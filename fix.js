const fs = require('fs');
const file = 'src/services/whatsapp/handlers/surat.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\/pdf\?download=1/g, '/download?download=1');
content = content.replace(/http:\/\/localhost:3000/g, 'https://tatawarga.biz.id');
fs.writeFileSync(file, content);
console.log("File surat.ts berhasil diperbaiki 100%!");
