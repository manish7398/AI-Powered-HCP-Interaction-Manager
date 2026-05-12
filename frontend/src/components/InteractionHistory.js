import React, { useState } from 'react';
import { useSelector } from 'react-redux';

function InteractionHistory() {
  const { interactions } = useSelector((state) => state.interaction);
  return (
    <div className="history-container">
      <h2>History</h2>
      <div className="history-list">
        {interactions.length === 0 ? <p>No interactions yet</p> : interactions.map((i, idx) => (
          <div key={i.id || idx} className="card">
            <h3>{i.hcpName}</h3><span>{i.specialty}</span><p>{i.discussionSummary}</p>
          </div>))}
      </div>
    </div>
  );
}
export default InteractionHistory;