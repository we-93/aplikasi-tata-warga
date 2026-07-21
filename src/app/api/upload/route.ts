import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/lib/s3";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Validate session
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "general";
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      // If no file but there's an oldUrl, treat it as a delete-only operation
      if (oldUrl) {
        await deleteFile(oldUrl);
        return NextResponse.json({ url: null, success: true });
      }
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (file.size === 0) {
      if (oldUrl) {
        await deleteFile(oldUrl);
        return NextResponse.json({ url: null, success: true });
      }
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3 (Maxcloud)
    const publicUrl = await uploadFile(buffer, file.name, folder, file.type);

    // Delete old file if provided
    if (oldUrl) {
      await deleteFile(oldUrl);
    }

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
