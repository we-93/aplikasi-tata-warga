import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT || "";
const region = process.env.S3_REGION || "auto";
const bucketName = process.env.S3_BUCKET_NAME || "";
const accessKeyId = process.env.S3_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
const publicUrl = process.env.S3_PUBLIC_URL || "";

// Validasi minimal sebelum membuat client
const isS3Configured = Boolean(endpoint && accessKeyId && secretAccessKey);

const s3Client = isS3Configured ? new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Dibutuhkan untuk sebagian besar layanan kompatibel S3 (selain AWS)
}) : null;

/**
 * Uploads a file (Buffer) to Maxcloud S3.
 * @param fileBuffer Buffer file yang akan diunggah
 * @param fileName Nama file asli
 * @param folder Direktori target (misal: 'logo', 'avatar')
 * @param mimeType Tipe konten file (misal: 'image/jpeg')
 * @returns URL publik dari file yang berhasil diunggah
 */
export async function uploadFile(
  fileBuffer: Buffer, 
  fileName: string, 
  folder: string, 
  mimeType: string
): Promise<string> {
  if (!s3Client || !bucketName) {
    throw new Error("S3 is not properly configured. Check your environment variables.");
  }

  // Buat nama file unik untuk mencegah bentrok/tertimpa
  const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  
  // Hapus slash di awal/akhir folder agar rapi
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const objectKey = `${cleanFolder}/${uniquePrefix}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Bersihkan slash ganda pada publicUrl jika ada
  const cleanPublicUrl = publicUrl.replace(/\/+$/, '');
  return `${cleanPublicUrl}/${objectKey}`;
}

/**
 * Deletes a file from Maxcloud S3 given its public URL.
 * @param fileUrl URL publik lengkap dari file
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!s3Client || !bucketName || !fileUrl) return;

  const cleanPublicUrl = publicUrl.replace(/\/+$/, '');
  
  // Jangan proses jika file tersebut bukan berasal dari bucket kita
  if (!fileUrl.startsWith(cleanPublicUrl)) return;

  // Ekstrak object key dari URL publik
  const objectKey = fileUrl.replace(`${cleanPublicUrl}/`, "");

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error(`Failed to delete S3 object: ${objectKey}`, error);
  }
}
