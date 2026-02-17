from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

MODEL_NAME = "gemini-flash-latest"

def generate_summary(
    text: str,
    summary_type: str,
    target_words: int
) -> str:
    if summary_type == "bullet":
        instruction = (
            f"Summarize the following text into clear bullet points. "
            f"Use '-' for each bullet. Aim for around {target_words} words. "
            f"Do NOT write paragraphs."
        )
    else:
        instruction = (
            f"Summarize the following text into a concise paragraph "
            f"of around {target_words} words."
        )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are an accurate summarization assistant."},
            {"role": "user", "content": f"{instruction}\n\n{text}"}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content.strip()

