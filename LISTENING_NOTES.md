# Listening curation

The initial listening curation selected 109 patterns in 20 categories: 89 earlier entries retired from browsing and 16 original musical constructions added. This is a curation toward phrasing, articulation, evolving texture, melody and interaction, rather than mathematical novelty alone. Three against five, The final boss, all ten video presets and gentler contrasting sounds remain. Retired saved seeds continue to resolve.

- **Phase marimbas:** Two bright pentatonic phrases drift apart, creating new accents as they meet again.
- **Hocket hop:** Low and high voices trade alternate notes; together they form one skipping melody.
- **Pendulum bells:** Three ringing notes swing on independent clocks, occasionally landing together.
- **Bouncing notes:** A bright ball drops, rebounds faster and softer, then starts a new bounce sequence.
- **String waterfall:** Real plucked-string echoes cascade up and down a pentatonic staircase.
- **Robot vowels:** A low melody opens into bright, vowel-like FM squawks and closes again.
- **Bitwise arcade:** Bit shifts and XOR turn a little integer counter into a jagged chip melody.
- **Firefly cloud:** Tiny tuned grains gather into bright clouds, scatter, then leave space between them.
- **Bubble zipper:** Rounded little pitch bubbles tumble down, with short gaps and a changing upper sparkle.
- **Mirror duet:** A short tune is answered upside down by a warmer voice, then both overlap.
- **Growing music box:** A sparse bell phrase fills in note by note until the whole tune rings out.
- **Chord carousel:** Four changing harmonies unfold as a three-part arpeggio, then circle home.
- **Endless stairs:** Four octave layers hand notes to each other to suggest a staircase that keeps rising.
- **Echo garden:** A few rounded notes answer themselves in softer fifths and octaves.
- **Chaos conversation:** A constrained chaotic phrase asks a question; its reversed, lower reply answers.
- **Talking drums:** Two tuned FM drums trade short bent notes, with a higher reply instead of a constant backing beat.

## Research references

