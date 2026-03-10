const Jimp = require('jimp');

async function processImage() {
  const image = await Jimp.read('src/assets/cdrrmo-logo.jpg');
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const w = this.bitmap.width;
    const h = this.bitmap.height;
    
    // the image has a white background padding and a circle inside
    const cx = w / 2;
    const cy = h / 2;
    // Shrink radius slightly to nip the white edges (about 12px padding empirically from user's screenshot showing standard square white logo)
    const padding = 12; 
    const r = (Math.min(w, h) / 2) - padding;
    
    const dx = x - cx;
    const dy = y - cy;
    
    if (Math.sqrt(dx*dx + dy*dy) > r) {
      this.bitmap.data[idx + 3] = 0; // set alpha to 0 for background outside the circle
    }
  });
  
  await image.writeAsync('src/assets/cdrrmo-logo-transparent.png');
  console.log("Successfully created transparent CDRRMO logo!");
}

processImage().catch(console.error);
