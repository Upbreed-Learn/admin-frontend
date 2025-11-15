import { SearchInput } from '@/components/ui/custom/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TransactionHistoryType } from '@/lib/constants';
import { formatTrxnDate } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useEffect, useState, type ChangeEvent } from 'react';
import {
  HistoryCardSkeleton,
  HistoryListError,
  useGetTransactionHistory,
} from '.';
import PaginationSection from '@/components/ui/custom/pagination';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { QUERIES } from '@/queries';
import EmptyState from '@/components/empty';

const useGetSearchedTransactionHistory = (
  page?: number,
  limit?: number,
  search?: string,
) => {
  return useQuery({
    queryKey: ['transactionHistory', { page, limit, search }],
    queryFn: () => QUERIES.getTransactionHistory(page, limit, search),
    enabled: !!search && search !== '',
  });
};

const MoreTransactionHistoryModal = () => {
  const [page, setPage] = useState(1);
  const [viewMore, setViewMore] = useQueryState('viewMore');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 1000);
  const [activeList, setActiveList] = useState<TransactionHistoryType[]>([]);
  const { data, isPending, isError } = useGetTransactionHistory(page, 8);
  const {
    data: searchedTransactionHistoryData,
    isPending: isSearching,
    isError: isSearchError,
  } = useGetSearchedTransactionHistory(page, undefined, debouncedSearch);

  console.log(searchedTransactionHistoryData?.data.metadata.lastPage);

  const transactionHistory: TransactionHistoryType[] = data?.data.data;
  const searchedTransactionHistory: TransactionHistoryType[] =
    searchedTransactionHistoryData?.data?.data;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      setActiveList(searchedTransactionHistory);
    } else {
      setActiveList(transactionHistory);
    }
  }, [debouncedSearch, transactionHistory, searchedTransactionHistory]);

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
            <SearchInput onChange={e => handleChange(e)} />
            <Upload />
          </div>
        </div>
        <div className="h-full max-h-[calc(32.875rem-5rem)] overflow-auto">
          {isError || (search !== '' && isSearchError) ? (
            <HistoryListError />
          ) : isPending || (search !== '' && isSearching) ? (
            <div className="flex flex-col gap-[1.125rem]">
              {Array(7)
                .fill(null)
                .map((_, i) => (
                  <HistoryCardSkeleton key={i} />
                ))}
            </div>
          ) : (
            <div className="flex flex-col gap-[1.125rem]">
              {activeList?.length === 0 ? (
                <EmptyState
                  title={`No transactions found.`}
                  description={'You have not made any transactions yet.'}
                  removeCTA
                />
              ) : (
                activeList?.map(history => (
                  <HistoryCard key={history.transactionDate} {...history} />
                ))
              )}
              {data && (
                <PaginationSection
                  currentPage={page}
                  setCurrentPage={setPage}
                  totalPages={
                    search === ''
                      ? data?.data.metadata.lastPage
                      : searchedTransactionHistoryData?.data?.metadata.lastPage
                  }
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoreTransactionHistoryModal;

const HistoryCard = (props: TransactionHistoryType) => {
  const [currency, _] = useQueryState('currency', {
    defaultValue: 'NGN',
  });

  return (
    <div className="flex justify-between border-b border-[#00000026] pb-0.5">
      <div>
        <p className="text-[13.7px]/[100%] font-medium">{props.userName}</p>
        <p className="text-[11.41px]/[100%] font-medium text-[#9B9B9B]">
          {formatTrxnDate(props.transactionDate)}
        </p>
      </div>
      <p className="text-xs/[100%] font-medium">{props.paymentGateway}</p>
      <p className="text-xs/[100%] font-medium">
        {currency === 'NGN' ? `₦${props.amount.naira}` : `$${props.amount.usd}`}
      </p>
    </div>
  );
};
