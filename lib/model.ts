export type Role = "owner" | "receptionist" | "trainer";
export type Actor = { role: Role; trainerId: string };
export type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
};
export type Member = {
  id: string;
  name: string;
  phone: string;
  trainerId: string;
  goal: string;
};
export type Membership = {
  id: string;
  memberId: string;
  planId: string;
  start: string;
  end: string;
  total: number;
};
export type Payment = {
  id: string;
  membershipId: string;
  amount: number;
  method: "Cash" | "Bank transfer";
  date: string;
};
export type Trial = {
  id: string;
  name: string;
  phone: string;
  goal: string;
  date: string;
  time: string;
  trainerId: string;
  status: "New" | "Confirmed" | "Attended" | "Joined" | "Declined";
};
export type Message = {
  id: string;
  name: string;
  phone: string;
  text: string;
  status: "New" | "Handled";
};
export type Data = {
  version: 1;
  members: Member[];
  memberships: Membership[];
  payments: Payment[];
  trials: Trial[];
  messages: Message[];
};
export const plans: Plan[] = [
  {
    id: "open",
    name: "Open Floor",
    price: 5000,
    description: "Your routine. Your rhythm. Full gym-floor access.",
  },
  {
    id: "coached",
    name: "Coached",
    price: 9000,
    description: "Structured sessions, trainer guidance and a plan to follow.",
  },
  {
    id: "personal",
    name: "Personal",
    price: 18000,
    description: "One-to-one coaching built around your goals.",
  },
];
export const trainers = [
  { id: "trainer-1", name: "Hamza Ali", specialty: "Strength & conditioning" },
  {
    id: "trainer-2",
    name: "Sana Ahmed",
    specialty: "Movement & functional fitness",
  },
];
export const money = (n: number) => "Rs. " + n.toLocaleString("en-PK");
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function addDays(date: string, days: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export const phone = (v: string) => {
  const p = v.replace(/[^0-9]/g, "");
  const n = p.startsWith("0") ? "92" + p.slice(1) : p;
  if (!/^92\d{10}$/.test(n))
    throw Error("Enter a valid Pakistani phone number.");
  return n;
};
export function validDate(v: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !isNaN(Date.parse(v + "T12:00Z")) &&
    new Date(v + "T12:00Z").toISOString().slice(0, 10) === v
  );
}
export function seed(): Data {
  const d = today();
  return {
    version: 1,
    members: [
      {
        id: "m1",
        name: "Ahmed Raza",
        phone: "923000000001",
        trainerId: "trainer-1",
        goal: "Build strength",
      },
      {
        id: "m2",
        name: "Ayesha Khan",
        phone: "923000000002",
        trainerId: "trainer-2",
        goal: "General fitness",
      },
      {
        id: "m3",
        name: "Bilal Ahmed",
        phone: "923000000003",
        trainerId: "trainer-1",
        goal: "Consistency",
      },
    ],
    memberships: [
      {
        id: "sub1",
        memberId: "m1",
        planId: "coached",
        start: addDays(d, -10),
        end: addDays(d, 19),
        total: 9000,
      },
      {
        id: "sub2",
        memberId: "m2",
        planId: "personal",
        start: addDays(d, -27),
        end: addDays(d, 2),
        total: 18000,
      },
      {
        id: "sub3",
        memberId: "m3",
        planId: "open",
        start: addDays(d, -35),
        end: addDays(d, -6),
        total: 5000,
      },
    ],
    payments: [
      {
        id: "pay1",
        membershipId: "sub1",
        amount: 5000,
        method: "Cash",
        date: d,
      },
      {
        id: "pay2",
        membershipId: "sub2",
        amount: 18000,
        method: "Bank transfer",
        date: d,
      },
      {
        id: "pay3",
        membershipId: "sub3",
        amount: 5000,
        method: "Cash",
        date: addDays(d, -35),
      },
    ],
    trials: [
      {
        id: "t1",
        name: "Omar Farooq",
        phone: "923000000004",
        goal: "Strength training",
        date: d,
        time: "18:00",
        trainerId: "trainer-1",
        status: "New",
      },
    ],
    messages: [
      {
        id: "q1",
        name: "Hassan Ali",
        phone: "923000000005",
        text: "Do you offer evening strength sessions for beginners?",
        status: "New",
      },
    ],
  };
}
export type Command =
  | { type: "member"; member: Member; planId: string }
  | { type: "renew"; memberId: string; planId: string }
  | { type: "payment"; payment: Payment }
  | {
      type: "trial-status";
      id: string;
      status: Trial["status"];
      trainerId?: string;
    }
  | { type: "convert"; id: string; planId: string; trainerId: string }
  | { type: "message"; id: string; status: Message["status"] };
