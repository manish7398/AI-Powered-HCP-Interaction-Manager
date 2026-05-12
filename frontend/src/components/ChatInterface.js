import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, sendMedicalChatMessage, clearChat } from '../features/chatSlice';
import { setFormData } from '../features/interactionSlice';

function ChatInterface({ currentChatTitle, onFillForm, showFillButton, fullHeight, appMode }) {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chat);
  const { formData } = useSelector((state) => state.interaction);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (appMode === 'medical' && messages.length === 1) {
      // Welcome message for medical mode
      const medicalWelcome = {
        id: 'medical-welcome',
        role: 'assistant',
        content: "🩺 Hello! I'm your medical assistant. I can help you with general health information.\n\nYou can ask me about:\n• Common symptoms\n• General health advice\n• Medication information\n• When to see a doctor\n\n⚠️ Remember: This is general information only. Always consult a doctor for proper diagnosis!\n\nWhat would you like to know?",
        timestamp: new Date().toISOString(),
      };
      // Don't add again if already there
    }
  }, [appMode]);

  const parseExtractedData = (content) => {
    try {
      const htmlCommentMatch = content.match(/<!-- extracted_data: ({[\s\S]*}) -->/);
      if (htmlCommentMatch) {
        const parsed = JSON.parse(htmlCommentMatch[1]);
        if (parsed.extracted_data) {
          return parsed.extracted_data;
        }
      }
      
      const jsonMatch = content.match(/\{[\s\S]*"extracted_data"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.extracted_data) {
          return parsed.extracted_data;
        }
      }
      
      const simpleMatch = content.match(/\{[\s\S]*"hcp_name"[\s\S]*\}/);
      if (simpleMatch) {
        const parsed = JSON.parse(simpleMatch[0]);
        if (parsed.hcp_name || parsed.specialty) {
          return parsed;
        }
      }
      
      if (content.includes('HCP Name:') || content.includes('**HCP Name:**')) {
        const data = {};
        const hcpMatch = content.match(/(?:\*\*)?HCP Name(?:\*\*)?:\s*([^\n]+)/i);
        if (hcpMatch) data.hcp_name = hcpMatch[1].trim();
        
        const specialtyMatch = content.match(/(?:\*\*)?Specialty(?:\*\*)?:\s*([^\n]+)/i);
        if (specialtyMatch) data.specialty = specialtyMatch[1].trim();
        
        const dateMatch = content.match(/(?:\*\*)?Date(?:\*\*)?:\s*(\d{4}-\d{2}-\d{2})/i);
        if (dateMatch) data.interaction_date = dateMatch[1];
        
        const typeMatch = content.match(/(?:\*\*)?Type(?:\*\*)?:\s*([^\n]+)/i);
        if (typeMatch) data.interaction_type = typeMatch[1].trim();
        
        const outcomeMatch = content.match(/(?:\*\*)?Outcome(?:\*\*)?:\s*([^\n]+)/i);
        if (outcomeMatch) data.outcome = outcomeMatch[1].trim();
        
        if (Object.keys(data).length > 0) return data;
      }
    } catch (e) {
      console.log("Parse error:", e);
    }
    return null;
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !lastMessage.id.includes('error') && appMode === 'hcp') {
        const extracted = parseExtractedData(lastMessage.content);
        if (extracted) {
          setExtractedData(extracted);
          setShowSuggestions(true);
        }
      }
    }
  }, [messages, appMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    
    const userMessage = inputValue;
    setInputValue('');
    
    if (appMode === 'medical') {
      dispatch(sendMedicalChatMessage(userMessage));
    } else {
      dispatch(sendChatMessage(userMessage));
    }
  };

  const handleExtractToForm = () => {
    if (extractedData) {
      dispatch(setFormData({
        hcpName: extractedData.hcp_name || extractedData.hcpName || formData.hcpName,
        specialty: extractedData.specialty || formData.specialty,
        location: extractedData.location || formData.location,
        interactionDate: extractedData.interaction_date || extractedData.date || formData.interactionDate,
        interactionType: extractedData.interaction_type || extractedData.type || formData.interactionType,
        discussionSummary: extractedData.summary || extractedData.discussion_summary || extractedData.discussionSummary || formData.discussionSummary,
        outcome: extractedData.outcome || formData.outcome,
        duration: extractedData.duration || formData.duration,
        keyTopics: extractedData.key_topics || extractedData.keyTopics || formData.keyTopics,
        notes: extractedData.notes || formData.notes,
        nextFollowUp: extractedData.next_follow_up || extractedData.nextFollowUp || formData.nextFollowUp
      }));
      setShowSuggestions(false);
      setExtractedData(null);
      
      if (onFillForm) {
        onFillForm(extractedData);
      }
    }
  };

  const getWelcomeMessage = () => {
    if (appMode === 'medical') {
      return {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your medical assistant. I can provide general health information.\n\nYou can ask about:\n- Common symptoms and general guidance\n- General health advice\n- Basic medication information\n- When to consult a doctor\n\nNote: This is general information only. Please consult a qualified doctor for proper diagnosis and treatment.\n\nHow can I help you today?",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI assistant for logging HCP interactions. You can describe your interaction naturally, and I'll help structure and log the details.\n\nFor example: 'I met with Dr. Sarah Johnson, a cardiologist at City Hospital yesterday about the new diabetes drug and she seemed very interested.'\n\nHow would you like to proceed?",
      timestamp: new Date().toISOString(),
    };
  };

  const displayMessages = messages.length === 0 || (messages.length === 1 && messages[0].id === 'welcome') 
    ? [getWelcomeMessage(), ...messages.filter(m => m.id !== 'welcome')]
    : messages;

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>{currentChatTitle || 'Chat'}</h2>
        {showFillButton && appMode === 'hcp' && (
          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
            Describe your interaction naturally
          </span>
        )}
        {appMode === 'medical' && (
          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
            General health queries only
          </span>
        )}
      </div>

      <div className="chat-messages-container">
        <div className="chat-messages">
          {displayMessages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? 'U' : msg.role === 'assistant' ? (appMode === 'medical' ? 'M' : 'AI') : 'E'}
              </div>
              <div className="message-bubble">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message ai-message">
              <div className="message-avatar">{appMode === 'medical' ? 'M' : 'AI'}</div>
              <div className="message-bubble loading">
                <span className="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          )}

          {showSuggestions && extractedData && appMode === 'hcp' && (
            <div className="ai-suggestion-banner">
              <h4>✨ Extracted Data from Chat</h4>
              {extractedData.hcp_name && (
                <div className="suggestion-item">
                  <span className="suggestion-label">HCP Name:</span>
                  <span className="suggestion-value">{extractedData.hcp_name}</span>
                </div>
              )}
              {extractedData.specialty && (
                <div className="suggestion-item">
                  <span className="suggestion-label">Specialty:</span>
                  <span className="suggestion-value">{extractedData.specialty}</span>
                </div>
              )}
              {extractedData.interaction_type && (
                <div className="suggestion-item">
                  <span className="suggestion-label">Type:</span>
                  <span className="suggestion-value">{extractedData.interaction_type}</span>
                </div>
              )}
              {extractedData.interaction_date && (
                <div className="suggestion-item">
                  <span className="suggestion-label">Date:</span>
                  <span className="suggestion-value">{extractedData.interaction_date}</span>
                </div>
              )}
              {extractedData.outcome && (
                <div className="suggestion-item">
                  <span className="suggestion-label">Outcome:</span>
                  <span className="suggestion-value">{extractedData.outcome}</span>
                </div>
              )}
              <button className="apply-suggestion-btn" onClick={handleExtractToForm}>
                ✅ Apply to Form
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={appMode === 'medical' 
            ? "Enter your health query..." 
            : "Enter interaction details..."}
          disabled={loading}
        />
        <button type="submit" className="send-btn" disabled={loading || !inputValue.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;