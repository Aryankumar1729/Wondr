"""Quick test: Verify Nominatim + Overpass + OSRM return REAL data (no mocks)."""
import requests
import json

payload = {
    "origin": "Delhi",
    "destination": "Mumbai",
    "date": "2026-10-01",
    "duration": 2,
    "adults": 1,
    "budget": 50000
}

print("🚀 Sending request to orchestrator...")
response = requests.post("http://localhost:8000/api/orchestration/stream", json=payload, stream=True)

for line in response.iter_lines():
    if line:
        decoded = line.decode('utf-8')
        if decoded.startswith("data: "):
            data = json.loads(decoded[6:])
            
            if data["event"] == "agent_completed" and data["agent"] == "ItineraryAgent":
                days = data["result"]["data"].get("days", [])
                print(f"\n✅ Got {len(days)} days\n")
                
                has_real_data = False
                has_real_distances = False
                has_real_alternatives = False
                
                for d in days:
                    print(f"━━━ Day {d.get('day')} ━━━")
                    for act in d.get("activities", []):
                        title = act.get("title", "")
                        pd = act.get("place_details", {})
                        name = pd.get("name", "N/A")
                        address = pd.get("address", "N/A")
                        loc = pd.get("location", {})
                        lat = loc.get("latitude", 0)
                        lng = loc.get("longitude", 0)
                        
                        # Check for real data (not mocked)
                        if "Mocked" not in name and "Mock" not in name:
                            has_real_data = True
                        
                        print(f"  📍 {title}")
                        print(f"     Name: {name}")
                        print(f"     Addr: {address[:60]}")
                        print(f"     Coords: ({lat}, {lng})")
                        
                        ti = act.get("travel_info")
                        if ti:
                            dist = ti.get("distance", "")
                            dur = ti.get("duration", "")
                            if "0.0 km" not in dist and "N/A" not in dist:
                                has_real_distances = True
                            print(f"     🚗 {dist} in {dur}")
                        
                        alts = act.get("alternatives", [])
                        if alts:
                            has_real_alternatives = True
                            print(f"     🍽️  Alternatives: {', '.join(a['name'] for a in alts)}")
                    print()
                
                print("═" * 50)
                print(f"  Real place data: {'✅ YES' if has_real_data else '❌ STILL MOCKED'}")
                print(f"  Real distances:  {'✅ YES' if has_real_distances else '❌ STILL 0.0 km'}")
                print(f"  Real alternatives: {'✅ YES' if has_real_alternatives else '❌ NONE FOUND'}")
                print("═" * 50)
                break
