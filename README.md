# RepDesk / Form & Iron

A neutral, fictional gym sales demo: a public website and working management workspace in one Next.js + TypeScript project. Dark graphite/lime website, light operations dashboard. No required environment variables.

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
