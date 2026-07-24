// One-off script: converts our 3 marker PNGs into 8th Wall image target format.
// Uses sharp already installed by @8thwall/image-target-cli.
// Run: node process-markers.mjs

import sharp from 'file:///C:/Users/wiktor.t/AppData/Local/npm-cache/_npx/d9fd33f22c0f2465/node_modules/sharp/lib/index.js'
import fs from 'fs/promises'
import path from 'path'

const LUMINANCE_HEIGHT = 640
const THUMBNAIL_HEIGHT = 350

const MARKERS = [
  {src: './marker_BOSTON001TW.png', name: 'boston001'},
  {src: './marker_BOSTON002TW.png', name: 'boston002'},
  {src: './marker_BOSTON003TW.png', name: 'boston003'},
]

function getDefaultCrop(width, height) {
  // 8th Wall requires 3:4 portrait ratio (480x640)
  if (width / 3 > height / 4) {
    const croppedWidth = Math.round((height * 3) / 4)
    return {left: Math.round((width - croppedWidth) / 2), top: 0, width: croppedWidth, height}
  } else {
    const croppedHeight = Math.round((width * 4) / 3)
    return {left: 0, top: Math.round((height - croppedHeight) / 2), width, height: croppedHeight}
  }
}

async function processMarker({src, name}) {
  const outDir = `./image-targets`
  await fs.mkdir(outDir, {recursive: true})

  const img = sharp(src)
  const meta = await img.metadata()
  const crop = getDefaultCrop(meta.width, meta.height)

  console.log(`Processing ${name}: ${meta.width}x${meta.height} → crop ${crop.width}x${crop.height}`)

  const ext = meta.format === 'jpeg' ? 'jpg' : meta.format

  const originalFile  = `${name}_original.${ext}`
  const croppedFile   = `${name}_cropped.${ext}`
  const thumbnailFile = `${name}_thumbnail.${ext}`
  const luminanceFile = `${name}_luminance.${ext}`

  const cropped = img.clone().extract(crop)

  await Promise.all([
    img.clone().toFile(path.join(outDir, originalFile)),
    cropped.clone().toFile(path.join(outDir, croppedFile)),
    cropped.clone().resize({height: THUMBNAIL_HEIGHT}).toFile(path.join(outDir, thumbnailFile)),
    cropped.clone().resize({height: LUMINANCE_HEIGHT}).grayscale().toFile(path.join(outDir, luminanceFile)),
  ])

  const jsonData = {
    imagePath: `image-targets/${luminanceFile}`,
    name,
    type: 'FLAT',
    properties: {
      ...crop,
      isRotated: false,
      originalWidth: meta.width,
      originalHeight: meta.height,
    },
    resources: {originalImage: originalFile, croppedImage: croppedFile, thumbnailImage: thumbnailFile, luminanceImage: luminanceFile},
    created: Date.now(),
    updated: Date.now(),
  }

  await fs.writeFile(path.join(outDir, `${name}.json`), `${JSON.stringify(jsonData, null, 2)}\n`)
  console.log(`  ✓ ${outDir}/${name}.json`)
}

for (const marker of MARKERS) {
  await processMarker(marker)
}
console.log('All markers processed.')
