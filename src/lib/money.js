export function formatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  const rounded = Math.round(Math.abs(n) * 100) / 100;
  const sign = n < -0.004 ? "-" : "";
  return `${sign}$${rounded.toFixed(2)}`;
}

export function splitEqual(amount, ids) {
  const n = ids.length;
  if (!n) return {};
  const totalCents = Math.round(Number(amount) * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainder = totalCents % n;
  const shares = {};
  ids.forEach((id, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0);
    shares[id] = cents / 100;
  });
  return shares;
}

export function percentsSumTo100(percents) {
  const values = Object.values(percents).map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) < 0.01;
}

export function splitByPercent(amount, percents) {
  const entries = Object.entries(percents);
  if (!entries.length) return {};
  const totalCents = Math.round(Number(amount) * 100);
  const rawCents = entries.map(([id, pct]) => ({
    id,
    pct: Number(pct),
    cents: Math.round((totalCents * Number(pct)) / 100),
  }));
  const sumCents = rawCents.reduce((s, x) => s + x.cents, 0);
  const diff = totalCents - sumCents;
  if (diff !== 0 && rawCents.length > 0) {
    rawCents[0].cents += diff;
  }
  const shares = {};
  for (const item of rawCents) {
    shares[item.id] = item.cents / 100;
  }
  return shares;
}

export function sharesForExpense(expense) {
  if (expense.splitType === "percent" && expense.percents) {
    return splitByPercent(expense.amount, expense.percents);
  }
  return splitEqual(expense.amount, expense.splitWith);
}

