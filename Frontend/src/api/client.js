/**
 * DocMind RAG Pipeline API Client
 * Backend server runs on http://localhost:8084
 */

const API_BASE_URL = 'http://localhost:8084';

// Helper for generic JSON API requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `Server error: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * 1. Upload single document with progress tracking
 * Endpoint: POST /api/v1/document/upload
 * Field name: 'file'
 */
export function uploadDocument(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.open('POST', `${API_BASE_URL}/api/v1/document/upload`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 90);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          resolve({ success: true, message: xhr.responseText });
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText);
          msg = err.message || msg;
        } catch (_) {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

/**
 * 2. Upload multiple documents with progress tracking
 * Endpoint: POST /api/v1/document/upload-multiple
 * Field name: 'files'
 */
export function uploadMultipleDocuments(files, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    xhr.open('POST', `${API_BASE_URL}/api/v1/document/upload-multiple`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 90);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          resolve({ success: true, message: xhr.responseText });
        }
      } else {
        let msg = `Multiple upload failed (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText);
          msg = err.message || msg;
        } catch (_) {}
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during multiple upload'));
    xhr.send(formData);
  });
}

/**
 * 3. List all documents
 * Endpoint: GET /api/v1/document/listDocumets
 */
export async function listDocuments() {
  return request('/api/v1/document/listDocumets');
}

/**
 * 4. Get document by ID
 * Endpoint: GET /api/v1/document/{id}
 */
export async function getDocumentById(id) {
  return request(`/api/v1/document/${id}`);
}

/**
 * 5. Delete document by ID
 * Endpoint: DELETE /api/v1/document/{id}
 */
export async function deleteDocument(id) {
  return request(`/api/v1/document/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 6. Chat Query (Non-streaming)
 * Endpoint: POST /api/v1/chat/query
 */
export async function askQuestion({
  question,
  documentId = null,
  topK = 5,
  minSimilarity = 0.0,
  conversationId = null,
}) {
  return request('/api/v1/chat/query', {
    method: 'POST',
    body: JSON.stringify({
      question,
      documentId,
      topK,
      minSimilarity,
      conversationId,
    }),
  });
}

/**
 * 7. Real-time Stream Chat (SSE)
 * Endpoint: POST /api/v1/chat/stream
 */
export async function streamQuestionAnswer({
  question,
  documentId = null,
  topK = 5,
  minSimilarity = 0.0,
}, onToken, onDone, onError) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream, application/json, text/plain',
      },
      body: JSON.stringify({
        question,
        documentId,
        topK,
        minSimilarity,
      }),
    });

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        onToken(chunk);
      }
    }
    if (onDone) onDone();
  } catch (err) {
    if (onError) onError(err);
    else throw err;
  }
}

/**
 * 8. Semantic Similarity Search
 * Endpoint: POST /api/v1/chat/search/similarity
 */
export async function searchSimilarChunks({
  query,
  documentId = null,
  topK = 5,
  similaritySearch = 0.0,
}) {
  return request('/api/v1/chat/search/similarity', {
    method: 'POST',
    body: JSON.stringify({
      query,
      documentId,
      topK,
      similaritySearch,
    }),
  });
}

/**
 * Check if the backend on 8084 is accessible
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/api/v1/document/listDocumets`, {
      signal: controller.signal,
      method: 'GET',
    });
    clearTimeout(timeoutId);
    return res.status < 500;
  } catch (e) {
    return false;
  }
}
