import sharp from 'file:///C:/Users/wiktor.t/AppData/Local/npm-cache/_npx/d9fd33f22c0f2465/node_modules/sharp/lib/index.js'
import fs from 'fs/promises'

const SIZE = 1500

function cornerSquare(x, y, s) {
  const b = s        // outer box
  const g = s * 0.1  // gap
  const i = s * 0.55 // inner fill
  const io = (b - i) / 2
  return `
    <rect x="${x}" y="${y}" width="${b}" height="${b}" fill="#111"/>
    <rect x="${x+g}" y="${y+g}" width="${b-g*2}" height="${b-g*2}" fill="#fff"/>
    <rect x="${x+io}" y="${y+io}" width="${i}" height="${i}" fill="#111"/>
  `
}

function markerShell(accentColor, spotNum, spotName) {
  const S = SIZE
  const cs = S * 0.18  // corner square size
  const pad = S * 0.04
  const topBandH = S * 0.08
  const botBandH = S * 0.07
  return {
    prefix: `
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
    `,
    suffix: ''
  }
}

// ── MARKER B-01: diagonal stripes + big "01" ─────────────────────
function svgB01() {
  const S = SIZE
  const shell = markerShell('#c8102e', '1', 'ROBOTIC BEE')
  const stripeW = S * 0.022
  const stripes = []
  for (let i = -S; i < S*2; i += stripeW*3) {
    stripes.push(`<line x1="${i}" y1="0" x2="${i+S}" y2="${S}" stroke="#e8e8e8" stroke-width="${stripeW}"/>`)
  }
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${S}" height="${S}" fill="#fff"/>
    <g clip-path="url(#clip01)">${stripes.join('')}</g>
    <defs><clipPath id="clip01"><rect width="${S}" height="${S}"/></clipPath></defs>
    ${shell.prefix}
    <text x="${S/2}" y="${S/2}" font-size="${S*0.28}" font-family="monospace" font-weight="700" fill="#111" text-anchor="middle" dominant-baseline="middle" opacity="0.85">01</text>
    <rect x="${S*0.3}" y="${S*0.46}" width="${S*0.4}" height="${S*0.022}" fill="#c8102e" opacity="0.6"/>
  </svg>`
}

// ── MARKER B-02: concentric rings + crosshair ─────────────────────
function svgB02() {
  const S = SIZE
  const cx = S / 2, cy = S / 2
  const shell = markerShell('#185FA5', '2', 'HONEYBEE')
  const rings = []
  const radii = [S*0.32, S*0.24, S*0.16, S*0.09, S*0.04]
  for (const r of radii) {
    rings.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#111" stroke-width="${S*0.015}"/>`)
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
    ${shell.prefix}
    ${rings.join('')}
    <line x1="${cx-S*0.34}" y1="${cy}" x2="${cx+S*0.34}" y2="${cy}" stroke="#111" stroke-width="${S*0.012}"/>
    <line x1="${cx}" y1="${cy-S*0.34}" x2="${cx}" y2="${cy+S*0.34}" stroke="#111" stroke-width="${S*0.012}"/>
    <circle cx="${cx}" cy="${cy}" r="${S*0.035}" fill="#185FA5"/>
  </svg>`
}

// ── MARKER B-03: grid / circuit board lines ───────────────────────
function svgB03() {
  const S = SIZE
  const shell = markerShell('#3B6D11', '3', 'DIY VR IMPLANT')
  const gridStep = S * 0.055
  const lines = []
  for (let x = 0; x < S; x += gridStep) {
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${S}" stroke="#ccc" stroke-width="1.5"/>`)
  }
  for (let y = 0; y < S; y += gridStep) {
    lines.push(`<line x1="0" y1="${y}" x2="${S}" y2="${y}" stroke="#ccc" stroke-width="1.5"/>`)
  }
  // circuit dots at intersections (sparse)
  const dots = []
  for (let xi = 1; xi < S/gridStep; xi += 2) {
    for (let yi = 1; yi < S/gridStep; yi += 2) {
      const x = xi * gridStep
      const y = yi * gridStep
      if (x > S*0.15 && x < S*0.85 && y > S*0.15 && y < S*0.85) {
        dots.push(`<circle cx="${x}" cy="${y}" r="${S*0.008}" fill="#aaa"/>`)
      }
    }
  }
  // big horizontal bars in center
  const bars = []
  const barY = [S*0.38, S*0.44, S*0.50, S*0.56, S*0.62]
  const barW = [S*0.38, S*0.28, S*0.34, S*0.22, S*0.30]
  for (let i = 0; i < barY.length; i++) {
    bars.push(`<rect x="${S/2-barW[i]/2}" y="${barY[i]}" width="${barW[i]}" height="${S*0.03}" fill="#111" rx="3"/>`)
  }
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${S}" height="${S}" fill="#fff"/>
    ${lines.join('')}
    ${dots.join('')}
    ${shell.prefix}
    ${bars.join('')}
  </svg>`
}

const markers = [
  {name: 'marker_BETA001', svg: svgB01()},
  {name: 'marker_BETA002', svg: svgB02()},
  {name: 'marker_BETA003', svg: svgB03()},
]

for (const {name, svg} of markers) {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(`./${name}.png`)
  console.log(`✓ ${name}.png`)
}
console.log('Done.')
