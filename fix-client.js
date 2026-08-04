const fs = require('fs');
const file = 'src/app/admin/data/client.tsx';
let content = fs.readFileSync(file, 'utf8');

// Gunakan Regex agar pasti kena walaupun spasinya berbeda
content = content.replace(/\{sub\s*\?\s*sub\.product\.name\s*:\s*"Trial"\}/g, '{t.subscriptionPlan || "Free"}');

fs.writeFileSync(file, content);
console.log("Berhasil menambal tampilan client.tsx!");
