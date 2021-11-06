export function parseDate(str: string): Date {
  let date = str.split('/').map((n) => parseInt(n));
  return new Date(date[2], date[0] - 1, date[1]);
}
