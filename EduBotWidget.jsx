import React, { useState, useEffect, useRef } from 'react';
import { useEduTrack } from '../context/EduTrackContext';
import { askEduBot } from '../services/aiService';

const WELCOME_MESSAGE =
  "Hi! I'm GurukulBot, your AI academic advisor. Ask me about student attendance risks, SAKEC Sem-III coursework, the 75% policy, or SDG 4 & 10 goals.";

const QUICK_PROMPTS = [
  "Who are the top defaulters (<75%)?",
  "How does eGurukul help SDG 4 & 10?",
  "Recommend recovery plan for at-risk students",
  "Explain Sem III passing & attendance criteria"
];

export default function EduBotWidget() {
  const { totalCount, defaulterStudents, avgAttendance } = useEduTrack();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('eduTrack_chatHistory'));
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (e) {}
    return [{ role: 'assistant', content: WELCOME_MESSAGE }];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef(null);

  // Sync chat history to localStorage
  useEffect(() => {
    localStorage.setItem('eduTrack_chatHistory', JSON.stringify(messages.slice(-30)));
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg = { role: 'user', content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const contextData = {
        totalStudents: totalCount,
        defaulters: defaulterStudents,
        averageAttendance: avgAttendance
      };
      const response = await askEduBot(query, newMessages, contextData);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having difficulty connecting right now. Please try again in a moment." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    const reset = [{ role: 'assistant', content: WELCOME_MESSAGE }];
    setMessages(reset);
    localStorage.setItem('eduTrack_chatHistory', JSON.stringify(reset));
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        id="etChatBtn"
        className="et-chat-btn"
        aria-label="Open GurukulBot assistant"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with GurukulBot AI"
      >
        <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-robot'}`}></i>
        <span className="et-chat-dot"></span>
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="et-chat-window" id="etChatWindow">
          <div className="et-chat-header">
            <div className="et-chat-header-title">
              <span className="et-status-dot"></span>
              <span>GurukulBot AI Advisor</span>
            </div>
            <div className="et-chat-header-actions d-flex gap-1">
              <button
                type="button"
                id="etChatClear"
                title="Clear conversation"
                onClick={handleClear}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              <button
                type="button"
                id="etChatClose"
                title="Close"
                onClick={() => setIsOpen(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div className="et-chat-body" ref={chatBodyRef} id="etChatBody">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`et-msg ${m.role === 'user' ? 'et-msg-user' : 'et-msg-bot'}`}
              >
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div className="et-msg et-msg-bot et-msg-typing">
                <span className="spinner-border spinner-border-sm text-primary me-2" role="status"></span>
                GurukulBot is thinking...
              </div>
            )}

            {/* Quick Prompt Chips */}
            {messages.length < 3 && !isLoading && (
              <div className="mt-2">
                <div className="small text-muted mb-1 fw-bold" style={{ fontSize: '0.72rem' }}>
                  Suggested queries:
                </div>
                <div className="chat-prompt-chips">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="chat-chip"
                      onClick={() => handleSend(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="et-chat-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              id="etChatInput"
              placeholder="Ask about students, risk policies, SDGs..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              id="etChatSend"
              disabled={isLoading || !inputValue.trim()}
              title="Send"
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
