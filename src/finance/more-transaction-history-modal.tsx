import { SearchInput } from '@/components/ui/custom/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useQueryState } from 'nuqs';

const MoreTransactionHistoryModal = () => {
  const [viewMore, setViewMore] = useQueryState('viewMore');

  return (
    <Dialog
      open={viewMore === 'true' ? true : false}
      onOpenChange={() => setViewMore(viewMore === 'true' ? null : 'true')}
    >
      <DialogContent className="flex flex-col gap-8">
        <DialogHeader className="sr-only">
          <DialogTitle>Transaction History</DialogTitle>
          <DialogDescription>
            View more details about the transaction history
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs font-semibold">Transaction History</p>
          <div className="flex items-center gap-11">
            <SearchInput />
            <Upload />
          </div>
        </div>
        <div className="_hide-scrollbar flex h-full max-h-[calc(32.875rem-5rem)] flex-col gap-[1.125rem] overflow-auto">
          {Array(91)
            .fill(null)
            .map((_, i) => (
              <HistoryCard key={i} />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoreTransactionHistoryModal;

const HistoryCard = () => {
  return (
    <div className="flex justify-between border-b border-[#00000026] pb-0.5">
      <div>
        <p className="text-[13.7px]/[100%] font-medium">Chinedu Asake</p>
        <p className="text-[11.41px]/[100%] font-medium text-[#9B9B9B]">
          16 - Nov - 2024
        </p>
      </div>
      <p className="text-xs/[100%] font-medium">Bank Transfer</p>
      <p className="text-xs/[100%] font-medium">$120</p>
    </div>
  );
};
