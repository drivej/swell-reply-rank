import { IFastColumn, IFastColumnConfig, IFastRow, IFastTableConfig } from './IFastTable';
import { Paginate, PaginateInfo } from './Paginate';
import { PaginationUI } from './PaginationUI';

export class FastTable<CustomData> {
  $table = document.createElement('table');
  $thead = document.createElement('thead');
  $tbody = document.createElement('tbody');
  $tfoot = document.createElement('tfoot');

  rows: IFastRow<CustomData>[] = [];
  columns: IFastColumn<CustomData>[] = [];
  pagination: Paginate;
  paginateUI: PaginationUI;

  lastSortKey = '';
  lastSortDir = 1;
  onClickRow: IFastTableConfig<CustomData>['onClickRow'];

  //
  // initializers
  //

  constructor(config: IFastTableConfig<CustomData>) {
    this.$table.appendChild(this.$thead);
    this.$table.appendChild(this.$tbody);
    this.$table.appendChild(this.$tfoot);
    this.$table.className = config?.tableClassName ?? '';

    this.pagination = new Paginate({ total: config.rows.length, itemsPerPage: config.itemsPerPage ?? 10 });
    this.pagination.on('change', this.onChangePagination.bind(this));
    this.paginateUI = new PaginationUI(this.pagination);
    // this.$tfoot.appendChild(this.paginateUI.$el);

    this.columns = config.columns.map(this.initColumn.bind(this));
    this.rows = config.rows.map(this.initRow.bind(this));
    this.onClickRow = config.onClickRow;

    this.renderHeader();
    this.renderBody();
    this.renderFooter();
    this.pagination.triggerChange();

    if (config.wheelScroll) {
      this.$tbody.addEventListener('wheel', (e: WheelEvent) => {
        this.pagination.startIndex += e.deltaY > 0 ? 1 : -1;
        e.stopPropagation();
        e.stopImmediatePropagation();
      });
    }
  }

  insertRows(rows: CustomData[]) {
    this.rows = rows.map(this.initRow.bind(this));
    this.pagination.total = this.rows.length;
    this.renderBody();
  }

  initColumn(colConfig: IFastColumnConfig<CustomData>, index: number): IFastColumn<CustomData> {
    const $th = document.createElement('th');
    $th.innerHTML = colConfig.label || colConfig.key;
    $th.dataset.colKey = colConfig.key;
    $th.addEventListener('click', this.handleClickHeader.bind(this));
    $th.className = colConfig?.headClassName?.(colConfig);

    return {
      __el: $th,
      __index: index,
      label: colConfig.key,
      visible: colConfig.visible === false ? false : true,
      cellClassName: this.defaultCellClassName,
      headClassName: this.defaultHeadClassName,
      cellRenderer: this.defaultDisplayRenderer,
      sortRenderer: this.defaultSortRenderer,
      __sortDirection: 1,
      ...colConfig,
    };
  }

  handleClickHeader(evt: Event) {
    const colKey = (evt.currentTarget as HTMLTableCellElement).dataset.colKey;
    const col = this.getColumn(colKey);
    col.__sortDirection *= -1;
    this.sortOnColumn(colKey, col.__sortDirection);
    console.log(col, col.__sortDirection);
  }

  handleClickRow(evt: Event) {
    const rowIndex = parseInt((evt.currentTarget as HTMLTableCellElement).dataset.rowIndex);
    const row = this.rows[rowIndex];
    this?.onClickRow(row);
  }

  initRow(data: CustomData, index: number): IFastRow<CustomData> {
    return {
      __el: null,
      __displayRendered: false,
      __cellsRendered: false,
      //   __index: index,
      __visible: true,
      __cells: null,
      __haystack: '',
      ...data,
    };
  }

  //
  // renderers
  //

  renderAll() {
    this.renderHeader();
    this.renderBody();
    this.renderFooter();
  }

  renderHeader() {
    this.$thead.innerHTML = '';
    for (var i = 0; i < this.columns.length; i++) {
      let col = this.columns[i];
      if (col.visible) {
        this.$thead.appendChild(col.__el);
      }
    }
  }

  renderBody() {
    this.$tbody.innerHTML = '';
    const $frag = document.createDocumentFragment();
    let row;
    let i = 0;
    let found = 0;

    while (i < this.rows.length && found < this.pagination.itemsPerPage) {
      row = this.rows[i];
      if (row.__visible) {
        if (i >= this.pagination.startIndex) {
          this.renderRow(row);
          row.__el.dataset.rowIndex = `${i}`;
          $frag.appendChild(row.__el);
          found++;
        }
      }
      i++;
    }

    this.$tbody.appendChild($frag);
  }

