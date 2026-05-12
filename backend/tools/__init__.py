from .interaction_tools import log_interaction, edit_interaction, search_interactions, schedule_followup, generate_summary

TOOLS = [log_interaction, edit_interaction, search_interactions, schedule_followup, generate_summary]

TOOL_DESCRIPTIONS = {
    "log_interaction": "Log a new HCP interaction with details like name, specialty, discussion summary, outcome",
    "edit_interaction": "Edit an existing logged interaction by ID",
    "search_interactions": "Search for HCP interactions by name, specialty, or date",
    "schedule_followup": "Schedule a follow-up reminder for an HCP",
    "generate_summary": "Generate a summary report for an HCP"
}