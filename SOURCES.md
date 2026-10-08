# Mathematical collection and sources

The collection combines established mathematical families with original compositions made from those ingredients. References document the underlying functions or methods; they do not imply that each composed equation is copied from a source. All drawing and sound implementations are local JavaScript.

## Research references

- [SciPy chirp](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html): frequency-sweep conventions. The app labels quadratic/cubic/logarithmic **phase** compositions by their actual formulas rather than implying identical SciPy parameterization.
- [SciPy sawtooth](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) and [square](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html): ramp, triangle, and pulse ingredients.
- [SciPy Gaussian pulses](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html): localized oscillatory envelopes.
- [Wolfram Fourier series](https://mathworld.wolfram.com/FourierSeries.html): harmonic expansions and kernels.
- [Weierstrass-Mandelbrot](https://mathworld.wolfram.com/Weierstrass-MandelbrotFunction.html), [Takagi / blancmange](https://mathworld.wolfram.com/BlancmangeFunction.html), [Minkowski ?(x)](https://mathworld.wolfram.com/MinkowskisQuestionMarkFunction.html), and [Cantor function](https://mathworld.wolfram.com/CantorFunction.html): multiscale, fractal, and singular staircase constructions.
- [Logistic map](https://mathworld.wolfram.com/LogisticMap.html), [tent map](https://mathworld.wolfram.com/TentMap.html), [Hénon map](https://mathworld.wolfram.com/HenonMap.html), [circle map](https://mathworld.wolfram.com/CircleMap.html), [Chirikov standard map](https://mathworld.wolfram.com/StandardMap.html), [Gingerbreadman map](https://mathworld.wolfram.com/GingerbreadmanMap.html), [Ikeda resonator map](https://en.wikipedia.org/wiki/Ikeda_map), and [Lorenz system](https://mathworld.wolfram.com/LorenzAttractor.html): deterministic nonlinear dynamics.
- [Van der Pol oscillator](https://en.wikipedia.org/wiki/Van_der_Pol_oscillator), [Duffing oscillator](https://en.wikipedia.org/wiki/Duffing_equation), [Rössler attractor](https://en.wikipedia.org/wiki/R%C3%B6ssler_attractor), and [Chua’s circuit](https://en.wikipedia.org/wiki/Chua%27s_circuit): continuous nonlinear dynamical systems and limit cycles.
- [Korteweg-de Vries equation](https://en.wikipedia.org/wiki/Korteweg%E2%80%93de_Vries_equation), [sine-Gordon equation](https://en.wikipedia.org/wiki/Sine-Gordon_equation), [Peregrine soliton](https://en.wikipedia.org/wiki/Peregrine_soliton), and [Gerstner wave](https://en.wikipedia.org/wiki/Trochoidal_wave): solitary waves, topological kinks, rogue waves, and non-linear ocean trochoids.
- [Gammatone filter](https://en.wikipedia.org/wiki/Gammatone_filter), [Shepard tone illusion](https://en.wikipedia.org/wiki/Shepard_tone), [formants](https://en.wikipedia.org/wiki/Formant), [Morlet wavelet](https://en.wikipedia.org/wiki/Morlet_wavelet), and [LF glottal model](https://en.wikipedia.org/wiki/Liljencrants%E2%80%93Fant_model): auditory cochlear mechanics, psychoacoustics, and speech synthesis.
- [FitzHugh-Nagumo model](https://en.wikipedia.org/wiki/FitzHugh%E2%80%93Nagumo_model) and [McSharry ECG model](https://physionet.org/content/ecgsyn/): biophysical neural action potentials and cardiac electrophysiology.
- [Quantum harmonic oscillator](https://en.wikipedia.org/wiki/Quantum_harmonic_oscillator), [Fabry-Pérot interferometer](https://en.wikipedia.org/wiki/Fabry%E2%80%93P%C3%A9rot_interferometer), [Pöschl-Teller potential](https://en.wikipedia.org/wiki/P%C3%B6schl%E2%80%93Teller_potential), and [Hofstadter’s butterfly](https://en.wikipedia.org/wiki/Hofstadter%27s_butterfly): quantum wavefunctions, reflectionless wells, and optical cavities.
- [Witch of Agnesi](https://mathworld.wolfram.com/WitchofAgnesi.html), [Folium of Descartes](https://mathworld.wolfram.com/FoliumofDescartes.html), [Astroid](https://mathworld.wolfram.com/Astroid.html), [Cissoid of Diocles](https://mathworld.wolfram.com/CissoidofDiocles.html), and [Superformula](https://en.wikipedia.org/wiki/Superformula): classical geometric and biological natural curves.
- [Collatz problem](https://mathworld.wolfram.com/CollatzProblem.html), [Prime counting function](https://mathworld.wolfram.com/PrimeCountingFunction.html), [Farey sequences](https://mathworld.wolfram.com/FareySequence.html), [Stern diatomic series](https://mathworld.wolfram.com/SternsDiatomicSeries.html), and [Hofstadter Q-sequence](https://mathworld.wolfram.com/HofstadterQ-Sequence.html): number theory and meta-recursions.
- [NIST Bessel integrals](https://dlmf.nist.gov/10.9), [Airy functions](https://dlmf.nist.gov/9), [Jacobi elliptic functions](https://dlmf.nist.gov/22.2), [error and Fresnel functions](https://dlmf.nist.gov/7.2), and [orthogonal polynomials](https://dlmf.nist.gov/18.3): special-function definitions.
- [Toussaint, The Euclidean Algorithm Generates Traditional Musical Rhythms](https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf): evenly distributed rhythmic hits. The app uses a modular distribution with a possible rotation of the pulse sequence.
- [Thue-Morse sequence](https://mathworld.wolfram.com/Thue-MorseSequence.html), [Fibonacci word](https://mathworld.wolfram.com/FibonacciWord.html), and [Rudin-Shapiro sequence](https://mathworld.wolfram.com/Rudin-ShapiroSequence.html): binary parity and flat-spectrum pulse distributions.

## Numerical methods and interpretation

Fractals are finite approximations: seven Weierstrass terms, eight Takagi terms, eighteen Riemann terms, ten Cantor levels, seven fractional Brownian motion scales, and finite multiscale compositions. A Mandelbrot slice uses a 48-iteration escape limit. The logistic parameter slice shows one trajectory endpoint after 100 updates at each parameter, rather than a full bifurcation diagram. The Minkowski question mark function uses a 16-step continued fraction partial quotient expansion.

Discrete chaotic orbits discard 32 warm-up updates and store 192 values; displayed subscripts index the stored sequence from zero. The final sample is held at the right endpoint. Continuous dynamical systems (Lorenz, Van der Pol, Duffing, Rössler, Chua, Lotka-Volterra, and FitzHugh-Nagumo) use 4th-order Runge-Kutta (RK4) integration with linear interpolation between stored states.

Bessel J₀ and J₁ use 96-point midpoint quadrature of Bessel’s integral. Airy Ai uses 128-point midpoint quadrature. Fresnel C uses 512-point midpoint quadrature. Jacobi elliptic sn uses the arithmetic-geometric mean (AGM) transformation. Error-function evaluation uses the Abramowitz-Stegun 7.1.26 approximation. Orthogonal polynomials use standard recurrences or their cosine representation. KdV 2-soliton collisions use the Hirota bilinear direct formula. Expensive curves are cached at 8193 points for playback and 513 for collection previews, with linear interpolation.

The reciprocal chirp sets the isolated undefined sample at x=0 to zero. Graph rendering breaks lines near discontinuities/asymptotes. Audio clips heights to ±4 and smooths pitch transitions. These are sonification choices, not claims of exact continuous-time rendering. Eight voices add distinct spectra; waveform height drives pitch, and envelope families also drive loudness.

## Original 160 families

| Category | Family | Seed ID | Construction reference |
| --- | --- | --- | --- |
| Waveforms | Sine wave | sine | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Waveforms | Triangle wave | triangle | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Waveforms | Sawtooth wave | saw | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Waveforms | Square wave | square | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html) |
| Waveforms | Variable-duty pulses | duty | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html) |
| Waveforms | Trapezoid wave | trapezoid | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Waveforms | Rectified sine | rectified | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Waveforms | Circular scallops | scallops | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Waveforms | Hyperbolic tangent square | tanh_square | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Waveforms | Parabolic alternating arcs | parabolic_tri | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Harmonics | Harmonic ladder | harmonics | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Odd harmonics | odd | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Even harmonic comb | even | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Detuned beats | beats | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Inharmonic stack | inharmonic | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Fourier triangle | fourier_triangle | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Dirichlet packets | dirichlet | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Fejér pulses | fejer | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Ramanujan harmonic sum | ramanujan | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Harmonics | Chebyshev harmonic comb | cheb_comb | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Modulation | Frequency modulation | fm | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Modulation | Nested oscillation | nested | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Modulation | Chirped phase modulation | phase | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Modulation | Ring modulation | ring | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Modulation | Amplitude modulation | am | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Modulation | Wave folding | fold | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Modulation | Hard clipping | clip | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Modulation | Quantized sine | quantized | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html) |
| Modulation | Exponential frequency modulation | exp_fm | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Modulation | Cross-modulation synthesis | cross_mod | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Sweeps | Quadratic chirp | quadratic | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Cubic chirp | cubic | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Exponential chirp | exponential | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Logarithmic phase | log_chirp | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Reciprocal chirp | reciprocal_chirp | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Sinusoidal sweep | warped | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Stepped sweep | stepped_chirp | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Mirrored sweep | mirror_chirp | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Hyperbolic frequency sweep | hyperbolic_sweep | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Sweeps | Sigmoidal sweep | sigmoid_sweep | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.chirp.html) |
| Envelopes | Exponential pulse train | decay | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Envelopes | Damped sine | damped | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Envelopes | Gaussian wave packet | gaussian | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Envelopes | Mexican hat wavelet | mexican | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Envelopes | Sinc ripples | sinc | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Envelopes | Hyperbolic secant | sech | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Envelopes | Beta-shaped pulses | beta | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Envelopes | Parabolic bounces | bounce | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Envelopes | Blackman-Nuttall window | blackman | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Envelopes | Tukey tapered burst | tukey | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Geometry | Tangent fields | tan_field | [Reference](https://mathworld.wolfram.com/Tangent.html) |
| Geometry | Reciprocal hyperbola | hyperbola | [Reference](https://mathworld.wolfram.com/Hyperbola.html) |
| Geometry | Arctangent terraces | arctan | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Geometry | Soft saturation | tanh | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Geometry | Rational oscillation | rational | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Geometry | Logarithmic spikes | log_spikes | [Reference](https://mathworld.wolfram.com/NaturalLogarithm.html) |
| Geometry | Root cusps | root_cusps | [Reference](https://mathworld.wolfram.com/FourierSeries.html) |
| Geometry | Superellipse arches | superellipse | [Reference](https://mathworld.wolfram.com/Superellipse.html) |
| Geometry | Rational multipole field | rational_dipole | [Reference](https://dlmf.nist.gov/18.3) |
| Geometry | Logarithmic vortex potential | log_potential | [Reference](https://mathworld.wolfram.com/NaturalLogarithm.html) |
| Fractals | Weierstrass texture | weierstrass | [Reference](https://mathworld.wolfram.com/Weierstrass-MandelbrotFunction.html) |
| Fractals | Takagi ridge | takagi | [Reference](https://mathworld.wolfram.com/BlancmangeFunction.html) |
| Fractals | Riemann sine texture | riemann | [Reference](https://mathworld.wolfram.com/WeierstrassFunction.html) |
| Fractals | Cantor staircase | cantor | [Reference](https://mathworld.wolfram.com/CantorFunction.html) |
| Fractals | Dyadic pulse texture | dyadic | [Reference](https://mathworld.wolfram.com/Weierstrass-MandelbrotFunction.html) |
| Fractals | Multiplicative cascade | cascade | [Reference](https://mathworld.wolfram.com/Weierstrass-MandelbrotFunction.html) |
| Fractals | Lacunary chirp | lacunary | [Reference](https://mathworld.wolfram.com/Weierstrass-MandelbrotFunction.html) |
| Fractals | Mandelbrot slice | mandelbrot | [Reference](https://mathworld.wolfram.com/MandelbrotSet.html) |
| Fractals | Minkowski question mark | minkowski | [Reference](https://mathworld.wolfram.com/MinkowskisQuestionMarkFunction.html) |
| Fractals | Fractional Brownian motion | fbm | [Reference](https://mathworld.wolfram.com/Weierstrass-MandelbrotFunction.html) |
| Chaos | Logistic chaos | logistic | [Reference](https://mathworld.wolfram.com/LogisticMap.html) |
| Chaos | Tent-map orbit | tent | [Reference](https://mathworld.wolfram.com/TentMap.html) |
| Chaos | Sine-map orbit | sine_map | [Reference](https://mathworld.wolfram.com/LogisticMap.html) |
| Chaos | Circle-map orbit | circle | [Reference](https://mathworld.wolfram.com/CircleMap.html) |
| Chaos | Hénon orbit | henon | [Reference](https://mathworld.wolfram.com/HenonMap.html) |
| Chaos | Chebyshev orbit | cheb_map | [Reference](https://dlmf.nist.gov/18.3) |
| Chaos | Logistic parameter slice | bifurcation | [Reference](https://mathworld.wolfram.com/LogisticMap.html) |
| Chaos | Lorenz trajectory | lorenz | [Reference](https://mathworld.wolfram.com/LorenzAttractor.html) |
| Chaos | Chirikov standard map | chirikov | [Reference](https://mathworld.wolfram.com/StandardMap.html) |
| Chaos | Gingerbreadman chaotic map | gingerbread | [Reference](https://mathworld.wolfram.com/GingerbreadmanMap.html) |
| Special functions | Bessel J₀ | bessel_zero | [Reference](https://dlmf.nist.gov/10.9) |
| Special functions | Bessel J₁ | bessel_one | [Reference](https://dlmf.nist.gov/10.9) |
| Special functions | Chebyshev contour | chebyshev | [Reference](https://dlmf.nist.gov/18.3) |
| Special functions | Legendre contour | legendre | [Reference](https://dlmf.nist.gov/18.3) |
| Special functions | Hermite wave packet | hermite | [Reference](https://dlmf.nist.gov/18.3) |
| Special functions | Laguerre pulse | laguerre | [Reference](https://dlmf.nist.gov/18.3) |
| Special functions | Error-function terraces | erf | [Reference](https://dlmf.nist.gov/7.2) |
| Special functions | Fresnel contour | fresnel | [Reference](https://dlmf.nist.gov/7.2) |
| Special functions | Airy function Ai | airy | [Reference](https://dlmf.nist.gov/9) |
| Special functions | Jacobi elliptic sn | jacobi_sn | [Reference](https://dlmf.nist.gov/22.2) |
| Rhythms | Polyrhythmic gates | polyrhythm | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html) |
| Rhythms | Euclidean rhythm | euclidean | [Reference](https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf) |
| Rhythms | Gated sine bursts | burst | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html) |
| Rhythms | Switched waveforms | switch | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.sawtooth.html) |
| Rhythms | Ratchet pulses | ratchet | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.gausspulse.html) |
| Rhythms | Ascending stairs | stairs | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html) |
| Rhythms | Thue-Morse pulses | thue_morse | [Reference](https://mathworld.wolfram.com/Thue-MorseSequence.html) |
| Rhythms | Seeded sample & hold | sample_hold | [Reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.square.html) |
| Rhythms | Fibonacci golden rhythm | fibonacci_word | [Reference](https://mathworld.wolfram.com/FibonacciWord.html) |
| Rhythms | Rudin-Shapiro sequence | rudin_shapiro | [Reference](https://mathworld.wolfram.com/Rudin-ShapiroSequence.html) |
| Acoustics | Gammatone auditory filter | gammatone | [Reference](https://en.wikipedia.org/wiki/Acoustics) |
| Acoustics | Shepard pitch illusion | shepard | [Reference](https://en.wikipedia.org/wiki/Shepard_tone) |
| Acoustics | Vocal formant resonator | formant | [Reference](https://en.wikipedia.org/wiki/Formant) |
| Acoustics | Karplus-Strong plucked string | karplus | [Reference](https://en.wikipedia.org/wiki/Karplus%E2%80%93Strong_string_synthesis) |
| Acoustics | Comb-filtered flanger sweep | comb_filter | [Reference](https://en.wikipedia.org/wiki/Comb_filter) |
| Acoustics | Phase distortion resonance | phase_distortion | [Reference](https://en.wikipedia.org/wiki/Phase_distortion_synthesis) |
| Acoustics | Morlet auditory wavelet | morlet | [Reference](https://en.wikipedia.org/wiki/Morlet_wavelet) |
| Acoustics | Liljencrants-Fant glottal wave | glottal_pulse | [Reference](https://en.wikipedia.org/wiki/Liljencrants%E2%80%93Fant_model) |
| Acoustics | Cochlear traveling wave | cochlea_wave | [Reference](https://en.wikipedia.org/wiki/Basilar_membrane) |
| Acoustics | Gabor acoustic atom | gabor | [Reference](https://en.wikipedia.org/wiki/Gabor_atom) |
| Solitons | KdV solitary wave | kdv_soliton | [Reference](https://en.wikipedia.org/wiki/Korteweg%E2%80%93de_Vries_equation) |
| Solitons | KdV two-soliton collision | kdv_two_soliton | [Reference](https://en.wikipedia.org/wiki/Korteweg%E2%80%93de_Vries_equation) |
| Solitons | Sine-Gordon topological kink | sine_gordon_kink | [Reference](https://en.wikipedia.org/wiki/Sine-Gordon_equation) |
| Solitons | Sine-Gordon breather | sine_gordon_breather | [Reference](https://en.wikipedia.org/wiki/Sine-Gordon_equation) |
| Solitons | Peregrine rogue wave | peregrine | [Reference](https://en.wikipedia.org/wiki/Peregrine_soliton) |
| Solitons | Gerstner trochoidal wave | gerstner | [Reference](https://en.wikipedia.org/wiki/Trochoidal_wave) |
| Solitons | Akhmediev breather | akhmediev | [Reference](https://en.wikipedia.org/wiki/Breather) |
| Solitons | Burgers viscous shock wave | burgers_shock | [Reference](https://en.wikipedia.org/wiki/Burgers%27_equation) |
| Solitons | Defocusing dark soliton | dark_soliton | [Reference](https://en.wikipedia.org/wiki/Soliton) |
| Solitons | Cnoidal wave train | cnoidal | [Reference](https://en.wikipedia.org/wiki/Cnoidal_wave) |
| Dynamics | Van der Pol relaxation oscillator | vanderpol | [Reference](https://en.wikipedia.org/wiki/Van_der_Pol_oscillator) |
| Dynamics | Duffing chaotic oscillator | duffing | [Reference](https://en.wikipedia.org/wiki/Duffing_equation) |
| Dynamics | Rössler attractor trajectory | rossler | [Reference](https://en.wikipedia.org/wiki/R%C3%B6ssler_attractor) |
| Dynamics | Chua’s double-scroll circuit | chua | [Reference](https://en.wikipedia.org/wiki/Chua%27s_circuit) |
| Dynamics | Kuramoto phase synchrony | kuramoto | [Reference](https://en.wikipedia.org/wiki/Kuramoto_model) |
| Dynamics | Lotka-Volterra predator-prey | lotka_volterra | [Reference](https://en.wikipedia.org/wiki/Lotka%E2%80%93Volterra_equations) |
| Dynamics | FitzHugh-Nagumo neural spike | fitzhugh_nagumo | [Reference](https://en.wikipedia.org/wiki/FitzHugh%E2%80%93Nagumo_model) |
| Dynamics | Synthetic ECG heartbeat | ecg | [Reference](https://physionet.org/content/ecgsyn/) |
| Dynamics | Ikeda optical resonator map | ikeda | [Reference](https://en.wikipedia.org/wiki/Ikeda_map) |
| Dynamics | Large-amplitude pendulum | pendulum | [Reference](https://en.wikipedia.org/wiki/Pendulum_(mathematics)) |
| Quantum | Quantum oscillator eigenstate | quantum_harmonic | [Reference](https://en.wikipedia.org/wiki/Quantum_harmonic_oscillator) |
| Quantum | Fabry-Pérot Airy resonance | fabry_perot | [Reference](https://en.wikipedia.org/wiki/Fabry%E2%80%93P%C3%A9rot_interferometer) |
| Quantum | Double-slit diffraction | double_slit | [Reference](https://en.wikipedia.org/wiki/Double-slit_experiment) |
| Quantum | Pöschl-Teller bound state | poschl_teller | [Reference](https://en.wikipedia.org/wiki/P%C3%B6schl%E2%80%93Teller_potential) |
| Quantum | Hofstadter Harper eigenstate | hofstadter_slice | [Reference](https://en.wikipedia.org/wiki/Hofstadter%27s_butterfly) |
| Quantum | Relativistic Doppler sweep | doppler | [Reference](https://en.wikipedia.org/wiki/Relativistic_Doppler_effect) |
| Quantum | Planck blackbody spectral curve | planck_radiation | [Reference](https://en.wikipedia.org/wiki/Planck%27s_law) |
| Quantum | Cornu spiral curvature | cornu_spiral | [Reference](https://en.wikipedia.org/wiki/Euler_spiral) |
| Quantum | Catenary chain arch | catenary_arch | [Reference](https://en.wikipedia.org/wiki/Catenary) |
| Quantum | Newton rings interference | newton_rings | [Reference](https://en.wikipedia.org/wiki/Newton%27s_rings) |
| Curves | Witch of Agnesi | agnesi | [Reference](https://mathworld.wolfram.com/WitchofAgnesi.html) |
| Curves | Folium of Descartes profile | folium | [Reference](https://mathworld.wolfram.com/FoliumofDescartes.html) |
| Curves | Semi-cubical parabola cusp | semicubical | [Reference](https://mathworld.wolfram.com/SemicubicalParabola.html) |
| Curves | Astroid star envelope | astroid | [Reference](https://mathworld.wolfram.com/Astroid.html) |
| Curves | Cassini oval contour | cassini | [Reference](https://mathworld.wolfram.com/CassiniOvals.html) |
| Curves | Euler clothoid sweep | clothoid | [Reference](https://mathworld.wolfram.com/CornuSpiral.html) |
| Curves | Cissoid of Diocles | cissoid | [Reference](https://mathworld.wolfram.com/CissoidofDiocles.html) |
| Curves | Versiera resonance contour | versiera | [Reference](https://mathworld.wolfram.com/WitchofAgnesi.html) |
| Curves | Kampyle of Eudoxus | kampyle | [Reference](https://mathworld.wolfram.com/KampyleofEudoxus.html) |
| Curves | Gielis superformula contour | superformula | [Reference](https://en.wikipedia.org/wiki/Superformula) |
| Number theory | Collatz hailstone orbit | collatz | [Reference](https://mathworld.wolfram.com/CollatzProblem.html) |
| Number theory | Prime counting staircase π(x) | prime_counting | [Reference](https://mathworld.wolfram.com/PrimeCountingFunction.html) |
| Number theory | Farey mediant staircase | farey_steps | [Reference](https://mathworld.wolfram.com/FareySequence.html) |
| Number theory | Stern’s diatomic sequence | stern_brocot | [Reference](https://mathworld.wolfram.com/SternsDiatomicSeries.html) |
| Number theory | Hofstadter Q-sequence | hofstadter_q | [Reference](https://mathworld.wolfram.com/HofstadterQ-Sequence.html) |
| Number theory | Euler totient oscillation | totient_sum | [Reference](https://mathworld.wolfram.com/TotientFunction.html) |
| Number theory | Gauss continued fraction map | gauss_map | [Reference](https://mathworld.wolfram.com/GaussMap.html) |
| Number theory | Dragon paperfolding sequence | paperfolding | [Reference](https://mathworld.wolfram.com/RegularPaperfoldingSequence.html) |
| Number theory | Dirichlet divisor fluctuation | divisor_sum | [Reference](https://mathworld.wolfram.com/DivisorFunction.html) |
| Number theory | Van der Corput low-discrepancy | van_der_corput | [Reference](https://en.wikipedia.org/wiki/Van_der_Corput_sequence) |

## Video reference and new compositions

Before listening curation, the collection reached 182 families in 18 categories. The 22 additions are registered in `equations.js`; the earlier 160-family seed mapping is preserved. The supplied local Matharium video is the source for the ten video constructions. See [VIDEO_FORMULAS.md](VIDEO_FORMULAS.md) for the full audit and [browser formula notes](dist/video-formulas.html) for every equation. The missing `c` melody list in scenes 2 and 10 is explicitly reconstructed; no claim of identical recorded sound is made.

Twelve original compositions add swing kick pairs, ratchet bursts, three-against-five pulse trains, log-periodic ripples, cubic Bezier ribbons, Hermite smoothstep glides, raised-cosine packets, rational phase bending, resetting chirps, sine-to-triangle morphs, palindrome pulse codes, and bounded arctangent phase warps. Their displayed definitions fully specify each construction. They are compositions of elementary functions, rather than claimed solutions of additional physical systems.

## Listening-focused collection

The active collection now contains 168 patterns in 25 categories. See [LISTENING_NOTES.md](LISTENING_NOTES.md) for the 89 retired entries, 16 new constructions and primary technique references. The catalog above documents historical seed definitions as well as active entries. Current browsing and Next pattern include playground.js, cartoon.js, shapes.js, machines.js, songs.js, performances.js, kinetic-scores.js, curve-play.js and continuous-curves.js. See [cartoon equations](dist/funny-sounds.html) for synthesis references and [pocket song scores](dist/pocket-songs.html) for the 12 original arranged tunes and their composition references.

[Shape equations](dist/shape-equations.html) documents the ten parametric additions and their geometry and synthesis references.

[Music machines](MUSIC_MACHINES.md) documents eight original simulation-to-score constructions and direct verification.

[Visual scores](VISUAL_SCORES.md) documents five geometric musical additions, their source constructions and score mappings. See [visual score equations](dist/visual-scores.html) for individual replay links and references.
