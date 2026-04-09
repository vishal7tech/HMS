export interface PaginationParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SearchParams extends PaginationParams {
  keyword?: string;
  filters?: Record<string, any>;
}

export class ApiUtils {
  static buildPaginationParams(params: Partial<PaginationParams>): PaginationParams {
    return {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'id',
      sortDirection: params.sortDirection || 'desc',
    };
  }

  static buildSearchParams(params: Partial<SearchParams>): SearchParams {
    return {
      ...this.buildPaginationParams(params),
      keyword: params.keyword,
      filters: params.filters,
    };
  }

  static buildQueryParams(params: SearchParams): string {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', params.page.toString());
    queryParams.append('size', params.size.toString());
    
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    
    if (params.sortDirection) {
      queryParams.append('sortDir', params.sortDirection);
    }
    
    if (params.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return queryParams.toString();
  }

  static async fetchWithPagination<T>(
    url: string,
    params: SearchParams,
    token: string
  ): Promise<PaginatedResponse<T>> {
    const queryString = this.buildQueryParams(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static createDebouncedSearch(delay: number = 300) {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return function<T extends (...args: any[]) => void>(
      callback: T,
      ...args: Parameters<T>
    ) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'SCHEDULED': 'blue',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
      'NO_SHOW': 'orange',
      'PENDING': 'yellow',
      'PAID': 'green',
      'UNPAID': 'red',
    };
    return colors[status.toUpperCase()] || 'gray';
  }

  static getStatusBadgeClass(status: string): string {
    const statusUpper = status.toUpperCase();
    const classMap: Record<string, string> = {
      'SCHEDULED': 'bg-blue-100 text-blue-800 border-blue-200',
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
      'NO_SHOW': 'bg-orange-100 text-orange-800 border-orange-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PAID': 'bg-green-100 text-green-800 border-green-200',
      'UNPAID': 'bg-red-100 text-red-800 border-red-200',
    };
    return classMap[statusUpper] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
