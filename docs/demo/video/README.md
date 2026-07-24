# BidPilot demo video

## What you have

| File | Purpose |
|---|---|
| `bidpilot-demo.mp4` | Silent screen capture (Playwright) |
| `bidpilot-demo-voiced.mp4` | Current cut — replace after you record |
| `SCRIPT-read-aloud.md` | **Your narration** — grassroots / poignant tone |
| `record-my-voiceover.sh` | Record your mic, mux onto the silent picture |

TTS was a placeholder. For Devpost, use **your** voice.

## Record yourself (recommended)

1. Open the script and practice once.
2. Allow mic access if macOS prompts (Terminal or Cursor).
3. From the repo:

```bash
bash docs/demo/video/record-my-voiceover.sh
```

4. Press Enter, read the script naturally, then **Ctrl+C** when you finish.
5. The script muxes your take onto the silent video and opens the result.

If the wrong mic is selected:

```bash
ffmpeg -f avfoundation -list_devices true -i ""
AUDIO_DEVICE=1 bash docs/demo/video/record-my-voiceover.sh   # try 0 or 1
```

## Re-capture the picture only

```bash
cd web && npm run record:demo-video
```

That regenerates the silent MP4 (and an old TTS voiced file). Then run
`record-my-voiceover.sh` again with your voice.

## Devpost

1. Upload `bidpilot-demo-voiced.mp4` to YouTube (Unlisted or Public).
2. Paste the watch URL into **Video demo link**.
3. Confirm the embed in an incognito window.

Hard limit: under **3:00**.
