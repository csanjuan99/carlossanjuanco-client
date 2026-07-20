import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.resolve(__dirname, '../src/assets/hero-creacion.png')
const OUT_DIR = path.resolve(__dirname, '../public')
const WIDTH = 1520
const HEIGHT = 680

async function main() {
  const pipeline = sharp(SOURCE).resize(WIDTH, HEIGHT, { fit: 'cover' })

  await pipeline.clone().webp({ quality: 82 }).toFile(path.join(OUT_DIR, 'hero-creacion.webp'))
  await pipeline.clone().png({ quality: 82, compressionLevel: 9 }).toFile(path.join(OUT_DIR, 'hero-creacion.png'))

  console.log(`[optimize-hero] wrote ${WIDTH}x${HEIGHT} webp+png to ${OUT_DIR}`)
}

await main()
