import { useEffect, useState } from 'react';
import { useFiles } from '@/hooks/use-files';
import { FileInfo, SearchResult } from '@/lib/api-service';

export function FileManager() {
  const {
    files,
    isLoading,
    error,
    searchResults,
    loadFiles,
    uploadFile,
    deleteFile,
    searchFiles,
    clearSearchResults
  } = useFiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load files when component mounts
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadFile(file);
        // Clear the input
        event.target.value = '';
      } catch (err) {
        console.error('Failed to upload file:', err);
      }
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        await searchFiles(searchQuery);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Failed to search files:', err);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render file list
  const renderFileList = (files: FileInfo[]) => (
    <div className="grid gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{file.id}</h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {file.content_type}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              View
            </a>
            <button
              onClick={() => handleDeleteFile(file.id)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Render search results
  const renderSearchResults = (results: SearchResult[]) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Search Results</h2>
        <button
          onClick={() => {
            setShowSearchResults(false);
            clearSearchResults();
          }}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear Results
        </button>
      </div>
      {results.map((result, index) => (
        <div
          key={`search-result-${index}`}
          className="p-4 bg-white rounded-lg shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-900">
              Search Result
            </h3>
          </div>
          <p className="text-sm text-gray-600">{result.content}</p>
          {result.file_references && result.file_references.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              <p>Referenced files: {result.file_references.join(', ')}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">File Manager</h1>
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          Upload File
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error.message}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {showSearchResults ? (
            renderSearchResults(searchResults)
          ) : (
            <>
              <h2 className="text-lg font-semibold">Your Files</h2>
              {files.length === 0 ? (
                <p className="text-gray-500">No files uploaded yet.</p>
              ) : (
                renderFileList(files)
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 