- [Steve Reich: Piano Phase - composer notes](https://stevereich.com/composition/piano-phase/): Two players repeating a motif at slightly different speeds inspired Phase marimbas. The melody here is original.
- [Stanford: the Karplus-Strong algorithm](https://crypto.stanford.edu/~blynn/sound/karplusstrong.html): String waterfall uses seeded noise, a fractional feedback delay and low-pass averaging to create actual plucked-string tones.
- [Barry Truax: granular synthesis](https://www.sfu.ca/~truax/gran.html): Firefly cloud sums short overlapping chirplets under smooth windows, with seeded event density and pitch.
- [Stanford CCRMA: an introduction to FM](https://ccrma.stanford.edu/software/snd/snd/fm.html): Robot vowels and Talking drums use changing modulation ratios and indices to give notes changing spectra.
- [Viznut: discovering novel computer music techniques](https://viznut.fi/texts-en/bytebeat_exploring_space.pdf): Bitwise arcade uses an original XOR-and-shift note selector inspired by algorithmic chip music; it does not copy a bytebeat tune.

## Retired from the active collection

- square
- duty
- trapezoid
- scallops
- tanh_square
- parabolic_tri
- odd
- even
- beats
- fourier_triangle
- dirichlet
- fejer
- ramanujan
- damped
- gaussian
- mexican
- sinc
- blackman
- tukey
- hyperbola
- tanh
- superellipse
- rational_dipole
- log_potential
- root_cusps
- mandelbrot
- minkowski
- cantor
- tent
- sine_map
- circle
- cheb_map
- bifurcation
- chirikov
- gingerbread
- chebyshev
- legendre
- hermite
- laguerre
- erf
- fresnel
- airy
- stairs
- thue_morse
- sample_hold
- fibonacci_word
- rudin_shapiro
- gammatone
- shepard
- formant
- karplus
- morlet
- cochlea_wave
- gabor
- kdv_soliton
- kdv_two_soliton
- sine_gordon_kink
- sine_gordon_breather
- akhmediev
- cnoidal
- kuramoto
- lotka_volterra
- pendulum
- quantum_harmonic
- double_slit
- poschl_teller
- planck_radiation
- cornu_spiral
- catenary_arch
- agnesi
- folium
- semicubical
- cassini
- clothoid
- cissoid
- kampyle
- superformula
- prime_counting
- hofstadter_q
- totient_sum
- gauss_map
- divisor_sum
- van_der_corput
- log_ripple
- bezier_ribbon
- hermite_glide
- raised_gate
- rational_fm
- pendulum_phase

## Original curve additions - October 8, 2026

Jelly gears, Modulo mischief and Divisor dance add three original curve-to-pitch constructions, preserving all 162 prior patterns. Current total: 165 patterns in 25 categories. The graph itself supplies pitch and bends; there are no event-score renderers or backing drum tracks in this batch. Their rules combine a unit-circle phase warp, quadratic residues and divisor-selected harmonic sums with constrained note tables and articulated rests. These are original app constructions, not transcriptions or claims of a newly discovered mathematical formula.

All three use the existing Vivid synthesis path. The new plotYLimit field fits each graph while retaining mathematical axis labels; entries without it keep their standard scale. Equations and full voice definitions are in the app's About panel and [offline listening notes](dist/listening-notes.html#jelly_gears). No descriptions or sound hints were added to the main interface or cards.

Direct verification: all 165 family seeds load. The three additions rendered at 48 kHz for Vivid and 8 kHz for Original at both scan speeds, with finite samples, peak at most 0.82 and zero final samples. Checked envelopes and graph bounds by direct evaluation. No test files or automated browser scripts were added.

Browser inspection covered the three main graphs, fitted axis labels and collection previews. Modulo mischief produced a nonzero live output signal; the app reported no browser errors. Checked 36 seeded variants for deterministic curve values, unclipped graph bounds and zero envelopes in rests.

## Continuous curves - October 8, 2026

Marshmallow motor, Ribbon racer and Taffy tornado add three single-voice, unbroken pitch graphs. All 165 earlier patterns remain. Current total: 168 in 25 categories. There are no undefined values, jump discontinuities or silent note gates in these additions. Smooth positive loudness curves create accents without breaking the sound into separate notes.

Marshmallow motor normalizes a smoothly varying sum of rotating harmonics, adding a curl between octave-and-fifth pitch anchors and gentle harmonic FM. Ribbon racer slides between a recurring pentatonic motif using a quintic interpolant; values and first two derivatives match at every boundary. Taffy tornado uses an increasing, gently warped phase, nested modulation and a rational ripple whose denominator is at least 1. The original functions and their mappings are documented in the offline listening notes and About panels.

continuous-curves.js registers the functions; the standard graph and Vivid synthesis paths render them. The continuous flag adds a short raised-cosine playback boundary fade in both sound modes, ending exactly at zero, without affecting earlier patterns. No interface descriptions, hints or taglines were added.

Direct verification covered 36 seeded variants: all samples finite, amplitude envelopes strictly positive, pitch values deterministic and inside fitted graph bounds. Maximum neighboring point differences are below the line-breaking threshold at both main and preview sampling densities. Ribbon joins differ by at most 1.1e-15 across a 2e-6-unit interval. All 168 active family seeds load. No test files or automated browser scripts were added.

All three additions rendered at 48 kHz in Vivid and 8 kHz in Original for both 7- and 14-second scans. Final RMS rounds to 0.260 for every render; maximum peak is 0.809 across both modes, and both boundary samples are zero.

Browser inspection confirmed the three full-width unbroken graphs and their collection thumbnails. Motor and ribbon playback produced nonzero output; Pause held the ribbon at the same transport time. Both scan selections worked and no browser errors were reported. Ribbon racer is left ready at the 7-second scan.
