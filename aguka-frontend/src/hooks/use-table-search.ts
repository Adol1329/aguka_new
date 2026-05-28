import { useState, useMemo } from 'react';

/**
 * A hook to perform local, multi-column search on an array of data.
 * Supports nested object access (e.g., 'user.profile.fullName').
 */
export function useTableSearch<T>(data: T[], searchFields: string[]) {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;

    const lowerQuery = query.toLowerCase().trim();

    return data.filter((item: any) => {
      return searchFields.some((field) => {
        // Handle nested fields like 'user.profile.fullName'
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        
        if (value === null || value === undefined) return false;
        
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }, [data, query, searchFields]);

  return {
    query,
    setQuery,
    filteredData,
    isEmpty: filteredData.length === 0 && query.length > 0,
    reset: () => setQuery(''),
  };
}
