from langgraph.prebuilt import create_react_agent
from llm import get_llm
from tools.interaction_tools import TOOLS
import json
import re

llm = None

def get_llm_instance():
    global llm
    if llm is None:
        llm = get_llm()
    return llm

def create_hcp_agent():
    """Create LangGraph HCP agent with 5 tools."""
    return create_react_agent(get_llm_instance(), TOOLS, prompt="You are an HCP CRM assistant. Use the tools to help log and manage healthcare professional interactions.")

def extract_interaction_data(user_message: str) -> dict:
    """Extract interaction data from natural language using LLM."""
    llm = get_llm_instance()
    
    extraction_prompt = f"""Extract HCP interaction details from this message. Return ONLY a JSON object with these fields:
- hcp_name (doctor's name, include "Dr." if mentioned)
- specialty (medical specialty)
- location (hospital/clinic name)
- interaction_date (YYYY-MM-DD, default to today if not specified)
- interaction_type (Visit/Call/Email/Virtual Meeting/Conference)
- duration (minutes as integer)
- discussion_summary (key points discussed)
- outcome (Positive/Neutral/Negative/Follow-up Scheduled)
- key_topics (comma-separated topics)
- notes (any additional notes)
- next_follow_up (YYYY-MM-DD if mentioned)

Message: {user_message}

Return ONLY valid JSON, no other text:"""

    try:
        result = llm.invoke(extraction_prompt)
        content = result.content if hasattr(result, 'content') else str(result)
        
        # Clean up the response
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        data = json.loads(content.strip())
        return data
    except Exception as e:
        print(f"Extraction error: {e}")
        return {}

def create_conversational_agent():
    """Create conversational agent for chat interface."""
    return create_react_agent(get_llm_instance(), TOOLS, prompt="""You are a helpful CRM assistant for logging HCP interactions. When user describes an interaction, parse it and use log_interaction tool. Always confirm when saved.""")

def process_chat_message(user_message: str, session_data: dict = None):
    """Process a chat message and return response with extracted data."""
    extracted = extract_interaction_data(user_message)
    
    response_parts = []
    
    if extracted:
        response_parts.append(f"I've extracted the following information from your message:\n")
        response_parts.append(f"• **HCP Name:** {extracted.get('hcp_name', 'N/A')}")
        response_parts.append(f"• **Specialty:** {extracted.get('specialty', 'N/A')}")
        response_parts.append(f"• **Location:** {extracted.get('location', 'N/A')}")
        response_parts.append(f"• **Date:** {extracted.get('interaction_date', 'N/A')}")
        response_parts.append(f"• **Type:** {extracted.get('interaction_type', 'N/A')}")
        response_parts.append(f"• **Outcome:** {extracted.get('outcome', 'N/A')}")
        if extracted.get('discussion_summary'):
            response_parts.append(f"• **Summary:** {extracted.get('discussion_summary')[:100]}...")
        
        response_parts.append("\n✨ Click 'Apply to Form' to fill the form with this data, or I can log it directly.")
    
    # Try to log the interaction
    try:
        agent = create_conversational_agent()
        tool_result = agent.invoke({"messages": [{"role": "user", "content": f"Log this interaction: {user_message}"}]})
        
        # Check if interaction was logged
        for msg in tool_result.get("messages", []):
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    if tc.get("name") == "log_interaction":
                        response_parts.append("\n✅ Interaction has been logged to the database!")
                        break
    except Exception as e:
        print(f"Tool execution error: {e}")
    
    # Add extracted data JSON for frontend
    response_parts.append(f"\n\n<!-- extracted_data: {json.dumps({'extracted_data': extracted})} -->")
    
    full_response = "\n".join(response_parts)
    return {"response": full_response, "session_data": session_data}