from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from agents.hcp_agent import process_chat_message, create_hcp_agent
from database import SessionLocal, Interaction, FollowUp

app = FastAPI(title="HCP CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-powered-hcp-interaction-manager-hf9g4ss0y.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Interaction(BaseModel):
    hcp_name: str
    specialty: str
    interaction_date: str
    interaction_type: str
    discussion_summary: str
    outcome: str
    location: Optional[str] = ""
    duration: Optional[int] = 0
    key_topics: Optional[str] = ""
    notes: Optional[str] = ""
    next_follow_up: Optional[str] = ""

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

sessions = {}

@app.get("/")
def root():
    return {"message": "HCP CRM API Running", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "ok", "backend": "running"}

@app.post("/api/medical-chat")
def medical_chat(request: ChatRequest):
    """General medical consultation chat (not a substitute for professional advice)"""
    from llm import get_llm
    
    llm = get_llm()
    
    medical_prompt = f"""You are a helpful medical assistant. Provide general health information only. 
    ALWAYS add this disclaimer at the end of EVERY response: "⚠️ Disclaimer: This is general information only. 
    Please consult a qualified doctor for proper diagnosis and treatment. Do not use this as a substitute for professional medical advice."
    
    User question: {request.message}
    
    Provide helpful, accurate general health information. Do not diagnose specific conditions. Suggest when to see a doctor."""
    
    try:
        response = llm.invoke(medical_prompt)
        return {"response": response.content if hasattr(response, 'content') else str(response)}
    except Exception as e:
        return {"response": f"Sorry, I couldn't process your request. Please try again. Error: {str(e)}"}

@app.post("/api/interactions")
def create_interaction(interaction: Interaction):
    """Log a new HCP interaction."""
    from tools.interaction_tools import log_interaction
    
    try:
        result = log_interaction.invoke({
            "hcp_name": interaction.hcp_name,
            "specialty": interaction.specialty,
            "interaction_date": interaction.interaction_date,
            "interaction_type": interaction.interaction_type,
            "discussion_summary": interaction.discussion_summary,
            "outcome": interaction.outcome,
            "location": interaction.location or "",
            "duration": interaction.duration or 0,
            "key_topics": interaction.key_topics or "",
            "notes": interaction.notes or "",
            "next_follow_up": interaction.next_follow_up or ""
        })
        return result
    except Exception as e:
        print(f"Error logging interaction: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.get("/api/interactions")
def get_interactions():
    """Get all interactions."""
    db = SessionLocal()
    try:
        interactions = db.query(Interaction).order_by(Interaction.interaction_date.desc()).all()
        return [
            {
                "id": i.id,
                "hcp_name": i.hcp_name,
                "specialty": i.specialty,
                "location": i.location,
                "interaction_date": i.interaction_date.isoformat() if i.interaction_date else None,
                "interaction_type": i.interaction_type,
                "duration": i.duration,
                "discussion_summary": i.discussion_summary,
                "summary": i.summary,
                "key_topics": i.key_topics,
                "outcome": i.outcome,
                "next_follow_up": i.next_follow_up.isoformat() if i.next_follow_up else None,
                "notes": i.notes
            }
            for i in interactions
        ]
    finally:
        db.close()

@app.put("/api/interactions/{interaction_id}")
def update_interaction(interaction_id: str, interaction: Interaction):
    """Update an interaction."""
    from tools.interaction_tools import edit_interaction
    
    result = edit_interaction.invoke({"interaction_id": interaction_id, **interaction.dict()})
    return result

@app.post("/api/chat")
def chat(request: ChatRequest):
    """Chat with AI agent."""
    session_id = request.session_id or str(uuid.uuid4())
    session_data = sessions.get(session_id)
    
    result = process_chat_message(request.message, session_data)
    sessions[session_id] = result.get("session_data", {})
    
    return {"response": result["response"], "session_id": session_id}

@app.get("/api/tools")
def get_tools():
    """Get available tools."""
    return {
        "tools": [
            {"name": "log_interaction", "description": "Log a new HCP interaction"},
            {"name": "edit_interaction", "description": "Edit an existing interaction"},
            {"name": "search_interactions", "description": "Search interactions"},
            {"name": "schedule_followup", "description": "Schedule follow-up"},
            {"name": "generate_summary", "description": "Generate HCP summary"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)