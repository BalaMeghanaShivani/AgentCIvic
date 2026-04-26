import os
import requests


def test_asi1_endpoint():
    """
    Test the ASI:One chat completions endpoint.
    Sends a simple request and verifies a 200 response.
    """
    url = "https://api.asi1.ai/v1/chat/completions"
    api_key = os.environ["ASI1_API_KEY"]

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "model": "asi1-mini",
        "messages": [
            {
                "role": "user",
                "content": "Give me 3 bullet ideas for a RAG hackathon demo.",
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
    }

    response = requests.post(url, headers=headers, json=payload, timeout=60)

    # Assert status is 200
    assert response.status_code == 200, (
        f"Expected 200, got {response.status_code}: {response.text}"
    )

    data = response.json()
    content = data["choices"][0]["message"]["content"]
    print("ASI:One response:")
    print(content)


if __name__ == "__main__":
    test_asi1_endpoint()
    print("\n✅ ASI:One endpoint test passed.")
