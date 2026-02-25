import React, { useState, useEffect } from 'react';
import { workspaces, papers } from '../api';

interface WorkspaceProps {
  onSelectWorkspace: (id: number) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ onSelectWorkspace }) => {
  const [workspaceList, setWorkspaceList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [workspacePapers, setWorkspacePapers] = useState<any[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadPapers(selectedId);
    }
  }, [selectedId]);

  const loadWorkspaces = async () => {
    try {
      const response = await workspaces.getAll();
      setWorkspaceList(response.data);
    } catch (err) {
      console.error('Failed to load workspaces', err);
    }
  };

  const loadPapers = async (id: number) => {
    try {
      const response = await papers.getByWorkspace(id);
      setWorkspacePapers(response.data);
    } catch (err) {
      console.error('Failed to load papers', err);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspaceName) return;
    try {
      await workspaces.create(newWorkspaceName);
      setNewWorkspaceName('');
      loadWorkspaces();
    } catch (err) {
      console.error('Failed to create workspace', err);
    }
  };

  const selectWorkspace = (id: number) => {
    setSelectedId(id);
    onSelectWorkspace(id);
  };

  const openPaper = (paper: any) => {
    setSelectedPaper(paper);
    setShowPaperModal(true);
  };

  const closePaperModal = () => {
    setShowPaperModal(false);
    setSelectedPaper(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedId) return;

    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      await papers.upload(file, selectedId);
      alert('PDF uploaded successfully!');
      loadPapers(selectedId);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Failed to upload PDF', err);
      alert(err.response?.data?.detail || 'Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    if (!selectedId) {
      alert('Please select a workspace first');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">My Workspaces</h2>
        <p className="text-slate-600">Organize your research papers into different projects</p>
      </div>

      {/* Create Workspace Card */}
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Workspace</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter workspace name (e.g., 'Machine Learning Research')"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          <button
            onClick={createWorkspace}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-sm"
          >
            Create
          </button>
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {workspaceList.map((ws) => (
          <div
            key={ws.id}
            onClick={() => selectWorkspace(ws.id)}
            className={`p-6 rounded-3xl cursor-pointer transition-all transform hover:-translate-y-1 ${
              selectedId === ws.id
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl border border-white/10'
                : 'bg-white/90 backdrop-blur border border-slate-200 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  selectedId === ws.id ? 'bg-white/15 border-white/20' : 'bg-blue-50 border-slate-200'
                }`}
              >
                <svg
                  className={`w-6 h-6 ${selectedId === ws.id ? 'text-white' : 'text-blue-700'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">{ws.name}</h3>
            </div>
            <p className={`text-sm ${selectedId === ws.id ? 'text-white/90' : 'text-slate-500'}`}>
              Click to view papers
            </p>
          </div>
        ))}
      </div>

      {/* Papers Section */}
      {selectedId && (
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Papers in Workspace</h3>
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={triggerFileUpload}
                disabled={uploading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </div>

          {workspacePapers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-slate-700">No papers yet</p>
              <p className="text-sm mb-4">Search papers from arXiv or upload your own PDFs.</p>
              <button
                onClick={triggerFileUpload}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Upload Your First PDF
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workspacePapers.map((paper) => (
                <div
                  key={paper.id}
                  className="border border-slate-200 p-5 rounded-2xl hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-900 mb-2">{paper.title}</h4>
                      <p className="text-sm text-slate-600 mb-1">
                        <span className="font-semibold">Authors:</span> {paper.authors}
                      </p>
                      <p className="text-sm text-slate-500 mb-3">
                        <span className="font-semibold">Date:</span> {paper.date}
                      </p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {paper.abstract?.substring(0, 150)}...
                      </p>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 lg:ml-4">
                      <button
                        onClick={() => openPaper(paper)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        View Details
                      </button>
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium text-center whitespace-nowrap border border-slate-200"
                      >
                        Open arXiv
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Paper Details Modal */}
      {showPaperModal && selectedPaper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 p-6 flex justify-between items-start">
              <h3 className="text-2xl font-bold text-slate-900 pr-8">{selectedPaper.title}</h3>
              <button
                onClick={closePaperModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Authors</h4>
                <p className="text-slate-900">{selectedPaper.authors}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Publication Date</h4>
                <p className="text-slate-900">{selectedPaper.date}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Abstract</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPaper.abstract}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">arXiv Link</h4>
                <a
                  href={selectedPaper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 underline break-all"
                >
                  {selectedPaper.url}
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <a
                  href={selectedPaper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-center"
                >
                  Open Full Paper on arXiv
                </a>
                <button
                  onClick={closePaperModal}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl hover:bg-slate-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;