import React, { useState, useEffect } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  BookOpen,
  MessageSquare,
  Upload,
  FileText,
  X,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

export default function CommandSearchModal() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    documents,
    setActiveTab,
    setIsUploadModalOpen,
    viewSourceDetails,
    askAboutDocument,
  } = useDocuments();
  const { isDark, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const handleClose = () => {
    setQuery('');
    setIsCommandPaletteOpen(false);
  };

  const filteredDocs = documents.filter((d) =>
    (d.fileName || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden transition-all
          ${isDark ? 'bg-ink-900 border-ink-750 text-ink-100' : 'bg-white border-parchment-200 text-parchment-900'}
        `}
      >
        {/* Search Bar Input */}
        <div className={`flex items-center px-4 py-3 border-b ${isDark ? 'border-ink-800' : 'border-parchment-200'}`}>
          <Search className={`w-4 h-4 mr-3 shrink-0 ${isDark ? 'text-ink-400' : 'text-parchment-500'}`} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, desks, or actions..."
            className={`w-full bg-transparent text-sm placeholder:text-parchment-400 dark:placeholder:text-ink-500 focus:outline-hidden
              ${isDark ? 'text-ink-100' : 'text-parchment-900'}
            `}
          />
          <button
            onClick={handleClose}
            className={`p-1 rounded text-xs ${isDark ? 'text-ink-400 hover:text-ink-200' : 'text-parchment-500 hover:text-parchment-800'}`}
          >
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 border rounded">ESC</kbd>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Desks */}
          <div className="space-y-1">
            <span className={`px-2 text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
              Desks & Navigation
            </span>
            <div
              onClick={() => {
                setActiveTab('chat');
                handleClose();
              }}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors
                ${isDark ? 'hover:bg-ink-800' : 'hover:bg-parchment-100'}
              `}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ask your knowledge (Chat companion)</span>
              </div>
              <ArrowRight className="w-3 h-3 opacity-50" />
            </div>

            <div
              onClick={() => {
                setActiveTab('library');
                handleClose();
              }}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors
                ${isDark ? 'hover:bg-ink-800' : 'hover:bg-parchment-100'}
              `}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Knowledge library (Document desk)</span>
              </div>
              <ArrowRight className="w-3 h-3 opacity-50" />
            </div>

            <div
              onClick={() => {
                setActiveTab('search');
                handleClose();
              }}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors
                ${isDark ? 'hover:bg-ink-800' : 'hover:bg-parchment-100'}
              `}
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Semantic search (Clauses, Concepts & Facts)</span>
              </div>
              <ArrowRight className="w-3 h-3 opacity-50" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1">
            <span className={`px-2 text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
              Actions
            </span>
            <div
              onClick={() => {
                handleClose();
                setIsUploadModalOpen(true);
              }}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors
                ${isDark ? 'hover:bg-ink-800' : 'hover:bg-parchment-100'}
              `}
            >
              <div className="flex items-center space-x-2">
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Upload single or multiple documents</span>
              </div>
              <span className={`text-[10px] font-mono ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
                Dialog
              </span>
            </div>

            <div
              onClick={() => {
                toggleTheme();
                handleClose();
              }}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors
                ${isDark ? 'hover:bg-ink-800' : 'hover:bg-parchment-100'}
              `}
            >
              <div className="flex items-center space-x-2">
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                <span>Toggle theme ({isDark ? 'Switch to Daylight' : 'Switch to Evening'})</span>
              </div>
              <span className={`text-[10px] font-mono ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
                Appearance
              </span>
            </div>
          </div>

          {/* Matching Documents */}
          {filteredDocs.length > 0 && (
            <div className="space-y-1">
              <span className={`px-2 text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
                Documents ({filteredDocs.length})
              </span>
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    viewSourceDetails(doc);
                    handleClose();
                  }}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors
                    ${isDark ? 'hover:bg-ink-800' : 'hover:bg-parchment-100'}
                  `}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate font-medium">{doc.fileName}</span>
                  </div>
                  <span className="text-[10px] opacity-70">
                    {doc.chunkCreated || 0} chunks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
