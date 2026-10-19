import React from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import { Upload, Search } from 'lucide-react';

export default function TopHeader() {
  const { activeTab, setIsUploadModalOpen, setIsCommandPaletteOpen } = useDocuments();
  const { isDark } = useTheme();

  const getDeskLabel = () => {
    switch (activeTab) {
      case 'library':
      case 'source-details':
        return 'Personal knowledge library';
      case 'search':
        return 'Retrieval desk';
      case 'chat':
      default:
        return 'Reading companion';
    }
  };

  return (
    <header className={`h-14 px-8 border-b flex items-center justify-between transition-colors
      ${isDark ? 'bg-ink-900 border-ink-800 text-ink-200' : 'bg-parchment-50 border-[#E8E6DF] text-parchment-700'}
    `}>
      {/* Current Desk Indicator */}
      <div className="flex items-center space-x-2 text-sm font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-parchment-500 dark:bg-ink-400" />
        <span className={isDark ? 'text-ink-200' : 'text-parchment-800'}>
          {getDeskLabel()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Upload Document Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150 shadow-xs
            ${isDark
              ? 'bg-ink-800 border-ink-700 text-ink-100 hover:bg-ink-750 hover:border-ink-600'
              : 'bg-white border-[#D6D2C4] text-parchment-800 hover:bg-[#FAF9F5] hover:border-parchment-400'
            }
          `}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload document</span>
        </button>

        {/* Global Search ⌘K Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`flex items-center space-x-2 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all duration-150
            ${isDark
              ? 'bg-ink-850/60 border-ink-800 text-ink-300 hover:text-ink-100 hover:bg-ink-800'
              : 'bg-transparent border-[#E8E6DF] text-parchment-600 hover:text-parchment-900 hover:border-parchment-400'
            }
          `}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded border
            ${isDark ? 'bg-ink-950 border-ink-800 text-ink-400' : 'bg-parchment-100 border-parchment-300 text-parchment-500'}
          `}>
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  );
}
