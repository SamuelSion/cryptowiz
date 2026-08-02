// Scales decimal precision to the price magnitude (e.g. BTC vs a $1 coin).
export function formatPriceTick(value: number): string {
  if (value >= 1000) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (value >= 1) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
}
