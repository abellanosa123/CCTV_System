const Jimp = require('jimp');

async function processImage() {
  const image = await Jimp.read('src/assets/CCTVUnit_logo.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // 1. Remove white background like before
  const queue = [[0,0], [w-1,0], [0,h-1], [w-1,h-1]];
  const visited = new Uint8Array(w * h);
  
  while(queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    
    const bitIdx = y * w + x;
    if (visited[bitIdx]) continue;
    visited[bitIdx] = 1;
    
    const idx = (y * w + x) * 4;
    const r = image.bitmap.data[idx];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    
    if (r >= 210 && g >= 210 && b >= 210) {
      image.bitmap.data[idx + 3] = 0; // Make transparent
      
      queue.push([x-1, y]);
      queue.push([x+1, y]);
      queue.push([x, y-1]);
      queue.push([x, y+1]);
    }
  }

  // 2. The user wants the gray silver stand and red/blue blur below the eye removed entirely.
  // We'll crop manually: the eye sits above a certain Y coordinate.
  // The height is 196. Looking at standard proportions, the silver stand probably starts around y=135.
  // We will manually clear all pixels from y=135 to the bottom.
  for (let y = 135; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      image.bitmap.data[idx + 3] = 0; // Set transparent
    }
  }

  await image.writeAsync('src/assets/CCTVUnit_logo_cropped.png');
  console.log('Successfully saved to src/assets/CCTVUnit_logo_cropped.png!');
}

processImage().catch(console.error);
