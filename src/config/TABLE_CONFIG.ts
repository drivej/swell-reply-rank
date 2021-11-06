import { IFastTableConfig } from '../components/FastTable/IFastTable';
import { CustomRowData } from '../interface/IApp';
import { formatDuration } from '../utils/formatDuration';
import { timeago } from '../utils/timeago';

export const TABLE_CONFIG: IFastTableConfig<CustomRowData> = {
  tableClassName: 'table',
  rows: [],
  itemsPerPage: 16,
  // onClickRow: this.onClickRow.bind(this),
  wheelScroll: true,

  columns: [
    {
      key: 'index',
      sortRenderer: (row) => row.index,
    },
    {
      key: 'title',
      headClassName: (col) => 'text-nowrap w-100',
      cellClassName: () => 'nowrap',
      cellTitleRenderer: (row, col) => row.id,
      cellRenderer: (row) => `<span>${row.title}</span>`,
    },
    {
      key: 'age',
      cellClassName: () => 'text-nowrap',
      cellRenderer: (row) => timeago(row.created) + `&nbsp;(${(row.totalAgePercent * 100).toFixed(0)}%)`,
    },
    {
      label: 'duration',
      key: 'duration',
      headClassName: (col) => 'text-nowrap',
      cellClassName: () => 'text-end',
      cellRenderer: (row) => formatDuration(row.duration) + `&nbsp;(${(row.durationPercent * 100).toFixed(0)}%)`,
    },
    {
      label: 'Sec. Listened',
      key: 'secondsListened',
      headClassName: (col) => 'text-nowrap',
      cellClassName: () => 'text-end',
      cellRenderer: (row) => formatDuration(row.secondsListened) + `&nbsp;(${(row.secondsListenedPercent * 100).toFixed(0)}%)`,
    },
    {
      label: '% Listened',
      key: 'percentListened',
      headClassName: (col) => 'text-nowrap',
      cellClassName: () => 'text-end',
      cellRenderer: (row) => (row.percentListened * 100).toFixed(0) + '%',
    },
    {
      label: 'total listens',
      key: 'totalListens',
      headClassName: (col) => 'text-nowrap',
      cellClassName: () => 'text-end text-nowrap',
      cellRenderer: (row) => row.totalListens + `&nbsp;(${(row.totalListensPercent * 100).toFixed(0)}%)`,
    },

    {
      label: 'rating',
      key: 'rating',
      headClassName: (col) => 'text-nowrap',
      cellClassName: () => 'text-end bg-secondary text-white',
      cellRenderer: (row) => row.rating.toFixed(2),
    },
    {
      label: 'graph',
      key: 'graph',
      headClassName: (col) => 'text-nowrap',
      sortRenderer: (row) => 1,
      cellRenderer: (row) => `
      <div class="vis-bar">
          <div class="vis-duration" style="width:${row.durationPercent * 100}%">
            <div class="vis-position" style="left:${row.percentListened * 100}%"></div>
          </div>
      </div>
      <div class="vis-listensLength" style="width:${row.totalListensPercent * 100}%;" />`,
    },
  ],
};
