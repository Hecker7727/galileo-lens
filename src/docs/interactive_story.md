# Interactive Story Mode — Mission Simulator

## Purpose
- Interactive screen where users configure a mission (gravity, duration, focused bioscience challenges) and run an AI-driven forecast of health risks.
- Frontend component: `components/InteractiveStory.tsx`
- Uses `services/predictiveService.predictHealthRisks` (remote /api/predict with heuristic fallback).

## Quick usage
- Open the app, select "Story" in the view switcher.
- Configure gravity, mission duration, select challenges, add optional notes, then click "Run simulation".

## Example payload
```json
{
  "input": {
    "durationDays": 180,
    "gravity": 0.38,
    "subject": {
      "age": 35,
      "bmi": 24,
      "activityLevel": "moderate"
    }
  },
  "contextNotes": ["bone_loss","limited_exercise_facility"]
}
```

## Files in this implementation
- Added: `components/InteractiveStory.tsx`
- Modified: `App.tsx` (view switcher + story view)
- Created: `tmp/predict_payload.json` (test payload)
- Created: `server/index.js` (API server)
- Uses: `services/predictiveService.ts`

## Edge cases and next improvements
- Surface clear error when `/api/predict` is unreachable (currently falls back silently).
- Add validation and UI guards for invalid inputs.
- Add unit and integration tests.
- Add story presets for quick demos.

## How to test locally
1. Start server: `node server/index.js`
2. Start frontend: `npm run dev`
3. Open app, switch to "Story", run a simulation.
4. API smoke test:
   ```bash
   # PowerShell
   Invoke-RestMethod -Uri 'http://localhost:9000/api/predict' -Method Post -ContentType 'application/json' -Body (Get-Content tmp\predict_payload.json -Raw)
   
   # cmd.exe
   curl -X POST http://localhost:9000/api/predict -H "Content-Type: application/json" -d @tmp/predict_payload.json
   ```

## Verification checklist
- [x] Analyze requirements
- [x] Read App.tsx to determine integration point
- [x] Create InteractiveStory component
- [x] Fix TypeScript typing and JSX issues
- [x] Implement main functionality (wire into App)
- [x] Add documentation (this file)
- [ ] Handle edge cases (input validation, disabled UI when service unavailable, graceful errors)
- [ ] Test the implementation (manual + basic unit)
- [ ] Verify results (end-to-end: start server + frontend + UI flow)
- [ ] Add unit & acceptance tests (server and client)