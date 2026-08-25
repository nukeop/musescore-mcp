---
name: bar-notation
description: Reference sheet for the notation format used by musescore-mcp tools. Use when calling musescore-mcp tools.
---

# Bar notation reference

Bars are separated by `|`. Just like in regular sheet music, all bars must have the correct number of beats in them. All pitches are written pitch.

| Syntax                   | Meaning                                              |
| ------------------------ | ---------------------------------------------------- |
| `C5:4`                   | Note: letter A-G, optional `♭`/`♯`, octave, duration |
| `r:8`                    | Rest                                                 |
| `R`                      | Full-measure rest, alone in the bar                  |
| `chord(C4 E4 G4):4`      | Chord, one duration for the entire chord             |
| `tuplet(3:2 C5:8 D5 E5)` | Tuplet, ratio is actual:normal                       |
| `C5:4~ C5`               | Tie                                                  |
| `[C-7] C4:4`             | Chord symbol, attached to the following event        |

Durations: `:1` `:2` `:4` `:8` `:16` `:32` `:64` `:128`, dotted `:4.`, double-dotted `:4..`. A duration carries over to following events until changed. It's mandatory on the first note/rest.

Chord symbols are written in square brackets before the event they attach to. The root is a note name (A-G with optional ♭/♯). Everything after the root is the suffix, passed through unchanged. Common suffixes: `-7` (minor 7th), `7` (dominant), `^7` (major 7th), `o7` (diminished), `ø7` (half-diminished), `-` (minor), `6`, `-6`. A chord symbol can attach to any event, including rests.

Example:

```
[C-7] C5:4. B4:8 [F7] A4 G4 r F4~ | [B♭^7] F4:2. E4:4 | tuplet(3:2 C5:8 D5 E5) [E♭7] r:4 r:2 | R
```
