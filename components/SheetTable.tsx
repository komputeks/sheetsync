'use client';

import { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender, type SortingState, type ColumnDef } from '@tanstack/react-table';
import type { SheetColumn, SheetRow } from '@/lib/supabase';
import { ArrowUpDown, Search, ChevronLeft, ChevronRight, Image, FileText, Music, Video, ExternalLink, Calendar, DollarSign, Percent } from 'lucide-react';

interface SheetTableProps {
  columns: SheetColumn[];
  rows: SheetRow[];
  layoutType?: string;
}

function renderCell(value: any, type: string) {
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>;
  const str = String(value);

  switch (type) {
    case 'image':
      return str.match(/^https?:\/\//) ? (
        <img src={str} alt="" className="w-12 h-12 object-cover rounded-lg" loading="lazy" />
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
          <ExternalLink className="w-3 h-3" /> Link
        </a>
      );
    case 'currency':
      return <span className="font-mono text-emerald-600 dark:text-emerald-400">{str}</span>;
    case 'percentage':
      const pct = parseFloat(str.replace('%', ''));
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
          </div>
          <span className="text-sm">{str}</span>
        </div>
      );
    case 'date':
      return (
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
          <Calendar className="w-3 h-3" />
          {new Date(str).toLocaleDateString()}
        </span>
      );
    case 'number':
      return <span className="font-mono text-slate-700 dark:text-slate-300">{str}</span>;
    default:
      return <span className="text-slate-700 dark:text-slate-300 text-sm">{str}</span>;
  }
}

export default function SheetTable({ columns, rows, layoutType = 'table' }: SheetTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 25;

  const tableColumns = useMemo<ColumnDef<any>[]>(() => {
    return columns.map(col => ({
      accessorKey: col.name,
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
          {col.name}
          <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => renderCell(getValue(), col.type),
    }));
  }, [columns]);

  const tableData = useMemo(() => {
    return rows.map(r => r.data);
  }, [rows]);

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: { sorting, globalFilter, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const pageCount = Math.ceil(table.getFilteredRowModel().rows.length / pageSize);
  const currentRows = table.getRowModel().rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  if (layoutType === 'cards') {
    const imageCol = columns.find(c => c.type === 'image');
    const titleCol = columns.find(c => c.name.toLowerCase().includes('name') || c.name.toLowerCase().includes('title'));
    const priceCol = columns.find(c => c.type === 'currency' || c.name.toLowerCase().includes('price'));

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentRows.map((row, idx) => {
            const data = row.original;
            return (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition">
                {imageCol && data[imageCol.name] && (
                  <img src={data[imageCol.name]} alt="" className="w-full h-40 object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  {titleCol && <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{data[titleCol.name]}</h3>}
                  {priceCol && <p className="text-emerald-600 dark:text-emerald-400 font-bold">{data[priceCol.name]}</p>}
                  <div className="mt-3 space-y-1">
                    {columns.filter(c => c !== imageCol && c !== titleCol && c !== priceCol).map(col => (
                      <div key={col.name} className="flex justify-between text-sm">
                        <span className="text-slate-500">{col.name}</span>
                        <span className="text-slate-700 dark:text-slate-300">{renderCell(data[col.name], col.type)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-4">
          <button onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Page {pageIndex + 1} of {pageCount}</span>
          <button onClick={() => setPageIndex(p => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Search all columns..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {currentRows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-sm">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-sm text-slate-600 dark:text-slate-400">Page {pageIndex + 1} of {pageCount} ({table.getFilteredRowModel().rows.length} rows)</span>
        <button onClick={() => setPageIndex(p => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-sm">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
