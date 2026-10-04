const numberFormat = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });

// 12.5 -> "12,5"
export function formatNumber(value: number) {
  return numberFormat.format(value);
}
