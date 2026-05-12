import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFormData, logInteraction, resetForm } from '../features/interactionSlice';

function InteractionForm() {
  const dispatch = useDispatch();
  const { formData, loading, error, status } = useSelector((state) => state.interaction);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleChange = (field, value) => dispatch(setFormData({ [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    
    const payload = {
      hcp_name: formData.hcpName,
      specialty: formData.specialty,
      location: formData.location || '',
      interaction_date: formData.interactionDate,
      interaction_type: formData.interactionType,
      discussion_summary: formData.discussionSummary,
      outcome: formData.outcome,
      duration: formData.duration ? parseInt(formData.duration) : 0,
      key_topics: Array.isArray(formData.keyTopics) ? formData.keyTopics.join(', ') : (formData.keyTopics || ''),
      notes: formData.notes || '',
      next_follow_up: formData.nextFollowUp || ''
    };
    
    console.log('Submitting interaction:', payload);
    
    const result = await dispatch(logInteraction(payload));
    
    if (logInteraction.fulfilled.match(result)) {
      setShowSuccess(true);
      dispatch(resetForm());
      setTimeout(() => setShowSuccess(false), 3000);
      console.log('Interaction saved successfully!');
    } else {
      setShowError(true);
      console.error('Error saving interaction:', result.payload);
    }
  };

  const handleClear = () => {
    dispatch(resetForm());
    setShowError(false);
  };

  const isFormComplete = formData.hcpName && formData.specialty && 
    formData.interactionDate && formData.interactionType && 
    formData.discussionSummary && formData.outcome;

  return (
    <div className="interaction-form-container">
      {showSuccess && <div className="success-message">✅ Interaction logged successfully!</div>}
      {showError && (
        <div className="error-message">
          ❌ Error: {error?.message || 'Failed to save interaction. Check if backend is running.'}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">👤 HCP Details</h3>
          <div className="form-group">
            <label>HCP Name *</label>
            <input 
              type="text" 
              placeholder="Dr. John Smith"
              value={formData.hcpName}
              onChange={(e) => handleChange('hcpName', e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Specialty *</label>
              <select 
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                required
              >
                <option value="">Select Specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Practice">General Practice</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                placeholder="Hospital/Clinic name"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">📅 Interaction Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input 
                type="date" 
                value={formData.interactionDate}
                onChange={(e) => handleChange('interactionDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select 
                value={formData.interactionType}
                onChange={(e) => handleChange('interactionType', e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="Visit">In-Person Visit</option>
                <option value="Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="Virtual Meeting">Virtual Meeting</option>
                <option value="Conference">Conference</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input 
                type="number" 
                placeholder="30"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Outcome *</label>
              <select 
                value={formData.outcome}
                onChange={(e) => handleChange('outcome', e.target.value)}
                required
              >
                <option value="">Select Outcome</option>
                <option value="Positive">Positive - Interested</option>
                <option value="Neutral">Neutral - Needs Follow-up</option>
                <option value="Negative">Not Interested</option>
                <option value="Follow-up Scheduled">Follow-up Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">📝 Discussion</h3>
          <div className="form-group">
            <label>Discussion Summary *</label>
            <textarea 
              placeholder="Describe the key points discussed..."
              value={formData.discussionSummary}
              onChange={(e) => handleChange('discussionSummary', e.target.value)}
              rows="4"
              required
            />
          </div>
          <div className="form-group">
            <label>Key Topics (comma separated)</label>
            <input 
              type="text" 
              placeholder="Drug efficacy, Side effects, Pricing"
              value={Array.isArray(formData.keyTopics) ? formData.keyTopics.join(', ') : (formData.keyTopics || '')}
              onChange={(e) => handleChange('keyTopics', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea 
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Next Follow-up Date</label>
            <input 
              type="date" 
              value={formData.nextFollowUp}
              onChange={(e) => handleChange('nextFollowUp', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="clear-btn" onClick={handleClear}>
            Clear Form
          </button>
          <button type="submit" className="submit-btn" disabled={loading || !isFormComplete}>
            {loading ? 'Saving...' : 'Log Interaction'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InteractionForm;