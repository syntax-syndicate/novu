import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubscribersFiltersData } from '../components/subscribers/subscribers-filters';
import { useDebounce } from '../hooks/use-debounce';

interface SubscribersFilters {
  email?: string;
  phone?: string;
  name?: string;
  subscriberId?: string;
}

export interface SubscribersUrlState {
  filters: SubscribersFilters;
  filterValues: SubscribersFiltersData;
}

function parseFilters(searchParams: URLSearchParams): SubscribersFilters {
  const result: SubscribersFilters = {};

  const email = searchParams.get('email');
  if (email) {
    result.email = email;
  }

  const phone = searchParams.get('phone');
  if (phone) {
    result.phone = phone;
  }

  const name = searchParams.get('name');
  if (name) {
    result.name = name;
  }

  const subscriberId = searchParams.get('subscriberId');
  if (subscriberId) {
    result.subscriberId = subscriberId;
  }

  return result;
}

function parseFilterValues(searchParams: URLSearchParams): SubscribersFiltersData {
  return {
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    name: searchParams.get('name') || '',
    subscriberId: searchParams.get('subscriberId') || '',
  };
}

export function useSubscribersUrlState(debounceMs: number = 300): SubscribersUrlState & {
  handleFiltersChange: (data: SubscribersFiltersData) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateSearchParams = useCallback(
    (data: SubscribersFiltersData) => {
      const newParams = new URLSearchParams(searchParams);

      if (data.email) {
        newParams.set('email', data.email);
      }
      if (data.phone) {
        newParams.set('phone', data.phone);
      }
      if (data.name) {
        newParams.set('name', data.name);
      }
      if (data.subscriberId) {
        newParams.set('subscriberId', data.subscriberId);
      }

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const debouncedUpdateParams = useDebounce(updateSearchParams, debounceMs);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const filterValues = useMemo(() => parseFilterValues(searchParams), [searchParams]);

  return {
    filters,
    filterValues,
    handleFiltersChange: debouncedUpdateParams,
  };
}
