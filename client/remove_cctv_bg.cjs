const Jimp = require('jimp');

async function processImage() {
  console.log("Reading CCTVUnit.png...");
  const image = await Jimp.read('src/assets/CCTVUnit.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  console.log("Removing background through flood-fill algorithm...");
  // BFS approach to flood-fill transparent from the edges
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
    
    // Consider near-white as background
    if (r >= 210 && g >= 210 && b >= 210) {
      image.bitmap.data[idx + 3] = 0; // Make transparent
      
      // Add neighbors to the queue
      queue.push([x-1, y]);
      queue.push([x+1, y]);
      queue.push([x, y-1]);
      queue.push([x, y+1]);
    }
  }

  await image.writeAsync('src/assets/CCTVUnit-transparent.png');
  console.log('Successfully saved to src/assets/CCTVUnit-transparent.png!');
}

processImage().catch(console.error);
