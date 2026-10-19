# DocMind Frontend Documentation

This document provides a comprehensive overview of the **DocMind Frontend** application built to interface with the DocMind Spring Boot RAG Pipeline (`http://localhost:8084`).

---

## 1. Architecture & Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom literary/editorial palette (`parchment` & `ink`)
- **Typography**: 
  - Serif: *Newsreader* / *Georgia* (editorial headers, quotes, passages)
  - Sans: *Inter* (UI labels, system controls, buttons)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Network / Transport**:
  - `XMLHttpRequest` with upload progress listeners (for tracking 0–100% upload progress)
  - `fetch` with streaming support for Server-Sent Events (SSE)
  - Vite dev server reverse proxy (`/api` -> `http://localhost:8084`)

---

## 2. Directory Structure

```text
backend/Frontend/
├── Screenshots/                     # Design reference mockups
│   ├── image-1 (1).jpeg             # Ask your knowledge & Feature templates
│   ├── image-2.jpeg                 # Source details & Indexed chunks
│   ├── image-3.jpeg                 # Knowledge library desk
│   ├── image-4.jpeg                 # Semantic search (Clauses, Concepts, Facts)
│   └── Screenshot 2026-10-19...png  # Dark mode & compact rail
├── src/
│   ├── api/
│   │   ├── client.js                # RAG pipeline REST & streaming client
│   │   └── mockData.js              # Rich offline fallback & seed documents
│   ├── context/
│   │   ├── DocumentContext.jsx      # Documents, desks, filtering, global state
│   │   └── ThemeContext.jsx         # Dark / Light mode toggle & persistence
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx          # Collapsible sidebar, brand, quotes, theme toggle
│   │   │   └── TopHeader.jsx        # Desk breadcrumb, upload trigger, ⌘K trigger
│   │   ├── chat/
│   │   │   └── ChatSection.jsx      # Q&A conversation, feature templates, citations
│   │   ├── search/
│   │   │   └── SemanticSearch.jsx   # Clause/Concept/Fact retrieval desk
│   │   ├── library/
│   │   │   ├── KnowledgeLibrary.jsx # Preserved documents desk & metrics
│   │   │   └── SourceDetails.jsx    # 4-metric strip & indexed chunks inspection
│   │   ├── upload/
│   │   │   └── UploadModal.jsx      # Single & multi-file upload dialog with progress bar
│   │   └── modals/
│   │       └── CommandSearchModal.jsx # ⌘K global launcher & quick navigator
│   ├── App.jsx                      # Application root & desk router
│   ├── main.jsx                     # Entrypoint mount
│   └── index.css                    # Tailwind directives & typography
├── index.html                       # HTML5 template with Google web fonts
├── package.json                     # NPM scripts & dependencies
├── tailwind.config.js               # Dark mode & custom color themes
├── vite.config.js                   # Vite config with backend proxy to port 8084
└── DOCMIND_FRONTEND_DOCS.md         # Comprehensive documentation
```

---

## 3. Backend Endpoints Integration

The frontend connects directly to the Spring Boot RAG backend running on **port 8084**:

| HTTP Method | Backend Endpoint | Request Payload | Description |
|---|---|---|---|
| `POST` | `/api/v1/document/upload` | `multipart/form-data` (`file`) | Uploads and indexes a single document |
| `POST` | `/api/v1/document/upload-multiple` | `multipart/form-data` (`files`) | Batch upload and indexing of multiple files |
| `GET` | `/api/v1/document/listDocumets` | *None* | Fetches list of all ingested documents |
| `GET` | `/api/v1/document/{id}` | Path param `UUID id` | Retrieves document metadata and chunk stats |
| `DELETE` | `/api/v1/document/{id}` | Path param `UUID id` | Deletes document and cleans up vector chunks in PgVector |
| `POST` | `/api/v1/chat/query` | `ChatRequestDTO` | Non-streaming grounded RAG query with citations |
| `POST` | `/api/v1/chat/stream` | `ChatRequestDTO` | Real-time SSE token streaming Q&A |
| `POST` | `/api/v1/chat/search/similarity` | `SearchRequestDTO` | Top-K cosine similarity search over vector store |

### DTO Payload Formats:

