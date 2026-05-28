import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/api';
import { useState, useEffect } from 'react';

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  return useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => searchApi.globalSearch(debouncedQuery).then(r => r.data),
    enabled: debouncedQuery.length >= 1,
  });
}
