import { useState, useMemo, useEffect } from 'react';

/**
 * A hook to handle client-side pagination for an array of items.
 * @param items The full list of items (e.g., already filtered by search)
 * @param pageSize Number of items per page
 */
export function useClientPagination<T>(items: T[], pageSize: number = 10) {
  const [page, setPage] = useState(1);

  // Reset to page 1 if items change (e.g., search query changed)
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / pageSize);
  
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    pageSize,
  };
}
