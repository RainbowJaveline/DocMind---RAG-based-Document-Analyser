import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DocumentProvider, useDocuments } from './context/DocumentContext';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import ChatSection from './components/chat/ChatSection';
import KnowledgeLibrary from './components/library/KnowledgeLibrary';
import SemanticSearch from './components/search/SemanticSearch';
import SourceDetails from './components/library/SourceDetails';
import UploadModal from './components/upload/UploadModal';
import CommandSearchModal from './components/modals/CommandSearchModal';

function MainLayout() {
  const { activeTab } = useDocuments();

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chat' && <ChatSection />}
          {activeTab === 'library' && <KnowledgeLibrary />}
          {activeTab === 'search' && <SemanticSearch />}
          {activeTab === 'source-details' && <SourceDetails />}
        </main>
      </div>

      {/* Global Modals */}
      <UploadModal />
      <CommandSearchModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DocumentProvider>
        <MainLayout />
      </DocumentProvider>
    </ThemeProvider>
  );
}
