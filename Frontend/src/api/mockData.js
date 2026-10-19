/**
 * Mock data for demo preview & fallback testing
 */

export const INITIAL_MOCK_DOCUMENTS = [
  {
    id: "d8e3b44f-21f1-4df2-8c19-14a0f4439c01",
    fileName: "master-services-agreement.pdf",
    fileSize: 1420580, // ~1.4 MB
    status: "INDEXED",
    chunkCreated: 18,
    message: "Document successfully processed and indexed",
    uploadedAt: "2026-10-18T10:15:00",
    totalPages: 6,
    chunks: [
      {
        id: "chunk-01",
        chunkIndex: 0,
        pageNumber: 1,
        snippet: "SECTION 1. DEFINITIONS AND INTERPRETATION. 'Confidential Information' refers to any proprietary data, intellectual property, source code, trade secrets, financial records, customer lists, and strategic business plans disclosed by either party to the other, whether orally or in written or electronic form.",
        metadata: { category: "clause", clauseType: "Definitions", confidence: 0.98 }
      },
      {
        id: "chunk-02",
        chunkIndex: 1,
        pageNumber: 2,
        snippet: "SECTION 4.2 TERMINATION CLAUSE. Either party may terminate this Agreement without cause upon sixty (60) days prior written notice to the other party. In the event of a material breach, the non-breaching party may terminate immediately if such breach remains uncured for fifteen (15) days following formal written notice.",
        metadata: { category: "clause", clauseType: "Termination Clause", confidence: 0.99 }
      },
      {
        id: "chunk-03",
        chunkIndex: 2,
        pageNumber: 3,
        snippet: "SECTION 8. LIMITATION OF LIABILITY & INDEMNIFICATION. Under no circumstances shall either party be liable to the other for indirect, special, punitive, incidental, or consequential damages. Aggregate liability under this contract shall not exceed total fees paid during the preceding twelve (12) calendar months.",
        metadata: { category: "clause", clauseType: "Liability & Indemnification", confidence: 0.95 }
      },
      {
        id: "chunk-04",
        chunkIndex: 3,
        pageNumber: 4,
        snippet: "SECTION 12. COMPLIANCE & GOVERNING LAW. This Agreement shall be governed by, and construed in accordance with, the laws of the State of Delaware, without giving effect to any principles of conflict of laws. All disputes shall be subject to exclusive jurisdiction in Wilmington, Delaware.",
        metadata: { category: "fact", clauseType: "Jurisdiction", confidence: 0.94 }
      }
    ]
  },
  {
    id: "f1a239c0-98b1-411e-8e55-32111bbff652",
    fileName: "docmind-rag-pipeline-specs.pdf",
    fileSize: 2840912, // ~2.8 MB
    status: "INDEXED",
    chunkCreated: 24,
    message: "Document successfully processed and indexed",
    uploadedAt: "2026-10-19T08:30:00",
    totalPages: 8,
    chunks: [
      {
        id: "chunk-10",
        chunkIndex: 0,
        pageNumber: 1,
        snippet: "DocMind RAG Architecture Overview: The ingestion pipeline utilizes TokenTextSplitter with chunk size 600 tokens and 100 token overlap. Documents are parsed via Apache PDFBox/Tika and embedded using Google GenAI text embedding model 'gemini-embedding-001' generating 768-dimensional dense vectors.",
        metadata: { category: "concept", clauseType: "Ingestion Pipeline", confidence: 0.97 }
      },
      {
        id: "chunk-11",
        chunkIndex: 1,
        pageNumber: 2,
        snippet: "PgVector Vector Store Configuration: Vectors are stored in the PostgreSQL table 'vector_store_gemini' with HNSW indexing and COSINE_DISTANCE distance metrics. Similarity search executes top-K retrieval filtering on documentId and similarity score thresholds.",
        metadata: { category: "concept", clauseType: "Vector Store Storage", confidence: 0.96 }
      },
      {
        id: "chunk-12",
        chunkIndex: 2,
        pageNumber: 4,
        snippet: "Generation and Streaming Protocol: Prompts are synthesized with retrieved context citations, submitted to Gemini 2.5 Flash at temperature 0.2. Real-time token streaming is exposed through Spring WebFlux Server-Sent Events (SSE) via the `/api/v1/chat/stream` reactive endpoint.",
        metadata: { category: "fact", clauseType: "Streaming Protocol", confidence: 0.98 }
      }
    ]
  }
];

export const MOCK_SEARCH_SUGGESTIONS = [
  { text: "termination clause", type: "clause", hint: "Search for termination conditions, notice period, and breach remedy" },
  { text: "limitation of liability", type: "clause", hint: "Search for monetary caps and consequential damage exclusions" },
  { text: "confidential information", type: "concept", hint: "Identify proprietary data definitions and obligations" },
  { text: "token chunking & embeddings", type: "concept", hint: "Inspect RAG chunk size, overlap, and vector dimensions" },
  { text: "governing law jurisdiction", type: "fact", hint: "Check state governing law and dispute resolution venues" },
  { text: "vector store gemini pgvector", type: "fact", hint: "Review PostgreSQL HNSW cosine distance setup" }
];
