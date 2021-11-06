import * as Papa from 'papaparse';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './assets/styles.css';
import { CanvasLoader } from './components/CanvasLoader';
import { FastTable } from './components/FastTable/FastTable';
import { IFastRow } from './components/FastTable/IFastTable';
import { LinearLoader } from './components/LinearLoader/LinearLoader';
import { RateControls } from './components/RateControls';
import { TABLE_CONFIG } from './config/TABLE_CONFIG';
import { CustomRowData, RateConfig } from './interface/IApp';
import { parseDate } from './utils/parseDate';

// tabulator
const GOOGLE_SHEET = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT5QQ_zIuzGqX14L9YNaqvkqaX9gUhx2r3wBUOsGH3g9UwA3A9EFOUF2ac8ikdnJSaJFGK8iipXkeuj/pub?output=csv';
// const GOOGLE_SHEET = '/google_csv.csv';
export const MAX_DURATION = 60 * 5;
const UTC_DAY = 24 * 60 * 60 * 100;

export class App {
  maxListens = 0;
  maxAge = 0;
  doChangeTimeout: NodeJS.Timeout;
  loader = new CanvasLoader();
  configLoader = new LinearLoader();
  controls: RateControls = new RateControls({ onChange: this.onChange.bind(this) });
  fastTable = new FastTable<CustomRowData>({
    ...TABLE_CONFIG,
    onClickRow: this.onClickRow.bind(this),
  });

  constructor() {
    document.body.appendChild(this.loader.$div);
    document.body.appendChild(this.controls.$el);
    document.body.appendChild(this.configLoader.$el);
    document.body.appendChild(this.fastTable.$table);
    window.addEventListener('resize', this.handleResize.bind(this));
    this.configLoader.addEventListener('complete', this.doChange.bind(this));
    this.importData(GOOGLE_SHEET);
  }

  handleResize() {
    if (this.fastTable.rows.length > 0) {
      const rect = this.fastTable.$table.getBoundingClientRect();
      const rowHeight = Math.ceil(this.fastTable.$tbody.querySelector('tr').getBoundingClientRect().height);
      const newRows = Math.floor((window.innerHeight - rect.bottom) / rowHeight);
      this.fastTable.pagination.itemsPerPage += newRows;
    }
  }

  importData(url: string) {
    console.log('importData');
    const self = this;
    let config = {
      transformHeader: (header: string, index: number) => {
        return [
          'id', // Swell ID
          'created', // Created
          'title', // Title
          'totalListens', // Unique Listens - Main Swell
          'duration', // Duration
          'percentListened', // Listen %
          'repl', // Replies Listened
          'ulis', // Unique Listens - Reply
        ][index];
      },
      transform: (value: string, headerName: string) => {
        switch (headerName) {
          case 'totalListens':
          case 'duration':
            return parseFloat(value);
          case 'percentListened':
            return parseFloat(value) / 100;
          case 'created':
            return parseDate(value);
          default:
            return value;
        }
      },
      complete: (results: { data: CustomRowData[] }) => {
        const report: { id: string; report: { reason: Record<string, any> } }[] = [];

        const rows = results.data.filter((r) => {
          const res = this.junkRowFilter(r);
          if (!res.pass) report.push({ id: r.id, report: res });
          return res.pass;
        });

        this.maxListens = rows.reduce((max, row) => Math.max(max, row.totalListens), 0);
        this.maxAge = rows.reduce((max, row) => Math.max(max, Date.now() - row.created.getTime()), 0);

        rows.forEach(this.processRawRow.bind(this));

        console.log('rows', rows.length);
        console.log(`${results.data.length - rows.length} Rows Failed`, report);
        console.log('maxListens', this.maxListens);
        console.log('maxAge', this.maxAge, Math.floor(this.maxAge / UTC_DAY)); // timeago(new Date(this.maxAge)));
        this.fastTable.insertRows(rows);
        this.fastTable.sortOnColumn('rating', -1);
        this.loader.stop();
        this.handleResize();
      },
      download: true,
      header: true,
    };
    Papa.parse(url as any, config);
  }

  junkRowFilter(r: CustomRowData) {
    const test1 = !isNaN(r.duration) && r.duration > 0;
    const test2 = !isNaN(r.percentListened) && r.percentListened > 0;
    const test3 = !isNaN(r.totalListens) && r.totalListens > 0;
    const test4 = r.created !== null;
    const pass = test1 && test2 && test3;
    return { pass, reason: { duration: test1, percentListened: test2, totalListens: test3, created: test4 } };
  }

  processRawRow(r: CustomRowData, i: number) {
    r.index = i;
    r.duration = Math.min(MAX_DURATION, r.duration); // durations can be 301s?
    r.durationPercent = r.duration / MAX_DURATION;
    r.secondsListened = r.percentListened * r.duration;
    r.secondsListenedPercent = r.secondsListened / MAX_DURATION;
    r.averageSeconds = r.duration * r.secondsListenedPercent;
    r.totalListensPercent = r.totalListens / this.maxListens;
    r.age = Date.now() - r.created.getTime();
    r.totalAgePercent = Math.max(0, Math.min(1, 1 - r.age / this.maxAge));
    r.rating = this.calculateRating(r, this.controls.config);
  }

  onClickRow(row: IFastRow<CustomRowData>) {
    console.log('rating', row.rating, row);
  }

  onChange(config: RateConfig) {
    this.configLoader.start(1000);
  }

  doChange() {
    if (!this.fastTable) return;
    // why while when you can duff? ...from an anonymous donor to Jeff Greenberg's site
    let iterations = this.fastTable.rows.length;
    let i = 0;
    var n = iterations % 8;
    while (n--) {
      this.updateRowRating(i++);
    }
    n = Math.floor(iterations / 8);
    while (n--) {
      this.updateRowRating(i++);
      this.updateRowRating(i++);
      this.updateRowRating(i++);
      this.updateRowRating(i++);
      this.updateRowRating(i++);
      this.updateRowRating(i++);
      this.updateRowRating(i++);
      this.updateRowRating(i++);
    }
    this.fastTable.updateColumn('rating');
    this.fastTable.sortOnColumn('rating', -1);
  }

  updateRowRating(i: number) {
    const row = this.fastTable.rows[i];
    const col = this.fastTable.getColumn('rating');
    row.rating = this.calculateRating(row, this.controls.config);
    if (row.__cellsRendered) {
      row.__cells[col.__index].sortRendered = true;
      row.__cells[col.__index].sortValue = row.rating;
      row.__cells[col.__index].displayValue = row.rating;
      row.__cells[col.__index].__el.innerHTML = `${row.rating}`;
    }
  }

  calculateRating(item: CustomRowData, config: RateConfig): number {
    if (config.maxScore === 0) return 0;
    // kpi #1
    const durationPercentVal = item.durationPercent * config.durationPercentMultiplier;
    // kpi #2
    const averageSecondsVal = item.secondsListenedPercent * config.averageSecondsMultiplier;
    // kpi #3
    const averagePositionVal = item.percentListened * config.percentListenedMultiplier;
    // kpi #4
    const totalListensVal = item.totalListensPercent * config.totalListensMultiplier;
    // kpi #4
    const ageDecayVal = item.totalAgePercent * config.ageDecayMultiplier;

    return (durationPercentVal + averageSecondsVal + averagePositionVal + totalListensVal + ageDecayVal) / config.maxScore;
  }
}
