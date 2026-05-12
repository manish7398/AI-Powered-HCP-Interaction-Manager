# HCP CRM - AI-First Healthcare Professional Interaction Manager

## Tech Stack
- **Frontend**: React + Redux (Google Inter font)
- **Backend**: FastAPI + LangGraph
- **LLM**: Groq gemma2-9b-it
- **Database**: MySQL/PostgreSQL (required for production)

## Assignment Requirements Verification

| Requirement | Status |
|-------------|--------|
| 6. Google Inter Font | ✅ VERIFIED - Loaded in public/index.html + index.css |
| 7. Log Interaction Screen | ✅ VERIFIED - Dual interface (Structured Form + Conversational Chat) |
| 8. 5 LangGraph Tools | ✅ VERIFIED - All tools implemented |

### 5 LangGraph Tools Implemented
1. **log_interaction** - Log HCP interactions with LLM summarization
2. **edit_interaction** - Modify logged data
3. **search_interactions** - Search by name/specialty
4. **schedule_followup** - Set follow-up reminders
5. **generate_summary** - Create HCP reports

## Setup

### MySQL Database Setup
1. Open MySQL Workbench
2. Create database:
```sql
CREATE DATABASE hcp_crm;
```
3. Update `.env` with your MySQL credentials

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add your GROQ_API_KEY to .env
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Features

### 5 LangGraph Tools
1. **log_interaction** - Log HCP interactions with LLM summarization
2. **edit_interaction** - Modify logged data
3. **search_interactions** - Search by name/specialty
4. **schedule_followup** - Set follow-up reminders
5. **generate_summary** - Create HCP reports

### Dual Interface
- Structured Form - Manual entry
- Conversational Chat - AI-powered natural language