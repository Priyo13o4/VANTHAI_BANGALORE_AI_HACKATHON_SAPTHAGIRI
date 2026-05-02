import asyncio
import sys
import os

# Add /app to path if running in container
sys.path.append("/app")

async def test_tool():
    try:
        from agents.cloudcare.tools import query_health_records
        print(f"Tool imported: {query_health_records}")
        
        # Test calling it
        result = await query_health_records.ainvoke({"patient_id": 1})
        print(f"Tool result: {result}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_tool())
