// Unambiguous DD.MM.YYYY date, always with a year (axis ticks stay
// compact, but tooltips need the full date).
export function formatFullDate(timeMs: number, includeTime: boolean): string {
  const date = new Date(timeMs);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const datePart = `${day}.${month}.${year}`;

  if (!includeTime) {
    return datePart;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${datePart}, ${hours}:${minutes}:${seconds}`;
}
