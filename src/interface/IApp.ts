export interface RateConfig {
  maxScore: number;
  durationPercentMultiplier: number;
  averageSecondsMultiplier: number;
  percentListenedMultiplier: number;
  totalListensMultiplier: number;
  ageDecayMultiplier: number;
}

export interface CustomRowData {
  id: string;
  index: number;
  title: string;
  created: Date;
  duration: number;
  totalListens: number;
  totalListensPercent: number;
  secondsListened: number;
  secondsListenedPercent: number;
  percentListened: number;
  durationPercent: number;
  averageSeconds: number;
  rating: number;
  totalAgePercent: number;
  age: number;
}
