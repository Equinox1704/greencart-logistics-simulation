// src/utils/format.js
export const inr = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      })
    : n;

export const pct = (n) =>
  typeof n === "number" ? `${Number(n).toFixed(0)}%` : n;
