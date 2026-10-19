import React, { useState, useRef, useEffect } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamQuestionAnswer } from '../../api/client';
import {
  Sparkles,
  Paperclip,
  Send,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';

export default function ChatSection() {
  const {
    documents,
    chatScopeDocId,
    setChatScopeDocId,
    setIsUploadModalOpen,
  } = useDocuments();

  const { isDark } = useTheme();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedCitations, setExpandedCitations] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const featureTemplates = [
    {
      id: 'summarize',
      label: 'Summarize the main idea',
      prompt:
        'Provide a concise summary of the main ideas and core concepts across the connected documents.',
    },
    {
      id: 'explain',
      label: 'Explain a technical concept',
      prompt:
        'Explain the technical architecture and underlying mechanisms detailed in these documents.',
    },
    {
      id: 'action-items',
      label: 'Find important action items',
      prompt:
        'Identify and list all key action items, obligations, deadlines, and requirements mentioned in the documents.',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const activeDocName = chatScopeDocId
    ? documents.find(
        (doc) => String(doc.id) === String(chatScopeDocId)
      )?.fileName || 'Selected document'
    : 'All documents';

  // Send a question and display the answer progressively.
  const handleSend = async (customPrompt) => {
    const questionText = (customPrompt || inputQuestion).trim();

    if (!questionText || isGenerating) return;

    setInputQuestion('');

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: questionText,
      timestamp,
    };

    const botMessageId = `bot-${Date.now()}`;

    const assistantMessage = {
      id: botMessageId,
      sender: 'assistant',
      content: '',
      citations: [],
      responseTimeMs: null,
      timestamp,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      assistantMessage,
    ]);

    setIsGenerating(true);

    const startTime = performance.now();
    let receivedText = false;

    const updateAssistantMessage = (updates) => {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === botMessageId
            ? { ...message, ...updates }
            : message
        )
      );
    };

    try {
      await streamQuestionAnswer(
        {
          question: questionText,
          documentId: chatScopeDocId || null,
          topK: 5,
          minSimilarity: 0.0,
        },

        // Called whenever a new text chunk arrives.
        (chunk) => {
          if (!chunk) return;

          receivedText = true;

          setMessages((previous) =>
            previous.map((message) =>
              message.id === botMessageId
                ? {
                    ...message,
                    content: message.content + chunk,
                  }
                : message
            )
          );
        },

        // Called when streaming finishes.
        () => {
          updateAssistantMessage({
            responseTimeMs: Math.round(
              performance.now() - startTime
            ),
            ...(!receivedText
              ? {
                  content:
                    'The server returned no answer text. Please check the backend streaming response.',
                }
              : {}),
          });
        },

        // Called when the streaming request fails.
        (error) => {
          console.error('DocMind streaming error:', error);

          updateAssistantMessage({
            content: receivedText
              ? undefined
              : `Unable to generate an answer. ${
                  error?.message ||
                  'Check that the backend is running and the streaming URL is correct.'
                }`,
            responseTimeMs: Math.round(
              performance.now() - startTime
            ),
          });
        }
      );
    } catch (error) {
      console.error('Unexpected chat error:', error);

      updateAssistantMessage({
        content: `Unable to generate an answer. ${
          error?.message || 'Please try again.'
        }`,
        responseTimeMs: Math.round(
          performance.now() - startTime
        ),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Could not copy answer:', error);
    }
  };

  const toggleCitationExpansion = (messageId) => {
    setExpandedCitations((previous) => ({
      ...previous,
      [messageId]: !previous[messageId],
    }));
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${
        isDark
          ? 'bg-ink-900 text-ink-100'
          : 'bg-parchment-50 text-parchment-900'
      }`}
    >
      {/* Header */}
      <div
        className={`px-8 pt-6 pb-4 border-b flex items-baseline justify-between ${
          isDark ? 'border-ink-800' : 'border-[#E8E6DF]'
        }`}
      >
        <div>
          <span
            className={`text-[11px] font-semibold tracking-widest uppercase ${
              isDark ? 'text-ink-400' : 'text-parchment-500'
            }`}
          >
            READING COMPANION
          </span>

          <h1 className="text-3xl font-serif font-medium tracking-tight mt-1">
            Ask your knowledge.
          </h1>
        </div>

        {/* Document Selector */}
        <div className="relative inline-block text-left">
          <select
            value={chatScopeDocId || ''}
            onChange={(event) =>
              setChatScopeDocId(
                event.target.value ? event.target.value : null
              )
            }
            className={`appearance-none text-xs font-medium py-1.5 pl-7 pr-8 rounded-md border cursor-pointer transition-colors shadow-2xs ${
              isDark
                ? 'bg-ink-850 border-ink-750 text-ink-200 hover:border-ink-600 focus:outline-hidden'
                : 'bg-white border-[#D6D2C4] text-parchment-800 hover:border-parchment-400 focus:outline-hidden'
            }`}
          >
            <option value="">
              📖 All documents ({documents.length})
            </option>

            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                📄 {doc.fileName} ({doc.chunkCreated || 0} chunks)
              </option>
            ))}
          </select>

          <BookOpen
            className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-ink-400' : 'text-parchment-500'
            }`}
          />

          <ChevronDown
            className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-ink-400' : 'text-parchment-500'
            }`}
          />
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6 animate-fade-in -mt-4">
            <div
              className={`w-14 h-14 rounded-lg border flex items-center justify-center shadow-xs ${
                isDark
                  ? 'bg-ink-850 border-ink-750 text-ink-200'
                  : 'bg-white border-parchment-300 text-parchment-700'
              }`}
            >
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div>
              <span
                className={`text-[10px] font-semibold tracking-widest uppercase ${
                  isDark ? 'text-ink-500' : 'text-parchment-400'
                }`}
              >
                A BLANK MARGIN
              </span>

              <h2 className="text-2xl font-serif font-medium mt-1">
                What would you like to understand?
              </h2>

              <p
                className={`text-xs mt-2 max-w-md mx-auto leading-relaxed ${
                  isDark ? 'text-ink-400' : 'text-parchment-500'
                }`}
              >
                Ask a question once your sources are connected. Answers
                will show the passages that shaped them.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {featureTemplates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSend(item.prompt)}
                  disabled={isGenerating}
                  className={`flex items-center space-x-2 px-3.5 py-2 text-xs rounded-md border transition-all duration-150 group shadow-2xs disabled:opacity-50 ${
                    isDark
                      ? 'bg-ink-850/80 border-ink-750 text-ink-200 hover:bg-ink-800 hover:border-ink-600'
                      : 'bg-white border-parchment-300 text-parchment-800 hover:bg-[#FAF9F5] hover:border-parchment-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                      isDark
                        ? 'border-ink-600 text-ink-400'
                        : 'border-parchment-400 text-parchment-500'
                    }`}
                  >
                    ◯
                  </span>

                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`animate-fade-in ${
                  message.sender === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }`}
              >
                {message.sender === 'user' ? (
                  /* User Message */
                  <div
                    className={`max-w-xl rounded-xl px-4 py-3 text-sm shadow-xs ${
                      isDark
                        ? 'bg-ink-800 text-ink-50 border border-ink-700'
                        : 'bg-[#ECE9E1] text-parchment-900 border border-parchment-300'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </div>

                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        isDark ? 'text-ink-400' : 'text-parchment-500'
                      }`}
                    >
                      {message.timestamp}
                    </span>
                  </div>
                ) : (
                  /* Assistant Message */
                  <div
                    className={`w-full max-w-3xl rounded-xl border p-5 shadow-xs transition-colors ${
                      isDark
                        ? 'bg-ink-850 border-ink-800 text-ink-100'
                        : 'bg-white border-[#E8E6DF] text-parchment-900'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-inherit">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-serif font-bold text-xs ${
                            isDark
                              ? 'bg-ink-750 text-indigo-300'
                              : 'bg-[#ECE9E1] text-parchment-800'
                          }`}
                        >
                          D
                        </div>

                        <span className="text-xs font-semibold">
                          DocMind Synthesis
                        </span>

                        {message.responseTimeMs != null && (
                          <span
                            className={`flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full ${
                              isDark
                                ? 'bg-ink-800 text-ink-400'
                                : 'bg-parchment-100 text-parchment-600'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{message.responseTimeMs}ms</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(message.content, index)
                        }
                        disabled={!message.content}
                        className={`p-1.5 rounded transition-colors text-xs flex items-center space-x-1 disabled:opacity-40 ${
                          isDark
                            ? 'hover:bg-ink-800 text-ink-400'
                            : 'hover:bg-parchment-100 text-parchment-500'
                        }`}
                        title="Copy answer"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>


                    {/* Streaming Answer Text */}
                    <div
                      className={`
                        max-w-none break-words text-[14.5px] leading-7
                        font-sans tracking-[0.005em]
                        ${isDark ? 'text-ink-100' : 'text-[#292B30]'}
                        [&>*:first-child]:mt-0
                        [&>*:last-child]:mb-0

                        [&_h1]:text-2xl
                        [&_h1]:font-semibold
                        [&_h1]:tracking-tight
                        [&_h1]:mt-7
                        [&_h1]:mb-3

                        [&_h2]:text-xl
                        [&_h2]:font-semibold
                        [&_h2]:tracking-tight
                        [&_h2]:mt-7
                        [&_h2]:mb-3

                        [&_h3]:text-base
                        [&_h3]:font-semibold
                        [&_h3]:mt-5
                        [&_h3]:mb-2

                        [&_p]:my-3
                        [&_strong]:font-semibold

                        [&_ul]:my-3
                        [&_ul]:list-disc
                        [&_ul]:pl-6

                        [&_ol]:my-3
                        [&_ol]:list-decimal
                        [&_ol]:pl-6

                        [&_li]:my-1.5
                        [&_li]:pl-1

                        [&_a]:underline
                        [&_a]:underline-offset-2
                        [&_a]:text-indigo-500

                        [&_blockquote]:my-4
                        [&_blockquote]:border-l-[3px]
                        [&_blockquote]:border-indigo-400
                        [&_blockquote]:pl-4
                        [&_blockquote]:italic

                        [&_table]:my-5
                        [&_table]:w-full
                        [&_table]:border-collapse
                        [&_table]:text-sm

                        [&_th]:px-3
                        [&_th]:py-2.5
                        [&_th]:text-left
                        [&_th]:font-semibold
                        [&_th]:border
                        [&_td]:px-3
                        [&_td]:py-2.5
                        [&_td]:border

                        [&_pre]:my-4
                        [&_pre]:overflow-x-auto
                        [&_pre]:rounded-lg
                        [&_pre]:p-4

                        [&_code]:font-mono
                        [&_code]:text-[0.9em]
                        [&_hr]:my-6
                        ${isDark
                          ? '[&_th]:border-ink-700 [&_td]:border-ink-700 [&_th]:bg-ink-800 [&_code]:bg-ink-800 [&_blockquote]:text-ink-300'
                          : '[&_th]:border-[#E5E2DA] [&_td]:border-[#E5E2DA] [&_th]:bg-[#F7F6F2] [&_code]:bg-[#F1EFE9] [&_blockquote]:text-[#656873]'
                        }
                      `}
                    >
                      {message.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-2 py-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span className={isDark ? 'text-ink-400' : 'text-parchment-500'}>
                            Retrieving sources and preparing an answer...
                          </span>
                        </div>
                      )}
                    </div>


                    {/* Citation Accordion */}
                    {message.citations?.length > 0 && (
                      <div
                        className={`mt-4 pt-3 border-t text-xs ${
                          isDark
                            ? 'border-ink-800'
                            : 'border-parchment-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleCitationExpansion(message.id)
                          }
                          className={`flex items-center justify-between w-full py-1 text-left font-medium ${
                            isDark
                              ? 'text-indigo-400 hover:text-indigo-300'
                              : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center space-x-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>
                              {message.citations.length} Source Passages
                              Cited
                            </span>
                          </span>

                          {expandedCitations[message.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {expandedCitations[message.id] && (
                          <div className="mt-2.5 space-y-2 animate-fade-in">
                            {message.citations.map((citation, citationIndex) => (
                              <div
                                key={citation.id || citationIndex}
                                className={`p-3 rounded-md border text-xs leading-relaxed ${
                                  isDark
                                    ? 'bg-ink-900 border-ink-750'
                                    : 'bg-parchment-50 border-parchment-200'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center space-x-2 font-medium flex-wrap">
                                    <FileText className="w-3.5 h-3.5 text-blue-500" />

                                    <span>
                                      {citation.fileName || 'Source Document'}
                                    </span>

                                    {citation.pageNumber != null && (
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] ${
                                          isDark
                                            ? 'bg-ink-800 text-ink-300'
                                            : 'bg-parchment-200 text-parchment-700'
                                        }`}
                                      >
                                        Page {citation.pageNumber}
                                      </span>
                                    )}

                                    {citation.chunkIndex != null && (
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] ${
                                          isDark
                                            ? 'bg-ink-800 text-ink-300'
                                            : 'bg-parchment-200 text-parchment-700'
                                        }`}
                                      >
                                        Chunk #{citation.chunkIndex}
                                      </span>
                                    )}
                                  </div>

                                  {citation.similarityScore != null && (
                                    <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                      {Math.round(
                                        citation.similarityScore * 100
                                      )}
                                      % match
                                    </span>
                                  )}
                                </div>

                                <p
                                  className={`italic ${
                                    isDark
                                      ? 'text-ink-300'
                                      : 'text-parchment-700'
                                  }`}
                                >
                                  "{citation.snippet || 'No passage text provided.'}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input */}
      <div
        className={`p-6 border-t ${
          isDark
            ? 'border-ink-800 bg-ink-950/40'
            : 'border-[#E8E6DF] bg-parchment-50'
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className={`rounded-xl border p-3 shadow-xs transition-all focus-within:ring-1 focus-within:ring-slate-400 ${
              isDark
                ? 'bg-ink-850 border-ink-750'
                : 'bg-white border-[#D6D2C4]'
            }`}
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputQuestion}
              onChange={(event) =>
                setInputQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                chatScopeDocId
                  ? `Ask about ${activeDocName}...`
                  : 'Ask about your sources...'
              }
              className={`w-full bg-transparent resize-none text-sm placeholder:text-parchment-400 dark:placeholder:text-ink-500 focus:outline-hidden ${
                isDark ? 'text-ink-100' : 'text-parchment-900'
              }`}
            />

            <div className="flex items-center justify-between pt-2 border-t border-inherit/40 text-xs">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className={`flex items-center space-x-1.5 py-1 px-2 rounded transition-colors ${
                    isDark
                      ? 'text-ink-400 hover:text-ink-200 hover:bg-ink-800'
                      : 'text-parchment-600 hover:text-parchment-900 hover:bg-parchment-100'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach</span>
                </button>

                <span
                  className={`text-[11px] hidden sm:inline ${
                    isDark ? 'text-ink-500' : 'text-parchment-400'
                  }`}
                >
                  Enter to send · Shift + Enter for a new line
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputQuestion.trim() || isGenerating}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-medium text-white transition-all shadow-xs ${
                  !inputQuestion.trim() || isGenerating
                    ? 'bg-slate-400/50 cursor-not-allowed opacity-50'
                    : 'bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-500'
                }`}
              >
                <span>{isGenerating ? 'Generating' : 'Ask'}</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}