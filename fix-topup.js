const fs = require('fs');
const file = 'src/app/actions/customer.ts';
let content = fs.readFileSync(file, 'utf8');
const oldCode = `    if (invoice.product.type === "ADDON") {
      tenantUpdateData.addonMaxSurat = (invoice.tenant.addonMaxSurat || 0) + (invoice.product.maxSurat || 0);
      tenantUpdateData.addonMaxAiToken = (invoice.tenant.addonMaxAiToken || 0) + (invoice.product.maxAiToken || 0);
    } else {`;
const newCode = `    if (invoice.product.type === "ADDON") {
      tenantUpdateData.addonMaxSurat = (invoice.tenant.addonMaxSurat || 0) + (invoice.product.maxSurat || 0);
      tenantUpdateData.addonMaxAiToken = (invoice.tenant.addonMaxAiToken || 0) + (invoice.product.maxAiToken || 0);
      if (invoice.product.maxWarga === -1) {
        tenantUpdateData.maxWarga = -1;
      } else if (invoice.product.maxWarga > 0 && invoice.tenant.maxWarga !== -1) {
        tenantUpdateData.maxWarga = (invoice.tenant.maxWarga || 0) + invoice.product.maxWarga;
      }
    } else {`;
if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(file, content);
  console.log("Bug logika topup berhasil ditambal!");
}
