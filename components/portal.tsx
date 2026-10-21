"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  Inbox,
  Plus,
  ArrowUpRight,
  X,
  Printer,
  Menu,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  Actor,
  Command,
  Membership,
  Trial,
  access,
  addDays,
  command,
  latest,
  money,
  paid,
  plans,
  today,
  trainers,
} from "@/lib/model";
import { useDemo } from "@/lib/store";
const nav = [
  ["Overview", LayoutDashboard],
  ["Trials", CalendarDays],
  ["Members", Users],
  ["Payments", Wallet],
  ["Renewals", RotateCcw],
  ["Messages", Inbox],
] as const;
export default function Portal() {
  const { data, save, warning, reset } = useDemo();
  const [actor, setActor] = useState<Actor>({
      role: "owner",
      trainerId: "trainer-1",
    }),
    [tab, setTab] = useState("Overview"),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState(""),
    [modal, setModal] = useState<"member" | "renew" | "convert" | null>(null),
    [selected, setSelected] = useState(""),
    [receipt, setReceipt] = useState<string | null>(null),
    [error, setError] = useState(""),
    [mobile, setMobile] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]',
        ) || [],
      );
    focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobile(false);
      }
      if (event.key === "Tab") {
        const items = focusable();
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const breakpoint = window.matchMedia("(min-width: 801px)");
    const resized = () => {
      if (breakpoint.matches) setMobile(false);
    };
    document.addEventListener("keydown", keydown);
    breakpoint.addEventListener("change", resized);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      breakpoint.removeEventListener("change", resized);
      menuButton.current?.focus({ preventScroll: true });
    };
  }, [mobile]);
  const manage = actor.role !== "trainer";
  useEffect(() => {
    if (modal || receipt) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal, receipt]);
  if (!data)
    return <div className="loading">Preparing your training floor…</div>;
  const visible = access(data, actor);
  const member = (id: string) => data.members.find((m) => m.id === id);
  const trainer = (id: string) =>
    trainers.find((t) => t.id === id)?.name || "Unassigned";
  const plan = (id: string) => plans.find((p) => p.id === id);
  const remaining = (m: Membership) => m.total - paid(data, m.id);
  const upcoming = data.members.filter((m) => {
    const s = latest(data, m.id);
    return s && s.end <= addDays(today(), 7);
  });
  const total = data.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = data.memberships.reduce((s, m) => s + remaining(m), 0);
  const receiptPeriod = data.memberships.find((m) => m.id === receipt);
  function run(c: Command) {
    if (!data) return false;
    try {
      if (save(command(data, actor, c))) {
        setNotice("Demo updated. Changes are saved on this browser.");
        return true;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
      setNotice(e instanceof Error ? e.message : "Unable to save.");
    }
    return false;
  }
  function open(kind: typeof modal, id = "") {
    setError("");
    setSelected(id);
    setModal(kind);
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) || "").trim();
    let ok = false;
    if (modal === "member")
      ok = run({
        type: "member",
        member: {
          id: crypto.randomUUID(),
          name: get("name"),
          phone: get("phone"),
          trainerId: get("trainerId"),
          goal: get("goal"),
        },
        planId: get("planId"),
      });
    if (modal === "renew")
      ok = run({ type: "renew", memberId: selected, planId: get("planId") });
    if (modal === "convert")
      ok = run({
        type: "convert",
        id: selected,
        planId: get("planId"),
        trainerId: get("trainerId"),
      });
    if (ok) setModal(null);
  }
  function payment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!receipt) return;
    const form = e.currentTarget,
      f = new FormData(form);
    if (
      run({
        type: "payment",
        payment: {
          id: crypto.randomUUID(),
          membershipId: receipt,
          amount: Number(f.get("amount")),
          method: String(f.get("method")) as "Cash" | "Bank transfer",
          date: today(),
        },
      })
    )
      form.reset();
  }
  function chooseRole(value: string) {
    const [role, id] = value.split(":");
    setActor({ role: role as Actor["role"], trainerId: id || "trainer-1" });
    setTab("Overview");
    setModal(null);
    setReceipt(null);
    setNotice("");
    setError("");
  }
  return (
    <div className="admin-shell">
      {mobile && (
        <button
          type="button"
          className="menu-backdrop"
          aria-label="Close navigation backdrop"
          tabIndex={-1}
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={sidebar}
        id="workspace-navigation"
        className={mobile ? "sidebar show" : "sidebar"}
        role={mobile ? "dialog" : undefined}
        aria-modal={mobile ? true : undefined}
        aria-label="Workspace navigation"
      >
        <button
          type="button"
          className="drawer-close"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X size={22} />
        </button>
        <Link className="rep-brand" href="/admin">
          <Dumbbell size={25} />
          RepDesk
          <span />
        </Link>
        <div className="workspace">
          <span>F/I</span>
          <div>
            <strong>Form & Iron</strong>
            <small>Management workspace</small>
          </div>
        </div>
        <span className="nav-label">YOUR WORKSPACE</span>
        <nav>
          {nav
            .filter(
              ([name]) =>
                manage || ["Overview", "Trials", "Members"].includes(name),
            )
            .map(([name, Icon]) => (
              <button
                key={name}
                className={tab === name ? "active" : ""}
                onClick={() => {
                  setTab(name);
                  setQuery("");
                  setMobile(false);
                }}
              >
                <Icon size={18} />
                {name}
                {name === "Trials" && (
                  <small>
                    {visible.trials.filter((t) => t.status === "New").length}
                  </small>
                )}
              </button>
            ))}
        </nav>
        <div className="sidebar-end">
          <div className="demo-card">
            <span>SHOW THE WHOLE JOURNEY.</span>
            <p>
              From first inquiry
              <br />
              to the next renewal.
            </p>
            <Link href="/">View public website ↗</Link>
          </div>
          <div className="user">
            <span>{actor.role === "trainer" ? "TR" : "AD"}</span>
            <div>
              <strong>
                {actor.role === "trainer"
                  ? trainer(actor.trainerId)
                  : actor.role === "owner"
                    ? "Demo Owner"
                    : "Demo Reception"}
              </strong>
              <small>{actor.role} preview</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="admin-main" inert={mobile}>
        <header>
          <div>
            <button
              aria-label="Toggle navigation"
              ref={menuButton}
              aria-expanded={mobile}
              aria-controls="workspace-navigation"
              className="iconbtn mobilemenu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu />
            </button>
            <span>
              Workspace / <b>{tab}</b>
            </span>
          </div>
          <label className="role-select">
            Preview role
            <select
              aria-label="Preview role"
              value={
                actor.role === "trainer"
                  ? "trainer:" + actor.trainerId
                  : actor.role
              }
              onChange={(e) => chooseRole(e.target.value)}
            >
              <option value="owner">Owner</option>
              <option value="receptionist">Receptionist</option>
              {trainers.map((t) => (
                <option key={t.id} value={"trainer:" + t.id}>
                  Trainer · {t.name}
                </option>
              ))}
            </select>
          </label>
        </header>
        <div className="demo-strip">
          DEMO MODE · Sample data on this browser · Role previews are not real
          authentication
        </div>
        <main>
          <div className="admin-heading">
            <div>
              <span className="eyebrow">FORM & IRON / OPERATIONS</span>
              <h1>
                {tab === "Overview" ? "A stronger day starts here." : tab}
              </h1>
              <p>
                {manage
                  ? "Keep the floor moving. Keep the details together."
                  : "Your assigned members and trial sessions."}
              </p>
            </div>
            {manage && ["Overview", "Members"].includes(tab) && (
              <button className="button dark" onClick={() => open("member")}>
                <Plus size={17} />
                Add member
              </button>
            )}
          </div>
          {(notice || warning) && (
            <div role="status" className="notice">
              {notice || warning}
              <button
                className="iconbtn"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {tab === "Overview" && (
            <>
              <div className="stats">
                {[
                  {
                    label: manage ? "Active memberships" : "Assigned members",
                    value: manage
                      ? String(
                          data.members.filter((m) => {
                            return data.memberships.some(
                              (s) =>
                                s.memberId === m.id &&
                                s.start <= today() &&
                                s.end >= today(),
                            );
                          }).length,
                        ).padStart(2, "0")
                      : String(visible.members.length).padStart(2, "0"),
                    note: manage
                      ? "Current 30-day periods"
                      : "Your coaching roster",
                  },
                  ...(manage
                    ? [
                        {
                          label: "Recorded collections",
                          value: money(total),
                          note: "All manually recorded payments",
                        },
                        {
                          label: "Outstanding fees",
                          value: money(outstanding),
                          note: "Across membership periods",
                        },
                        {
                          label: "Renewal follow-ups",
                          value: String(upcoming.length).padStart(2, "0"),
                          note: "Expired or due within 7 days",
                        },
                      ]
                    : [
                        {
                          label: "Assigned trials",
                          value: String(visible.trials.length).padStart(2, "0"),
                          note: "Confirmations handled by reception",
                        },
                      ]),
                ].map((s) => (
                  <article className="stat" key={s.label}>
                    <span>{s.label}</span>
                    <strong>{s.value}</strong>
                    <small>{s.note}</small>
                  </article>
                ))}
              </div>
              <div className="operations-banner">
                <div>
                  <span className="eyebrow">
                    SMALL DETAILS. STRONGER BUSINESS.
                  </span>
                  <h2>
                    LESS CHASING.
                    <br />
                    MORE COACHING.
                  </h2>
                  <p>
                    {manage
                      ? `${data.trials.filter((t) => t.status === "New").length} new trial requests. ${upcoming.length} renewal conversations.`
                      : "Your next session starts with the right attention."}
                  </p>
                  <button onClick={() => setTab("Trials")}>
                    Open trial requests <ArrowUpRight size={17} />
                  </button>
                </div>
                <Dumbbell size={130} strokeWidth={0.7} />
              </div>
            </>
          )}
          {(tab === "Members" || tab === "Overview") && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>{manage ? "Member roster" : "Your members"}</h2>
                  <p>
                    {manage
                      ? "Every goal, every membership, one place."
                      : "Member details for your assigned coaching roster."}
                  </p>
                </div>
                <label className="search">
                  <Search size={15} />
                  <input
                    aria-label="Search members"
                    placeholder="Search name or phone…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>MEMBER</th>
                      <th>COACH / GOAL</th>
                      {manage && (
                        <>
                          <th>MEMBERSHIP</th>
                          <th>BALANCE</th>
                          <th>ACTIONS</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.members
                      .filter((m) =>
                        (m.name + m.phone)
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((m) => {
                        const s = latest(data, m.id);
                        return (
                          <tr key={m.id}>
                            <td>
                              <div className="person">
                                <span>
                                  {m.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                                <div>
                                  <strong>{m.name}</strong>
                                  <small>+{m.phone}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>{trainer(m.trainerId)}</strong>
                              <small>{m.goal}</small>
                            </td>
                            {manage && (
                              <>
                                <td>
                                  <span
                                    className={
                                      "status " +
                                      (s && s.end >= today()
                                        ? "green"
                                        : "amber")
                                    }
                                  >
                                    {s && s.end >= today()
                                      ? s.start > today()
                                        ? "Renewal scheduled"
                                        : "Active"
                                      : "Expired"}
                                  </span>
                                  <small>
                                    {s
                                      ? `${plan(s.planId)?.name} · until ${s.end}`
                                      : "No membership"}
                                  </small>
                                </td>
                                <td>
                                  <strong>
                                    {s ? money(remaining(s)) : "—"}
                                  </strong>
                                  <small>Latest period balance</small>
                                </td>
                                <td>
                                  <div className="row-actions">
                                    {s && (
                                      <button
                                        aria-label={`Receipt for ${m.name}`}
                                        className="iconbtn"
                                        onClick={() => {
                                          setError("");
                                          setReceipt(s.id);
                                        }}
                                      >
                                        <ArrowUpRight size={18} />
                                      </button>
                                    )}
                                    <button
                                      className="subtle"
                                      onClick={() => open("renew", m.id)}
                                    >
                                      Renew
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {!visible.members.length && (
                  <div className="empty">No members assigned yet.</div>
                )}
              </div>
            </section>
          )}
          {tab === "Trials" && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>First visits. Future regulars.</h2>
                  <p>
                    Assign a coach, confirm the visit, then convert to a member.
                  </p>
                </div>
              </div>
              {!visible.trials.length && (
                <div className="empty">No trials assigned yet.</div>
              )}
              {visible.trials.map((t) => (
                <article key={t.id} className="inbox-row">
                  <div>
                    <span className="status">{t.status}</span>
                    <h3>{t.name}</h3>
                    <p>
                      +{t.phone} · {t.date} at {t.time}
                    </p>
                    <p>{t.goal}</p>
                  </div>
                  <div className="trial-controls">
                    {manage ? (
                      <>
                        <label>
                          Coach
                          <select
                            aria-label={`Coach for ${t.name}`}
                            disabled={t.status === "Joined"}
                            value={t.trainerId}
                            onChange={(e) =>
                              run({
                                type: "trial-status",
                                id: t.id,
                                status: t.status,
                                trainerId: e.target.value,
                              })
                            }
                          >
                            <option value="">Unassigned</option>
                            {trainers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Status
                          <select
                            aria-label={`Status for ${t.name}`}
                            disabled={t.status === "Joined"}
                            value={t.status}
                            onChange={(e) =>
                              run({
                                type: "trial-status",
                                id: t.id,
                                status: e.target.value as Trial["status"],
                              })
                            }
                          >
                            {[
                              "New",
                              "Confirmed",
                              "Attended",
                              "Declined",
                              ...(t.status === "Joined" ? ["Joined"] : []),
                            ].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                        {!["Joined", "Declined"].includes(t.status) && (
                          <button
                            className="button dark"
                            onClick={() => open("convert", t.id)}
                          >
                            Convert to member
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <p>Coach: {trainer(t.trainerId)}</p>
                        {t.status === "Confirmed" && (
                          <button
                            className="button dark"
                            onClick={() =>
                              run({
                                type: "trial-status",
                                id: t.id,
                                status: "Attended",
                              })
                            }
                          >
                            Mark attended
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}
          {tab === "Payments" && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Membership periods & receipts</h2>
                  <p>
                    Old periods remain here after renewal, with their own
                    payment history.
                  </p>
                </div>
              </div>
              {data.memberships
                .slice()
                .reverse()
                .map((s) => (
                  <button
                    className="payment-row"
                    key={s.id}
                    onClick={() => {
                      setError("");
                      setReceipt(s.id);
                    }}
                  >
                    <div>
                      <strong>{member(s.memberId)?.name}</strong>
                      <small>
                        {plan(s.planId)?.name} · {s.start} → {s.end}
                      </small>
                    </div>
                    <div>
                      <strong>{money(paid(data, s.id))} paid</strong>
                      <small>{money(remaining(s))} balance</small>
                    </div>
                    <ArrowUpRight size={19} />
                  </button>
                ))}
            </section>
          )}
          {tab === "Renewals" && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Keep their momentum going.</h2>
                  <p>Expired memberships and renewals due within seven days.</p>
                </div>
              </div>
              {!upcoming.length && (
                <div className="empty">No renewal follow-ups due.</div>
              )}
              {upcoming.map((m) => {
                const s = latest(data, m.id)!;
                return (
                  <article className="inbox-row" key={m.id}>
                    <div>
                      <span className="status amber">
                        {s.end < today() ? "Expired" : "Due soon"}
                      </span>
                      <h3>{m.name}</h3>
                      <p>
                        +{m.phone} · {plan(s.planId)?.name} · expires {s.end}
                      </p>
                    </div>
                    <button
                      className="button dark"
                      onClick={() => open("renew", m.id)}
                    >
                      Renew membership
                    </button>
                  </article>
                );
              })}
            </section>
          )}
          {tab === "Messages" && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Website inbox</h2>
                  <p>General inquiries. Reply manually by phone or WhatsApp.</p>
                </div>
              </div>
              {!data.messages.length && (
                <div className="empty">No messages yet.</div>
              )}
              {data.messages.map((m) => (
                <article key={m.id} className="inbox-row">
                  <div>
                    <span className="status">{m.status}</span>
                    <h3>{m.name}</h3>
                    <p>+{m.phone}</p>
                    <p className="message-text">{m.text}</p>
                  </div>
                  <button
                    className="subtle"
                    onClick={() =>
                      run({
                        type: "message",
                        id: m.id,
                        status: m.status === "New" ? "Handled" : "New",
                      })
                    }
                  >
                    {m.status === "New" ? "Mark handled" : "Reopen"}
                  </button>
                </article>
              ))}
            </section>
          )}
          <footer className="admin-footer">
            <span>RepDesk · Purpose-built for the training floor.</span>
            {actor.role === "owner" && (
              <button
                onClick={() => {
                  if (window.confirm("Reset all demo data on this browser?")) {
                    reset();
                    setNotice("Sample data restored.");
                  }
                }}
              >
                Reset demo data
              </button>
            )}
          </footer>
        </main>
      </div>
      <dialog
        ref={dialog}
        onCancel={() => {
          setModal(null);
          setReceipt(null);
        }}
      >
        <div className="dialog-top">
          <span className="eyebrow">FORM & IRON / REPDESK</span>
          <button
            aria-label="Close dialog"
            className="iconbtn"
            onClick={() => {
              setModal(null);
              setReceipt(null);
            }}
          >
            <X />
          </button>
        </div>
        {receiptPeriod ? (
          <>
            <div className="receipt">
              <h2>Payment receipt</h2>
              <p>Form & Iron · Demonstration only</p>
              <div className="receipt-meta">
                <span>RD-{receiptPeriod.id.slice(0, 8).toUpperCase()}</span>
                <span>
                  {receiptPeriod.start} → {receiptPeriod.end}
                </span>
              </div>
              <h3>{member(receiptPeriod.memberId)?.name}</h3>
              <p>{plan(receiptPeriod.planId)?.name} · 30 days</p>
              <div className="receipt-line">
                <span>Period total</span>
                <strong>{money(receiptPeriod.total)}</strong>
              </div>
              {data.payments
                .filter((p) => p.membershipId === receiptPeriod.id)
                .map((p) => (
                  <div key={p.id} className="receipt-line">
                    <span>
                      {p.method}
                      <small>
                        {p.date} · {p.id.slice(0, 8)}
                      </small>
                    </span>
                    <strong>{money(p.amount)}</strong>
                  </div>
                ))}
              <div className="receipt-line total">
                <span>Remaining balance</span>
                <strong>{money(remaining(receiptPeriod))}</strong>
              </div>
              <p className="fine">
                Sample payment summary · Not a tax invoice
                <br />
                No real payment is processed.
              </p>
            </div>
            {remaining(receiptPeriod) > 0 && (
              <form className="noprint" onSubmit={payment}>
                <label>
                  Record payment (PKR)
                  <input
                    aria-label="Payment amount"
                    name="amount"
                    type="number"
                    min="1"
                    max={remaining(receiptPeriod)}
                    step="1"
                    required
                  />
                </label>
                <label>
                  Method
                  <select name="method">
                    <option>Cash</option>
                    <option>Bank transfer</option>
                  </select>
                </label>
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                <button className="button dark full">Record payment</button>
              </form>
            )}
            <button
              className="button outline full noprint"
              onClick={() => window.print()}
            >
              <Printer size={17} />
              Print receipt
            </button>
          </>
        ) : (
          <>
            <h2>
              {modal === "member"
                ? "A new member. A fresh start."
                : modal === "renew"
                  ? "Keep the momentum."
                  : "From trial to training."}
            </h2>
            <form onSubmit={submit} key={modal + selected}>
              {modal === "member" && (
                <>
                  <label>
                    Full name
                    <input name="name" minLength={2} maxLength={80} required />
                  </label>
                  <label>
                    Phone / WhatsApp
                    <input name="phone" type="tel" maxLength={25} required />
                  </label>
                  <label>
                    Training goal
                    <input name="goal" maxLength={120} required />
                  </label>
                </>
              )}
              {modal === "renew" && (
                <p className="fine">
                  {member(selected)?.name}. New periods start after the current
                  period ends, or today if expired. Previous payments stay on
                  their original receipt.
                </p>
              )}
              {modal === "convert" && (
                <p className="fine">
                  {data.trials.find((t) => t.id === selected)?.name} will become
                  a member with a new 30-day period.
                </p>
              )}
              <label>
                Membership
                <select name="planId">
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {money(p.price)}
                    </option>
                  ))}
                </select>
              </label>
              {modal !== "renew" && (
                <label>
                  Assigned trainer
                  <select name="trainerId">
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button className="button dark full">
                {modal === "renew" ? "Create renewal period" : "Save member"}
              </button>
            </form>
          </>
        )}
      </dialog>
    </div>
  );
}
