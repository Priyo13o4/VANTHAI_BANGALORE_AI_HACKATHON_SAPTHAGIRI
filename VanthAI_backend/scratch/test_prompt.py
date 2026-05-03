import sys
import os

# Add VanthAI_backend to path so we can import internal modules smoothly
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from agents.itr.prompts import build_system_prompt, load_page_markdown_from_disk
from agents.cloudcare.prompts import build_system_prompt as cloudcare_build_prompt

def test_itr_prompt():
    print("=== Testing ITR Assistant Prompt ===")
    
    url = "/itr/salary"
    user_id = "test-session-123"
    
    # We will Mock the KB load just for this local test script, pointing to our newly created files
    kb_path = os.path.join(os.path.dirname(__file__), "..", "..", "KB")
    kb_data = load_page_markdown_from_disk(url, kb_base=kb_path)
    
    prompt = build_system_prompt(
        current_page=url,
        user_id=user_id,
        page_markdown=kb_data
    )
    
    print(prompt)
    print("\n\n=== Verification: Cloudcare Prompt is completely separate ===")
    cloud_prompt = cloudcare_build_prompt("/cloudcare/patient/vitals", user_id, "Vitals info")
    
    print(f"Cloudcare Prompt starts with: {cloud_prompt.splitlines()[1]}") # Print just the role to show split
    
if __name__ == "__main__":
    test_tool()
