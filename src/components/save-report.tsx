import ExportIcon from '@/assets/jsx-icons/export-icon';
import { cn } from '@/lib/utils';

type Cell = string | number | null | undefined;

/** Downloads rows as a CSV file (opens in Excel, Numbers or Google Sheets). */
export function downloadCsv(filename: string, rows: Cell[][]) {
  const esc = (v: Cell) => {
    const s = v == null ? '' : String(v);
    // Stop spreadsheet apps treating text as a formula.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const csv = rows.map(r => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const SaveReport = ({ filename, rows, className, disabled }: { filename: string; rows: () => Cell[][]; className?: string; disabled?: boolean }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => downloadCsv(filename, rows())}
    className={cn(
      'flex h-8 cursor-pointer items-center gap-2 rounded-md border border-[#D9D9D9] bg-white px-3 text-[10px] font-semibold text-[#6F6F6F] transition-colors hover:border-[#305B43] hover:text-[#305B43] disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >
    <ExportIcon />
    Save Report
  </button>
);

export default SaveReport;
