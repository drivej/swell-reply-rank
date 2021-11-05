/*

Updated: Jan 25, 2020

- sorting
- toolbar total
- toCSV
- filter

*/
import { CSVToArray } from './CSVToArray';
import { ObjectFilter } from './ObjectFilter';
import './Table.css';

interface TableConfig<RowData> {
  title?: string;
  //   columns?: TableColumn<RowData & RowDataDefault>[];
  //   rows?: (RowData & RowDataDefault)[];
  //   visibleRows?: (RowData & RowDataDefault)[];
  columns?: TableColumn<RowData>[];
  rows?: RowData[];
  visibleRows?: RowData[];
  container?: HTMLElement;
}

interface TableColumn<RowData> {
  cellClassName?(data: RowData, col: TableColumn<RowData>): string;
  __el?: HTMLTableCellElement;
  __index?: number;
  __visible?: boolean;
  key: string;
  label: string;
  style?: CSSStyleDeclaration;
  cellRenderer?(row: RowData, col?: TableColumn<RowData>, info?: Record<string, any>): string | number;
  sortRenderer?(row: RowData, col?: TableColumn<RowData>, info?: Record<string, any>): string | number;
}

export interface RowDataDefault {
  [key: string]: any;
  index: number;
  __el: HTMLTableRowElement;
  __index: number;
  __visible: boolean;
  __sortValues: (string | number)[];
  __cells: TableCell[];
  __haystack: string;
}

interface TableCell {
  el: HTMLTableCellElement;
  value: string | number; // | HTMLElement;
}

type FilterQuery = ((row: any) => boolean) | string | Record<string, any>;

export class Table<RowData> {
  $parent;
  $table;
  $title;
  $toolbar;
  config: TableConfig<RowData & RowDataDefault>;
  lastSortColIndex = -1;
  lastSortDir = 1;
  _lastSortColIndex = -1;
  _lastSortDir = 1;
  _lastSortKey: string;
  columnLookup: Record<string, TableColumn<RowData>> = {};
  groupByColKey: string = null;
  visibleHeaders = 0;
  pagination = {
    offset: 0,
    limit: 100,
    total: 0,
    index: 0,
    startIndex: 0,
    endIndex: 0,
    prevOffset: 0,
    nextOffset: 0,
    __total: 0,
    __offset: 0,
  };
  $caption: HTMLTableCaptionElement;
  $thead: HTMLTableSectionElement;
  $thead_labels: HTMLTableRowElement;
  $tbody: HTMLTableSectionElement;
  $table_stats: any;
  $toolbar_btns: any;
  $tfoot: HTMLTableSectionElement;
  $pageInfo: HTMLSpanElement;
  $tfoot_td: HTMLTableCellElement;
  columnToggle: Record<string, number>;
  $pageInfo_totalPages: any;
  $pageInfo_total: any;
  $pageInfo_limit: HTMLInputElement;
  $pageInfo_backBtn: HTMLButtonElement;
  $pageInfo_nextBtn: HTMLButtonElement;
  $pageInfo_pageIndex: any;

