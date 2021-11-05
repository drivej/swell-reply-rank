import { Paginate, PaginateEvent } from './Paginate';

export class PaginationUI {
  paginate;
  $el = document.createElement('div');
  // $pageIndex = document.createElement('div');
  $pageInfo: HTMLDivElement;
  $btnPrev: HTMLButtonElement;
  $btnNext: HTMLButtonElement;

  constructor(paginate: Paginate) {
    this.$el.innerHTML = `
    <div style="display:flex;">
      <div style="padding:5px" class="page-info">
      </div>
      <div style="padding:5px">
        <button class="page-prev">Prev</button>
      </div>
      <div style="padding:5px">
        <button class="page-next">Next</button>
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
    paginate.on('change', (evt) => this.onChange(evt));
  }

  onChange(evt: PaginateEvent) {
    this.$pageInfo.innerHTML = `${evt.info.startIndex}-${evt.info.endIndex} of ${evt.info.total}`;
  }
}
