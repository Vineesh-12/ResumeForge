import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, User, RefreshCw, Trash2, CheckCircle2, RotateCcw } from 'lucide-react'
import { chatEditResume } from '../../services/resumeChat'
import { useApp } from '../../context/AppContext'
import './ResumeChat.css'

const QUICK_PROMPTS = [
  '⚡ Make my summary more leadership focused',
  '📈 Add quantifiable % metrics to experience',
  '🎯 Emphasize target JD keywords in projects',
  '✂️ Shorten bullets to fit single page',
  '🛠️ Add Docker & Kubernetes to technical skills'
]

/**
 * Cleanly formats markdown text into React elements without raw asterisks
 */
function FormattedMessage({ text }) {
  if (!text) return null

  // Split by newlines
  const lines = text.split('\n')

  return (
    <div className="formatted-msg-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="msg-blank-line" />

        // Bullet point check
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')
        const contentText = isBullet ? trimmed.replace(/^[-•*]\s*/, '') : trimmed

        // Parse bold and italics safely
        const parts = contentText.split(/(\*\*.*?\*\*|\*.*?\*)/g)
        const parsedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx}>{part.slice(2, -2)}</strong>
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={pIdx}>{part.slice(1, -1)}</em>
          }
          return part
        })

        if (isBullet) {
          return (
            <div key={idx} className="msg-bullet-row">
              <span className="msg-bullet-dot">•</span>
              <span>{parsedLine}</span>
            </div>
          )
        }

        return <p key={idx} className="msg-paragraph">{parsedLine}</p>
      })}
    </div>
  )
}

export default function ResumeChat({ currentResume, onResumeUpdated }) {
  const { state, dispatch } = useApp()
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hi! I'm your ResumeForge AI Copilot. You can ask me career questions or give direct instructions to edit, rewrite, or enhance any section of your resume.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modifiedSections: []
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [previousResumeHistory, setPreviousResumeHistory] = useState([])
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isSending])

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || isSending) return

    if (!state.apiKey) {
      dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please configure your Gemini API Key to chat with the AI Copilot.'
      })
      return
    }

    const userMsgObj = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsgObj])
    setInputMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px'
    }
    setIsSending(true)

    try {
      const activeResume = currentResume || state.tailoredResume || state.resumeParsed
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }))

      const result = await chatEditResume({
        currentResume: activeResume,
        userMessage: text,
        chatHistory,
        jdParsed: state.jdParsed,
        apiKey: state.apiKey
      })

      const botMsgObj = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: result.reply || 'Here is what I found.',
        modifiedSections: (result.isResumeModified && result.modifiedSections) ? result.modifiedSections : [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMsgObj])

      // Only update resume state if the AI explicitly modified sections
      if (result.isResumeModified && result.updatedResume) {
        // Save previous version for undo
        setPreviousResumeHistory(prev => [...prev, activeResume])

        dispatch({
          type: 'SET_TAILORED_RESUME',
          payload: {
            tailoredResume: result.updatedResume,
            changesLog: state.changesLog || [],
            skillSuggestions: state.skillSuggestions || []
          }
        })
        if (onResumeUpdated) {
          onResumeUpdated(result.updatedResume)
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      const errorMsgObj = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ Request failed: ${err.message || 'Please try again.'}`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMsgObj])
    } finally {
      setIsSending(false)
    }
  }

  const handleUndoLast = () => {
    if (previousResumeHistory.length === 0) return
    const lastVersion = previousResumeHistory[previousResumeHistory.length - 1]
    const updatedHistory = previousResumeHistory.slice(0, -1)
    setPreviousResumeHistory(updatedHistory)

    dispatch({
      type: 'SET_TAILORED_RESUME',
      payload: {
        tailoredResume: lastVersion,
        changesLog: state.changesLog || [],
        skillSuggestions: state.skillSuggestions || []
      }
    })

    if (onResumeUpdated) {
      onResumeUpdated(lastVersion)
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        text: '↩️ Undid the last change and restored your previous resume version.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modifiedSections: []
      }
    ])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: "✨ Chat cleared! What would you like to ask or change next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modifiedSections: []
      }
    ])
  }

  return (
    <div className="resume-chat-widget glass-card">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <div className="chat-bot-avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <h4>AI Resume Copilot</h4>
            <span className="chat-status-text">
              <span className="online-dot" /> Live Editor Connected
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          {previousResumeHistory.length > 0 && (
            <button
              type="button"
              className="btn-undo-chat"
              onClick={handleUndoLast}
              title="Undo last AI modification"
            >
              <RotateCcw size={13} />
              <span>Undo</span>
            </button>
          )}

          <button
            type="button"
            className="btn-clear-chat"
            onClick={handleClearChat}
            title="Clear conversation history"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="quick-prompts-bar">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-prompt-chip"
            onClick={() => handleSendMessage(prompt)}
            disabled={isSending}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-container">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant'

          return (
            <div
              key={msg.id}
              className={`chat-message-bubble-row ${isBot ? 'row-bot' : 'row-user'} animate-fade-in`}
            >
              <div className="message-avatar">
                {isBot ? <Bot size={15} /> : <User size={15} />}
              </div>

              <div className={`message-bubble ${isBot ? 'bubble-bot' : 'bubble-user'} ${msg.isError ? 'bubble-error' : ''}`}>
                <FormattedMessage text={msg.text} />

                {/* Section Modified Tags */}
                {msg.modifiedSections && msg.modifiedSections.length > 0 && (
                  <div className="modified-sections-strip">
                    <CheckCircle2 size={12} className="text-success" />
                    <span>Updated Live: {msg.modifiedSections.join(', ')}</span>
                  </div>
                )}

                <span className="message-time">{msg.timestamp}</span>
              </div>
            </div>
          )
        })}

        {/* AI Typing Indicator */}
        {isSending && (
          <div className="chat-message-bubble-row row-bot animate-fade-in">
            <div className="message-avatar">
              <Bot size={15} />
            </div>
            <div className="message-bubble bubble-bot bubble-typing">
              <RefreshCw size={14} className="animate-spin text-purple" />
              <span className="text-xs text-muted">AI Copilot is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="chat-input-bar">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Ask a question or request a change (e.g. 'Add GraphQL to skills')..."
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value)
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto'
              const newH = Math.min(textareaRef.current.scrollHeight, 200)
              textareaRef.current.style.height = `${Math.max(42, newH)}px`
            }
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isSending}
        />
        <button
          type="button"
          className="btn-send-message"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isSending}
          title="Send message"
        >
          {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
