import sharp from 'sharp';
import path from 'path';

async function generateTransparentLogo() {
  const inputPath = path.resolve('src/assets/home-and-away-logo.jpg');
  const outputPathSrc = path.resolve('src/assets/home-and-away-logo.png');
  const outputPathPublic = path.resolve('public/home-and-away-logo.png');

  console.log('Processing logo asset to PNG with true alpha transparency...');

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  // Get raw RGBA pixel buffer
  const rawBuffer = await image.ensureAlpha().raw().toBuffer();

  // Create transparent buffer where white background becomes alpha = 0
  // and edges anti-alias seamlessly to black without white fringe/halo.
  const numPixels = width * height;
  const transparentBuffer = Buffer.alloc(numPixels * 4);

  for (let i = 0; i < numPixels; i++) {
    const r = rawBuffer[i * 4];
    const g = rawBuffer[i * 4 + 1];
    const b = rawBuffer[i * 4 + 2];

    // Compute pixel luminosity (0 = black, 255 = white)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luminance >= 250) {
      // Pure white background -> fully transparent
      transparentBuffer[i * 4] = 0;
      transparentBuffer[i * 4 + 1] = 0;
      transparentBuffer[i * 4 + 2] = 0;
      transparentBuffer[i * 4 + 3] = 0;
    } else {
      // Dark / texture / text pixel
      // Map alpha based on inverse luminance for perfect anti-aliased edge blending on grey
      let alpha = Math.round(255 - luminance);
      if (luminance < 100) {
        // Sculptural body pixels
        alpha = 255;
        transparentBuffer[i * 4] = r;
        transparentBuffer[i * 4 + 1] = g;
        transparentBuffer[i * 4 + 2] = b;
        transparentBuffer[i * 4 + 3] = alpha;
      } else {
        // Anti-aliased text / edge transition
        const factor = (250 - luminance) / 150;
        const clampedAlpha = Math.min(255, Math.max(0, Math.round(factor * 255)));
        transparentBuffer[i * 4] = Math.round(r * (1 - factor));
        transparentBuffer[i * 4 + 1] = Math.round(g * (1 - factor));
        transparentBuffer[i * 4 + 2] = Math.round(b * (1 - factor));
        transparentBuffer[i * 4 + 3] = clampedAlpha;
      }
    }
  }

  // Save PNG with alpha channel to src/assets and public/
  await sharp(transparentBuffer, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPathSrc);

  await sharp(transparentBuffer, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPathPublic);

  console.log('Successfully generated home-and-away-logo.png with true alpha transparency!');
}

generateTransparentLogo().catch((err) => {
  console.error('Error generating transparent logo:', err);
  process.exit(1);
});
