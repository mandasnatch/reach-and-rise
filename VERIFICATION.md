# Verification record

## Passed locally

- Nine Node tests: geometry/aspect ratio, low visibility, complete flexion and extension cycles, jitter rejection, tracking loss, prescription validation, signed token tampering, report validation, and server workflow.
- The server workflow test uses mocked Redis and Resend responses. It checks authentication, therapist-only prescriptions, patient-only report submission, origin rejection, retained program versions, idempotent reports and notification acceptance. This is not a live service test.
- Browser: landing screen and patient game render; a slider-driven movement cycle counts a repetition; ending a session generates a report marked Simulation; the therapist dashboard shows the same report.
- Browser: therapist edits elbow extension, repetitions and sets; saving creates program v2; the patient view loads those changes after a reload.
- Static build succeeds; JavaScript parses successfully.
- MediaPipe's WASM initializes locally and on the hosted app. The hosted app handles denied camera permission with retry controls. Live camera input and movement accuracy still require verification on the user's laptop.
- A complete simulated extension session finishes automatically, retains its program version and awards a clearly labelled game reward.
- The corrected Vercel deployment is reachable at https://reach-and-rise.vercel.app without authentication. The page, browser scripts and API config return HTTP 200. The browser renders the patient game with no captured console errors. The config explicitly reports cloud=false and email=false.

## Outstanding

- Initial Vercel deployment misclassified the browser script as a server. Setting framework=null corrected the routing in deployment `dpl_F8W8mHgY2i7ce54bBvQh6ipgpgom`. Hosted page and API checks pass.
- The public GitHub repository has been created; source push verification is tracked separately from runtime verification.
- Shared dashboard storage and real email delivery require Upstash/Resend server environment configuration. Neither has been provisioned or verified live.
- No real-patient validation has been performed; this is a sample-data demonstration.