  constructor(_config: TableConfig<RowData & RowDataDefault>) {
    this.config = Object.assign({ columns: [], rows: [] }, _config);

    var self = this;
    // var config = { columns: [], rows: [] }
    this.$parent = document.createElement('div');
    this.$toolbar = document.createElement('div');

    this.$toolbar.innerHTML =
      '\
    <h2></h2>\
    <div style="display:flex; align-items: center;">\
        <div class="table-stats"></div>\
        <div class="toolbar-btns">\
            <button class="btn btn-sm btn-link toggle-header-toggles-btn"><i class="material-icons align-middle">settings</i></button>\
        </div>\
    </div>\
    <div class="header-toggles p-2 bg-light" style="display:none; flex-wrap:wrap;"></div>';
    this.$table = document.createElement('table');
    this.$caption = document.createElement('caption');
    this.$thead = document.createElement('thead');
    this.$thead_labels = document.createElement('tr');
    this.$tbody = document.createElement('tbody');

    this.$table_stats = this.$toolbar.querySelector('.table-stats');
    this.$toolbar_btns = this.$toolbar.querySelector('.toolbar-btns');

    this.$tfoot = document.createElement('tfoot');
    this.$tfoot.innerHTML =
      '\
    <tr>\
        <td>\
            <span class="page-info">\
                <div class="d-flex align-items-center">\
                    <div class="p-1">Page </div>\
                    <div class="p-1"><button class="back-btn btn btn-link p-0"><i class="material-icons align-middle">chevron_left</i></button></div>\
                    <div class="p-1"><input type="number" min="1" max="1" step="1" value="1" size="4" class="form-control w-auto page-info-page-index" /></div>\
                    <div class="p-1"><button class="next-btn btn btn-link p-0"><i class="material-icons align-middle">chevron_right</i></button></div>\
                    <div class="p-1">of</div>\
                    <div class="p-1 page-info-total-pages"></div>\
                    <div class="p-1 px-4">|</div>\
                    <div class="p-1"> Showing </div>\
                    <div class="p-1"><input type="number" min="100" max="1000" step="100" value="100" class="form-control page-info-limit" /></div>\
                    <div class="p-1">Per Page</div>\
                    <div class="p-1 px-4">|</div>\
                    <div class="p-1 page-info-total"></div>\
                    <div class="p-1">rows</div>\
                </div>\
            </span>\
        </td>\
    </tr>';
    this.$tfoot_td = this.$tfoot.querySelector('td');
    this.$pageInfo = this.$tfoot.querySelector<HTMLSpanElement>('.page-info');
    this.$pageInfo_backBtn = this.$pageInfo.querySelector<HTMLButtonElement>('.back-btn');
    this.$pageInfo_nextBtn = this.$pageInfo.querySelector<HTMLButtonElement>('.next-btn');
    this.$pageInfo_pageIndex = this.$pageInfo.querySelector('.page-info-page-index');
    this.$pageInfo_totalPages = this.$pageInfo.querySelector('.page-info-total-pages');
    this.$pageInfo_total = this.$pageInfo.querySelector('.page-info-total');
    this.$pageInfo_limit = this.$pageInfo.querySelector<HTMLInputElement>('.page-info-limit');

    this.columnToggle = JSON.parse(window.localStorage.getItem('columnToggle') || '{}');

    this.$parent.appendChild(this.$toolbar);
    this.$parent.appendChild(this.$table);
    this.$table.classList.add('data-table');
    this.$table.classList.add('table');
    this.$table.classList.add('table-hover');
    this.$table.classList.add('shadow');
    this.$table.appendChild(this.$caption);
    this.$table.appendChild(this.$thead);
    this.$thead.appendChild(this.$thead_labels);
    this.$table.appendChild(this.$tbody);
    this.$table.appendChild(this.$tfoot);

    const $title = (this.$title = this.$toolbar.querySelector('h2'));

    // var lastSortColIndex = -1;
    // var lastSortDir = 1;
    // var _lastSortColIndex = -1;
    // var _lastSortDir = 1;
    // var _lastSortKey
    // var columnLookup = {}
    // var groupByColKey = null
    // var visibleHeaders = 0
    // var pagination = {
    //     offset: 0,
    //     limit: 100,
    //     total: 0,
    //     pages: [],
    //     index: 0,
    //     startIndex: 0,
    //     endIndex: 0
    // }

    this.$toolbar.querySelector<HTMLButtonElement>('.toggle-header-toggles-btn').addEventListener('click', function () {
      var el = self.$toolbar.querySelector<HTMLDivElement>('.header-toggles');
      el.style.display = el.style.display === 'none' ? 'flex' : 'none';
    });

    (this.$pageInfo_pageIndex as HTMLInputElement).addEventListener('change', function (evt) {
      var offset = self.pagination.limit * (parseInt(this.value) - 1);
      self.updatePagination({ offset: offset });
    });

    this.$pageInfo_limit.addEventListener('change', function () {
      self.updatePagination({ limit: Math.min(parseInt(this.max), parseInt(this.value)) });
    });

    this.$pageInfo_backBtn.addEventListener('click', () => {
      this.updatePagination({ offset: this.pagination.prevOffset });
    });

    this.$pageInfo_nextBtn.addEventListener('click', () => {
      this.updatePagination({ offset: this.pagination.nextOffset });
    });

    this.setConfig(_config);
  }

