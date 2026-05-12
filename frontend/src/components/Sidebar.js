import React from 'react';

function Sidebar({ isOpen, onToggle, history, currentChatId, onSelectChat, onNewChat, onDeleteChat }) {
  if (!isOpen) {
    return (
      <button className="sidebar-toggle" onClick={onToggle}>
        ☰
      </button>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Chat with LLM</h2>
        <button className="sidebar-close" onClick={onToggle}>×</button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        + New Chat
      </button>

      <div className="history-list">
        {history.map((chat) => (
          <div 
            key={chat.id} 
            className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="history-title">{chat.title}</span>
            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;