#### 1. ChatRequestDTO
```json
{
  "question": "What is the termination notice period?",
  "documentId": "d8e3b44f-21f1-4df2-8c19-14a0f4439c01",
  "topK": 5,
  "minSimilarity": 0.0,
  "conversationId": "uuid-optional"
}
```

#### 2. SearchRequestDTO
```json
{
  "query": "termination clause",
  "documentId": null,
  "topK": 5,
  "similaritySearch": 0.0
}
```

---

## 4. Key Features Implemented

### 1. Document Upload Dialog with Real-Time Progress Bar
- **Single & Multiple File Dropzone**: Drag-and-drop or file picker supporting PDF, DOCX, TXT, MD.
- **Upload Progress**: Tracks upload byte transfer (0% to 100%) using `xhr.upload.onprogress`.
- **Pipeline Stage Indicators**:
  1. *Uploading payload*
  2. *Parsing text & chunking tokens*
  3. *Generating Gemini embeddings (768 dimensions)*
  4. *Writing vectors into PostgreSQL PgVectorStore*
- **Post-Upload Action**: Displays chunk counts and allows jumping directly into "Ask questions now".

### 2. User Chat Section ("Ask your knowledge")
- Matches screenshot `image-1 (1).jpeg` and dark mode `Screenshot 2026-10-19 143637.png`.
- **Document Scope Selector**: `📖 All documents` dropdown or scope Q&A to a specific document.
- **Empty State**: Sparkle card with header `A BLANK MARGIN` and prompt: *"What would you like to understand?"*.
- **Feature Templates** (from screenshot 1):
  - `Summarize the main idea`
  - `Explain a technical concept`
  - `Find important action items`
- **RAG Grounded Citations**:
  - Displays each source document name, chunk index, page number, and similarity score match percentage.
  - Expandable passage drawer to view the exact text snippet that shaped the answer.
- **Latency Indicator**: Shows answer generation time in milliseconds (e.g., `⚡ Answered in 340ms`).
- **Rich Input Controls**: Attach button, Enter to send, Shift+Enter for new line.

### 3. Semantic Search Desk ("Find the thread." - Clauses, Concepts, Facts)
- Matches screenshot `image-4.jpeg`.
- **Search Categories**: Filter by **Clauses**, **Concepts**, or **Facts** (matching user requirements).
- **Advanced Sliders**: Top-K retrieval limit and minimum similarity score threshold.
- **Quick Preset Chips**: Fast queries for *"termination clause"*, *"limitation of liability"*, *"confidential information"*, *"vector embeddings pipeline"*, etc.
- **Results Trail**: Shows similarity scores, category tags, page numbers, highlighted snippets, and instant *"Ask in Chat"* or *"Copy"* actions.

### 4. Knowledge Library & Chunks Information ("Source details")
- Matches screenshots `image-3.jpeg` and `image-2.jpeg`.
- **Library Desk**:
  - Dynamic day banner (e.g. `MONDAY, YOUR KNOWLEDGE DESK`).
  - Summary metrics: `DOCUMENTS` count and `INDEXED CHUNKS` count.
  - Document cards with file size, chunk count, status badge, inspect chunks action, and delete action.
- **Source Details**:
  - `← Back to library` navigation.
  - Document entry header with file type, date, pages, and chunk metrics.
  - 4-metric strip: `FILE TYPE`, `UPLOADED`, `PAGES`, `INDEXED CHUNKS`.
  - Passage trail displaying all indexed chunks with page numbers, character/token lengths, and snippet inspection.

### 5. Dark Mode ("Evening" / "Daylight")
- Matches screenshot `Screenshot 2026-10-19 143637.png`.
- Full dark palette using deep ink/slate tones (`#0B0F15`, `#111720`, `#161F2B`, `#212D3E`).
- Sidebar toggle button: `☾ Evening` / `☼ Daylight`.
- Sidebar collapse/expand button to switch to the sleek icon-only rail shown in screenshot 5.
- Theme preference persisted in `localStorage`.

### 6. Command Palette (⌘K / Ctrl+K)
- Global shortcut opens a spotlight search modal to instantly jump between desks, search documents, trigger file upload, or toggle themes.

---

## 5. Running the Frontend

### Prerequisites
- Node.js >= 18.0.0
- Backend running on `http://localhost:8084`

### Development Mode
```bash
cd backend/Frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```
Output will be generated in `backend/Frontend/dist`.
