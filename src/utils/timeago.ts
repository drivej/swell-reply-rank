const MN = 0;
const MM = 60 * 1000;
const HH = 60 * MM;
const DD = 24 * HH;
const WK = 7 * DD;
const MO = 30 * DD;
const YR = 365 * DD;

export const UTCDay = DD;

interface Epoch {
  min: number;
  max: number;
  past(val: string | number): string;
  future(val: string | number): string;
}

const defaultEpochs: Array<Epoch> = [
  { min: MN, max: MM, past: () => `<1m ago`, future: () => `in <1m` },
  { min: MM, max: HH, past: (val) => `${val}m ago`, future: (val) => `in ${val}m` },
  { min: HH, max: DD, past: (val) => `${val}h ago`, future: (val) => `in ${val}h` },
  { min: DD, max: WK, past: (val) => `${val}d ago`, future: (val) => `in ${val}d` },
  { min: WK, max: MO, past: (val) => `${val}w ago`, future: (val) => `in ${val}w` },
  { min: MO, max: YR, past: (val) => `${val}mo ago`, future: (val) => `in ${val}mo` },
  { min: YR, max: Infinity, past: (val) => `${val}yr ago`, future: (val) => `in ${val}yr` },
];

export const timeago = (date: Date, epochs: typeof defaultEpochs = defaultEpochs): string => {
  const dif = Date.now() - date.getTime();
  const abs = Math.abs(dif);
  const e = epochs.find((epoch) => abs >= epoch.min && abs < epoch.max);
  if (e) {
    const func = dif < 0 ? e.future : e.past;
    return e ? func(Math.round(abs / Math.max(1, e.min))) : '';
  }
  return '';
};
