import { test } from "node:test";
import assert from "node:assert/strict";
import { access, addDays, command, latest, seed, today } from "./model";
const owner = { role: "owner" as const, trainerId: "trainer-1" };
test("renewal preserves old period and payments and starts after expiry", () => {
  const d = seed(),
    old = latest(d, "m1")!;
  const n = command(d, owner, {
    type: "renew",
    memberId: "m1",
    planId: "open",
  });
  assert.equal(n.memberships.length, d.memberships.length + 1);
  assert.equal(latest(n, "m1")!.start, addDays(old.end, 1));
  assert.deepEqual(n.payments, d.payments);
  assert.equal(
    command(d, owner, {
      type: "renew",
      memberId: "m3",
      planId: "open",
    }).memberships.at(-1)!.start,
    today(),
  );
});
test("rejects overpayment, nonpositive payment and trainer financial access", () => {
  const d = seed();
  const c = {
    type: "payment" as const,
    payment: {
      id: "p",
      membershipId: "sub1",
      amount: 5000,
      method: "Cash" as const,
      date: today(),
    },
  };
  assert.throws(() => command(d, owner, c), /remaining balance/);
  assert.throws(() =>
    command(d, owner, { ...c, payment: { ...c.payment, amount: 0 } }),
  );
  assert.throws(
    () =>
      command(
        d,
        { role: "trainer", trainerId: "trainer-1" },
        { ...c, payment: { ...c.payment, amount: 1000 } },
      ),
    /owner or reception/,
  );
});
test("trainer scope filters members and trials and removes financial/inbox data", () => {
  const d = seed(),
    v = access(d, { role: "trainer", trainerId: "trainer-2" });
  assert.equal(v.members.length, 1);
  assert.equal(v.payments.length, 0);
  assert.equal(v.memberships.length, 0);
  assert.equal(v.messages.length, 0);
  assert.equal(v.trials.length, 0);
  assert.throws(() =>
    command(
      d,
      { role: "trainer", trainerId: "trainer-2" },
      { type: "trial-status", id: "t1", status: "Attended" },
    ),
  );
});
test("trial conversion creates member and period once", () => {
  const d = seed(),
    n = command(d, owner, {
      type: "convert",
      id: "t1",
      planId: "open",
      trainerId: "trainer-1",
    });
  assert.equal(n.trials[0].status, "Joined");
  assert.equal(n.members.length, d.members.length + 1);
  assert.throws(() =>
    command(n, owner, {
      type: "convert",
      id: "t1",
      planId: "open",
      trainerId: "trainer-1",
    }),
  );
});

import { isDemoData } from "./storage-data";
test("damaged saved records are rejected before rendering", () => {
  const d = seed();
  assert.equal(isDemoData(d), true);
  assert.equal(isDemoData({ ...d, members: [null] }), false);
  assert.equal(
    isDemoData({ ...d, members: [{ ...d.members[0], name: 3 }] }),
    false,
  );
  assert.equal(
    isDemoData({ ...d, payments: [{ ...d.payments[0], amount: Infinity }] }),
    false,
  );
  assert.equal(
    isDemoData({
      ...d,
      memberships: [{ ...d.memberships[0], end: "bad-date" }],
    }),
    false,
  );
});
test("coach can be cleared on a new trial but not on a confirmed session", () => {
  const d = seed();
  const n = command(d, owner, {
    type: "trial-status",
    id: "t1",
    status: "New",
    trainerId: "",
  });
  assert.equal(n.trials[0].trainerId, "");
  assert.throws(
    () =>
      command(d, owner, {
        type: "trial-status",
        id: "t1",
        status: "Confirmed",
        trainerId: "",
      }),
    /Assign a trainer/,
  );
});
test("phone input rejects letters instead of stripping them", () => {
  assert.throws(
    () =>
      command(seed(), owner, {
        type: "member",
        planId: "open",
        member: {
          id: "new",
          name: "Someone",
          phone: "abc03001234567",
          trainerId: "trainer-1",
          goal: "fitness",
        },
      }),
    /letters/,
  );
});
