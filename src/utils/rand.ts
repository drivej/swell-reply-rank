export function rand(n1: number, n2: number): number {
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
