# nephrology-fellowship-scheduler
Scheduling helper for UNC Nephrology Fellowship
# Nephrology Fellowship Scheduler

An interactive tool for building the nephrology fellowship clinical schedule for a single academic year (July 1 → June 30). Designed to be run locally by the chief fellow when it's time to lay out the year's rotations.

---

## Quick start

You'll need [Node.js](https://nodejs.org) (v18+) installed.

```bash
npm install      # first time only
npm run dev      # starts the app, open the localhost URL it prints
```

That's it — everything runs in your browser. There's no server, login, or database. When you're done, close the tab and stop the process (`Ctrl+C`).

---

## How to use it

1. **Set the academic year** at the top (e.g. July 1, 2025 → June 30, 2026).
2. **Confirm the fellows.** There are 8 fellows — 4 first-years (Y1) and 4 second-years (Y2). Edit names and year designations as needed.
3. **Set the Renal Block weeks.** All Y2 fellows do this together to teach the medical students; it defaults to mid-February but you can enter the actual weeks once they're known.
4. **Enter vacation requests.** Each fellow can list up to 3 preferred vacation weeks (choices 1–3). The scheduler honors these when possible.
5. **Click Generate Schedule.**
6. **Review and adjust.** Use the week navigator to move through the year, and the dropdowns to hand-tweak any assignment. The distribution table shows each fellow's rotation counts against their targets so you can spot anything off.
7. **Export to CSV** when you're happy — fellows are rows, weeks are columns, so each fellow's whole year reads left-to-right.

---

## Scheduling rules the tool enforces

These are baked into the generator so you don't have to track them by hand.

**Coverage that must never have a gap**
- ICU consult and Floor consult are staffed **every week** of the year.
- Night coverage is staffed **every week except the Christmas–New Year week**.

**Holiday handling**
- Thanksgiving week: only ICU, Floor, and Night are staffed.
- Christmas–New Year week: only ICU and Floor are staffed (no nights).
- No fellow works **both** Thanksgiving and Christmas.

**Consult load (ICU + Floor)**
- Y1 fellows: 8 weeks ICU + 8 weeks Floor each (16 consult weeks).
- Y2 fellows: 5 weeks ICU + 5 weeks Floor each (10 consult weeks).
- This slightly front-loads consults onto first-years, as the program director prefers.

**Per-fellow rotation targets**

| Rotation | Year 1 | Year 2 |
|---|---|---|
| ICU consult | 8 | 5 |
| Floor consult | 8 | 5 |
| Transplant consult | 4 | 4 |
| Subspecialty | 5 | 6–7 |
| Outpatient | 4 | 6–7 |
| Elective | 4 | 4–5 |
| Renal Biopsy | balance | balance |
| Night coverage | balance | balance |
| Apheresis | 0 | 1 |
| Renal Block | — | 2 (fixed, simultaneous) |
| Orientation | 1 (week 1) | — |
| Vacation | 3 | 3 |

**Other constraints**
- **Vacation is non-negotiable:** every fellow gets exactly 3 weeks, always.
- **Apheresis is Y2-only** — fellows only need it once across the two-year fellowship, so second-years cover it and first-years get that week back (usually as elective) since they're already clinically busy.
- **Orientation** is fixed to week 1 for all first-years.
- **Renal Block** is 2 consecutive weeks with all Y2 fellows out simultaneously; Y1 fellows cover clinical services during that stretch.
- **No rotation repeats two weeks in a row** where avoidable.
- **Consult weeks (ICU / Floor / Transplant) are not scheduled back-to-back.**
- **Certain post-ICU transitions are avoided** — ICU is not followed by Nights, Subspecialty, or Renal Biopsy (a downstream outpatient-clinic constraint).

---

## Configurable each year
- Academic year start
- Fellow names and Y1/Y2 designations
- Renal Block weeks
- Vacation preferences per fellow

---

## Notes & limitations
- **State is local to the browser.** The schedule lives in the page while you have it open. Export to CSV to save your work — there's no autosave and nothing is shared across devices.
- The generator uses a scoring approach, so the same inputs won't always produce an identical schedule. If a generated schedule has an awkward spot, regenerate or hand-edit it.
- Targets marked as ranges (e.g. Subspecialty for Y2) give the algorithm room to balance coverage; small deviations are expected and fine.

---

## Tech stack
React + Vite, styled with Tailwind CSS, icons from lucide-react. No backend.
