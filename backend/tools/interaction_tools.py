from langchain_core.tools import tool
from llm import get_llm
from database import SessionLocal, Interaction, FollowUp, init_db
from datetime import datetime
import json

log_interaction_tool = None
edit_interaction_tool = None
search_interactions_tool = None
schedule_followup_tool = None
generate_summary_tool = None

def _init_tools():
    global log_interaction_tool, edit_interaction_tool, search_interactions_tool, schedule_followup_tool, generate_summary_tool
    
    init_db()
    
    @tool
    def log_interaction(hcp_name: str, specialty: str, interaction_date: str, interaction_type: str, discussion_summary: str, outcome: str, location: str = "", duration: int = 0, key_topics: str = "", notes: str = "", next_follow_up: str = "") -> dict:
        """Log a new HCP interaction with full details."""
        llm = get_llm()
        summary = ""
        if discussion_summary:
            try:
                summary = llm.invoke(f"Summarize this: {discussion_summary}").content
            except:
                summary = discussion_summary[:200]
        
        db = SessionLocal()
        try:
            topics_list = key_topics.split(",") if key_topics else []
            follow_up_dt = None
            if next_follow_up:
                try:
                    follow_up_dt = datetime.strptime(next_follow_up, "%Y-%m-%d")
                except:
                    pass
            
            interaction = Interaction(
                hcp_name=hcp_name,
                specialty=specialty,
                location=location,
                interaction_date=datetime.strptime(interaction_date, "%Y-%m-%d") if isinstance(interaction_date, str) else interaction_date,
                interaction_type=interaction_type,
                duration=duration,
                discussion_summary=discussion_summary,
                summary=summary,
                key_topics=topics_list,
                outcome=outcome,
                next_follow_up=follow_up_dt,
                notes=notes
            )
            db.add(interaction)
            db.commit()
            db.refresh(interaction)
            result = {
                "id": interaction.id,
                "hcp_name": interaction.hcp_name,
                "specialty": interaction.specialty,
                "location": interaction.location,
                "interaction_date": interaction.interaction_date.isoformat() if interaction.interaction_date else None,
                "interaction_type": interaction.interaction_type,
                "duration": interaction.duration,
                "discussion_summary": interaction.discussion_summary,
                "summary": interaction.summary,
                "key_topics": interaction.key_topics,
                "outcome": interaction.outcome,
                "next_follow_up": interaction.next_follow_up.isoformat() if interaction.next_follow_up else None,
                "notes": interaction.notes
            }
            return {"status": "success", "message": f"Interaction logged for {hcp_name}", "interaction": result}
        finally:
            db.close()

    @tool 
    def edit_interaction(interaction_id: str, **updates) -> dict:
        """Edit an existing interaction by ID."""
        db = SessionLocal()
        try:
            interaction = db.query(Interaction).filter(Interaction.id == int(interaction_id)).first()
            if not interaction:
                return {"status": "error", "message": "Interaction not found"}
            
            for key, value in updates.items():
                if hasattr(interaction, key):
                    setattr(interaction, key, value)
            
            interaction.updated_at = datetime.now()
            db.commit()
            db.refresh(interaction)
            
            result = {
                "id": interaction.id,
                "hcp_name": interaction.hcp_name,
                "specialty": interaction.specialty,
                "outcome": interaction.outcome
            }
            return {"status": "success", "message": f"Updated interaction {interaction_id}", "interaction": result}
        finally:
            db.close()

    @tool
    def search_interactions(query: str) -> dict:
        """Search HCP interactions by name, specialty, or date."""
        db = SessionLocal()
        try:
            results = db.query(Interaction).filter(
                (Interaction.hcp_name.ilike(f"%{query}%")) | 
                (Interaction.specialty.ilike(f"%{query}%"))
            ).all()
            
            interactions = []
            for i in results:
                interactions.append({
                    "id": i.id,
                    "hcp_name": i.hcp_name,
                    "specialty": i.specialty,
                    "interaction_date": i.interaction_date.isoformat() if i.interaction_date else None,
                    "outcome": i.outcome
                })
            
            return {"status": "success", "results": interactions, "count": len(interactions)}
        finally:
            db.close()

    @tool
    def schedule_followup(hcp_name: str, follow_up_date: str, notes: str = "") -> dict:
        """Schedule a follow-up reminder for an HCP."""
        db = SessionLocal()
        try:
            follow_up_dt = datetime.strptime(follow_up_date, "%Y-%m-%d")
            
            followup = FollowUp(
                hcp_name=hcp_name,
                follow_up_date=follow_up_dt,
                notes=notes
            )
            db.add(followup)
            db.commit()
            db.refresh(followup)
            
            result = {
                "id": followup.id,
                "hcp_name": followup.hcp_name,
                "follow_up_date": followup.follow_up_date.isoformat(),
                "notes": followup.notes
            }
            return {"status": "success", "message": f"Follow-up scheduled for {hcp_name} on {follow_up_date}", "follow_up": result}
        finally:
            db.close()

    @tool
    def generate_summary(hcp_name: str) -> dict:
        """Generate a summary report for an HCP's interactions."""
        db = SessionLocal()
        try:
            interactions = db.query(Interaction).filter(
                Interaction.hcp_name.ilike(f"%{hcp_name}%")
            ).order_by(Interaction.interaction_date).all()
            
            if not interactions:
                return {"status": "error", "message": "No interactions found"}
            
            total = len(interactions)
            positive = len([i for i in interactions if i.outcome and "Positive" in i.outcome])
            
            interaction_list = []
            for i in interactions:
                interaction_list.append({
                    "id": i.id,
                    "date": i.interaction_date.isoformat() if i.interaction_date else None,
                    "type": i.interaction_type,
                    "outcome": i.outcome,
                    "summary": i.summary
                })
            
            last_date = interactions[-1].interaction_date.isoformat() if interactions[-1].interaction_date else "N/A"
            summary = f"HCP: {hcp_name}\nTotal Interactions: {total}\nPositive: {positive}\nLast Interaction: {last_date}"
            
            return {"status": "success", "summary": summary, "interactions": interaction_list}
        finally:
            db.close()

    log_interaction_tool = log_interaction
    edit_interaction_tool = edit_interaction
    search_interactions_tool = search_interactions
    schedule_followup_tool = schedule_followup
    generate_summary_tool = generate_summary

_init_tools()

log_interaction = log_interaction_tool
edit_interaction = edit_interaction_tool
search_interactions = search_interactions_tool
schedule_followup = schedule_followup_tool
generate_summary = generate_summary_tool

TOOLS = [log_interaction, edit_interaction, search_interactions, schedule_followup, generate_summary]