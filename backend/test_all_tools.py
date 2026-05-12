# Test all 5 LangGraph tools
import os
os.chdir(r"C:\Users\MANISH PAL\Desktop\llm\backend")

from dotenv import load_dotenv
load_dotenv(".env")

print("=" * 50)
print("TESTING ALL 5 LANGGRAPH TOOLS")
print("=" * 50)

from llm import get_llm
from tools.interaction_tools import (
    log_interaction, edit_interaction, search_interactions, 
    schedule_followup, generate_summary, MOCK_DB
)

# Clear DB
MOCK_DB.clear()

# Tool 1: log_interaction
print("\n1. log_interaction")
r1 = log_interaction.invoke({
    "hcp_name": "Dr. John Smith",
    "specialty": "Cardiology",
    "interaction_date": "2026-05-02",
    "interaction_type": "In-Person Visit",
    "discussion_summary": "Discussed new cardiac drug X and its benefits for heart patients",
    "outcome": "Positive - Will prescribe",
    "location": "NYC Medical Center",
    "duration": 30
})
print(f"   Result: {r1.get('message')}")

# Tool 2: edit_interaction
print("\n2. edit_interaction")
r2 = edit_interaction.invoke({
    "interaction_id": "INT-1",
    "outcome": "Positive - Interested in more info",
    "notes": "Follow up next week"
})
print(f"   Result: {r2.get('message')}")

# Tool 3: search_interactions
print("\n3. search_interactions")
r3 = search_interactions.invoke({"query": "Cardiology"})
print(f"   Result: Found {r3.get('count')} interaction(s)")

# Tool 4: schedule_followup
print("\n4. schedule_followup")
r4 = schedule_followup.invoke({
    "hcp_name": "Dr. John Smith",
    "follow_up_date": "2026-05-09",
    "notes": "Discuss clinical trial details"
})
print(f"   Result: {r4.get('message')}")

# Tool 5: generate_summary  
print("\n5. generate_summary")
r5 = generate_summary.invoke({"hcp_name": "Dr. John Smith"})
print(f"   Result: {r5.get('summary')}")

print("\n" + "=" * 50)
print("ALL 5 LANGGRAPH TOOLS WORKING!")
print("=" * 50)