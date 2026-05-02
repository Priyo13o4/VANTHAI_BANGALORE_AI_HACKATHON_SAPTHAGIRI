# Cloudcare Agent UI Tools & Architecture Refactor Plan

## 1. Objective
Currently, the Text Agent and Voice Agent for Cloudcare have diverging architectures. The Text Agent uses rigid JSON schemas for UI actions (navigation, highlighting, tours) while the Voice Agent uses the Gemini Live WebSocket API and only has access to limited Python tools.

This plan unifies the architecture by converting UI interactions into standard, callable Python tools (`highlight_element`, `navigate_to`, `start_tour`). This lets both the LangGraph text agent and the Gemini Live voice agent invoke UI changes naturally, ensuring the friend's frontend UI improvements connect seamlessly.

## 2. Addressing Current Ambiguities

| Issue | Current State | Planned State |
| :--- | :--- | :--- |
| **JSON vs Tool Confusion** | Text agent is told to output JSON *and* use tools, causing decision paralysis. | Text agent outputs standard text. UI updates are handled exclusively by invoking Python tools. |
| **Voice Agent Capabilities** | Voice agent can't highlight or start tours because it can't output the complex JSON schema. | Voice agent gets access to the new explicit UI tools via function calling. "Highlighting" becomes a native voice capability. |
| **Prompt Drift** | Voice agent has hardcoded dummy data (`Patient: 1`). Text agent dynamically fetches IDs. | Unified context builder for both agents to guarantee identical page grounding and session data. |

## 3. The Three Core UI Tools

Instead of relying on the LLM to format a perfect JSON payload, we will expose three distinct, isolated tools. These tools will fire events over the WebSocket connection to trigger the UI without disrupting the conversational flow.

### A. The Navigation Tool
Moves the user to a different route.

```python
async def navigate_to(ws, url: str):
    """
    Moves the user's browser to the specified URL.
    Use this when the user asks about records, appointments, or vitals and is not on that page.
    """
    await ws.send_json({"type": "ui_action", "action": "navigate", "url": url})
```

### B. The Highlight Tool
Seamlessly spotlights a specific DOM element. The LLM only needs to provide the `data-vanthai-id`. Note: Frontend UI handles the aesthetics (how the highlight looks).

```python
async def highlight_element(ws, element_id: str):
    """
    Highlights a specific element on the screen to focus the user's attention.
    Provide the exact data-vanthai-id (e.g., 'cloudcare-records-latest').
    """
    await ws.send_json({"type": "ui_action", "action": "highlight", "element": element_id})
```

### C. The Tour Tool
Starts an interactive product tour (like step-by-step guidance for booking an appointment).

```python
async def start_tour(ws, tour_name: str, start_url: str = None):
    """
    Starts an interactive guided tour. If start_url is provided, navigates there first.
    Examples: 'book-appointment', 'view-records'.
    """
    payload = {"type": "ui_action", "action": "navigate+tour", "tour": tour_name}
    if start_url:
        payload["url"] = start_url
    await ws.send_json(payload)
```

## 4. Implementation Steps

1. **Update Tool Definitions:** Create or update `VanthAI_backend/agents/cloudcare/tools.py` to ensure `highlight_element`, `navigate_to`, and `start_tour` are defined as LangChain/LangGraph tools.
2. **Unified System Prompt Pipeline:** Refactor `build_system_prompt` in `prompts.py` so that both `agent.py` (Text) and `routes.py` (Voice) call it. Remove hardcoded user IDs in the Voice handler.
3. **Remove JSON Contract from Text Prompt:** Strip out the `[RESPONSE CONTRACT]` from `prompts.py`. The LLM should just output standard conversational text and rely purely on tool calling to manipulate the UI.
4. **Update Dispatcher / Frontend Contract:** Ensure the frontend (handled by the friend) listens for the unified `"ui_action"` event schema over the WebSocket or SSE stream.

## 5. Friend Handoff Notes (Frontend)
- The frontend will no longer need to parse the *entire LLM text response* as a JSON object.
- Instead, the backend will emit out-of-band events like `{"type": "ui_action", "action": "highlight", "element": "blood-pressure-card"}`.
- This allows the UI highlight styling to evolve independently of the LLM's response generation logic.