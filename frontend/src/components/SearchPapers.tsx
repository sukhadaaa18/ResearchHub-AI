import React, { useState, useEffect } from 'react';
import { papers, workspaces } from '../api';

interface Paper {
  title: string;
  authors: string;
  abstract: string;
  date: string;
  url: string;
}

interface Workspace {
  id: number;
  name: string;
}

interface SearchPapersProps {
  workspaceId: number | null;
}

const SearchPapers: React.FC<SearchPapersProps> = ({ workspaceId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [selectedWorkspaceForImport, setSelectedWorkspaceForImport] = useState<number | null>(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [paperToImport, setPaperToImport] = useState<Paper | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await workspaces.getAll();
      setWorkspaceList(response.data);
    } catch (err) {
      console.error('Failed to load workspaces', err);
    }
  };

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const response = await papers.search(query);

      if (response.data && Array.isArray(response.data)) {
        setResults(response.data);
        if (response.data.length === 0) {
          setError('No papers found. Try different keywords.');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Search failed', err);
      setError(err.response?.data?.detail || 'Search failed. Please try again.');
    }
    setLoading(false);
  };

  const handleImportClick = (paper: Paper) => {
    if (workspaceList.length === 0) {
      alert('Please create a workspace first!');
      return;
    }
    if (workspaceList.length === 1) {
      handleImport(paper, workspaceList[0].id);
    } else {
      setPaperToImport(paper);
      setSelectedWorkspaceForImport(workspaceId || workspaceList[0].id);
      setShowWorkspaceModal(true);
    }
  };

  const handleImport = async (paper: Paper, targetWorkspaceId: number) => {
    try {
      await papers.import(paper, targetWorkspaceId);
      alert('Paper imported successfully!');
      setShowWorkspaceModal(false);
      setPaperToImport(null);
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to import paper. Please try again.');
    }
  };

  const confirmImport = () => {
    if (paperToImport && selectedWorkspaceForImport) {
      handleImport(paperToImport, selectedWorkspaceForImport);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Search Research Papers</h2>
        <p className="text-slate-600 mt-1">Search arXiv and import papers into your workspaces</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-3xl p-4 shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search papers... (e.g., 'machine learning', 'neural networks')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            className="px-8 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !query}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600"></div>
          <p className="mt-3 text-slate-600">Searching arXiv database...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && query && (
        <div className="text-center py-10 text-slate-500">
          <p>No results yet. Try searching for papers.</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((paper, idx) => (
          <div
            key={idx}
            className="border border-slate-200 p-5 rounded-3xl bg-white/90 backdrop-blur shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
          >
            <h3 className="font-bold text-lg mb-2 text-slate-900">{paper.title}</h3>

            <p className="text-sm text-slate-600 mb-2">
              <span className="font-semibold">Authors:</span> {paper.authors}
            </p>

            <p className="text-sm text-slate-500 mb-3">
              <span className="font-semibold">Published:</span> {paper.date}
            </p>

            <p className="text-sm text-slate-700 mb-4 line-clamp-3">
              {paper.abstract.substring(0, 300)}...
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleImportClick(paper)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-semibold transition-colors"
              >
                Import to Workspace
              </button>
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 text-sm font-semibold transition-colors text-center border border-slate-200"
              >
                View on arXiv
              </a>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="mt-6 text-center text-slate-600">
          Found <span className="font-semibold text-slate-900">{results.length}</span> papers
        </div>
      )}

      {/* Workspace Selection Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur rounded-3xl p-6 max-w-md w-full mx-4 border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Select Workspace</h3>
            <p className="text-slate-600 mb-4">Choose which workspace to import this paper to:</p>

            <div className="space-y-2 mb-6">
              {workspaceList.map((ws) => (
                <label
                  key={ws.id}
                  className="flex items-center p-3 border border-slate-200 rounded-2xl cursor-pointer hover:bg-blue-50/40 transition-colors"
                >
                  <input
                    type="radio"
                    name="workspace"
                    value={ws.id}
                    checked={selectedWorkspaceForImport === ws.id}
                    onChange={() => setSelectedWorkspaceForImport(ws.id)}
                    className="mr-3"
                  />
                  <span className="font-medium text-slate-900">{ws.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmImport}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setShowWorkspaceModal(false);
                  setPaperToImport(null);
                }}
                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl hover:bg-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPapers;