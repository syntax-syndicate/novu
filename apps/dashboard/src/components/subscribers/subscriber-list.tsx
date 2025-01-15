import { CursorPagination } from '@/components/cursor-pagination';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { SubscriberListEmpty } from '@/components/subscribers/subscriber-list-empty';
import { SubscriberRow, SubscriberRowSkeleton } from '@/components/subscribers/subscriber-row';
import { defaultSubscribersFilters, SubscribersFilters } from '@/components/subscribers/subscribers-filters';
import { useFetchSubscribers } from '@/hooks/use-fetch-subscribers';
import { useSubscribersUrlState } from '@/hooks/use-subscribers-url-state';
import { cn } from '@/utils/ui';
import { HTMLAttributes, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type SubscriberListProps = HTMLAttributes<HTMLDivElement>;

export const SubscriberList = (props: SubscriberListProps) => {
  const { className, ...rest } = props;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cursorHistory, setCursorHistory] = useState<string[]>(['']);

  const { filterValues, handleFiltersChange } = useSubscribersUrlState();
  const query = searchParams.get('query') || '';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const name = searchParams.get('name') || '';
  const subscriberId = searchParams.get('subscriberId') || '';
  const limit = parseInt(searchParams.get('limit') || '10');
  const currentCursor = searchParams.get('cursor') || '';

  const currentIndex = cursorHistory.indexOf(currentCursor);

  const { data, isPending, isError } = useFetchSubscribers({
    cursor: currentCursor,
    limit,
    query,
    email,
    phone,
    subscriberId,
    name,
  });

  const handleNext = () => {
    if (!data?.nextCursor) return;

    const newParams = new URLSearchParams(searchParams);
    newParams.set('cursor', data.nextCursor);

    // Use replace instead of navigate to avoid history stack issues
    navigate(`${location.pathname}?${newParams}`, { replace: true });

    if (data.nextCursor && !cursorHistory.includes(data.nextCursor)) {
      setCursorHistory((prev) => [...prev, data.nextCursor!]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex <= 0) return;
    const previousCursor = cursorHistory[currentIndex - 1];
    const newParams = new URLSearchParams(searchParams);

    if (previousCursor === '') {
      newParams.delete('cursor');
    } else {
      newParams.set('cursor', previousCursor);
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true });
  };

  const handleFirst = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('cursor');
    navigate(`${location.pathname}?${newParams}`, { replace: true });
  };

  const handleClearFilters = () => {
    handleFiltersChange(defaultSubscribersFilters);
  };

  if (isError) return null;

  return (
    <div className={cn('flex h-full flex-col', className)} {...rest}>
      <SubscribersFilters
        onFiltersChange={handleFiltersChange}
        initialValues={filterValues}
        onReset={handleClearFilters}
        className="py-2"
      />
      {!isPending && data?.subscribers.length === 0 ? (
        <SubscriberListEmpty />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscriber</TableHead>
              <TableHead>Email address</TableHead>
              <TableHead>Phone number</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Updated at</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <>
                {new Array(limit).fill(0).map((_, index) => (
                  <SubscriberRowSkeleton key={index} />
                ))}
              </>
            ) : (
              <>
                {data.subscribers.map((subscriber) => (
                  <SubscriberRow key={subscriber.subscriberId} subscriber={subscriber} />
                ))}
              </>
            )}
          </TableBody>
        </Table>
      )}
      {data && (
        <CursorPagination
          hasNext={Boolean(data.nextCursor)}
          hasPrevious={currentIndex > 0}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onFirst={handleFirst}
        />
      )}
    </div>
  );
};