export function paid(data: Data, id: string) {
  return data.payments
    .filter((p) => p.membershipId === id)
    .reduce((s, p) => s + p.amount, 0);
}
export function latest(data: Data, memberId: string) {
  return data.memberships
    .filter((m) => m.memberId === memberId)
    .sort((a, b) => b.end.localeCompare(a.end))[0];
}
export function access(data: Data, actor: Actor) {
  if (actor.role !== "trainer") return data;
  const members = data.members.filter((m) => m.trainerId === actor.trainerId);
  return {
    ...data,
    members,
    memberships: [],
    payments: [],
    messages: [],
    trials: data.trials.filter((t) => t.trainerId === actor.trainerId),
  };
}
export function command(data: Data, actor: Actor, c: Command): Data {
  const next = structuredClone(data);
  const manage = actor.role === "owner" || actor.role === "receptionist";
  if (!manage && c.type !== "trial-status")
    throw Error("This action is for owner or reception only.");
  const newPeriod = (memberId: string, planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) throw Error("Choose a membership plan.");
    const old = latest(next, memberId);
    const start = old && old.end >= today() ? addDays(old.end, 1) : today();
    next.memberships.push({
      id: crypto.randomUUID(),
      memberId,
      planId,
      start,
      end: addDays(start, 29),
      total: plan.price,
    });
  };
  if (c.type === "member") {
    if (
      !c.member.name.trim() ||
      !trainers.some((t) => t.id === c.member.trainerId)
    )
      throw Error("Add a name and trainer.");
    c.member.phone = phone(c.member.phone);
    if (next.members.some((m) => m.phone === c.member.phone))
      throw Error("A member with that phone already exists.");
    next.members.push(c.member);
    newPeriod(c.member.id, c.planId);
  }
  if (c.type === "renew") {
    if (!next.members.some((m) => m.id === c.memberId))
      throw Error("Member not found.");
    newPeriod(c.memberId, c.planId);
  }
  if (c.type === "payment") {
    const m = next.memberships.find((m) => m.id === c.payment.membershipId);
    if (
      !m ||
      !Number.isInteger(c.payment.amount) ||
      c.payment.amount <= 0 ||
      c.payment.amount > m.total - paid(next, m.id)
    )
      throw Error("Payment must be positive and within the remaining balance.");
    next.payments.push(c.payment);
  }
  if (c.type === "trial-status") {
    const t = next.trials.find((t) => t.id === c.id);
    if (!t) throw Error("Trial not found.");
    if (t.status === "Joined")
      throw Error("This trial is already converted to a member.");
    if (
      !manage &&
      (t.trainerId !== actor.trainerId ||
        t.status !== "Confirmed" ||
        c.status !== "Attended")
    )
      throw Error(
        "Trainers may only mark their assigned confirmed trials attended.",
      );
    if (c.status === "Joined")
      throw Error("Use convert to create a membership.");
    if (c.trainerId) {
      if (!trainers.some((x) => x.id === c.trainerId))
        throw Error("Choose a trainer.");
      t.trainerId = c.trainerId;
    }
    if (c.status === "Confirmed" && !t.trainerId)
      throw Error("Assign a trainer before confirming.");
    t.status = c.status;
  }
  if (c.type === "convert") {
    const t = next.trials.find((t) => t.id === c.id);
    if (!t || t.status === "Joined" || t.status === "Declined")
      throw Error("This trial cannot be converted.");
    if (!trainers.some((x) => x.id === c.trainerId))
      throw Error("Choose a trainer.");
    if (next.members.some((m) => m.phone === t.phone))
      throw Error("This phone already belongs to a member.");
    const id = crypto.randomUUID();
    next.members.push({
      id,
      name: t.name,
      phone: t.phone,
      goal: t.goal,
      trainerId: c.trainerId,
    });
    newPeriod(id, c.planId);
    t.status = "Joined";
  }
  if (c.type === "message") {
    const m = next.messages.find((m) => m.id === c.id);
    if (!m) throw Error("Message not found.");
    m.status = c.status;
  }
  return next;
}
