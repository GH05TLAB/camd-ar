import sharp from 'file:///C:/Users/wiktor.t/AppData/Local/npm-cache/_npx/d9fd33f22c0f2465/node_modules/sharp/lib/index.js'
import { createRequire } from 'module'
import fs from 'fs/promises'

const require = createRequire(import.meta.url)
const QRCode = require('C:/Users/wiktor.t/AppData/Local/npm-cache/_npx/934e343ed3b069fe/node_modules/qrcode/lib/index.js')

const SIZE = 1500
const BETA_URL = 'https://gh05tlab.github.io/camd-ar/campus_ar_beta.html'

async function makeQrSvgGroup(url, x, y, boxSize) {
  const svgStr = await QRCode.toString(url, {type: 'svg', margin: 1})
  // Extract viewBox size (qrcode outputs e.g. viewBox="0 0 35 35")
  const vbMatch = svgStr.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
  // qrcode uses stroke path (h/m syntax horizontal lines per module row)
  const pathMatch = svgStr.match(/<path stroke="#000000" d="([^"]+)"/)
  if (!vbMatch || !pathMatch) throw new Error(`QR SVG parse failed. SVG start: ${svgStr.substring(0, 200)}`)
  const vbSize = parseFloat(vbMatch[1])
  const scale = boxSize / vbSize
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${boxSize}" height="${boxSize}" fill="white" rx="8"/>
      <g transform="scale(${scale})">
        <path stroke="#000000" stroke-width="1" stroke-linecap="square" fill="none" d="${pathMatch[1]}"/>
      </g>
    </g>`
}

function cornerSquare(x, y, s) {
  const b = s
  const g = s * 0.1
  const i = s * 0.55
  const io = (b - i) / 2
  return `
    <rect x="${x}" y="${y}" width="${b}" height="${b}" fill="#111"/>
    <rect x="${x+g}" y="${y+g}" width="${b-g*2}" height="${b-g*2}" fill="#fff"/>
    <rect x="${x+io}" y="${y+io}" width="${i}" height="${i}" fill="#111"/>
  `
}

function markerShell(accentColor, spotNum, spotName) {
  const S = SIZE
  const cs = S * 0.18
  const pad = S * 0.04
  const topBandH = S * 0.08
  const botBandH = S * 0.07
  return `
    <rect width="${S}" height="${S}" fill="#fff"/>
    ${cornerSquare(pad, pad, cs)}
    ${cornerSquare(S-pad-cs, pad, cs)}
    ${cornerSquare(pad, S-pad-cs, cs)}
    <rect x="${S-pad-cs}" y="${S-pad-cs}" width="${cs}" height="${cs}" fill="${accentColor}"/>
    <text x="${S-pad-cs+cs/2}" y="${S-pad-cs+cs/2}" font-size="${cs*0.4}" font-family="monospace" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">β</text>
    <rect x="${pad+cs}" y="${pad}" width="${S-pad*2-cs*2}" height="${topBandH}" fill="${accentColor}"/>
    <text x="${S/2}" y="${pad+topBandH/2}" font-size="${topBandH*0.42}" font-family="monospace" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">CAMD · BETA</text>
    <rect x="${pad}" y="${S-pad-botBandH}" width="${S-pad*2-cs}" height="${botBandH}" fill="#111"/>
    <text x="${pad+(S-pad*2-cs)/2}" y="${S-pad-botBandH/2}" font-size="${botBandH*0.42}" font-family="monospace" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">AR GALLERY · SPOT ${spotNum} · ${spotName}</text>
  `
}

// QR code centered in the marker, sized to ~38% of marker width
const QR_SIZE = Math.round(SIZE * 0.38)  // 570px
const QR_X = Math.round((SIZE - QR_SIZE) / 2)
const QR_Y = Math.round(SIZE * 0.5 - QR_SIZE / 2 + SIZE * 0.04)  // slightly below center (leaves room for top elements)

// ── MARKER B-01: diagonal stripes + QR ─────────────────────
async function svgB01() {
  const S = SIZE
  const qr = await makeQrSvgGroup(BETA_URL, QR_X, QR_Y, QR_SIZE)
  const stripeW = S * 0.022
  const stripes = []
  for (let i = -S; i < S*2; i += stripeW*3) {
    stripes.push(`<line x1="${i}" y1="0" x2="${i+S}" y2="${S}" stroke="#e8e8e8" stroke-width="${stripeW}"/>`)
  }
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${S}" height="${S}" fill="#fff"/>
    <g clip-path="url(#clip01)">${stripes.join('')}</g>
    <defs><clipPath id="clip01"><rect width="${S}" height="${S}"/></clipPath></defs>
    ${markerShell('#c8102e', '1', 'ROBOTIC BEE')}
    ${qr}
    <text x="${S/2}" y="${QR_Y - SIZE*0.03}" font-size="${S*0.055}" font-family="monospace" font-weight="700" fill="#c8102e" text-anchor="middle" dominant-baseline="middle">01</text>
  </svg>`
}

