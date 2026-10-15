# Progress

## Figma
Page **Progress** (`3769:50200`), file `ilpJ5K66cGR85o287K4HDD`.

| Component set | Node id | Variants |
|---|---|---|
| .Frame 1 (hidden/placeholder) | `5097:51978` | 4 |

The page also contains `Frame 3` (`5097:51993`), a 99x111 white frame holding one instance of `.Frame 1`.

![.Frame 1](img/progress.png)

## Description
No description. **The page has no real progress component.** The only set is a hidden-style placeholder (name starts with `.`).

## Variant axes
- `Property 1: Default|Variant2|Variant3|Variant4` (default Figma naming)
- No non-variant props.

## Anatomy (Property 1=Default)
```
.Frame 1 (COMPONENT, 24x24, no auto-layout)
└─ Ellipse 1  ELLIPSE 24x24, fill #d9d9d9
```
All four variants are identical: a 24px grey (#d9d9d9) circle, with no rotation or arc and no difference between them.

## Token table
| property | value |
|---|---|
| fill | #d9d9d9 (no token, nearest `light-grey/weak` #d8d8d8) |
| size | 24x24 |

## Notes
- This is a work-in-progress stub (possibly the start of a spinner animated across 4 frames). There is no linear progress bar, spinner arc, determinate value or label in Figma.
- Do not build from this. Define progress/spinner specs separately (e.g. with `primary/default` on a `bg/variant` track) once design provides them.
