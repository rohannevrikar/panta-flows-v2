import { useState, useCallback } from 'react';
import { apiService, FileInfo, SearchResult } from '@/lib/api-service';

export function useFiles() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Load files
  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fileList = await apiService.listFiles();
      setFiles(fileList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load files'));
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload file
  const uploadFile = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const uploadedFile = await apiService.uploadFile(file);
      setFiles(prev => [...prev, uploadedFile]);
      return uploadedFile;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload file'));
      console.error('Error uploading file:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete file
  const deleteFile = useCallback(async (fileId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete file'));
      console.error('Error deleting file:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search files
  const searchFiles = useCallback(async (query: string, fileIds?: string[], maxResults?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Searching for:', query, 'with fileIds:', fileIds, 'and maxResults:', maxResults);
      
      // Just pass the query string to the API service
      const results = await apiService.searchFiles(query);
      setSearchResults([results]); // Wrap in array since state expects SearchResult[]
      return results;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search files'));
      console.error('Error searching files:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    files,
    isLoading,
    error,
    searchResults,
    loadFiles,
    uploadFile,
    deleteFile,
    searchFiles,
    clearSearchResults
  };
} 