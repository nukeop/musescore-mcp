---
name: bar-notation
description: Reference sheet for the notation format used by musescore-mcp tools, and for reading get_overview output. Use when calling musescore-mcp tools.
---

# Bar notation reference

Bars are separated by `|`. Just like in regular sheet music, all bars must have the correct number of beats in them. All pitches are written pitch. Accidentals are `b`, `#`, `bb` and `##`.

| Syntax                   | Meaning                                            |
| ------------------------ | -------------------------------------------------- |
| `C5:4`, `Bb4:4`          | Note: letter, accidental, octave, duration         |
| `r:8`                    | Rest                                               |
| `R`                      | Full-measure rest, alone in the bar                |
| `chord(C4 E4 G4):4`      | Chord, one duration for the entire chord           |
| `tuplet(3:2 C5:8 D5 E5)` | Tuplet, ratio is actual:normal                     |
| `grace(D4:8) C4:4`       | Grace note (acciaccatura) before the main note     |
| `slur(C4:8 D4 E4)`       | Slur, may cross barlines: `slur(G4:8 A4 \| B4 C5)` |
| `C5:4~ C5`               | Tie                                                |
| `C5:4'`                  | Staccato                                           |
| `C5:4>`                  | Accent                                             |
| `C5:4(tr)`               | Short trill                                        |
| `C5:4(mord)`             | Mordent                                            |
| `C5:4(scoop)`            | Scoop                                              |
| `C5:4(gliss)`            | Glissando to the next note                         |
| `[C-7] C4:4`             | Chord symbol, attached to the following event      |

Durations: `:1` `:2` `:4` `:8` `:16` `:32` `:64` `:128`, dotted `:4.`, double-dotted `:4..`. A duration carries over to following events until changed. It's mandatory on the first note/rest.

Each note or chord gets at most one suffix: a tie, an annotation, or a glissando. No stacking.

Chord symbols go in square brackets before the event they attach to. The root is a note name, and everything after it is the suffix. Use ASCII only.

Common suffixes: `-7` (minor 7th), `7` (dominant), `^7` (major 7th), `o7` (diminished), `07` (half-diminished), `-` (minor), `6`, `-6`, `7sus`, `sus4`, `sus2`, `7alt`. Extensions: `7b9`, `7#11`.

Slash chords: `[A7/G]`, `[G-7/Bb]`, `[C/E]`. `[C6/9]` is not a slash chord.

A chord symbol can attach to any event, including rests. A chord symbol before `slur(` or `tuplet(` attaches to the first event inside the group, and read_measures prints it there. Put a chord symbol either outside or inside a group, not both.

Example:

```
[C-7] grace(B4:8) C5:4.' B4:8> [F7] slur(A4(tr) G4 r F4~) | [Bb^7] F4:2.(gliss) E4:4 | tuplet(3:2 C5:8 D5 E5) [Eb7] r:4 r:2 | R
```

# Reading the overview

get_overview prints a summary line, a Form section, and a Chords section. Form and Chords are omitted when empty.

- Key signature shows the major and equivalent minor key in written pitch. A transposing instrument's concert key appears in parentheses next to its name on the Instruments line.
- Bar 1's key, time, and tempo are printed in the summary Subsequent `key:`, `time:`, or `tempo:` entries always means a mid-score change.
- The Chords grid prints 4 bars per line, each line prefixed with its first bar number. Lines without chord symbols are omitted. Example: a jump from `1:` to `9:` means bars 5-8 don't have chords.
- Chord roots are written pitch, spelled the same as read_measures output.
