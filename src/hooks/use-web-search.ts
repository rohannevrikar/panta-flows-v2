import { useState, useCallback } from 'react';
import { apiService, WebSearchResult } from '@/lib/api-service';

interface UseWebSearchOptions {
  maxResults?: number;
  refineResults?: boolean;
}

export function useWebSearch(options: UseWebSearchOptions = {}) {
  const [results, setResults] = useState<WebSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const searchResults = await apiService.webSearch({
        query,
        max_results: options.maxResults,
        refine_results: options.refineResults ?? true
      });

      // Sort by relevance score if available
      const sortedResults = [...searchResults].sort((a, b) => 
        (b.relevance_score ?? 0) - (a.relevance_score ?? 0)
      );

      setResults(sortedResults);
      return sortedResults;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options.maxResults, options.refineResults]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}