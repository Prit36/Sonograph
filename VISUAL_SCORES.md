# Visual scores

Nine geometric performances across two additions. The latest four preserve all 158 previous patterns. Active total: 162 in 25 categories.

## Analysis and design

The previous addition reused one note-grid view and closely related four-bar templates. This set instead gives every pattern its own geometric construction and score mechanism. Require a distinct silhouette, visible development during playback, a recurring musical idea, contrast between sections, and an exact shared event clock.

| Pattern | Visual construction | Musical connection |
| --- | --- | --- |
| Orbit rave | Perspective 3:5 torus braid with two moving heads | Vertical braid coordinates select Dorian notes; two attack rates interlock |
| Cymatic bloom | Four analytic zero-contour fields | Near-node coordinates select pentatonic notes; recurring hook, spectral chords, staged breakbeat |
| Prism break | Six mirrored recursive triangular sectors | Base-three cell addresses map to a recurring minor-pentatonic hook; high-register run after midpoint |
| Fractal drop | Seven-level binary tree growing by depth | Each branch has its own onset and pitch; leaves cascade when half-time bass enters |
| Moire motor | Moving, slightly rotated line gratings | Three- and four-step accent cycles, FM brightness follows note height, overlap reinforces bass |
| Euclid's carousel | Three rotating rhythm polygons | Evenly distributed 3/8, 5/12 and 7/16 attacks interlock; bass enters after the opening bar |
| Spirograph shuffle | Two closed five-petal hypotrochoids | Height selects pentatonic pitches; whistle and crystal voices use a 5:3 swing clock |
| Paper dragon groove | A 1024-segment paperfolding curve | Local turn direction offsets a recurring hook; FM plucks trade with crystal replies |
| Rubber-band ballet | Five vibrating strings arranged as a pentagram | Actual plucks excite five visual sine modes; a high reply enters after the first bar |

## Implementation

performances.js registers deterministic scores. performances-view.js renders their geometry from the exact transport position and event cues. The collection uses miniature versions of the same renderer. sound.js adds spectral pluck, crystal, velvet, shimmer and acid voices with conservative FM bandwidth, synchronized echoes, smooth envelopes and a soft mix knee. Old patterns retain their synthesis path.

Pause freezes the artwork, Restart resets the score, and both scan speeds scale the same normalized timeline. No new interface copy or pattern-card descriptions were added.

kinetic-scores.js adds the latest four scores and renderers. Each uses a different lead rule, supporting rhythm and silhouette. The star harp's displacement is perpendicular to each fixed-end string and scaled for visibility. These four reuse the existing spectral, whistle, wood, plucked-string and drum instruments. Their final dry notes end at t=0.984.

## Sources and limits

- [Wolfram: torus parameterization](https://reference.wolfram.com/language/ref/Torus.html)
- [Georgi: The Physics of Waves, section 11.3](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/ef731c1b91d77a6db003f6c27e300d25_MIT8_03SCF16_Textbook.pdf#page=289)
- [Wolfram: moire construction](https://demonstrations.wolfram.com/MoirePatterns/)
- [Toussaint: The Euclidean Algorithm Generates Traditional Musical Rhythms](https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf)
- [Wolfram: Circle Rolling Inside Another](https://demonstrations.wolfram.com/CircleRollingInsideAnother/)
- [MIT: Vibration Analysis by Mode Superposition](https://ocw.mit.edu/courses/2-003sc-engineering-dynamics-fall-2011/pages/vibration-analysis-by-mode-superposition/)

The nodal fields are analytic artworks, not a material simulation. The cosine difference is an antisymmetric mode combination; it is not claimed to be driven at the plate center. The torus is a projected winding curve. Tree and prism maps are explicit recursive geometry. No copyrighted music or audio samples are used.

[Equations and replay links](dist/visual-scores.html).

## Direct verification

All 158 active seeds load. Repeated generation produces identical scores. Every new event has a finite pitch, positive span and an endpoint inside the scan; the latest dry endpoint is t=0.978. All five additions rendered at 48 kHz for both Vivid scan durations, and at 8 kHz for both Original durations, without nonfinite samples. Minimum mixed RMS was 0.225; maximum peak was 0.82. The final sample of each Vivid render is zero. JavaScript syntax checks passed.

Browser inspection covered the five distinct views. Orbit projection bounds were checked across a complete scan and its canvas fit was corrected. Nodal contours use marching squares, the prism batches its line paths, and the moire renderer uses a smooth offscreen pixel surface. Live orbit playback produced a nonzero output signal, and Pause froze transport and artwork together. No test files or automated browser scripts were added.

## Visibility refinement

All five views and collection previews now use plain white canvases and darker teal, purple, pink and ochre strokes. Removed background gradients, extra orbit strands, decorative rings, the nodal dot texture and glow blur. Only reached tree branches are drawn. Note markers have small white outlines. The moire field is contained in a central square with dark ink on white, leaving the surrounding canvas clear. Sound scores and synthesis were not changed in this refinement.

## Latest addition verification

All 162 active family seeds load. Repeated generation of the four new scores is identical. Events have finite pitches, positive spans and dry endpoints no later than t=0.984. The carousel has exactly 3, 5 and 7 filled nodes; the dragon has 1025 vertices. Each addition rendered at 48 kHz in Vivid and 8 kHz in Original for both 7- and 14-second scans. No nonfinite samples occurred; Vivid RMS ranges from 0.215 to 0.243, peak is at most 0.82, and final samples are zero. No test files or browser scripts were added.

Inspected all four main views and the nine collection previews in the browser. Live spirograph and star-harp playback produced nonzero output; Pause held the star harp at the same transport time. No browser errors were reported. Drawing coordinates stayed finite and inside the canvas across complete scans at 820x320, 300x300 and 180x110. All four offline equation anchors match their generated formulas.
