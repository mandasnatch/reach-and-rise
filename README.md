# Reach & Rise

An MIT-licensed demonstration of camera-guided stroke rehabilitation games with therapist-programmed elbow flexion/extension and session reporting. **Sample data only; not validated for clinical use.**

Live demonstration: https://reach-and-rise.vercel.app

Source repository: https://github.com/mandasnatch/reach-and-rise

## Run locally

Requires Node.js 22 or newer. No package installation is required.

```sh
node server.mjs
```

Open http://127.0.0.1:4173. Choose the patient or therapist demo. Configure a program in the therapist view, switch to the patient, enable the camera or move the simulation slider, finish a session, then switch back to review the report.

```sh
node --test tests/*.test.mjs
node scripts/build.mjs
```

## Camera and MediaPipe

MediaPipe Tasks Vision 0.10.32 runs in the browser. It downloads its JS/WASM from jsDelivr and the Pose Landmarker Lite model from Google when the camera is enabled. No API key is needed. Browser camera access requires HTTPS or localhost. The app requests video only, not audio; it does not record or upload video. Google Fonts is used for typography.

Elbow angles are estimated from 2D shoulder/elbow/wrist landmarks with the image aspect ratio accounted for. The preview is mirrored but anatomical side selection is not swapped. The user must present the working arm side-on to reduce projection error. Occlusion, clothing, lighting, and camera placement affect accuracy; this is not a goniometer. Pose landmarks do not establish muscle strength, spasticity, movement safety, or clinical recovery.

The counter requires a complete start→target→return cycle with a 250ms dwell at each threshold, exponential smoothing, and visible landmarks. Tracking gaps reset the current cycle. Hidden browser tabs pause the game. Sets have prescribed rest intervals. Simulation is labelled and separated from camera repetition totals.

## Demo modes and data

**Device-local mode works immediately:** the sample patient and therapist share browser localStorage. It is deliberately labelled as unauthenticated. Email is a preview and is never represented as sent. Do not enter real patient information. Export reports to JSON; clear this site's browser storage to delete local demo data.

**Connected demo mode requires configuration:** `api/rehab.js` uses Upstash Redis over HTTPS for shared program and report storage, server-signed HttpOnly SameSite cookies for two role-specific demo access codes, and Resend for notification emails. Set the keys in `.env.example` in the Vercel project. Locally use `node --env-file=.env server.mjs`. Use different random patient and therapist codes (at least 12 characters) and a random AUTH_SECRET of at least 32 characters. This is one sample patient assigned to one sample therapist, not a multi-tenant patient system. Rotate AUTH_SECRET to revoke all sessions. Delete keys with prefix `reachrise:demo:v1:` to remove the connected demo data. The dashboard retrieves the latest 100 sessions; stored reports are not automatically deleted.

Only therapists can update prescriptions; only patients can submit reports. Prescriptions are versioned and reports retain their version. Browser role switching cannot grant connected access. Login attempts are rate-limited in Redis. POST requests require same-origin JSON. Unique session IDs and provider idempotency keys reduce duplicate submissions and notifications. Notifications contain only a dashboard link, not patient measurements. “Accepted” means the email provider accepted the request, not confirmed inbox delivery. Failed email can be retried from a report within 23 hours; there is no background retry worker or delivery webhook in this demo.

## Deploy on Vercel

Import this source repository as a Vercel project. Use framework preset **Other**, build command `npm run build`, output directory `dist`. Vercel discovers the Node function in `api/rehab.js`. Alternatively run `vercel deploy --prod` from this folder with an authenticated Vercel CLI. The static demo works without environment variables; connected roles, shared reports and real email need the server configuration above. A verified Resend sender and intended recipient are required.

Publishing to Vercel hosts the app; the public GitHub repository makes its source accessible. Keep `.env`, `.vercel`, generated output, credentials and patient data out of commits.

## Scope and limitations

- Supports therapist-configured elbow flexion and extension, selected arm, angle thresholds, repetitions, sets, rest and instructions.
- Live camera input and a clearly labelled slider simulation; no mock data is represented as live measurements.
- Session history, estimated range, tracking coverage, program snapshot, JSON export, dashboard and email preview.
- Connected authentication/storage/email adapters are implemented but require service configuration and end-to-end validation before they can be called operational.
- This demonstration must not be used for real-patient care. A pilot needs clinically reviewed exercise logic and usability, proper identity management, multi-patient assignment, consent, retention controls, audit records, and validation of movement measurements and failure behavior.
- MIT covers this repository's authored code. MediaPipe and fonts retain their respective licenses. MediaPipe: https://github.com/google-ai-edge/mediapipe (Apache-2.0); Google Fonts DM Sans and Manrope use the SIL Open Font License.

## Structure

- `public/app.js`: patient game, camera integration, therapist editor, reports
- `public/motion.js`: angle calculation, validated prescription and repetition state machine
- `api/rehab.js`: connected-demo authorization, storage and notification adapter
- `server.mjs`: local server
- `tests/`: deterministic movement and server boundary tests

Contributions: add exercise definitions with corresponding movement-state tests; keep raw video local; preserve explicit simulation labels; never add service secrets to client files.
