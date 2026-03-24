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
    let timeoutId: NodeJS.Timeout;
    
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
    const color = this.getStatusColor(status);
    return `bg-${color}-100 text-${color}-800 border-${color}-200`;
  }
}
