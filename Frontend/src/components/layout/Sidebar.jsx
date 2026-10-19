import React from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, Search, MessageSquare, Sun, Moon, PanelLeftClose, PanelLeft, Database } from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, backendConnected, collapsedSidebar, setCollapsedSidebar } = useDocuments();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    {
      id: 'library',
      label: 'Knowledge library',
      icon: BookOpen,
      match: ['library', 'source-details'],
    },
    {
      id: 'search',
      label: 'Semantic search',
      icon: Search,
      match: ['search'],
    },
    {
      id: 'chat',
      label: 'Ask your knowledge',
      icon: MessageSquare,
      match: ['chat'],
    },
  ];

  return (
    <aside
      className={`h-screen flex flex-col justify-between border-r transition-all duration-200 select-none
        ${collapsedSidebar ? 'w-16' : 'w-64'}
        ${isDark ? 'bg-ink-950 border-ink-800 text-ink-300' : 'bg-[#F4F3EE] border-[#E8E6DF] text-parchment-700'}
      `}
    >
      {/* Top Brand Header */}
      <div>
        <div className={`flex items-center p-4 border-b ${isDark ? 'border-ink-800' : 'border-[#E8E6DF]'} ${collapsedSidebar ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            {/* 'D' Box Logo */}
            <div className={`w-8 h-8 rounded border flex items-center justify-center font-serif text-lg font-bold tracking-tight shadow-sm
              ${isDark ? 'bg-ink-900 border-ink-700 text-ink-100' : 'bg-white border-[#D6D2C4] text-parchment-900'}
            `}>
              D
            </div>
            {!collapsedSidebar && (
              <div>
                <h1 className={`text-base font-semibold leading-tight tracking-tight ${isDark ? 'text-ink-100' : 'text-parchment-900'}`}>
                  DocMind
                </h1>
                <p className={`text-xs ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}>
                  A diary for knowledge
                </p>
              </div>
            )}
          </div>

          {!collapsedSidebar && (
            <button
              onClick={() => setCollapsedSidebar(true)}
              className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-xs ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Section Title */}
        {!collapsedSidebar && (
          <div className="px-5 pt-6 pb-2">
            <span className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-ink-500' : 'text-parchment-400'}`}>
              YOUR DESK
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-2 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match.includes(activeTab);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsedSidebar ? item.label : undefined}
                className={`w-full flex items-center text-sm font-medium transition-colors relative rounded-md
                  ${collapsedSidebar ? 'justify-center py-3' : 'px-3 py-2.5 space-x-3'}
                  ${isActive
                    ? isDark
                      ? 'bg-ink-850 text-ink-100 font-semibold shadow-sm'
                      : 'bg-[#ECE9E1] text-parchment-900 font-semibold shadow-xs'
                    : isDark
                      ? 'text-ink-400 hover:text-ink-200 hover:bg-ink-900'
                      : 'text-parchment-600 hover:text-parchment-900 hover:bg-[#ECE9E1]/50'
                  }
                `}
              >
                {/* Active vertical marker bar */}
                {isActive && (
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r
                      ${isDark ? 'bg-ink-100' : 'bg-parchment-900'}
                    `}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isDark ? 'text-ink-100' : 'text-parchment-900') : (isDark ? 'text-ink-400' : 'text-parchment-500')}`} />
                {!collapsedSidebar && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Quote, Status, Theme Toggle */}
      <div className={`p-4 border-t ${isDark ? 'border-ink-800' : 'border-[#E8E6DF]'} space-y-4`}>
        {!collapsedSidebar && (
          <div className={`pl-3 border-l-2 text-xs italic leading-relaxed ${isDark ? 'border-ink-700 text-ink-400' : 'border-parchment-300 text-parchment-600'}`}>
            Keep the questions close to the source. Trust grows from the details.
          </div>
        )}

        <div className={`flex flex-col space-y-2 text-xs ${collapsedSidebar ? 'items-center' : ''}`}>
          {/* Workspace Connection Indicator */}
          <div className={`flex items-center space-x-2 ${isDark ? 'text-ink-400' : 'text-parchment-600'}`}>
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-amber-500 ring-2 ring-amber-400/20'} animate-pulse`} />
            {!collapsedSidebar && (
              <span className="truncate">
                {backendConnected ? 'Workspace connected (8084)' : 'Backend preview mode'}
              </span>
            )}
          </div>

          {/* Theme Toggle Button (Matches Evening/Daylight screenshot) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-2 py-1.5 px-2 rounded transition-colors text-xs w-full
              ${isDark ? 'hover:bg-ink-900 text-ink-300' : 'hover:bg-[#ECE9E1] text-parchment-700'}
              ${collapsedSidebar ? 'justify-center' : ''}
            `}
            title={isDark ? 'Switch to Daylight' : 'Switch to Evening'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                {!collapsedSidebar && <span>☼ Daylight</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                {!collapsedSidebar && <span>☾ Evening</span>}
              </>
            )}
          </button>

          {/* Expand sidebar button when collapsed */}
          {collapsedSidebar && (
            <button
              onClick={() => setCollapsedSidebar(false)}
              className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-xs ${isDark ? 'text-ink-400' : 'text-parchment-500'}`}
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
