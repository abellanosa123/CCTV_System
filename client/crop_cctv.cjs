const Jimp = require('jimp');

async function processImage() {
  const image = await Jimp.read('src/assets/CCTVUnit-transparent.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  // Create a profile of the image: string of 1s (any opaque pixel) and 0s (fully transparent row)
  let profile = '';
  for(let y = 0; y < h; y++){
    let rowHasData = false;
    for(let x = 0; x < w; x++) {
      if(image.bitmap.data[(y * w + x) * 4 + 3] > 10) { 
        // using >10 alpha to account for edge artifacts
        rowHasData = true;
        break;
      }
    }
    profile += rowHasData ? '1' : '0';
  }
  
  console.log("Profile string:\n" + profile);
  
  // Find the gap between the main logo and the text at the bottom.
  // The bottom part is text, so we scan backwards to find the last chunk of 1s.
  let textEndIndex = profile.lastIndexOf('1');
  if (textEndIndex === -1) {
    console.log('Image is fully transparent.');
    return;
  }
  
  // Find where the text starts (going backwards from the end until we see 0s for a few pixels)
  let textStartIndex = textEndIndex;
  // We look for a gap of at least 2 pixels of 0s.
  while(textStartIndex > 0) {
    if (profile[textStartIndex] === '0' && profile[textStartIndex - 1] === '0') {
      break;
    }
    textStartIndex--;
  }

  console.log(`Detected bottom text from y = ${textStartIndex} to ${textEndIndex}`);
  
  // Instead of dynamically guessing if there are no clear gaps, 
  // Let's just forcefully clear everything from the gap downwards, OR if no gap, assume bottom 15%.
  let cropY = textStartIndex;
  if(textStartIndex === 0 || h - textStartIndex > h * 0.3) {
      // If logic failed (no gap, or gap is too high), fallback
      cropY = Math.floor(h * 0.85); // clear bottom 15%
  }

  console.log("Clearing rows starting from Y =", cropY);

  for (let y = cropY; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      image.bitmap.data[idx + 0] = 0;
      image.bitmap.data[idx + 1] = 0;
      image.bitmap.data[idx + 2] = 0;
      image.bitmap.data[idx + 3] = 0;
    }
  }

  await image.writeAsync('src/assets/CCTVUnit-transparent.png');
  console.log('Successfully cropped the text out of the transparent image!');
}

processImage().catch(console.error);
