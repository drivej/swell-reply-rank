export interface PaginateEvent {
  type: string;
  info: PaginateInfo;
}

export type Listener = (evt: PaginateEvent) => void;

export interface PaginateInfo {
  startIndex: number;
  endIndex: number;
  pageIndex: number;
  total: number;
}

export class Paginate {
  _itemsPerPage = 0;
  _total = 0;
  _pageIndex = 0;
  _startIndex = 0;
  _endIndex = 0;

  constructor(config: { total: number; itemsPerPage: number }) {
    Object.assign(this, config);
  }

  listeners: Listener[] = [];

  on(eventType: 'change', listener: Listener) {
    this.listeners.push(listener);
  }

  set total(val: number) {
    this._total = val;
    this._pageIndex = 0;
    this._startIndex = this._pageIndex * this._itemsPerPage;
    this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
    this.triggerChange();
  }

  get total() {
    return this._total;
  }

  set itemsPerPage(val: number) {
    this._itemsPerPage = Math.max(1, Math.min(1000, val));
    this._pageIndex = 0;
    this._startIndex = this._pageIndex * this._itemsPerPage;
    this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
    this.triggerChange();
    // this.pageIndex = 0;
  }

  get itemsPerPage() {
    return this._itemsPerPage;
  }

  set pageIndex(val: number) {
    val = Math.max(0, Math.min(this.maxPages, val));
    if (val !== this._pageIndex) {
      this._pageIndex = val;
    }
    this._startIndex = this._pageIndex * this._itemsPerPage;
    this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
    this.triggerChange();
  }

  get maxPages() {
    return Math.ceil(this._total / this._itemsPerPage);
  }

  get pageIndex() {
    // return Math.floor(this._startIndex % this._itemsPerPage);
    return this._pageIndex;
  }

  get startIndex(): number {
    return this._startIndex;
  }

  set startIndex(val: number) {
    if (val !== this._startIndex) {
      this._startIndex = Math.max(0, Math.min(this._total - this._itemsPerPage, val));
      this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
      this._pageIndex = Math.floor(this._startIndex % this._itemsPerPage);
      this.triggerChange();
    }
  }

  get endIndex(): number {
    return Math.min(this._total, this.startIndex + this._itemsPerPage);
  }

  get info(): PaginateInfo {
    return { startIndex: this._startIndex, endIndex: this._endIndex, total: this._total, pageIndex: this._pageIndex };
  }

  triggerChange() {
    this.listeners.forEach((fn) => fn({ type: 'change', info: this.info }));
  }
}
