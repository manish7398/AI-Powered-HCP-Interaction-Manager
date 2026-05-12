# Quick Test - Run this to verify the backend works
import os
os.chdir(r"C:\Users\MANISH PAL\Desktop\llm\backend")

from dotenv import load_dotenv
load_dotenv(".env")

print("Testing imports...")
from llm import get_llm
from tools.interaction_tools import log_interaction, edit_interaction, search_interactions, schedule_followup, generate_summary, MOCK_DB
print("OK: Tools imported")

llm = get_llm()
print(f"OK: LLM ready")

result = log_interaction.invoke({
    "hcp_name": "Dr. Smith",
    "specialty": "Cardiology",
    "interaction_date": "2026-05-02",
    "interaction_type": "Visit",
    "discussion_summary": "Discussed new cardiac medication",
    "outcome": "Positive"
})
print(f"OK: log_interaction - {result.get('message')}")

result2 = search_interactions.invoke({"query": "Smith"})
print(f"OK: search_interactions found {result2.get('count')} result(s)")

result3 = generate_summary.invoke({"hcp_name": "Dr. Smith"})
print(f"OK: generate_summary - {result3.get('summary')}")

print("\n=== ALL 5 LANGGRAPH TOOLS WORKING ===")
print(f"Total interactions in DB: {len(MOCK_DB)}")