  setConfig(delta: TableConfig<RowData>) {
    // console.log('setConfig', delta);
    if (delta) {
      Object.assign(this.config, delta);
      this.config.rows.forEach(function (row, i, a) {
        row.__index = i;
      });
      if (delta.columns) {
        this.renderHeader();
      }
      if (delta.rows) {
        this.updateVisibleRows();
        this.updatePagination({ total: this.config.visibleRows.length });
        this.renderBody();
      }
      if (delta.container) {
        delta.container.appendChild(this.$parent);
      }
      if (delta.title) {
        this.$title.innerHTML = delta.title;
      }
      this.updateToolbar();

      this.$table.style.display = this.config.visibleRows && this.config.visibleRows.length > 0 ? '' : 'none';
      this.$toolbar.style.display = this.config.columns.length > 0 ? '' : 'none';
    }
    return Object.assign({}, this.config);
  }

  updateToolbar() {
    if (!this.config.rows || this.config.rows.length === 0 || !this.config.columns || this.config.columns.length === 0) {
      this.$toolbar_btns.style.display = 'none';
      this.$table_stats.style.display = 'none';
      return (this.$table_stats.innerHTML = '');
    }
    var stats = [];
    stats.push('Rows: ' + this.pagination.total.toLocaleString());
    var prefix = '<span class="p-1">';
    var suffix = '</span>';
    this.$toolbar.querySelector('.table-stats').innerHTML = prefix + stats.join(suffix + prefix) + suffix;
    this.$table_stats.style.display = '';
    this.$toolbar_btns.style.display = '';
    this.populateHeaderToggle();
  }

  populateHeaderToggle() {
    var parent = this.$toolbar.querySelector('.header-toggles');
    parent.innerHTML = '';
    const self = this;
    const columnToggle = this.columnToggle;

    this.config.columns.forEach((col) => {
      var el = document.createElement('div');

      Object.assign(el.style, {
        width: '200px',
        flex: '0 1 20%',
        display: 'flex',
      });

      el.innerHTML = `<label>
        <input type="checkbox" data-col="${col.__index}" style="margin:5px;" ${col.key in columnToggle ? '' : 'checked'}/>
        <span>${col.label}</span>
      </label>`;

      el.querySelector<HTMLInputElement>('input').addEventListener('input', (evt) => {
        const t = evt.currentTarget as HTMLInputElement;
        self.toggleHeader(parseInt(t.getAttribute('data-col')), t.checked);
      });
      parent.appendChild(el);
    });
  }

  toggleHeader(columnIndex: number, force: boolean) {
    var col = this.config.columns[columnIndex];
    col.__visible = col.__visible !== false;
    col.__visible = typeof force === 'boolean' ? force : !col.__visible;
    if (col.__visible === false) {
      this.columnToggle[col.key] = 0;
    } else if (col.key in this.columnToggle) {
      delete this.columnToggle[col.key];
    }
    window.localStorage.setItem('columnToggle', JSON.stringify(this.columnToggle));
    this.render();
  }

  updateVisibleRows(test?: (row: any) => boolean) {
    this.config.visibleRows = this.config.rows.filter(function (row) {
      if (test) {
        row.__visible = test(row);
      }
      return row.__visible !== false;
    });
  }

  handleClickHeader(evt: { target: { getAttribute: (arg0: string) => any } }) {
    var colIndex = evt.target.getAttribute('data-colindex');
    var sortdir = evt.target.getAttribute('data-sortdir');
    sortdir = parseInt(sortdir === '-1' ? '1' : '-1');
    this.sortOn(this.config.columns[colIndex].key, sortdir);
  }

