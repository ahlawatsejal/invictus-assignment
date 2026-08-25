# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top. Also, comparing raw string dates produced `NaN`.

**What I changed:** In `src/components/ExpenseList.jsx`, reversed the comparator to sort descending (`dateValue(b.date) - dateValue(a.date)`). In `src/lib/format.js`, updated `dateValue` to safely parse dates into numeric timestamps for accurate chronological sorting.

---

## Bug 2

**How to reproduce:** Open the app and look at the Balances panel. Ben Okonkwo paid $276.00 and his share was $217.00, so he should be shown as being owed $59.00. Instead, the app says he “owes $59.00”. Aisha Khan has the opposite problem: she owes $85.00, but the app says she “is owed $85.00”.

**What is wrong:** The balance condition was backwards. Positive balances were being treated as money the person owed, while negative balances were being treated as money owed to them.

**What I changed:** In `src/components/BalancesPanel.jsx`, I fixed the balance check so a positive balance is shown as `is owed` using the `.owed` style, while a negative balance is shown as `owes` using the `.owe` style.

---

## Bug 3

**How to reproduce:** Look at expense `e2`, “Uber to airport”. Diya Patel paid the full $60.00, but the expense was split between Aisha and Ben. Diya should therefore receive the full $60.00 credit. Instead, she was being charged $30.00, and the total group balance ended up being -$30.00.

**What is wrong:** The balance calculation was incorrectly charging the person who paid for an expense when they were not included in the split.

**What I changed:** In `src/lib/balances.js`, I removed the incorrect deduction that charged the payer a share of the expense when they were not one of the participants. The payer now receives the correct full credit for paying for others.

---

## Bug 4

**How to reproduce:** Create a situation where one person owes exactly the amount another person should receive. For example, Carlos Mendes owes $17.00 and Diya Patel is owed $17.00. The settlement calculation runs, but no payment is suggested.

**What is wrong:** When the debtor's amount and creditor's amount were exactly the same, the settlement code moved on without actually creating the payment transfer.

**What I changed:** In `src/lib/settle.js`, I updated the settlement logic to calculate the amount to transfer, add the payment to the `transfers` list, and then mark both sides as settled when the amounts are equal.

---

## Bug 5

**How to reproduce:** Add an expense that cannot be split evenly into whole cents, such as a $100.00 grocery bill split between 3 people. Each person was shown as paying $33.33, which adds up to only $99.99.

**What is wrong:** The equal-split calculation rounded every person's share separately. This caused leftover cents to be lost whenever the amount could not be divided evenly.

**What I changed:** In `src/lib/money.js`, I changed `splitEqual` to work with cents. It calculates the base amount for each person and distributes any remaining pennies between the participants so that all shares always add up exactly to the original bill.

---

## Bug 6

**How to reproduce:** Look at expense `e9`, the $20.00 Wine expense split as 33.33%, 33.33%, and 33.34%. The app can calculate the shares as $6.67, $6.67, and $6.67, which adds up to $20.01 instead of $20.00.

**What is wrong:** Each percentage share was being rounded independently. Because of the rounding, the individual amounts could add up to more or less than the original expense.

**What I changed:** In `src/lib/money.js`, I updated `splitByPercent` to calculate the amounts in cents and adjust the rounding difference. This makes sure all percentage-based shares add up exactly to the total expense.

---

## Bug 7

**How to reproduce:** Add an expense with a Custom % split between 6 people, such as five people at 16.67% and one person at 16.65%. The percentages add up to 100.00%, but the form rejects them with the message “Percentages must add to 100.”

**What is wrong:** JavaScript's floating-point calculations produced a tiny rounding difference, so the calculated total was `99.99999999999999` instead of exactly `100`.

**What I changed:** In `src/lib/money.js`, I changed `percentsSumTo100` to allow a very small rounding difference by checking whether the total is within `0.01` of 100. This prevents valid percentage splits from being rejected because of floating-point precision.

---

## Bug 8

**How to reproduce:** Go to the Filters section and select a member from the “Paid by” dropdown, such as Aisha Khan. The app shows “No expenses match these filters”, even though Aisha has paid for expenses.

**What is wrong:** The selected value from the dropdown was stored as a string, while the `paidBy` value on an expense was stored as a number. The filter was comparing them directly, so values such as `1` and `"1"` were considered different.

**What I changed:** In `src/App.jsx`, I converted both values to numbers before comparing them. This makes the “Paid by” filter work correctly regardless of how the value is stored.

---

## Bug 9

**How to reproduce:** Filter or sort the expense list so that the order changes. For example, search for “Beach” and select “Dinner by the beach”. Click “Delete”. Instead of deleting that expense, the app deletes the first expense in the original list. The same problem can happen when editing an expense amount.

**What is wrong:** The expense list was using the position of an item in the displayed list to identify it. Once the list was filtered or sorted, that position no longer matched the item's position in the original state.

**What I changed:** I changed the delete and update logic in `src/state/store.js`, `src/App.jsx`, and `src/components/ExpenseList.jsx` to use each expense's unique `id` instead of its array index. This ensures the correct expense is updated or deleted even after filtering or sorting.

---

## Bug 10

**How to reproduce:** Type a new member's name, such as “Maya”, and click “Add”. The total number of members increases, but Maya does not appear in the “Paid so far” summary.

**What is wrong:** The summary calculation was only watching for changes to the expenses. It was not recalculating when the members list changed, so newly added members were missing from the summary.

**What I changed:** In `src/components/SummaryCards.jsx`, I added `members` to the `useMemo` dependency list. The summary now updates whenever either the members or expenses change.

---

## Bug 11

**How to reproduce:** Open the app with dates displayed in a format such as “12 Mar 2026”. Refresh the page. After the data is loaded again, the dates may appear as raw values such as “2026-03-12”. In some time zones, the date can also appear as the previous day.

**What is wrong:** Data loaded from `localStorage` was not being processed through the same `hydrate` logic used elsewhere in the app. The date handling also relied on JavaScript's default parsing, which can interpret date-only strings as UTC and cause them to shift by one day in some time zones.

**What I changed:** In `src/state/store.js`, I updated `loadState` so data loaded from `localStorage` is properly hydrated. In `src/lib/format.js`, I also added safer date parsing for both displaying dates and comparing them, avoiding unwanted timezone shifts.

---

## Bug 12

**How to reproduce:** Edit an expense amount or delete an expense while viewing the list. After the list changes, an expense row can show an old amount or other stale information.

**What is wrong:** `ExpenseList.jsx` was using the array index as the React `key`. When an item was removed or the list order changed, React could reuse the wrong component and keep its old local input state.

**What I changed:** In `src/components/ExpenseList.jsx`, I changed the React key from the array index to the unique `expense.id`. I also added an effect inside `ExpenseRow` to keep the draft amount in sync with the current expense amount.

---

## Bug 13

**How to reproduce:** Open the “Add expense” form, enter something such as “Taxi” with an amount of `$25`, and submit the form. The expense is added successfully, but the Description and Amount fields still contain the old values.

**What is wrong:** The form was successfully adding the expense, but it was not clearing the input fields after submission.

**What I changed:** In `src/components/AddExpenseForm.jsx`, I reset the Description and Amount fields after a successful submission. I also cleared any previous error message so the form is ready for the next expense.
