export function formatDuration(seconds: number): string {
  if (isNaN(seconds)) return '';
  seconds = Math.round(seconds);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${('0' + s).slice(-2)}`;
}
