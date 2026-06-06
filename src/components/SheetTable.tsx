'use client';

import { useState, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type ColumnResizeMode,
} from '@tanstack/react-table';
import type { SheetColumn, SheetRow } from '@/lib/supabase';
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Video,
  Music,
  FileText,
  Calendar,
  Rows3,
} from 'lucide-react';

/** Props accepted by the SheetTable component */
interface SheetTableProps {
  columns: SheetColumn[];
  rows: SheetRow[];
  layoutType?: string;
}

/** Available page size options the user can pick from */
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250] as const;

/** Default number of rows per page */
const DEFAULT_PAGE_SIZE = 25;

/** Map detected column type → approximate min-width in px */
const COLUMN_TYPE_WIDTHS: Record<string, number> = {
  image: 80,
  video: 100,
  audio: 100,
  document: 100,
  external_link: 180,
  currency: 120,
  percentage: 100,
  date: 140,
  number: 100,
  text: 160,
};

/**
 * Renders a single cell value based on its detected type.
 * Returns a styled React node appropriate to the data kind.
 */
function renderCell(value: unknown, type: string) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400">—</span>;
  }
  const str = String(value);

  switch (type) {
    case 'image':
      return str.match(/^https?:\/\//) ? (
        <img
          src={str}
          alt=""
          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
          loading="lazy"
        />
      ) : (
        <span className="text-slate-400">—</span>
      );

    case 'video':
      return (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Video className="w-4 h-4 shrink-0" />
          <a href={str} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate max-w-[140px]">
            Watch
          </a>
        </div>
      );

    case 'audio':
      return (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Music className="w-4 h-4 shrink-0" />
          <a href={str} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
            Play
          </a>
        </div>
      );

    case 'document':
      return (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <FileText className="w-4 h-4 shrink-0" />
          <a href={str} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
            Open
          </a>
        </div>
      );

    case 'external_link':
      return (
        <a
          href={str}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1 truncate max-w-[200px]"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{str.length > 35 ? str.slice(0, 35) + '…' : str}</span>
        </a>
      );

    case 'currency':
      return <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{str}</span>;

    case 'percentage':
      return <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{str}</span>;

    case 'date':
      return (
        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3 h-3 shrink-0 text-slate-400" />
          {str}
        </span>
      );

    case 'number':
      return <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{str}</span>;

    default:
      return <span className="text-slate-700 dark:text-slate-300">{str}</span>;
  }
}

/**
 * SheetTable — full-featured data table with:
 * - Global search / filter
 * - Sortable columns with type-aware widths
 * - Paginated rows with a "Rows per page" dropdown
 * - Responsive overflow scrolling
 */
export default function SheetTable({ columns: sheetColumns, rows, layoutType }: SheetTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  /** TanStack Table column definitions derived from sheet column metadata */
  const tableColumns: ColumnDef<SheetRow>[] = useMemo(
    () =>
      sheetColumns.map((col) => {
        /** Compute a sensible min-width from the column type */
        const minWidth = COLUMN_TYPE_WIDTHS[col.type] ?? 160;

        return {
          accessorKey: `data.${col.name}`,
          /** Minimum width ensures columns don't collapse to unreadable sizes */
          minSize: minWidth,
          /** Default size slightly larger than min so there's breathing room */
          size: minWidth + 40,
          header: ({ column }) => (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition whitespace-nowrap"
            >
              {col.name}
              <ArrowUpDown className="w-3 h-3 shrink-0" />
            </button>
          ),
          cell: ({ row }) => {
            const value = row.original.data[col.name];
            return renderCell(value, col.type);
          },
        };
      }),
    [sheetColumns],
  );

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: DEFAULT_PAGE_SIZE, pageIndex: 0 },
    },
    /** Enable column resizing */
    columnResizeMode: 'onChange' as ColumnResizeMode,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();
  const rowStart = pageIndex * pageSize + 1;
  const rowEnd = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-4">
      {/* ── Toolbar: search + rows-per-page ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Global search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns…"
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm"
          />
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <Rows3 className="w-4 h-4 text-slate-400" />
          <label htmlFor="rows-per-page" className="text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
            Rows per page
          </label>
          <select
            id="rows-per-page"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table container ── */}
      <div className="overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <table
          className="w-full text-left border-collapse"
          style={{ tableLayout: 'fixed' }}
        >
          {/* Head */}
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ width: h.getSize(), minWidth: h.column.columnDef.minSize }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/50 overflow-hidden text-ellipsis"
                      style={{ width: cell.column.getSize(), minWidth: cell.column.columnDef.minSize }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={sheetColumns.length}
                  className="py-20 text-center"
                >
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No matching data found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        {/* Row count summary */}
        <p>
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{rowStart}–{rowEnd}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{totalRows}</span> rows
        </p>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page indicator */}
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 min-w-[80px] text-center">
            {pageIndex + 1} / {totalPages || 1}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
