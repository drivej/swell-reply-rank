export type PaginateEvent = CustomEvent<PaginateInfo>;

export type Listener = (evt: PaginateEvent) => void;

export interface PaginateInfo {
  startIndex: number;
  endIndex: number;
  pageIndex: number;
  itemsPerPage: number;
  total: number;
}

export class Paginate {
  $el = document.createElement('div');
  _itemsPerPage = 1;
  _total = 0;
  _pageIndex = 0;
  _startIndex = 0;
  _endIndex = 0;
  _maxPages = 0;
  maxItemsPerPage = 2048;
  $triggerDelay: NodeJS.Timeout;

  constructor(config: { total: number; itemsPerPage: number }) {
    Object.assign(this, config);
  }

  addEventListener(t: keyof HTMLElementEventMap, f: (e: Event) => void) {
    this.$el.addEventListener(t, f);
  }

  removeEventListener(t: keyof HTMLElementEventMap, f: (e: Event) => void) {
    this.$el.removeEventListener(t, f);
  }

  get total() {
    return this._total;
  }

  set total(val: number) {
    if (val === this._total) return;
    this._total = val;
    this._maxPages = Math.ceil(this._total / this._itemsPerPage);
    this._pageIndex = 0;
    this._startIndex = this._pageIndex * this._itemsPerPage;
    this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
    this.triggerChange();
  }

  set itemsPerPage(val: number) {
    val = Math.max(1, Math.min(this.maxItemsPerPage, val));
    if (val === this._itemsPerPage) return;
    this._itemsPerPage = val;
    this._maxPages = Math.ceil(this._total / this._itemsPerPage);
    this._startIndex = Math.max(0, Math.min(this._total - this._itemsPerPage, this._startIndex));
    this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
    this.triggerChange();
  }

  get itemsPerPage() {
    return this._itemsPerPage;
  }

  set pageIndex(val: number) {
    val = Math.max(0, Math.min(this._maxPages, val));
    if (val === this._pageIndex) return;
    this._pageIndex = val;
    this._startIndex = this._pageIndex * this._itemsPerPage;
    this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
    this.triggerChange();
  }

  get maxPages() {
    return this._maxPages;
  }

  get pageIndex() {
    return this._pageIndex;
  }

  get startIndex(): number {
    return this._startIndex;
  }

  set startIndex(val: number) {
    val = Math.max(0, Math.min(this._total - this._itemsPerPage, val));
    if (val === this._startIndex) return;
    this._startIndex = val;
    this._endIndex = Math.min(this._total, this._startIndex + this._itemsPerPage);
    this._pageIndex = Math.floor(this._startIndex / this._itemsPerPage);
    this.triggerChange();
  }

  get endIndex(): number {
    return this._endIndex;
  }

  set endIndex(val: number) {
    val = Math.min(this._total, val);
    if (val === this._endIndex) return;
    this._endIndex = val;
    this._startIndex = Math.max(0, this._endIndex - this._itemsPerPage);
    this._pageIndex = Math.floor(this._startIndex / this._itemsPerPage);
    this.triggerChange();
  }

  get info(): PaginateInfo {
    return {
      startIndex: ~~this._startIndex,
      endIndex: ~~this._endIndex,
      total: this._total,
      pageIndex: this._pageIndex,
      itemsPerPage: this._itemsPerPage,
    };
  }

  triggerChange() {
    if (this.$triggerDelay) clearTimeout(this.$triggerDelay);
    this.$triggerDelay = setTimeout(() => {
      this.$el.dispatchEvent(new CustomEvent<PaginateInfo>('change', { bubbles: false, cancelable: false, detail: this.info }));
    }, 1);
  }
}
