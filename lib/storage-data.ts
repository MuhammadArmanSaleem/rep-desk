import { Data, validDate } from "./model";
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown) => typeof v === "string";
const number = (v: unknown) =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
const date = (v: unknown) => typeof v === "string" && validDate(v);
export function isDemoData(value: unknown): value is Data {
  if (!object(value) || value.version !== 1) return false;
  const keys = ["members", "memberships", "payments", "trials", "messages"];
  if (
    !keys.every(
      (k) => Array.isArray(value[k]) && (value[k] as unknown[]).every(object),
    )
  )
    return false;
  const d = value as unknown as Data;
  if (
    !d.members.every(
      (m) =>
        [m.id, m.name, m.phone, m.trainerId, m.goal].every(text) &&
        m.name.trim().length > 0,
    )
  )
    return false;
  if (
    !d.memberships.every(
      (m) =>
        [m.id, m.memberId, m.planId].every(text) &&
        date(m.start) &&
        date(m.end) &&
        m.end >= m.start &&
        number(m.total) &&
        m.total > 0,
    )
  )
    return false;
  if (
    !d.payments.every(
      (p) =>
        [p.id, p.membershipId].every(text) &&
        number(p.amount) &&
        p.amount > 0 &&
        ["Cash", "Bank transfer"].includes(p.method) &&
        date(p.date),
    )
  )
    return false;
  if (
    !d.trials.every(
      (t) =>
        [t.id, t.name, t.phone, t.goal, t.trainerId].every(text) &&
        date(t.date) &&
        typeof t.time === "string" &&
        /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t.time) &&
        ["New", "Confirmed", "Attended", "Joined", "Declined"].includes(
          t.status,
        ),
    )
  )
    return false;
  if (
    !d.messages.every(
      (m) =>
        [m.id, m.name, m.phone, m.text].every(text) &&
        ["New", "Handled"].includes(m.status),
    )
  )
    return false;
  if (
    !keys.every((k) => {
      const rows = value[k] as { id: string }[];
      return new Set(rows.map((r) => r.id)).size === rows.length;
    })
  )
    return false;
  const members = new Set(d.members.map((m) => m.id)),
    periods = new Set(d.memberships.map((m) => m.id));
  return (
    d.memberships.every(
      (m) =>
        members.has(m.memberId) &&
        d.payments
          .filter((p) => p.membershipId === m.id)
          .reduce((s, p) => s + p.amount, 0) <= m.total,
    ) && d.payments.every((p) => periods.has(p.membershipId))
  );
}
