import sys
import os
from dotenv import load_dotenv
import google.genai as genai
from google.genai import types

def analyze():
    load_dotenv()
    image_path = "/var/folders/d2/7xqzql994yb76jwgfsj3m_300000gn/T/TemporaryItems/NSIRD_screencaptureui_MXnsdA/Screenshot 2026-07-05 at 21.26.58.png"
    if not os.path.exists(image_path):
        print("Image not found at path")
        return
        
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    sample_file = client.files.upload(file=image_path)
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            "Please describe this screenshot in extreme detail. Focus on any UI bugs, errors, glitches, or visual issues. What is the context? What is broken?",
            sample_file
        ]
    )
    print(response.text)

if __name__ == "__main__":
    analyze()
