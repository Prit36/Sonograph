# Music machines

Eight new constructions bring the collection to 141 patterns in 23 categories. All 133 earlier entries remain available.

## Implemented plan

1. Use one seeded event timeline for each animation and its audio, so visual actions cause the notes.
2. Implement eight distinct mechanisms, with dedicated controls rather than variations of one pattern.
3. Constrain pitches to a seeded pentatonic scale, vary the instruments and articulations, leave space between events, and finish with a short tonic answer.
4. Verify the generated audio and algorithm outcomes directly, then check controls, dragging, replay, and presentation in the browser. No test files, suites, or browser automation scripts are added.

## Constructions

| Machine | Mechanism | Interaction | Sound |
| --- | --- | --- | --- |
| Musical pinball | Reflected velocity at bumpers and walls | Launch angle | Bent boings, bell replies, soft wall bass; speed controls brightness |
| Sorting orchestra | Actual bubble, insertion, or selection sort | Sort selector | Swap duets, occasional comparison ticks, final resolution |
| Ant composer | Right/left turn and binary cell toggle on a wrapping grid | Step count | Alternating plucks and bent accents from revisits |
| Domino reactions | Timed propagation through a branching parent graph | Break or restore one link | Branching melodic runs; unreached pieces stay silent |
| Sound maze | Seeded perfect maze plus depth-first exploration | New maze | Forward plucks, descending backtrack whistles, successful-route answer |
| Magnetic dancers | Softened attractive/repulsive field with damping and boundary reflection | Drag magnets, or X/Y controls | Close encounters, turns, and wall contacts trigger chirps |
| Knot untying | Planar interpolation from a tangled polyline to a straight line; segment-intersection detection | Tension | Disappearing crossing pairs release boings; endpoints finish with plucks |
| Puzzle-piece harmony | Six correctly matched pieces activate interlocking parts | Drag pieces to matching homes, Connect next, Scatter | The phrase fills in as pieces connect; automatic replay assembles remaining pieces |

The knot is a planar untangling illustration, not a physical three-dimensional knot solver. Dominoes use graph propagation rather than rigid-body collision dynamics. Those distinctions are explained in the construction details.

## Replay and implementation

`machines.js` generates simulations and scores, `machines-view.js` draws them, and `machine-controls.js` handles accessible controls and dragging. The player and collection select the machine renderer only for these eight new entries. Existing curve and shape renderers remain available.

Seeds use the existing `sg2-family--entropy` form with optional settings after `~`, for example `sg2-musical_pinball--resonance~a=35`. Editing a machine preserves the base seed and recalculates its timeline. Settings are included in the URL and Copy seed. Original sound uses the existing pitch renderer; Vivid uses the new event instruments.

Toy-event synthesis uses smooth attacks and releases, decaying harmonic or FM tones, bounded modulation, and conservative peaks. Noninteger bell partials use continuous phase so they do not jump at fundamental-cycle boundaries. The score places its closing three-note answer after the machine events.

## Direct verification

- All eight reference seeds rendered finite audio at 48 kHz over seven seconds, with nonzero RMS and peaks no higher than 0.82.
- Bubble, insertion, and selection sorting each ended with values 1 through 12 in order.
- The maze explorer and its solution path both reached exit 53.
- The reference tangle ended with zero segment crossings.
- Breaking the domino link left three downstream pieces standing and removed their notes.
- Editing launch, sorting, ant steps, domino link, magnetic field, tension, or puzzle connections changed the generated score.
- Browser checks confirmed playback, launch editing, magnet sliders and direct dragging, puzzle snapping and Connect next, sorting selection, domino-link toggling, ant step count, knot tension, maze regeneration, and preservation of edited settings after reload.

Browse [machine formulas and replay links](dist/music-machines.html).
