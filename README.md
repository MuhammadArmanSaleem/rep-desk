# RepDesk / Form & Iron

A neutral, fictional gym sales demo: a public website and working management workspace in one Next.js + TypeScript project. Dark graphite/lime website, light operations dashboard. No required environment variables.

## Admin login: demo now, passwords after Supabase

**Current demo: no password is required.** Open `/admin` and use **Preview role** to demonstrate Owner, Receptionist or either Trainer. There is no default admin email/password because authentication has not been implemented in this version.

This is intentional while Supabase setup is deferred. The role switcher is a presentation feature, not secure RBAC. It must not be used to protect real gym data.

| Stage | How the admin enters |
| --- | --- |
| Current browser-only demo | Open `/admin`; choose a preview role. No account or password. |
| Future Supabase-connected version | Sign in using an individual staff email and password, with the assigned role enforced on the server and in the database. This stage is not implemented yet. |

### First admin when Supabase is added

These are the requirements for the next implementation, not steps that enable login in the current demo:

1. Create a dedicated RepDesk Supabase project and apply the gym-specific database/auth schema once it is implemented.
2. Create the initial owner in **Supabase Authentication → Users** using your chosen email and a strong, unique password of at least 12 characters.
3. Link that Auth user's ID to the protected gym staff profile with the `owner` role, using the setup SQL/script supplied with that integration.
4. Configure the app's public connection settings and server-only key in the hosting environment, then redeploy.
5. Once the protected login route is implemented, sign in with the chosen email/password. The owner will then create individual receptionist/trainer accounts through the owner-only staff screen.

A migration alone does not create an Auth user or choose a password. A server secret/API key is not an admin login password. The gym staff schema, production login route, password recovery and staff-creation screen are still part of that future Supabase phase. Do not assume SalonDesk's existing auth tables or setup script apply to this repo.

Do not commit passwords, secret keys or real gym data. Use sample information in this demo.

## Run

Node.js 20.9+ required.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 for the public site, `/admin` for management. Production build: `npm run build`, then `npm start`.

## Demonstrate the whole workflow

1. On the public site, submit a trial request using sample details and a valid Pakistani-format phone number.
2. Open Management demo → Trials **on the same browser and origin**. The request appears immediately.
3. Assign a coach and change its status to Confirmed.
4. Switch the Preview role selector to that trainer to see assigned trials/members and mark a confirmed trial attended. Payments, renewals and messages are hidden.
5. Switch to Owner or Receptionist. Convert the trial to a member and select a membership package.
6. Under Members open the receipt using the arrow. Record cash or bank-transfer payments, then print or save as PDF using the browser print dialog. No money is actually processed.
7. Renew the membership. A new 30-day period starts after the existing period, or today if expired. Previous periods and their payment receipts remain in Payments.
8. The public Ask a question form saves to the management Messages inbox. Mark inquiries handled after a manual reply.
9. Refresh to demonstrate persistence. Use Owner → Reset demo data to restore samples (confirmation required).

## Current scope and storage

The user deliberately deferred Supabase provisioning until later. This version uses versioned localStorage (`repdesk:demo:v1`). It is a **sales demonstration, not production software**. No real login, server authorization, Supabase integration, shared database, cross-device messages, email or WhatsApp delivery is implemented. The role switcher simulates the agreed Owner / Receptionist / Trainer experiences; it is not a security boundary, and all stored demo data can be inspected in the browser. Use only sample information.

Owner and Receptionist can manage trial requests, members, periods, payments and messages. Trainer previews show only their assigned members/trials, with no financial controls. Dates use Asia/Karachi, currency is PKR, and every package is a fixed 30-day period. No inventory, payroll, biometric attendance, online payments or automated messaging is included.

Sample names, packages, trainers and the Form & Iron identity are fictional. No actual gym location, results, testimonials or accreditation is claimed. Search indexing is disabled.

## Next phase: Supabase

When the dedicated project is created, replace the demo storage with authenticated server routes and tables for protected staff profiles, members, trial requests, membership periods, payments and messages. Enforce permissions with RLS, validate all writes on the server, and make payment/renewal transactions atomic. Create the first owner through Supabase Auth plus a protected profile; subsequent accounts should be owner-managed. Do not put real data into this demo or represent its role previews as secure RBAC.

## Checks

```sh
npm run test
npm run typecheck
npm run build
```

Tests cover preserving historical receipts on renewal, expired/future period dates, rejecting overpayments, restricting trainer commands, filtering role previews and preventing duplicate trial conversion. Browser checks cover public submission → dashboard → conversion → payment → renewal → refresh.
