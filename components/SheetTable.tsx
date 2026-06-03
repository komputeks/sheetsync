'use client';

import { useState, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { SheetColumn, SheetRow } from '@/lib/supabase';
import { ArrowUpDown, Search, ChevronLeft, ChevronRight, Image as ImageIcon, FileText, Music, Video, ExternalLink, Calendar, DollarSign, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetTableProps {
  columns: SheetColumn[];
  rows: SheetRow[];
  layoutType?: string;
}

function renderCell(value: any, type: string) {
  if (value === null || value === undefined || value === '') return <span className="text-slate-400">—</span>;
  const str = String(value);

  switch (type) {
    case 'image':
      return str.match(/^https?:\/\//) ? (
        <div className="relative group">
          <img src={str} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform cursor-pointer" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none rounded-lg" />
        </div>
      ) : <span className="text-slate-400">—</span>;
    case 'video':
      return (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Video className="w-4 h-4" />
          <a href={str} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate max-w-[150px]">Watch</a>
        </div>
      );
    case 'audio':
      return (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Music className="w-4 h-4" />
          <a href={str} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">Play</a>
        </div>
      );
    case 'document':
      return (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <FileText className="w-4 h-4" />
          <a href={str} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">Open</a>
        </div>
      );
    case 'external_link':
      return (
        <a href={str} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          <ExternalLink className="w-3 h-3" /> {str.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
        </a>
      );
    case 'currency':
      return <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{str}</span>;
    case 'percentage':
      const pct = parseFloat(str.replace('%', ''));
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
          </div>
          <span className="text-sm font-mono">{str}</span>
        </div>
      );
    case 'date':
      try {
        return (
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
            <Calendar className="w-3 h-3" />
            {new Date(str).toLocaleDateString()}
          </span>
        );
      } catch { return str; }
    case 'number':
      return <span className="font-mono text-slate-700 dark:text-slate-300">{str}</span>;
    default:
      return <span className="text-slate-700 dark:text-slate-300 text-sm">{str}</span>;
  }
}

export default function SheetTable({ columns, rows, layoutType = 'table' }: SheetTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const tableColumns = useMemo<ColumnDef<any>[]>(() => {
    return columns.map(col => ({
      accessorKey: col.name,
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer select-none py-1 group"
          onClick={() => column.toggleSorting()}
        >
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
            {col.name}
          </span>
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ),
      cell: ({ getValue }) => renderCell(getValue(), col.type),
    }));
  }, [columns]);

  const tableData = useMemo(() => rows.map(r => r.data), [rows]);

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const { rows: tableRows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  return (
    <div className="space-y-4">
      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search all columns..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition shadow-sm"
        />
      </div>

      <div
        ref={parentRef}
        className="h-[600px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
      >
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur sticky top-0 z-10">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = tableRows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-2 border-b border-slate-100 dark:border-slate-800/50 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {tableRows.length === 0 && (
          <div className="py-20 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No matching data found</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span>Showing {tableRows.length} total rows</span>
        <div className="flex gap-4">
          <span>Sort by clicking column headers</span>
          <span>Scroll for more rows</span>
        </div>
      </div>
    </div>
  );
}
