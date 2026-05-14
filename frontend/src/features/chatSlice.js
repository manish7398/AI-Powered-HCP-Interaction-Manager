import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const sendChatMessage = createAsyncThunk(
  'chat/send',
  async (message, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, { message });
      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error);
      return rejectWithValue(error.response?.data || { error: error.message, details: error.toString() });
    }
  }
);

export const sendMedicalChatMessage = createAsyncThunk(
  'chat/medicalSend',
  async (message, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/medical-chat`, { message });
      return response.data;
    } catch (error) {
      console.error('Medical Chat API Error:', error);
      return rejectWithValue(error.response?.data || { error: error.message, details: error.toString() });
    }
  }
);

const initialState = {
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI assistant for logging HCP interactions. Describe your interaction naturally, and I'll help structure and log the details.",
      timestamp: new Date().toISOString(),
    },
  ],
  loading: false,
  error: null,
  sessionId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    addAssistantMessage: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearChat: (state) => {
      state.messages = initialState.messages;
      state.sessionId = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: action.payload.response,
          timestamp: new Date().toISOString(),
        });
        if (action.payload.sessionId) {
          state.sessionId = action.payload.sessionId;
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to connect to AI assistant. Please check your API configuration.';
        state.messages.push({
          id: Date.now().toString() + '-error',
          role: 'assistant',
          content: "Sorry, I couldn't connect to the AI server. Please make sure the API is properly configured.",
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendMedicalChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMedicalChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: Date.now().toString() + '-assistant',
          role: 'assistant',
          content: action.payload.response,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendMedicalChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to connect to medical assistant.';
        state.messages.push({
          id: Date.now().toString() + '-error',
          role: 'assistant',
          content: "Sorry, I couldn't connect to the medical assistant. Please try again.",
          timestamp: new Date().toISOString(),
        });
      });
  },
});

export const { addUserMessage, addAssistantMessage, clearChat, clearError } = chatSlice.actions;
export default chatSlice.reducer;