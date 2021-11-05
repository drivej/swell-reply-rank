export function rand(n1, n2) {
  if (n2 === undefined) {
    if (n1 === undefined) {
      return Math.random();
    } else {
      n2 = n1;
      n1 = 0;
    }
  }
  return Math.floor(n1 + Math.random() * (n2 - n1));
}

export function formatDuration(seconds) {
  if (isNaN(seconds)) return '';
  seconds = Math.round(seconds);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${('0' + s).slice(-2)}`;
}

export function parseDate(str) {
  let date = str.split('/').map((n) => parseInt(n));
  return new Date(date[2], date[0] - 1, date[1]);
}
