# Fair Split — Product Brief

## 1. Vision

Roommates already split rent, but the smaller stuff — who bought groceries, who paid the internet bill, whose turn it is to clean the bathroom — gets tracked in group chats, sticky notes, or not at all, and it quietly breeds resentment. **Fair Split** is a web app where a household logs shared expenses *and* chores in one place, and the app computes a single combined fairness balance per roommate, so nobody has to mentally reconcile "I paid more but he cleans more." Roommates would use it instead of a Splitwise + a paper chore wheel because it's the first place that treats unpaid labor as worth something comparable to money. **This is a success if a user can open the app and immediately see one number that tells them whether they're square with their household this week.**

## 2. Users

- **Alex, 24, grad student.** Busy, forgetful, wants logging an expense or marking a chore done to take under 10 seconds. Moderately tech-savvy, phone-first.
- **Jordan, 29, working professional.** Pays for most groceries/utilities up front, wants proof he isn't being taken advantage of — cares about clear numbers and history, not aesthetics.
- **Sam, 21, undergrad, self-appointed house admin.** Sets up the household, invites roommates, defines the chore rotation and how heavily each chore counts. Wants control without needing to nag people.

## 3. User stories (prioritized, for the GitHub Project Board)

1. **As a new user**, I want to create a household and get a shareable invite code, so that my roommates can join the same shared ledger.
   **Done when:** user can create a household with a name; a unique invite code/link is generated; the creator is auto-added as the first member; household appears on their dashboard.

2. **As an invited roommate**, I want to join a household using an invite code, so that I can start participating.
   **Done when:** entering a valid code adds the user to that household's member list; an invalid/expired code shows an error; a user can belong to only one household at a time (MVP simplification).

3. **As a roommate**, I want to log an expense I paid for, so that it gets split fairly among the household.
   **Done when:** user enters amount, description, payer, and date; can choose which members split it (default = all current members); the expense appears in a shared list; each member's share is calculated and stored.

4. **As a roommate**, I want to see a running list of all household expenses, so that I can verify what's been logged.
   **Done when:** list shows date, description, payer, amount, and per-person share; sorted newest first; total household spend is visible.

5. **As a roommate**, I want to see the household's chore list, so I know what needs doing and whose turn it is.
   **Done when:** each chore shows name, assigned person, frequency (e.g. weekly), and next-due date; overdue chores are visually flagged (e.g. red).

6. **As a roommate**, I want to mark a chore as done, so that I get credit and the rotation advances.
   **Done when:** marking done timestamps the completion, credits the current assignee, advances the chore to the next person in rotation, and resets the due date.

7. **As a roommate**, I want to see one combined fairness balance, so I instantly know if I owe money, owe chores, or am ahead.
   **Done when:** dashboard shows a single summary line (e.g. "You owe $12 and 1 chore") derived from money balance + chore-credit balance; clicking it reveals the money and chore breakdown separately.

8. **As a house admin**, I want to set a "weight" (point value) per chore, so that harder chores count for more than easy ones.
   **Done when:** admin can set/edit a numeric weight per chore; chore-credit calculations use this weight instead of counting all chores equally.

9. **As a roommate**, I want to record a settlement (e.g. "I paid Jordan $20 in cash"), so that our money balance reflects reality outside the app.
   **Done when:** user can log a payment between two members with an amount and date; it adjusts both members' money balances; appears in history.

10. **As a roommate**, I want to edit or delete an expense/chore I mistakenly entered, so that the ledger stays accurate.
    **Done when:** user can edit/delete their own entries within a grace period (e.g. 24h) or an admin can do so anytime; balances recalculate immediately.

11. **As a house admin**, I want to add or remove a chore from the rotation, so that the chore list matches our actual household.
    **Done when:** admin can create a new chore (name, frequency, weight, initial assignee) and archive an existing one without deleting its history.

12. **As a roommate**, I want to see history filtered by person, so I can double-check my own contributions.
    **Done when:** user can filter the combined expense+chore history by member and by date range.

13. *(Nice-to-have)* **As a roommate**, I want a weekly email/summary of my balance, so I don't have to check the app proactively.

14. *(Nice-to-have)* **As a house admin**, I want to auto-rotate chores on a schedule even if nobody marks them done, so the rotation doesn't stall.

15. *(Nice-to-have)* **As a roommate**, I want to attach a receipt photo to an expense, so disputes are easier to resolve.

## 4. Scope

**Must-have (MVP)** — stories 1–9 above: household creation/join, expense logging with splits, chore list with rotation and completion, combined fairness balance, chore weighting, manual settlements.

**Nice-to-have** — stories 10–15: editing/deleting entries, filtered history, email summaries, auto-rotation on schedule, receipt photos.

**Non-goals (deliberately not building):**
- Real payment processing/integration (Venmo, Stripe, etc.) — settlements are just a logged record, not an actual transfer.
- Multi-household membership per user.
- Native mobile apps (browser only).
- Notifications/push (email nice-to-have only, no SMS/push).
- Fine-grained permission roles beyond "member" vs "admin."

## 5. Key screens

- **Join/Create Household** → entry screen: "Create a household" or "Join with code."
- **Dashboard** (home after login) → shows the combined fairness balance for the current user, plus quick links to Expenses, Chores, and household members.
- **Expenses** → list of all logged expenses + an "Add expense" form (amount, description, payer, split-with).
- **Chores** → list of chores with assignee/due date + "Mark done" button; admin sees "Add/edit chore" controls here too.
- **Settle Up** → simple form to log a manual payment between two members, plus running money-only balance per pair.
- **Household Settings** (admin only) → member list, invite code, chore weight editor.

Navigation: Dashboard is the hub; Expenses, Chores, Settle Up, and Settings are tabs/nav items reachable from anywhere.

## 6. Data & rules

**Core entities:**
- **Household**: id, name, invite code.
- **Member**: id, household_id, name, role (admin/member).
- **Expense**: id, household_id, payer_id, amount, description, date.
- **ExpenseShare**: expense_id, member_id, share_amount (derived from split rule, default equal split among selected members).
- **Chore**: id, household_id, name, frequency, weight (point value), current_assignee_id, next_due_date, active (bool).
- **ChoreCompletion**: id, chore_id, completed_by_id, completed_at.
- **Settlement**: id, household_id, from_member_id, to_member_id, amount, date.

**Rules that aren't obvious:**
- A member belongs to exactly one household at a time (MVP simplification).
- An expense's shares must sum exactly to its total amount (handle rounding remainder by assigning it to the payer).
- Fairness balance = (money owed to others − money owed by others) combined with (chore weight completed − chore weight expected), normalized into one comparable number — exact formula to be pinned down during design, but both halves must be visible in the breakdown, not just the blended number.
- A chore's rotation only advances when marked done — it does not silently skip a person who never completes it (a fairness balance simply keeps accruing against them).
- Only an admin can edit/archive chores or change weights; any member can log an expense or mark a chore done.
- Deleting an expense/chore should be an archive, not a hard delete, so historical balances stay auditable.

<img width="1024" height="559" alt="sample image" src="https://github.com/user-attachments/assets/8c060604-a702-4e4d-a7c2-c7f42ce946fc" />

