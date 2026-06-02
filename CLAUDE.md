# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment workflow

Never commit or push to GitHub unless the user explicitly says "deploy", "push to production", "send to GitHub", or similar. Default workflow:
1. Make changes locally
2. User tests on localhost
3. User gives explicit deploy approval → then commit + push

## Language

The user may communicate in Polish or English. Always respond in the same language they write in. All code, comments, and any text written into the website/HTML files must always be in English.

## Running the project

This is a static web app — no build step, no package manager. To run it locally:

```
npx serve .
# or
python -m http.server 8080
```

**HTTPS is required** for camera access. For local testing, use a tunneling tool:

```
npx localtunnel --port 8080
# or use ngrok
```

Then open the HTTPS URL on a mobile device and print `AR_Marker_Design_CAMD_v01a.pdf` to trigger the experience.

## Architecture

All application logic lives in two self-contained HTML files — no external JS modules are shipped in the repo. Dependencies are loaded via CDN import maps at the top of each file:

- **Three.js 0.160.0** — 3D rendering (WebGL)
- **Mind AR.js 1.2.5** — image-based marker tracking (`targets.mind` is the compiled marker database)
- **THREE.FBXLoader** — loads the arcade cabinet models from `Arcade_Cabinet/`

### File roles

| File | Purpose |
|---|---|
| `index.html` | Redirects immediately to `Arcade_AR.html` |
| `Arcade_AR.html` | **Main experience** — FBX arcade cabinet with video screen, particles, hover animation |
| `CAMD_AR_ProofOfConcept.html` | Simpler annotated version — floating CAMD logo cubes, no FBX; good reference for understanding the AR setup pattern |
| `targets.mind` | Compiled Mind AR marker database (binary) — regenerate via the Mind AR compiler if the marker image changes |
| `game_footage.mp4` | Video played on the arcade screen |
| `Arcade_Cabinet/` | FBX models + PBR textures (Albedo, Emission, Normal, SpecularSmoothness) |

### AR lifecycle (Arcade_AR.html)

1. **Splash** → user taps "Start AR"
2. `MindARThree` initialises with `filterMinCF: 0.0001, filterBeta: 10` (tuned for low jitter)
3. FBX models load in parallel; textures applied in `onAllLoaded()`
4. `anchor.onTargetFound` / `onTargetLost` control visibility with a **3-second grace period** before despawning (prevents flicker when tracking is momentarily lost)
5. `renderer.setAnimationLoop` drives hover, ring pulse, particle orbits, and camera-facing rotation each frame

### Coordinate system

Mind AR anchors use: **X/Y = marker surface, Z = toward camera**. The marker fills roughly `−0.5` to `+0.5` in X and Y. All content is positioned in this space inside `anchor.group`.

### Replacing content

- **Swap video**: change `VIDEO_URL` constant in `Arcade_AR.html` (set to `null` for the canvas placeholder)
- **Swap 3D model**: replace FBX files and update paths in `loadArcadeCabinet()`; the auto-scaling logic (`1.5 / maxDim`) handles size normalization automatically
- **Regenerate marker**: use the [Mind AR compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile) with the source image, output replaces `targets.mind`