// ── MARKER B-02: concentric rings + QR ─────────────────────
async function svgB02() {
  const S = SIZE
  const cx = S / 2, cy = S / 2
  const qr = await makeQrSvgGroup(BETA_URL, QR_X, QR_Y, QR_SIZE)
  const rings = []
  const radii = [S*0.32, S*0.24, S*0.16, S*0.09]
  for (const r of radii) {
    rings.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ddd" stroke-width="${S*0.012}"/>`)
  }
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${S}" height="${S}" fill="#fff"/>
    <defs>
      <pattern id="chk" patternUnits="userSpaceOnUse" width="${S*0.04}" height="${S*0.04}">
        <rect width="${S*0.02}" height="${S*0.02}" fill="#f0f0f0"/>
        <rect x="${S*0.02}" y="${S*0.02}" width="${S*0.02}" height="${S*0.02}" fill="#f0f0f0"/>
      </pattern>
    </defs>
    <rect width="${S}" height="${S}" fill="url(#chk)"/>
    ${markerShell('#185FA5', '2', 'HONEYBEE')}
    ${rings.join('')}
    <line x1="${cx-S*0.34}" y1="${cy}" x2="${cx+S*0.34}" y2="${cy}" stroke="#ccc" stroke-width="${S*0.010}"/>
    <line x1="${cx}" y1="${cy-S*0.34}" x2="${cx}" y2="${cy+S*0.34}" stroke="#ccc" stroke-width="${S*0.010}"/>
    ${qr}
  </svg>`
}

// ── MARKER B-03: grid / circuit board + QR ───────────────────────
async function svgB03() {
  const S = SIZE
  const qr = await makeQrSvgGroup(BETA_URL, QR_X, QR_Y, QR_SIZE)
  const gridStep = S * 0.055
  const lines = []
  for (let x = 0; x < S; x += gridStep) {
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${S}" stroke="#ccc" stroke-width="1.5"/>`)
  }
  for (let y = 0; y < S; y += gridStep) {
    lines.push(`<line x1="0" y1="${y}" x2="${S}" y2="${y}" stroke="#ccc" stroke-width="1.5"/>`)
  }
  const dots = []
  for (let xi = 1; xi < S/gridStep; xi += 2) {
    for (let yi = 1; yi < S/gridStep; yi += 2) {
      const x = xi * gridStep
      const y = yi * gridStep
      if (x > S*0.15 && x < S*0.85 && y > S*0.15 && y < S*0.85) {
        dots.push(`<circle cx="${x}" cy="${y}" r="${S*0.008}" fill="#bbb"/>`)
      }
    }
  }
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${S}" height="${S}" fill="#fff"/>
    ${lines.join('')}
    ${dots.join('')}
    ${markerShell('#3B6D11', '3', 'DIY VR IMPLANT')}
    ${qr}
    <text x="${S/2}" y="${QR_Y - SIZE*0.03}" font-size="${S*0.055}" font-family="monospace" font-weight="700" fill="#3B6D11" text-anchor="middle" dominant-baseline="middle">03</text>
  </svg>`
}

const markers = [
  {name: 'marker_BETA001', svgFn: svgB01},
  {name: 'marker_BETA002', svgFn: svgB02},
  {name: 'marker_BETA003', svgFn: svgB03},
]

for (const {name, svgFn} of markers) {
  const svg = await svgFn()
  await sharp(Buffer.from(svg))
    .png()
    .toFile(`./${name}.png`)
  console.log(`✓ ${name}.png`)
}
console.log('Done.')
