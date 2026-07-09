import os
import re

directory = "frontend/src"
pattern_str = r'[\'"`]http://127.0.0.1:8000/api([^`\'"]*)[\'"`]'

def replace_match(match):
    path = match.group(1)
    if '?' in path or '&' in path or '$' in path: # template literal
        return f'`${{process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}}/api{path}`'
    else:
        return f'`${{process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}}/api{path}`'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = re.sub(pattern_str, replace_match, content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