  sortOn(colKey: string, sortdir: number = 1) {
    var i = this.config.columns.length;
    var selectedColumn = this.getColumn(colKey);
    var colIndex = selectedColumn.__index;

    this.config.columns.forEach((col) => col.__el.classList.remove('selected'));

    selectedColumn.__el.classList.add('selected');
    selectedColumn.__el.setAttribute('data-sortdir', `${sortdir}`);

    // prep rows
    this.config.visibleRows.forEach((row) => {
      if (!row.__sortValues) {
        row.__sortValues = [];
      }
      if (!row.__sortValues[colIndex]) {
        if (selectedColumn.sortRenderer) {
          row.__sortValues[colIndex] = selectedColumn.sortRenderer(row, selectedColumn);
        } else {
          row.__sortValues[colIndex] = String(selectedColumn.cellRenderer(row, selectedColumn)).toLowerCase();
        }
      }
    });

    if (colIndex > -1) {
      var _a, _b;
      this.sortRows((a, b) => {
        _a = a.__sortValues[colIndex];
        _b = b.__sortValues[colIndex];

        // support 2 dimensional sort
        if (_a === _b && this.lastSortColIndex > -1 && this.lastSortColIndex !== colIndex) {
          _a = a.__sortValues[this.lastSortColIndex];
          _b = b.__sortValues[this.lastSortColIndex];
          return (_a < _b ? -1 : _a > _b ? 1 : 0) * this.lastSortDir;
        } else {
          return (_a < _b ? -1 : _a > _b ? 1 : 0) * sortdir;
        }
      });
    }

    if (colIndex !== this._lastSortColIndex) {
      this.lastSortColIndex = this._lastSortColIndex;
      this.lastSortDir = this._lastSortDir;
    }
    this._lastSortColIndex = colIndex;
    this._lastSortDir = sortdir;
    this._lastSortKey = colKey;
  }

  resort() {
    if (this._lastSortColIndex > -1) {
      this.sortOn(this._lastSortKey, this._lastSortDir);
    }
  }

  getColumn(colKey: string) {
    if (this.columnLookup[colKey]) {
      return this.columnLookup[colKey];
    }
    var i = this.config.columns.length;
    var col;

    while (i--) {
      col = this.config.columns[i];
      if (col.key === colKey) {
        col.__index = i;
        this.columnLookup[colKey] = col;
        return col;
        break;
      }
    }
  }

  sortRows(sorter: (a: RowDataDefault, b: RowDataDefault) => number) {
    this.config.visibleRows.sort(sorter);
    this.renderBody();
  }

  groupBy(colKey: string) {
    var i = this.config.columns.length;
    var col;
    while (i--) {
      col = this.config.columns[i];
      if (col.key === colKey) {
        break;
      }
    }
    if (col) {
      this.toggleHeader(i, false);
      this.sortOn(col.key);
      this.groupByColKey = colKey;
    } else {
      this.groupByColKey = null;
    }
    this.renderBody();
  }

  render() {
    this.renderHeader();
    this.renderBody();
    this.updateToolbar();
  }

  cellRenderer(row: RowDataDefault, col?: TableColumn<RowData>, info?: Record<string, any>): string | number {
    if (!col) {
      console.log('cellRenderer', row, col);
    }
    return row[col.key] !== undefined ? row[col.key] : '';
  }

  renderHeader() {
    const self = this;
    this.$thead_labels.innerHTML = '';
    this.visibleHeaders = 0;

    this.config.columns.map((header, i) => {
      if (typeof header === 'string') {
        header = { label: header, key: header };
        this.config.columns[i] = header;
      }
      if (!header.label) {
        header.label = header.key;
      }
      if (!header.__el) {
        header.__index = i;
        header.__el = document.createElement('th');
        header.__el.setAttribute('data-colindex', `${i}`);
        header.__el.addEventListener('click', this.handleClickHeader.bind(this));
        Object.assign(header.__el.style, header.style || {});
      }
      header.__el.innerHTML = header.label;
      header.cellRenderer = header.cellRenderer || this.cellRenderer;
      header.__visible = !(header.key in self.columnToggle);

      if (header.__visible !== false) {
        self.visibleHeaders++;
        self.$thead_labels.appendChild(header.__el);
      }
    });
    this.$tfoot_td.setAttribute('colspan', `${this.visibleHeaders}`);
  }

