import os
from openai import OpenAI
import base64

# 从文件读取 API 密钥
with open(os.path.join(os.path.dirname(__file__), "mimo_api_key.txt"), "r") as f:
    api_key = f.read().strip()

client = OpenAI(
    api_key=api_key,
    base_url="https://api.xiaomimimo.com/v1"
)

completion = client.chat.completions.create(
    model="mimo-v2.5-tts",
    messages=[
        {
            "role": "user",
            "content": ""
        },
        {
            "role": "assistant",
            "content": "(慵懒)再让我睡五分钟……就五分钟，真的，最后一次，待会醒了，我就起来做饭给你吃。"
        }
    ],
    audio={
        "format": "wav",
        "voice": "白桦"
    }
)

message = completion.choices[0].message
audio_bytes = base64.b64decode(message.audio.data)
with open("audio_file.wav", "wb") as f:
    f.write(audio_bytes)
