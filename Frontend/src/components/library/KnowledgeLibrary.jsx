import React, { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Layers,
  Calendar,
  HardDrive
} from 'lucide-react';

export default function KnowledgeLibrary() {
  const {
    documents,
    setIsUploadModalOpen,
    viewSourceDetails,
    askAboutDocument,
    removeDocument,
  } = useDocuments();
  const { isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Dynamic Day of week
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  // Filter documents by search
  const filteredDocs = documents.filter((doc) =>
    (doc.fileName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunkCreated || 0), 0);

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this document and all its indexed vector chunks?")) {
      setDeletingId(id);
      try {
        await removeDocument(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors
      ${isDark ? 'bg-ink-900 text-ink-100' : 'bg-parchment-50 text-parchment-900'}
    `}>
      {/* Top Header (Matches image-3.jpeg) */}
      <div className={`px-8 pt-6 pb-5 border-b flex items-start justify-between
        ${isDark ? 'border-ink-800' : 'border-[#E8E6DF]'}
      `}>
        <div>
          <span className={`text-[11px] font-semibold tracking-widest uppercase
            ${isDark ? 'text-ink-400' : 'text-parchment-500'}
          `}>
            {dayName}, YOUR KNOWLEDGE DESK
          </span>
          <h1 className="text-3xl font-serif font-medium tracking-tight mt-1">
            A quieter way to remember.
          </h1>
          <p className={`text-xs mt-1.5 max-w-xl leading-relaxed ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
            Collect the papers, notes, and ideas you return to. DocMind keeps the trail readable.
          </p>
        </div>

        {/* Right Library Bookmark Status */}
        <div className={`hidden md:flex items-center space-x-2 text-xs italic px-3 py-1.5 rounded-md border
          ${isDark ? 'border-ink-800 bg-ink-850/60 text-ink-400' : 'border-parchment-200 bg-white text-parchment-600'}
        `}>
          <span>🔖</span>
          <span>
            {documents.length === 0
              ? 'Your library is waiting for its first entry'
              : `${documents.length} ${documents.length === 1 ? 'document' : 'documents'} preserved in desk`}
          </span>
        </div>
      </div>

      {/* Action and Search Row */}
      <div className={`px-8 py-3.5 border-b flex items-center justify-between gap-4
        ${isDark ? 'border-ink-800 bg-ink-950/20' : 'border-[#E8E6DF] bg-white'}
      `}>
        {/* Search your library */}
        <div className={`flex items-center rounded-md border px-3 py-1.5 w-full max-w-md shadow-2xs transition-all focus-within:ring-1 focus-within:ring-slate-400
          ${isDark ? 'bg-ink-850 border-ink-750' : 'bg-parchment-50 border-[#D6D2C4]'}
        `}>
          <Search className={`w-3.5 h-3.5 mr-2.5 shrink-0 ${isDark ? 'text-ink-400' : 'text-parchment-500'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your library"
            className={`w-full bg-transparent text-xs placeholder:text-parchment-400 dark:placeholder:text-ink-500 focus:outline-hidden
              ${isDark ? 'text-ink-100' : 'text-parchment-900'}
            `}
          />
          <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded
            ${isDark ? 'text-ink-500' : 'text-parchment-400'}
          `}>
            ⌘K
          </span>
        </div>

        {/* Add a document Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md border transition-all duration-150 shrink-0 shadow-2xs
            ${isDark
              ? 'bg-ink-800 border-ink-700 text-ink-100 hover:bg-ink-750'
              : 'bg-white border-[#D6D2C4] text-parchment-800 hover:bg-[#FAF9F5] hover:border-parchment-400'
            }
          `}
        >
          <span>↑</span>
          <span>Add a document</span>
        </button>
      </div>

      {/* Metrics Summary Strip (Matches image-3.jpeg) */}
      <div className={`px-8 py-3 border-b flex items-center justify-between text-xs
        ${isDark ? 'border-ink-800 bg-ink-850/40 text-ink-400' : 'border-[#E8E6DF] bg-parchment-100/60 text-parchment-600'}
      `}>
        <div className="flex items-center space-x-8">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider block">
              DOCUMENTS
            </span>
            <span className={`text-base font-serif font-medium ${isDark ? 'text-ink-100' : 'text-parchment-900'}`}>
              {documents.length > 0 ? documents.length : '—'}
            </span>
          </div>

          <div className="h-6 w-px bg-inherit opacity-40" />

          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider block">
              INDEXED CHUNKS
            </span>
            <span className={`text-base font-serif font-medium ${isDark ? 'text-ink-100' : 'text-parchment-900'}`}>
              {totalChunks > 0 ? totalChunks : '—'}
            </span>
          </div>
        </div>

        <div className="text-[11px] flex items-center space-x-1.5 italic">
          <span>✻</span>
          <span>
            {documents.length > 0
              ? 'Vector store connected via PostgreSQL PgVector'
              : 'Your collection will appear here when the library is connected.'}
          </span>
        </div>
      </div>

      {/* Main Content: Documents List or Empty State */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {documents.length === 0 ? (
          /* Empty State (Matches image-3.jpeg) */
          <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-4 animate-fade-in -mt-6">
            <div className={`w-14 h-16 rounded border flex items-center justify-center shadow-xs relative
              ${isDark ? 'bg-ink-850 border-ink-750 text-ink-300' : 'bg-white border-parchment-300 text-parchment-700'}
            `}>
              <FileText className="w-7 h-7" />
              <Sparkles className="w-3.5 h-3.5 absolute -top-1.5 -right-1.5 text-indigo-400" />
            </div>

            <div>
              <span className={`text-[10px] font-semibold tracking-widest uppercase
                ${isDark ? 'text-ink-500' : 'text-parchment-400'}
              `}>
                AN OPEN PAGE
              </span>
              <h2 className="text-xl font-serif font-medium mt-1">
                Nothing to read yet...
              </h2>
              <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
                Upload research papers, legal agreements, or technical notes to explore passages and ask questions.
              </p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-1.5 text-xs font-medium rounded text-white bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-xs"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          /* Documents Grid / Table */
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className={`font-medium ${isDark ? 'text-ink-300' : 'text-parchment-700'}`}>
                Preserved Documents ({filteredDocs.length})
              </span>
              <span className={`text-[11px] ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
                Click on any document to inspect its indexed vector chunks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => viewSourceDetails(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 group shadow-2xs hover:shadow-sm
                    ${isDark
                      ? 'bg-ink-850 border-ink-750 text-ink-100 hover:border-ink-600 hover:bg-ink-800'
                      : 'bg-white border-[#E5E3DC] text-parchment-900 hover:border-parchment-400 hover:bg-[#FAF9F5]'
                    }
                  `}
                >
                  {/* Top: File icon & name */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 truncate pr-2">
                      <div className={`p-2 rounded-lg border mt-0.5
                        ${isDark ? 'bg-ink-800 border-ink-700 text-indigo-400' : 'bg-parchment-100 border-parchment-200 text-parchment-800'}
                      `}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h3 className="text-sm font-semibold truncate group-hover:underline">
                          {doc.fileName}
                        </h3>
                        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
                          {formatFileSize(doc.fileSize)} · {doc.chunkCreated || 0} chunks
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {doc.status || 'INDEXED'}
                    </span>
                  </div>

                  {/* Document Excerpt Preview */}
                  {doc.chunks && doc.chunks.length > 0 && (
                    <p className={`text-xs mt-3 line-clamp-2 italic ${isDark ? 'text-ink-300' : 'text-parchment-600'}`}>
                      "{doc.chunks[0].snippet}"
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-inherit/40 text-xs">
                    <span className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      Inspect chunks →
                    </span>

                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => askAboutDocument(doc)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-xs transition-colors
                          ${isDark ? 'border-ink-700 text-ink-300 hover:bg-ink-750' : 'border-parchment-300 text-parchment-700 hover:bg-white'}
                        `}
                        title="Open chat scoped to this document"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Ask</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        disabled={deletingId === doc.id}
                        className={`p-1.5 rounded transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40`}
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