  renderFooter() {
    this.$tfoot.innerHTML = '';
    const $th = document.createElement('th');
    $th.setAttribute('colspan', this.columns.length.toString());
    $th.appendChild(this.paginateUI.$el);
    this.$tfoot.appendChild($th);
  }

  renderRow(row: IFastRow<CustomData>) {
    this.initRowCells(row);
    if (row.__displayRendered === false) {
      row.__displayRendered = true;
      row.__el = document.createElement('tr');
      row.__el.addEventListener('click', this.handleClickRow.bind(this));
      row.__cells.forEach((cell) => row.__el.appendChild(cell.__el));
    }
    let col;
    for (var i = 0; i < this.columns.length; i++) {
      col = this.columns[i];
      if (col.visible) {
        this.renderCell(row, col);
      }
      row.__cells[col.__index].__el.style.display = col.visible ? null : 'none';
    }
  }

  renderCell(row: IFastRow<CustomData>, col: IFastColumn<CustomData>, refresh: boolean = false) {
    this.initRowCells(row);
    let cell = row.__cells[col.__index];
    if (refresh === true || cell.displayRendered === false) {
      row.__cells[col.__index].displayRendered = true;
      row.__cells[col.__index].__el.className = col.cellClassName(row, col);
      if (col.cellTitleRenderer) row.__cells[col.__index].__el.title = col.cellTitleRenderer(row, col);
      row.__cells[col.__index].displayValue = col.cellRenderer(row, col);
      row.__cells[col.__index].__el.innerHTML = `${row.__cells[col.__index].displayValue}`;
    }
  }

  initRowCells(row: IFastRow<CustomData>) {
    if (row.__cellsRendered === false) {
      row.__cellsRendered = true;
      row.__cells = this.columns.map((col) => ({
        key: col.key,
        __el: document.createElement('td'),
        displayRendered: false,
        sortRendered: false,
      }));
    }
  }

  updateColumn(key: string) {
    const col = this.getColumn(key);
    let row;
    let i = this.rows.length;
    while (i--) {
      row = this.rows[i];
      this.initRowCells(row);
      this.renderCell(row, col, true);
    }
    // if (this.lastSortKey === key) {
    //   this.sortOnColumn(this.lastSortKey, this.lastSortDir);
    // }
  }

  //
  // features
  //

  onChangePagination(info: PaginateInfo) {
    this.renderBody();
  }

  sortOnColumn(key: string, dir = 1) {
    console.log('sortOnColumn', key, dir, this.rows.length);
    this.lastSortKey = key;
    this.lastSortDir = dir;
    const col = this.getColumn(key);
    const colIndex = col.__index;

    // prep rows for sort
    let row;
    let i = this.rows.length;
    while (i--) {
      row = this.rows[i];
      this.initRowCells(row);
      if (row.__cells[colIndex].sortRendered === false) {
        row.__cells[colIndex].sortValue = col.sortRenderer(row, col);
        row.__cells[colIndex].sortRendered = true;
      }
    }

    let cellA, cellB;
    this.rows.sort((a, b) => {
      cellA = a.__cells[colIndex];
      cellB = b.__cells[colIndex];
      return (cellA.sortValue < cellB.sortValue ? -1 : cellA.sortValue > cellB.sortValue ? 1 : 0) * dir;
    });
    // this.updateRowIndexes();
    this.pagination.pageIndex = 0;
    this.renderBody();
  }

  toggleColumn(key: string, visible?: boolean) {
    const col = this.getColumn(key);
    col.visible = visible === true || visible === false ? visible : !col.visible;
    this.renderAll();
  }

  //
  // utils
  //

  getColumn(key: string): IFastColumn<CustomData> {
    return this.columns.find((col) => col.key === key);
  }

  defaultCellClassName(row: IFastRow<CustomData>, col: IFastColumn<CustomData>) {
    return '';
  }

  defaultHeadClassName(col: IFastColumn<CustomData>) {
    return '';
  }

  defaultDisplayRenderer(row: IFastRow<CustomData>, col: IFastColumn<CustomData>) {
    return `${(row as any)[col.key]}`;
  }

  defaultSortRenderer(row: IFastRow<CustomData>, col: IFastColumn<CustomData>) {
    return `${(row as any)[col.key]}`;
  }
}
