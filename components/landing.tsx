"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Dumbbell,
  MoveUpRight,
  Activity,
  Target,
  Check,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { plans, trainers, money, phone, today, validDate } from "@/lib/model";
export default function Landing() {
  const { data, save, warning } = useDemo();
  const [kind, setKind] = useState<"trial" | "message">("trial"),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [submitted, setSubmitted] = useState(false);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data || submitted) return;
    setError("");
    setNotice("");
    const form = e.currentTarget;
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) || "").trim();
    try {
      if (get("website")) throw Error("Unable to submit.");
      const name = get("name"),
        number = phone(get("phone"));
      if (name.length < 2) throw Error("Please enter your name.");
      if (kind === "trial") {
        const date = get("date"),
          time = get("time");
        if (!validDate(date) || date < today())
          throw Error("Choose today or a future date.");
        if (
          data.trials.some(
            (t) =>
              t.phone === number && t.date === date && t.status !== "Declined",
          )
        )
          throw Error(
            "A trial request already exists for this phone and date.",
          );
        if (
          save({
            ...data,
            trials: [
              {
                id: crypto.randomUUID(),
                name,
                phone: number,
                goal: get("goal"),
                date,
                time,
                trainerId: "",
                status: "New",
              },
              ...data.trials,
            ],
          })
        )
          setNotice(
            "Demo trial saved. Open the management demo → Trials to confirm it. This is not a real gym booking.",
          );
        else
          throw Error(
            "Could not save. Your details have been kept; check browser storage and retry.",
          );
      } else {
        const text = get("message");
        if (text.length < 10)
          throw Error("Write a message of at least 10 characters.");
        if (
          save({
            ...data,
            messages: [
              {
                id: crypto.randomUUID(),
                name,
                phone: number,
                text,
                status: "New",
              },
              ...data.messages,
            ],
          })
        )
          setNotice(
            "Demo message saved. View it in the management inbox on this browser.",
          );
        else
          throw Error(
            "Could not save. Your details have been kept; check browser storage and retry.",
          );
      }
      form.reset();
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    }
  }
  return (
    <div className="landing">
      <div className="demobar">
        FICTIONAL GYM · INTERACTIVE DEMO · DATA STAYS IN THIS BROWSER
      </div>
      <nav className="site-nav">
        <Link className="wordmark" href="/">
          FORM<span>&</span>IRON
          <i />
        </Link>
        <div>
          <a href="#programs">The training</a>
          <a href="#plans">Memberships</a>
          <a href="#coaches">Coaches</a>
        </div>
        <Link className="nav-demo" href="/admin">
          Management demo <ArrowUpRight size={15} />
        </Link>
      </nav>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <i /> KARACHI · A NEW STANDARD OF TRAINING
            </div>
            <h1>
              SHOW UP.
              <br />
              PUT IN
              <br />
              <span>THE WORK.</span>
            </h1>
            <p>
              No shortcuts. Just purposeful training, real guidance, and a place
              to get a little stronger every day.
            </p>
            <a className="button lime" href="#start">
              Start with a trial <ArrowUpRight size={19} />
            </a>
            <div className="hero-foot">
              <span>STRENGTH / CONDITIONING / COACHING</span>
              <span>01 — YOUR NEXT REP STARTS HERE</span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Stylised weight plate illustration"
          >
            <span className="vertical-label">BUILT THROUGH CONSISTENCY</span>
            <div className="plate">
              <div className="plate-ring">
                <span>FORM & IRON</span>
                <strong>
                  20<small>KG</small>
                </strong>
                <i />
              </div>
            </div>
            <div className="barbell" />
            <div className="art-bottom">
              <span>
                MOVE WITH
                <br />
                <b>INTENTION.</b>
              </span>
              <ArrowUpRight size={48} />
            </div>
            <span className="art-caption">
              ONE REP. ONE DAY. ONE STRONGER YOU.
            </span>
          </div>
        </section>
        <div className="ticker">
          <span>TRAIN WITH INTENT</span>
          <i>✳</i>
          <span>BUILD YOUR FOUNDATION</span>
          <i>✳</i>
          <span>COME BACK STRONGER</span>
          <i>✳</i>
        </div>
        <section className="public-section" id="programs">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / THE TRAINING</span>
              <h2>
                FIND YOUR
                <br />
                <span>WAY TO STRONG.</span>
              </h2>
            </div>
            <p>
              A strong foundation, whatever your starting point.
              <br />
              Choose the training that fits your goals.
            </p>
          </div>
          <div className="programs">
            {[
              {
                title: "Strength foundations",
                desc: "Learn the lifts. Build your base. Progress with purpose.",
                Icon: Dumbbell,
              },
              {
                title: "Functional conditioning",
                desc: "Move better, build work capacity and find your rhythm.",
                Icon: Activity,
              },
              {
                title: "Personal coaching",
                desc: "A structured plan, individual attention and clear next steps.",
                Icon: Target,
              },
            ].map(({ title, desc, Icon }, i) => (
              <article key={title}>
                <span className="cardnum">0{i + 1}</span>
                <Icon size={34} strokeWidth={1.3} />
                <h3>{title}</h3>
                <p>{desc}</p>
                <a href="#start">
                  Explore a trial <MoveUpRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="manifesto">
          <span className="eyebrow">IT’S YOU VS. YESTERDAY.</span>
          <h2>
            YOU DON’T NEED
            <br />
            TO BE READY.
            <br />
            <em>JUST BE HERE.</em>
          </h2>
          <p>
            Your first session starts with a conversation about your goals.
            <br />
            We’ll help you find a place to begin.
          </p>
          <a href="#start" className="button outline">
            Make the first move <ArrowUpRight size={18} />
          </a>
        </section>
        <section className="public-section" id="plans">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / MEMBERSHIPS</span>
              <h2>
                A PLAN FOR
                <br />
                <span>YOUR NEXT CHAPTER.</span>
              </h2>
            </div>
            <p>
              Illustrative demo packages.
              <br />
              All memberships shown as 30-day periods.
            </p>
          </div>
          <div className="plans">
            {plans.map((p, i) => (
              <article key={p.id} className={i === 1 ? "featured" : ""}>
                <span className="eyebrow">
                  {i === 1
                    ? "A LITTLE MORE DIRECTION"
                    : "YOUR TRAINING, YOUR PACE"}
                </span>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="planprice">
                  {money(p.price)}
                  <small>/ 30 days</small>
                </div>
                <ul>
                  {[
                    "Gym floor access",
                    i === 0
                      ? "Independent training"
                      : i === 1
                        ? "Trainer-guided sessions"
                        : "Individual coaching",
                    "Progress at your own pace",
                  ].map((t) => (
                    <li key={t}>
                      <Check size={14} />
                      {t}
                    </li>
                  ))}
                </ul>
                <a
                  href="#start"
                  className={"button " + (i === 1 ? "lime" : "outline")}
                >
                  Find out more <ArrowUpRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="public-section coaches-section" id="coaches">
          <div className="section-heading">
            <div>
              <span className="eyebrow">03 / YOUR CORNER</span>
              <h2>
                GOOD COACHING.
                <br />
                <span>BETTER FOUNDATIONS.</span>
              </h2>
            </div>
            <p>
              Meet the fictional coaching team
              <br />
              used in this product demonstration.
            </p>
          </div>
          <div className="coaches">
            {trainers.map((t, i) => (
              <article key={t.id}>
                <div className="coachgraphic">
                  <span>
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <Dumbbell size={80} strokeWidth={0.8} />
                  <small>COACH / 0{i + 1}</small>
                </div>
                <h3>{t.name}</h3>
                <p>{t.specialty}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="start-section" id="start">
          <div>
            <span className="eyebrow">04 / START SOMEWHERE</span>
            <h2>
              YOUR FIRST
              <br />
              <span>STEP IS HERE.</span>
            </h2>
            <p>
              Try the customer journey. Submit a trial request or message, then
              open RepDesk to see it arrive.
            </p>
            <Link className="textlink" href="/admin">
              Open management demo <ArrowUpRight size={18} />
            </Link>
            <p className="fine">
              This is a fictional gym. Please use sample details. Submissions
              stay on this browser and do not contact a business.
            </p>
          </div>
          <div className="request-card">
            <div className="switch">
              <button
                className={kind === "trial" ? "selected" : ""}
                onClick={() => {
                  setKind("trial");
                  setSubmitted(false);
                  setNotice("");
                  setError("");
                }}
              >
                Request a trial
              </button>
              <button
                className={kind === "message" ? "selected" : ""}
                onClick={() => {
                  setKind("message");
                  setSubmitted(false);
                  setNotice("");
                  setError("");
                }}
              >
                Ask a question
              </button>
            </div>
            <form
              key={kind}
              onSubmit={submit}
              onChange={() => setSubmitted(false)}
            >
              <div className="formrow">
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Sample name"
                  />
                </label>
                <label>
                  Phone / WhatsApp
                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={25}
                    placeholder="03XX XXXXXXX"
                  />
                </label>
              </div>
              {kind === "trial" ? (
                <>
                  <label>
                    Your goal
                    <select name="goal">
                      <option>Build strength</option>
                      <option>General fitness</option>
                      <option>Improve conditioning</option>
                      <option>Personal coaching</option>
                    </select>
                  </label>
                  <div className="formrow">
                    <label>
                      Preferred date
                      <input name="date" type="date" required />
                    </label>
                    <label>
                      Preferred time
                      <input
                        name="time"
                        type="time"
                        defaultValue="18:00"
                        required
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label>
                  Your message
                  <textarea
                    name="message"
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                  />
                </label>
              )}
              <label className="honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              {(warning || error) && (
                <p className="error" role="alert">
                  {error || warning}
                </p>
              )}
              {notice && (
                <p className="success" role="status">
                  {notice}
                </p>
              )}
              <button
                disabled={!data || submitted}
                className="button lime full"
              >
                {kind === "trial"
                  ? "Save demo trial request"
                  : "Save demo message"}
                <ArrowUpRight size={18} />
              </button>
              <span className="fine">
                Trial requests need confirmation in the dashboard.
              </span>
            </form>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <Link className="wordmark" href="/">
          FORM<span>&</span>IRON
          <i />
        </Link>
        <p>TRAIN WITH INTENT.</p>
        <Link href="/admin">Powered by RepDesk ↗</Link>
        <small>
          Fictional brand. Sample prices and people. No real bookings or
          payments.
        </small>
      </footer>
    </div>
  );
}