  updatePagination(delta: { offset?: number; limit?: number; total?: any }) {
    this.pagination.__total = this.pagination.total;
    this.pagination.__offset = this.pagination.offset;

    Object.assign(this.pagination, delta);

    var minOffset = 0;
    var totalPages = Math.floor(this.pagination.total / this.pagination.limit);
    var maxOffset = totalPages * this.pagination.limit;

    this.pagination.offset = Math.max(minOffset, Math.min(maxOffset, this.pagination.offset));
    this.pagination.index = Math.floor(this.pagination.offset / this.pagination.limit);
    this.pagination.offset = this.pagination.index * this.pagination.limit;

    this.pagination.startIndex = this.pagination.offset;
    this.pagination.endIndex = Math.min(this.pagination.total, this.pagination.offset + this.pagination.limit);

    this.pagination.prevOffset = Math.max(minOffset, Math.min(maxOffset, this.pagination.offset - this.pagination.limit));
    this.pagination.nextOffset = Math.max(minOffset, Math.min(maxOffset, this.pagination.offset + this.pagination.limit));

    if (this.pagination.limit <= this.pagination.total) {
      this.$pageInfo.style.display = '';
      this.$pageInfo_totalPages.textContent = totalPages + 1;
      this.$pageInfo_total.textContent = this.pagination.total;
      this.$pageInfo_limit.value = `${this.pagination.limit}`;
      this.$pageInfo_nextBtn.disabled = totalPages === 0 || this.pagination.nextOffset > this.pagination.endIndex;
      this.$pageInfo_backBtn.disabled = totalPages === 0 || this.pagination.index === 0;
      this.$pageInfo_pageIndex.max = totalPages;
      this.$pageInfo_pageIndex.value = this.pagination.index + 1;
    } else {
      this.$pageInfo.style.display = 'none';
    }

    this.renderBody();
    this.updateToolbar();
    return this.pagination;
  }

  renderBody() {
    this.$tbody.innerHTML = '';

    var $frag = document.createDocumentFragment();
    var i = this.pagination.startIndex;

    while (i < this.pagination.endIndex) {
      this.config.visibleRows[i].__index = i;
      this.renderRow(this.config.visibleRows[i], $frag, { index: i });
      i++;
    }
    this.$tbody.appendChild($frag);
  }

  renderColumn(colKey: string) {
    const col = this.getColumn('rating');
    let i = this.config.rows.length;
    while (i--) {
      this.renderCell(this.config.rows[i], col);
    }
  }

  renderRow(row: RowData & RowDataDefault, $el: HTMLElement | DocumentFragment, rowInfo: { index: number }) {
    if (row.__visible !== false) {
      this.initRowCells(row);
      // if (!row.__el) {
      //   row.__el = document.createElement('tr');
      // }
      // if (!row.__cells) {
      //   row.__cells = this.config.columns.map(function () {
      //     var cell = {
      //       el: document.createElement('td'),
      //       value: 0,
      //     };
      //     row.__el.appendChild(cell.el);
      //     return cell;
      //   });
      // }

      let haystack: any[] = [];
      let info = {
        index: rowInfo.index,
        prevRow: rowInfo.index === 0 ? null : this.config.visibleRows[rowInfo.index--],
      };

      this.config.columns.forEach(function (header, i) {
        let cell = row.__cells[i];
        if (header.__visible !== false) {
          cell.value = header.cellRenderer(row, header, info);
          cell.el.innerHTML = String(cell.value) === '' ? '&nbsp;' : `${cell.value}`;
          haystack.push(cell.value);

          if (header.cellClassName) {
            let cls = header.cellClassName(row, header);
            if (cls) {
              cell.el.className = cls;
            }
          }
          Object.assign(cell.el.style, header.style || {});
          cell.el.style.display = '';
        } else {
          cell.el.style.display = 'none';
        }
      });
      row.__haystack = haystack.join(' ').toLowerCase();
      if ($el) $el.appendChild(row.__el);
    }
  }

