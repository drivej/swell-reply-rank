import { Paginate, PaginateEvent } from './Paginate';

export class PaginationUI {
  paginate;
  $el = document.createElement('div');
  $pageIndex = document.createElement('div');

  constructor(paginate: Paginate) {
    this.$el.appendChild(this.$pageIndex);
    this.paginate = paginate;
    paginate.on('change', (evt) => this.onChange(evt));
  }

  onChange(evt: PaginateEvent) {
    this.$pageIndex.innerHTML = `${evt.info.startIndex}-${evt.info.endIndex} of ${evt.info.total}`;
  }
}
