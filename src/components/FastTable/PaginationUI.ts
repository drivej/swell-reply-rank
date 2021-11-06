import { Paginate, PaginateEvent } from './Paginate';

export class PaginationUI {
  paginate;
  $el = document.createElement('div');
  $pageInfo: HTMLDivElement;
  $btnPrev: HTMLButtonElement;
  $btnNext: HTMLButtonElement;

  constructor(paginate: Paginate) {
    this.$el.innerHTML = `
    <div style="display:flex; align-items:center;">
      <div style="padding:5px" class="page-info">
      </div>
      <div style="padding:5px">
        <button class="btn btn-secondary page-prev">Prev</button>
      </div>
      <div style="padding:5px">
        <button class="btn btn-secondary page-next">Next</button>
      </div>
    </div>`;

    this.$pageInfo = this.$el.querySelector<HTMLDivElement>('.page-info');
    this.$btnPrev = this.$el.querySelector<HTMLButtonElement>('.page-prev');
    this.$btnNext = this.$el.querySelector<HTMLButtonElement>('.page-next');

    this.$btnPrev.addEventListener('click', () => {
      this.paginate.startIndex -= this.paginate.itemsPerPage;
    });

    this.$btnNext.addEventListener('click', () => {
      this.paginate.startIndex += this.paginate.itemsPerPage;
    });

    // this.$el.appendChild(this.$pageIndex);
    this.paginate = paginate;
    // paginate.on('change', (evt) => this.onChange(evt));
    paginate.addEventListener('change', this.onChange.bind(this));
  }

  onChange(evt: PaginateEvent) {
    this.$pageInfo.innerHTML = `${(evt.detail.startIndex + 1).toLocaleString()} &mdash; ${(evt.detail.endIndex + 1).toLocaleString()} of ${evt.detail.total.toLocaleString()} pp.${evt.detail.pageIndex + 1}`;
  }
}
