# Fair Split — Presentation Script (Live Demo)

A step-by-step script for presenting the app live. Adjust the numbers/names as needed.
Total running time: ~8–10 minutes.

---

## 0. Before You Start (Pre-Demo Setup)

1. Backend running: `http://localhost:3001/api/health` returns `{"status":"ok"}`.
2. Frontend running: open `http://localhost:5173`.
3. Database is fresh (already done — you wiped it).
4. Create the accounts BEFORE the demo, but don't log in yet:
   - Open a normal browser window → register `alex@demo.com` → **logout immediately** (so the demo starts at the login screen).
   - Open an **incognito/private window** → register `jordan@demo.com` → logout.
   - *Why incognito:* session tokens live in `sessionStorage`, so two separate windows = two separate "users" you can switch between live.
5. Keep both windows side by side if possible — you'll switch between them during the demo.

**Fallback if something breaks:** refresh the page. If that fails, check the terminal running the backend for error output.

---

## 1. Intro — What is this? (30–60 seconds)

> "Roommates split rent, but everything else — groceries, internet bills, whose turn it is to clean the bathroom — lives in group chats and sticky notes. Fair Split puts shared expenses AND chores in one place and computes a single fairness balance per person, so nobody has to mentally reconcile 'I paid more but he cleans more.'"

**Say what you'll show:**
> "I'll demo it with two roommates: Alex and Jordan. Alex creates the household, Jordan joins with an invite code, they log expenses and chores, and we'll watch the fairness balance move in real time."

---

## 2. Login / Create the Household (1–2 minutes)

**On screen:** login page.

> "First, Alex logs in."

1. Log in as `alex@demo.com`.
2. Click **Create a household**.
3. Enter a name, e.g. "Maple Street House".
4. **Highlight the invite code** — that's the shareable code from the product brief.

> "Alex is now the admin of the household. Note the invite code — Jordan will use it to join. Also notice the household gets seeded with default chores — a starting chore list, each with a point value."

**Optional click:** go to **Settings** → show the member list with Alex as admin + the invite code again. Come back to Dashboard.

---

## 3. Jordan Joins with the Invite Code (1–2 minutes)

**Switch to the incognito window.**

> "Meanwhile, Jordan just moved in. He doesn't want to ask Alex for the code — but they share a fridge, so let's share it."

1. Log in as `jordan@demo.com` in the incognito window.
2. Click **Join with code**, type the invite code.
3. Land on the dashboard.

> "Jordan is now a member — one household per person, no invitations to approve, just a code. Let's start using it."

---

## 4. Logging an Expense (1–2 minutes)

**In Alex's window (or Jordan's — mix it up).**

> "Groceries happen every week. Alex pays $90 up front."

1. Go to **Expenses**.
2. Click **Add expense**: amount `90`, description "Groceries", date today, split with everyone (default).
3. Submit → the expense appears with both members' shares: $45 each.

**Key talking point — the math:**
> "The split is automatic and it's exact: the shares always sum to the total — any rounding leftover goes to the payer, so the ledger never has a phantom cent."

4. Log a second expense from **Jordan's window** so the balance has two directions: e.g. "Internet bill" $30 paid by Jordan.

**On screen:** the expense list shows both entries, newest first, with payer names.

---

## 5. Dashboard — the Fairness Balance (1 minute)

**Switch to Alex's window.**

> "Here's the payoff — the combined fairness balance. No math, one number."

1. Go to **Dashboard**.
2. Read the headline: Alex paid $90 but only owed $45 for the internet → "You're ahead $…"
3. Click **Show breakdown**:
   - **Money balance** — how much the money side nets.
   - **Chore credit** — points done vs. fair share.
   - **Settlements** — cash paid outside the app.
   - **Per-person breakdown** — who owes whom, exactly.

> "This is the one number that tells you if you're square with your household — and you can always click into exactly why."

---

## 6. Chores & the Leaderboard (1–2 minutes)

**Any window.**

> "Now the unpaid labor half. Chores have point values — cleaning the kitchen is worth 100, mopping 200, taking out the trash 50. Harder work counts more."

1. Go to **Chores**.
2. Mark one or two chores as done (e.g. "Clean the kitchen" +100, "Take out the trash" +50).
3. Scroll to the **leaderboard** → the member who did the work is ahead on points.

**In Jordan's window, complete a chore too** so the leaderboard shows a real comparison.

> "The chore credit on the dashboard adjusts too — do more than your fair share, and you're ahead in chores as well as money."

---

## 7. Settle Up (1–2 minutes)

**In Jordan's window** (the one who owes money).

> "Real life: Jordan owes Alex cash. Fair Split doesn't process payments — it just records them, so the balances reflect reality."

1. Go to **Settle Up**.
2. Point at **Who Owes Whom**: it should list Alex "owes you …" / "you owe …" (this is the fixed per-pair net balance).
3. Click **Record Payment**, select the person, amount, date → submit.
4. The payment appears in **Payment History** and the debt line updates/disappears.

> "The money balance moves, and the history keeps everyone honest — proof Jordan actually paid."

---

## 8. Admin Powers (optional, 1 minute)

**In Alex's (admin) window.**

1. Go to **Settings**.
2. **Regenerate invite code** — old code stops working, new one appears.
3. **Remove a member** — e.g. show you *could* remove Jordan; his account would be banned from rejoining. (Only demo this if you don't need Jordan anymore, or log him in fresh after.)

> "Admins keep control: they can remove members and rotate invite codes, but any member can log expenses and mark chores done — low friction for everyone."

---

## 9. Closing (30 seconds)

> "To recap: households create and join in seconds, expenses split themselves, chores carry point values, and everything lands in one fairness balance you can always break down. That's Fair Split — the first place where doing the dishes counts as much as paying the electricity bill."

**Q&A prep — likely questions:**
- *How is the balance calculated?* → Money balance (paid − owed shares) + cash settlements; chore credit is your points vs. your fair share of the household total.
- *Can people be in multiple households?* → Not yet — one household per person is an MVP simplification.
- *Edits/deletes?* → Expenses can be edited by the payer and archived by owner/admin; deleting is a soft delete to keep history auditable.
- *What's next?* → Filtered history, email summaries, auto-rotation of chores, receipt photos.

---

## 10. Pitfalls Checklist (read before the demo)

- [ ] Both servers running (health check on 3001, page on 5173).
- [ ] Database is fresh — no leftover users from testing.
- [ ] Test accounts exist (`alex@demo.com`, `jordan@demo.com`) and are logged out.
- [ ] Incognito window ready for the second user.
- [ ] Know your invite code (regenerate it in Settings if you lost it).
- [ ] If a page shows stale data, refresh it — balances are fetched on page load.
- [ ] Don't demo "remove member" on Jordan unless you re-login Jordan afterwards (banned users can't rejoin).
