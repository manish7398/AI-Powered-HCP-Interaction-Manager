import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(env_path)

api_key = os.getenv("GROQ_API_KEY")

from langchain_groq import ChatGroq
llm = ChatGroq(
    model="llama-3.3-70b-versatile", 
    api_key=api_key
)

def get_llm():
    return llm