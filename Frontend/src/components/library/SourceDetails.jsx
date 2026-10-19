import React, { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';

export default function SourceDetails() {
  const {
    selectedDocument,
    setActiveTab,
    askAboutDocument,
    removeDocument,
  } = useDocuments();
  const { isDark } = useTheme();

  const [copiedChunkId, setCopiedChunkId] = useState(null);

  if (!selectedDocument) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <p className="text-sm">No document selected to inspect.</p>
          <button
            onClick={() => setActiveTab('library')}
            className="text-xs text-indigo-500 hover:underline"
          >
            ← Return to library
          </button>
        </div>
      </div>
    );
  }

  const doc = selectedDocument;
  const fileExt = (doc.fileName || '').split('.').pop().toUpperCase() || 'PDF';
  const chunks = doc.chunks || [];

  const copyChunk = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(id);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${doc.fileName}? This will permanently remove all associated vector chunks from PostgreSQL PgVector.`)) {
      await removeDocument(doc.id);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors
      ${isDark ? 'bg-ink-900 text-ink-100' : 'bg-parchment-50 text-parchment-900'}
    `}>
      {/* Top Breadcrumb & Header (Matches image-2.jpeg) */}
      <div className={`px-8 pt-6 pb-5 border-b ${isDark ? 'border-ink-800' : 'border-[#E8E6DF]'}`}>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center space-x-1.5 text-xs transition-colors mb-4
            ${isDark ? 'text-ink-400 hover:text-ink-100' : 'text-parchment-600 hover:text-parchment-900'}
          `}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to library</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Document icon box */}
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 shadow-2xs
              ${isDark ? 'bg-ink-850 border-ink-750 text-ink-200' : 'bg-white border-parchment-300 text-parchment-800'}
            `}>
              <FileText className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div>
              <span className={`text-[10px] font-semibold tracking-widest uppercase
                ${isDark ? 'text-ink-400' : 'text-parchment-500'}
              `}>
                DOCUMENT ENTRY
              </span>
              <h1 className="text-3xl font-serif font-medium tracking-tight mt-0.5">
                Source details
              </h1>
              <p className={`text-xs mt-1 ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
                Requested document: <span className="font-semibold">{doc.fileName}</span>
              </p>
            </div>
          </div>

          {/* Action buttons (Matches image-2.jpeg) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => askAboutDocument(doc)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all shadow-2xs
                ${isDark
                  ? 'bg-ink-800 border-ink-700 text-ink-100 hover:bg-ink-750'
                  : 'bg-white border-[#D6D2C4] text-parchment-800 hover:bg-[#FAF9F5]'
                }
              `}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask about this</span>
            </button>

            <button
              onClick={handleDelete}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all shadow-2xs
                ${isDark
                  ? 'border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40'
                  : 'border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/50'
                }
              `}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Metric Horizontal Strip (Matches image-2.jpeg) */}
      <div className={`grid grid-cols-2 md:grid-cols-4 border-b text-xs
        ${isDark ? 'border-ink-800 bg-ink-950/30' : 'border-[#E8E6DF] bg-white'}
      `}>
        <div className={`p-4 border-r ${isDark ? 'border-ink-800' : 'border-[#E8E6DF]'}`}>
          <span className={`text-[10px] uppercase font-semibold tracking-wider block ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
            FILE TYPE
          </span>
          <span className={`text-sm font-medium mt-1 block ${isDark ? 'text-ink-100' : 'text-parchment-900'}`}>
            {fileExt}
          </span>
        </div>

        <div className={`p-4 border-r ${isDark ? 'border-ink-800' : 'border-[#E8E6DF]'}`}>
          <span className={`text-[10px] uppercase font-semibold tracking-wider block ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
            UPLOADED
          </span>
          <span className={`text-sm font-medium mt-1 block ${isDark ? 'text-ink-100' : 'text-parchment-900'}`}>
            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}
          </span>
        </div>

        <div className={`p-4 border-r ${isDark ? 'border-ink-800' : 'border-[#E8E6DF]'}`}>
          <span className={`text-[10px] uppercase font-semibold tracking-wider block ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
            PAGES
          </span>
          <span className={`text-sm font-medium mt-1 block ${isDark ? 'text-ink-100' : 'text-parchment-900'}`}>
            {doc.totalPages || 6}
          </span>
        </div>

        <div className="p-4">
          <span className={`text-[10px] uppercase font-semibold tracking-wider block ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
            INDEXED CHUNKS
          </span>
          <span className={`text-sm font-medium mt-1 block ${isDark ? 'text-ink-100' : 'text-parchment-900'}`}>
            {doc.chunkCreated || chunks.length || 0}
          </span>
        </div>
      </div>

      {/* Chunks / Passages Inspection Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Section Heading */}
        <div className="flex items-center justify-between pb-2 border-b border-inherit">
          <div>
            <span className={`text-[10px] font-semibold tracking-widest uppercase
              ${isDark ? 'text-ink-500' : 'text-parchment-400'}
            `}>
              SOURCE PASSAGES
            </span>
            <h2 className="text-2xl font-serif font-medium mt-0.5">
              Indexed chunks
            </h2>
          </div>

          <span className={`text-xs ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
            {chunks.length} {chunks.length === 1 ? 'passage' : 'passages'}
          </span>
        </div>

        {chunks.length === 0 ? (
          /* Empty state matching image-2.jpeg */
          <div className="space-y-6 py-4 animate-fade-in">
            <div className={`p-4 rounded-lg border text-xs flex items-center space-x-3
              ${isDark ? 'bg-ink-850 border-ink-800 text-ink-400' : 'bg-parchment-50 border-parchment-200 text-parchment-600'}
            `}>
              <FileText className="w-4 h-4 shrink-0" />
              <span>No chunks are available to inspect.</span>
            </div>

            <div className={`p-6 rounded-xl border space-y-2
              ${isDark ? 'bg-ink-850 border-ink-800 text-ink-200' : 'bg-white border-parchment-200 text-parchment-800'}
            `}>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span className={`text-[10px] uppercase font-semibold tracking-widest ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
                  UNAVAILABLE IN THIS WORKSPACE
                </span>
              </div>
              <h3 className="font-serif text-lg font-medium">This document cannot be opened yet.</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
                The underlying vector store representation is preserved in PostgreSQL PgVector, but original raw text inspection requires active document indexing.
              </p>
            </div>
          </div>
        ) : (
          /* Rendered Chunk Passages */
          <div className="space-y-4 max-w-4xl">
            {chunks.map((chunk, idx) => (
              <div
                key={chunk.id || idx}
                className={`p-5 rounded-xl border transition-all duration-150 animate-fade-in
                  ${isDark ? 'bg-ink-850 border-ink-750 text-ink-100 hover:border-ink-600' : 'bg-white border-[#E5E3DC] text-parchment-900 hover:border-parchment-400'}
                `}
              >
                {/* Chunk Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-inherit/40 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px]
                      ${isDark ? 'bg-ink-800 text-indigo-300' : 'bg-parchment-200 text-parchment-800'}
                    `}>
                      Chunk #{chunk.chunkIndex ?? idx}
                    </span>

                    {chunk.pageNumber && (
                      <span className={`text-[11px] font-mono ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
                        Page {chunk.pageNumber}
                      </span>
                    )}

                    {chunk.metadata?.category && (
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold
                        ${chunk.metadata.category === 'clause'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : chunk.metadata.category === 'concept'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }
                      `}>
                        {chunk.metadata.clauseType || chunk.metadata.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyChunk(chunk.snippet, chunk.id || idx)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-xs transition-colors
                        ${isDark ? 'border-ink-750 text-ink-300 hover:bg-ink-800' : 'border-parchment-200 text-parchment-700 hover:bg-parchment-100'}
                      `}
                    >
                      {copiedChunkId === (chunk.id || idx) ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Chunk Passage Text */}
                <p className={`text-sm leading-relaxed font-serif ${isDark ? 'text-ink-200' : 'text-parchment-800'}`}>
                  "{chunk.snippet}"
                </p>

                {/* Chunk Footer Metadata */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-inherit/30 text-[11px]">
                  <span className={`font-mono ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
                    Length: {chunk.snippet.length} chars · ~{Math.round(chunk.snippet.length / 4)} tokens
                  </span>

                  <button
                    onClick={() => askAboutDocument(doc)}
                    className="text-indigo-500 hover:underline flex items-center space-x-1 font-medium"
                  >
                    <span>Ask question about this chunk</span>
                    <MessageSquare className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