  initRowCells(row: RowData & RowDataDefault) {
    if (!row.__el) {
      row.__el = document.createElement('tr');
    }
    if (!row.__cells) {
      row.__cells = this.config.columns.map(function () {
        var cell = {
          el: document.createElement('td'),
          value: 0,
        };
        row.__el.appendChild(cell.el);
        return cell;
      });
    }
  }

  renderCell(row: RowData & RowDataDefault, col: TableColumn<RowData>) {
    this.initRowCells(row);
    console.log('renderCell')

    var cell = row.__cells[col.__index];
    if (col.__visible !== false) {
      cell.value = col.cellRenderer(row, col);
      cell.el.innerHTML = String(cell.value) === '' ? '&nbsp;' : `${cell.value}`;
      if (col.cellClassName) {
        var cls = col.cellClassName(row, col);
        if (cls) {
          cell.el.className = cls;
        }
      }
      Object.assign(cell.el.style, col.style || {});
      cell.el.style.display = '';
    } else {
      cell.el.style.display = 'none';
    }
    // this.refreshHaystack(row);
  }

  refreshHaystack(row: RowDataDefault) {
    row.__haystack = row.__cells
      .reduce((haystack: string[], cell: TableCell) => [...haystack, cell.value], [])
      .join(' ')
      .toLowerCase();
  }

  toggleRows(visible: boolean) {
    let i = this.config.rows.length;
    while (i--) {
      this.config.rows[i].__visible = visible;
    }
  }

  filterRows(query: FilterQuery) {
    var test: (row: any) => boolean;
    if (typeof query === 'function') {
      test = query as (row: any) => boolean;
    } else {
      if (!query) {
        query = {};
      }

      if (typeof query === 'string') {
        try {
          try {
            query = eval(query);
          } catch (e) {
            query = JSON.parse(query as string);
          }
        } catch (e) {}
      }

      if (typeof query === 'string' || typeof query === 'number') {
        query = { __haystack: { LIKE: query } };
      }

      test = ObjectFilter.filterToFunction(query);
    }

    this.updateVisibleRows(test);
    this.updatePagination({ total: this.config.visibleRows.length, offset: 0 });
    this.resort();
  }

  toCSV() {
    var tmpConfig: any = { columns: [] };

    tmpConfig.columns = this.config.columns.map((col) => {
      return {
        key: col.__index,
        label: col.label || col.key,
      };
    });

    tmpConfig.rows = [];
    var i = 0;
    var row;
    while (i < this.config.visibleRows.length) {
      row = this.config.visibleRows[i];
      row.__index = i;
      this.renderRow(row, null, { index: i });
      tmpConfig.rows.push(row.__cells.map((cell) => cell.value));
      i++;
    }

    return Table.ObjToCSV(tmpConfig);
  }

  updateColumn(query: FilterQuery, delta: Record<string, any>) {
    var result = ObjectFilter.get(this.config.columns, query).map((col: any) => Object.assign(col, delta));
    this.render();
    return result;
  }

  static CSVtoObj = (csvStr: string) => {
    var rowsIn = CSVToArray(csvStr);
    var columns = rowsIn[0].map(function (col) {
      return { key: col };
    });
    var rowsOut = rowsIn.slice(1).map(function (row) {
      var o: Record<string, any> = {};
      row.map(function (cell, i) {
        o[columns[i].key] = cell;
      });
      return o;
    });
    return { columns: columns, rows: rowsOut };
  };

  static ObjToCSV = (obj: TableConfig<any>) => {
    var val;
    var arr = [];
    var cols = obj.columns.filter(function (col) {
      return col.key;
    });
    arr.push(
      cols.map(function (col) {
        return col.label || (String(col.key).indexOf(',') > -1 ? '"' + col.key + '"' : col.key);
      })
    );
    arr = arr.concat(
      obj.rows.map(function (row) {
        return cols.map(function (col) {
          val = row[col.key];
          try {
            if (String(val).indexOf(',') > -1) {
              val = '"' + val + '"';
            }
            if (String(val).indexOf('+') === 0) {
              val = ' ' + val;
            }
          } catch (err) {
            console.warn('val', val);
          }
          return val;
        });
      })
    );
    return arr.join('\n');
  };
}
