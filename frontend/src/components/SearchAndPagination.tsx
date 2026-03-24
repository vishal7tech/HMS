import React, { useState, useEffect } from 'react';
import type { SearchParams, PaginatedResponse } from '../utils/apiUtils';
import { ApiUtils } from '../utils/apiUtils';

interface SearchAndPaginationProps<T> {
  fetchData: (params: SearchParams) => Promise<PaginatedResponse<T>>;
  initialParams?: Partial<SearchParams>;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  children: (data: PaginatedResponse<T>, refresh: () => void) => React.ReactNode;
}

export function SearchAndPagination<T>({
  fetchData,
  initialParams = {},
  searchPlaceholder = "Search...",
  filters,
  children,
}: SearchAndPaginationProps<T>) {
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SearchParams>(
    ApiUtils.buildPaginationParams(initialParams)
  );

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params]);

  const handleSearch = (keyword: string) => {
    setParams(prev => ({ ...prev, keyword, page: 0 }));
  };

  const handleFilter = (filters: Record<string, any>) => {
    setParams(prev => ({ ...prev, filters, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setParams(prev => ({ ...prev, page }));
  };

  const handleSort = (sortBy: string, sortDirection?: 'asc' | 'desc') => {
    setParams(prev => ({
      ...prev,
      sortBy,
      sortDirection: sortDirection || (prev.sortDirection === 'asc' ? 'desc' : 'asc'),
    }));
  };

  const debouncedSearch = ApiUtils.createDebouncedSearch();

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => debouncedSearch(handleSearch, e.target.value)}
            />
          </div>

          {/* Filters */}
          {filters && (
            <div className="flex flex-wrap gap-2 items-center">
              {filters}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading Display */}
      {loading && !data && (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      )}

      {/* Data Display */}
      {!loading && data && children(data, loadData)}

      {/* Pagination */}
      {!loading && data && data.totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing {data.number * data.size + 1} to{' '}
              {Math.min((data.number + 1) * data.size, data.totalElements)} of{' '}
              {data.totalElements} results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(0)}
                disabled={data.first}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(data.number - 1)}
                disabled={data.first}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  let pageNum;
                  if (data.totalPages <= 5) {
                    pageNum = i;
                  } else if (data.number < 3) {
                    pageNum = i;
                  } else if (data.number >= data.totalPages - 3) {
                    pageNum = data.totalPages - 4 + i;
                  } else {
                    pageNum = data.number - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded-md ${
                        pageNum === data.number
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(data.number + 1)}
                disabled={data.last}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(data.totalPages - 1)}
                disabled={data.last}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAndPagination;
