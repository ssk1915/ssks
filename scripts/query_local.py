#!/usr/bin/env python3
import sys
import json
import urllib.request
import os

def load_config():
    config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "antigravity.config.json")
    base_url = "http://localhost:11434/v1"
    model = "gemma2:latest"
    api_key = "ollama"
    temperature = 0.1
    max_tokens = 4096

    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                local_cfg = cfg.get("models", {}).get("Local", {})
                base_url = local_cfg.get("baseUrl", base_url)
                model = local_cfg.get("model", model)
                api_key = local_cfg.get("apiKey", api_key)
                temperature = local_cfg.get("temperature", temperature)
                max_tokens = local_cfg.get("maxTokens", max_tokens)
        except Exception:
            pass

    return base_url, model, api_key, temperature, max_tokens

def main():
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
    else:
        prompt = sys.stdin.read().strip()

    if not prompt:
        print("Error: No prompt provided.", file=sys.stderr)
        sys.exit(1)

    base_url, model, api_key, temperature, max_tokens = load_config()
    endpoint = f"{base_url.rstrip('/')}/chat/completions"

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            print(content)
    except Exception as e:
        print(f"Error querying local LLM: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

