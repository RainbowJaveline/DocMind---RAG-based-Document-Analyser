import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {  listDocuments,
           getDocumentById,
           deleteDocument,
           checkBackendHealth} from '../api/client';
import { INITIAL_MOCK_DOCUMENTS } from '../api/mockData';

const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'library' | 'search' | 'source-details'
  const [selectedDocument, setSelectedDocument] = useState(null); // Document currently in source details view
  const [chatScopeDocId, setChatScopeDocId] = useState(null); // null = "All documents"
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  // Fetch documents from backend on mount
  const refreshDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const isOnline = await checkBackendHealth();
      setBackendConnected(isOnline);

      if (isOnline) {
        const response = await listDocuments();
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          setDocuments(response.data);
        } else {
          // If backend has 0 documents yet, seed with initial mock documents for rich UI experience
          setDocuments(INITIAL_MOCK_DOCUMENTS);
        }
      } else {
        // Backend offline or unreachable: use mock dataset
        setDocuments(INITIAL_MOCK_DOCUMENTS);
      }
    } catch (err) {
      console.warn("Could not reach backend on port 8084, using local fallback state", err);
      setBackendConnected(false);
      setDocuments(INITIAL_MOCK_DOCUMENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  // Keyboard shortcut listener for Command/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action: Delete document
  const removeDocument = async (id) => {
    try {
      if (backendConnected) {
        await deleteDocument(id);
      }
    } catch (err) {
      console.error("Backend delete failed or offline, removing from local state", err);
    } finally {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
        setActiveTab('library');
      }
      if (chatScopeDocId === id) {
        setChatScopeDocId(null);
      }
    }
  };

  // Action: Add new documents (e.g. after upload)
  const addUploadedDocuments = (newDocs) => {
    const docsToAdd = Array.isArray(newDocs) ? newDocs : [newDocs];
    setDocuments((prev) => {
      const existingIds = new Set(prev.map((d) => d.id));
      const filteredNew = docsToAdd.filter((d) => !existingIds.has(d.id));
      return [...filteredNew, ...prev];
    });
    refreshDocuments();
  };

  // Action: Navigate to Source Details

const viewSourceDetails = async (doc) => {
  // Display the selected document immediately while details load.
  setSelectedDocument(doc);
  setActiveTab('source-details');

  // Mock documents or an unavailable backend cannot be fetched from the API.
  if (!backendConnected || !doc?.id) {
    return;
  }

  try {
    const response = await getDocumentById(doc.id);

    if (response?.success && response?.data) {
      // The detail endpoint returns document metadata and indexed chunks.
      setSelectedDocument(response.data);
    } else {
      console.warn(
        'Document details response did not contain data:',
        response
      );
    }
  } catch (err) {
    console.error('Failed to fetch document details and chunks:', err);
  }
};


  // Action: Ask about this document in Chat
  const askAboutDocument = (doc) => {
    setChatScopeDocId(doc.id);
    setActiveTab('chat');
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        loading,
        activeTab,
        setActiveTab,
        selectedDocument,
        setSelectedDocument,
        chatScopeDocId,
        setChatScopeDocId,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        backendConnected,
        refreshDocuments,
        removeDocument,
        addUploadedDocuments,
        viewSourceDetails,
        askAboutDocument,
        collapsedSidebar,
        setCollapsedSidebar,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
