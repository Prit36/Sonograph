# Pocket songs

Added 12 original four-bar mini compositions, preserving all 141 earlier patterns. Active total: 153 patterns, 24 categories.

## Arrangement plan

Use a recognizable motif, an answering phrase, a return and a tonic ending. Four independently weighted parts provide melody, bass, triads and drums. Contrast groove, meter, scale, note density and lead timbre between pieces. Seeds transpose each composed score without randomizing away its hook.

| Name | Style | Lead |
| --- | --- | --- |
| Rubber duck funk | Funk | kazoo |
| The kazoo heist | Spy theme | kazoo |
| Pixel picnic | Chiptune | chip |
| Moonwalk mambo | Mambo | marimba |
| Penguin in a tuxedo | Waltz | reed |
| Toaster ska | Ska | reed |
| Disco noodles | Disco | chip |
| Sneaky socks | Swing | marimba |
| Seven-legged tap dancer | 7/8 dance | wood |
| Baroque banana chase | Counterpoint | organ |
| Jellybean drop | Half-time bass | boing |
| Circus on a bicycle | 6/8 jig | whistle |

## Implementation

- songs.js owns deterministic event scores, catalog registration and four-lane note rendering. All note blocks and cursor highlights use the audio event times. No extra card copy.
- sound.js adds band-limited harmonic kazoo, chip, reed, marimba, organ and guitar voices; seeded kick, snare, clap, brush, rim and hat synthesis. Existing event tones keep their renderer. A song-only soft knee manages coincident attacks before level matching.
- Each song has explicit rests and chord changes. Last tonic notes finish before the scan ends. Swing uses a continuous piecewise timing map, applied to note starts and lengths.
- Vivid is the arranged performance. Original retains the legacy curve renderer. Both Scan durations use the same normalized score.

## References

- [Ableton Learning Music](https://learningmusic.ableton.com/): beats, basslines, chords, melody and structure.
- [Ableton Using Grooves](https://www.ableton.com/en/live-manual/12/using-grooves/): timing and velocity shape rhythmic feel.

No copyrighted melodies or audio samples are used. [Browser score notes and replay links](dist/pocket-songs.html).

## Direct verification

All 153 active seeds load. The 12 song scores are distinct. Each of the 12 songs rendered at 48 kHz for both 7-second and 14-second Vivid scans, with no nonfinite samples or events outside the domain. Mixed RMS ranged from 0.204 to 0.238; peak stayed at or below 0.82. All 12 also rendered through Original at both durations at 8 kHz. JavaScript syntax checks passed. These were direct terminal checks, with no test files added.
