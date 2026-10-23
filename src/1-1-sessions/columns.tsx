import type { ColumnDef } from '@tanstack/react-table';
import { formatMoney } from '@/lib/utils';

export interface SessionsType {
  id: number;
  status: string;
  startsAt: string;
  endsAt: string;
  sessionType: { name: string; durationMinutes: number } | null;
  student: { name: string; email?: string } | null;
  instructor: { name: string; email?: string } | null;
  price: { amount: number; currency: string; provider: string };
  meetingUrl: string | null;
  review: { rating: number; comment: string | null } | null;
}

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: 'bg-[#FFF4D6] text-[#8A6100]',
  ACCEPTED: 'bg-[#E8F0FF] text-[#2453A6]',
  CONFIRMED: 'bg-[#D0EA50] text-[#00230F]',
  COMPLETED: 'bg-[#305B43] text-white',
};
const STATUS_LABEL: Record<string, string> = {
  REQUESTED: 'Awaiting instructor',
  ACCEPTED: 'Awaiting payment',
  CONFIRMED: 'Upcoming',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export const SessionColumns: ColumnDef<SessionsType>[] = [
  { id: 'instructor', header: 'Instructor', cell: ({ row }) => row.original.instructor?.name ?? '—' },
  { id: 'student', header: 'Student', cell: ({ row }) => row.original.student?.name ?? '—' },
  { id: 'type', header: 'Session', cell: ({ row }) => row.original.sessionType?.name ?? '—' },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => <p className="text-[#9B9B9B]">{fmtDate(row.original.startsAt)}</p>,
  },
  { id: 'price', header: 'Price', cell: ({ row }) => formatMoney(row.original.price.amount, row.original.price.currency) },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span className={`rounded px-2 py-1 ${STATUS_STYLE[row.original.status] ?? 'bg-[#EDEDED] text-[#737373]'}`}>
        {STATUS_LABEL[row.original.status] ?? row.original.status}
      </span>
    ),
  },
  {
    id: 'rating',
    header: 'Rating',
    cell: ({ row }) => (row.original.review ? `${'★'.repeat(row.original.review.rating)}` : '—'),
  },
];
