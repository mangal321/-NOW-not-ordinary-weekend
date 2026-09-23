const SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AED: "د.إ",
};

export function formatMoney(currency: string, amount: number): string {
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  const grouped = amount.toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });
  return `${symbol}${grouped}`;
}
