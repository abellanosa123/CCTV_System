const https = require('https');
const fs = require('fs');
const path = require('path');

const icons = {
  'icon-email.png': 'https://api.iconify.design/mdi:email.png?color=white&width=24',
  'icon-phone.png': 'https://api.iconify.design/mdi:phone.png?color=white&width=24',
  'icon-facebook.png': 'https://api.iconify.design/mdi:facebook.png?color=white&width=24',
  'icon-location.png': 'https://api.iconify.design/mdi:location.png?color=white&width=24'
};

async function download() {
  for (const [filename, url] of Object.entries(icons)) {
    const dest = path.join(__dirname, 'src', 'assets', filename);
    console.log(`Downloading ${filename}...`);
    await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', reject);
    });
    console.log(`Saved ${filename}`);
  }
}

download().catch(console.error);
