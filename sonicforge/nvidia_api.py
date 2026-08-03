import requests, base64
import os

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
stream = True

# Get API key from environment variable for security
API_KEY = os.environ.get("NVIDIA_API_KEY", "your-api-key-here")

def read_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "text/event-stream" if stream else "application/json"
}

payload = {
    "model": "google/gemma-4-31b-it",
    "messages": [{"role": "user", "content": "Hello! How are you?"}],
    "max_tokens": 16384,
    "temperature": 1.00,
    "top_p": 0.95,
    "stream": stream,
    "chat_template_kwargs": {"enable_thinking": True},
}

response = requests.post(invoke_url, headers=headers, json=payload, stream=stream)
if stream:
    for line in response.iter_lines():
        if line:
            print(line.decode("utf-8"))
else:
    print(response.json())
