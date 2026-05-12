import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ChatInterface from './components/ChatInterface';
import InteractionForm from './components/InteractionForm';
import { setFormData } from './features/interactionSlice';
import { clearChat } from './features/chatSlice';
import './styles/App.css';

function App() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('form');
  const [appMode, setAppMode] = useState('hcp');

  const handleFillFromChat = (extractedData) => {
    dispatch(setFormData(extractedData));
    setActiveTab('form');
  };

  const handleModeChange = (mode) => {
    setAppMode(mode);
    dispatch(clearChat());
    if (mode === 'medical') {
      setActiveTab('chat');
    } else {
      setActiveTab('form');
    }
  };

  return (
    <div className="app-container">
      <div className="main-layout">
        <div className="left-panel">
          <div className="panel-header">
            <h1>HCP CRM</h1>
            <p>
              {appMode === 'hcp' 
                ? 'Healthcare Professional Interaction Manager' 
                : 'Medical Assistant'}
            </p>
          </div>

          <div className="mode-toggle">
            <button 
              className={`mode-btn ${appMode === 'hcp' ? 'active' : ''}`}
              onClick={() => handleModeChange('hcp')}
            >
              🏥 HCP Interaction
            </button>
            <button 
              className={`mode-btn ${appMode === 'medical' ? 'active' : ''}`}
              onClick={() => handleModeChange('medical')}
            >
              🩺 Medical Chat
            </button>
          </div>

          {appMode === 'hcp' && (
            <>
              <div className="tab-buttons">
                <button 
                  className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                  onClick={() => setActiveTab('form')}
                >
                  📝 Form
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  💬 AI Assistant
                </button>
              </div>

              <div className="panel-content">
                {activeTab === 'form' ? (
                  <InteractionForm />
                ) : (
                  <div className="chat-only-mode">
                    <ChatInterface 
                      currentChatTitle="AI Assistant"
                      onFillForm={handleFillFromChat}
                      showFillButton={true}
                      appMode={appMode}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {appMode === 'medical' && (
            <div className="medical-welcome">
              <div className="medical-icon">🩺</div>
              <h2>Medical Assistant</h2>
              <p>Ask me about general health issues, symptoms, or general medical information.</p>
              <div className="medical-disclaimer">
                ⚠️ <strong>Disclaimer:</strong> This is general information only. 
                Please consult a qualified doctor for proper diagnosis and treatment.
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="panel-header">
            <h2>
              {appMode === 'hcp' ? 'AI Assistant' : 'Medical Assistant'}
            </h2>
            <p>
              {appMode === 'hcp' 
                ? 'Natural language interaction logging' 
                : 'General health information assistant'}
            </p>
          </div>
          <div className="chat-container">
            <ChatInterface 
              currentChatTitle={appMode === 'hcp' ? 'AI Assistant' : 'Medical Assistant'}
              onFillForm={handleFillFromChat}
              showFillButton={appMode === 'hcp'}
              fullHeight={true}
              appMode={appMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;