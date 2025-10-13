import type { ColumnDef } from '@tanstack/react-table';

export interface SessionsType {
  instructorName: string;
  category: string;
  date: string;
  notification: string;
}

export const SessionColumns: ColumnDef<SessionsType>[] = [
  {
    accessorKey: 'instructorName',
    header: 'Instructor Name',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      return <p className="text-[#9B9B9B]">{row.original.date}</p>;
    },
  },
  {
    accessorKey: 'notification',
    header: 'Notification',
  },
];
