import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

export const logInteraction = createAsyncThunk(
  'interaction/log',
  async (interactionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/interactions`, interactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateInteraction = createAsyncThunk(
  'interaction/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/interactions/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInteractions = createAsyncThunk(
  'interaction/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/interactions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  interactionType: 'form',
  formData: {
    hcpName: '',
    specialty: '',
    location: '',
    interactionDate: new Date().toISOString().split('T')[0],
    interactionType: '',
    duration: '',
    discussionSummary: '',
    keyTopics: [],
    nextFollowUp: '',
    outcome: '',
    notes: '',
  },
  interactions: [],
  loading: false,
  error: null,
  status: 'idle',
};

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    setInteractionType: (state, action) => {
      state.interactionType = action.payload;
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logInteraction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.interactions.unshift(action.payload);
        state.status = 'success';
      })
      .addCase(logInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.status = 'failed';
      })
      .addCase(updateInteraction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.interactions.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.interactions[index] = action.payload;
        }
      })
      .addCase(updateInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.interactions = action.payload;
      });
  },
});

export const { setInteractionType, setFormData, resetForm, clearError } = interactionSlice.actions;
export default interactionSlice.reducer;