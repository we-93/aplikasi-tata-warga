const fs = require('fs');
const https = require('https');
const path = require('path');

const KAB_TANGERANG_ID = '3603';
const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

async function run() {
  console.log('Fetching districts for Kabupaten Tangerang (3603)...');
  const districts = await fetchJson(`${API_BASE}/districts/${KAB_TANGERANG_ID}.json`);
  
  const result = [];
  
  for (const dist of districts) {
    console.log(`Fetching villages for district ${dist.name}...`);
    const villages = await fetchJson(`${API_BASE}/villages/${dist.id}.json`);
    
    result.push({
      id: dist.id,
      name: dist.name,
      villages: villages.map(v => ({ id: v.id, name: v.name }))
    });
  }
  
  const outDir = path.join(__dirname, '../src/lib/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const outFile = path.join(outDir, 'tangerang-regions.json');
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log(`Data saved to ${outFile}`);
}

run().catch(console.error);
