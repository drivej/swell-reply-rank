export interface IFastTableConfig<CustomData> {
  tableClassName?: string;
  wheelScroll?: boolean;
  rows: CustomData[];
  columns: IFastColumnConfig<CustomData>[];
  itemsPerPage?: number;
  onClickRow?(row: IFastRow<CustomData>): void;
}

export interface IFastColumnConfig<CustomData> {
  key: string;
  label?: string;
  style?: CSSStyleDeclaration;
  visible?: boolean;
  cellClassName?(row: IFastRow<CustomData>, col: IFastColumnConfig<CustomData>): string;
  headClassName?(col: IFastColumnConfig<CustomData>): string;
  cellTitleRenderer?(row: IFastRow<CustomData>, col?: IFastColumnConfig<CustomData>): string;
  cellRenderer?(row: IFastRow<CustomData>, col?: IFastColumnConfig<CustomData>): string | number;
  sortRenderer?(row: IFastRow<CustomData>, col?: IFastColumnConfig<CustomData>): string | number;
}

export interface IFastColumnPrivate {
  __el?: HTMLTableCellElement;
  __index?: number;
  __sortDirection: number;
}

export type IFastRow<CustomData> = IFastRowPrivate & CustomData;
export type IFastColumn<CustomData> = IFastColumnConfig<CustomData> & IFastColumnPrivate;

export interface IFastRowPrivate {
  __el?: HTMLTableRowElement;
  __displayRendered: boolean;
  __cellsRendered: boolean;
  __visible: boolean;
  __cells: IFastCell[];
  __haystack: string;
}

export interface IFastCell {
  key: string;
  __el?: HTMLTableCellElement;
  displayValue?: string | number;
  sortValue?: string | number;
  displayRendered: boolean;
  sortRendered: boolean;
}
