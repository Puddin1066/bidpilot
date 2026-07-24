#!/usr/bin/env bash
# Record your voice reading SCRIPT-read-aloud.md, then mux onto the silent demo.
#
# Usage (from repo root or docs/demo/video):
#   bash docs/demo/video/record-my-voiceover.sh
#
# Optional:
#   AUDIO_DEVICE=1 bash docs/demo/video/record-my-voiceover.sh   # MacBook mic is usually :1
#   MAX_SECONDS=180 bash docs/demo/video/record-my-voiceover.sh
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
SILENT="${DIR}/bidpilot-demo.mp4"
OUT_RAW="${DIR}/voiceover-human.wav"
OUT_M4A="${DIR}/voiceover-human.m4a"
OUT_MP4="${DIR}/bidpilot-demo-voiced.mp4"
SCRIPT="${DIR}/SCRIPT-read-aloud.md"
DEVICE="${AUDIO_DEVICE:-1}"
MAX_SECONDS="${MAX_SECONDS:-180}"

if [[ ! -f "$SILENT" ]]; then
  echo "Missing silent video at $SILENT"
  echo "Generate it first: cd web && npm run record:demo-video"
  exit 1
fi

echo ""
echo "=== BidPilot voiceover recording ==="
echo "Script: $SCRIPT"
echo "Mic device index: $DEVICE  (MacBook Air Microphone is usually 1)"
echo ""
echo "Open the script beside this terminal, take a breath, then press Enter"
echo "and start reading. Press Ctrl+C when you finish the last line."
echo ""
open "$SCRIPT" 2>/dev/null || true
read -r -p "Press Enter to start recording… " _

echo "Recording… (Ctrl+C to stop)"
# avfoundation format: video_device:audio_device — use none for video
ffmpeg -y -f avfoundation -i ":${DEVICE}" -ac 1 -ar 44100 -t "${MAX_SECONDS}" "$OUT_RAW" || true

if [[ ! -s "$OUT_RAW" ]]; then
  echo "No audio captured. Check mic permissions: System Settings → Privacy → Microphone → allow Terminal/Cursor."
  exit 1
fi

ffmpeg -y -i "$OUT_RAW" -c:a aac -b:a 192k "$OUT_M4A"

VIDEO_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$SILENT")
AUDIO_DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT_M4A")

echo "Video ${VIDEO_DUR}s · Voice ${AUDIO_DUR}s"

python3 - <<PY
video=float("$VIDEO_DUR")
audio=float("$AUDIO_DUR")
silent="$SILENT"
m4a="$OUT_M4A"
out="$OUT_MP4"
import subprocess
if audio > video:
    pad = audio - video
    cmd = [
        "ffmpeg","-y","-i",silent,"-i",m4a,
        "-filter_complex",f"[0:v]tpad=stop_mode=clone:stop_duration={pad:.3f}[v]",
        "-map","[v]","-map","1:a",
        "-c:v","libx264","-pix_fmt","yuv420p","-c:a","aac",
        "-shortest","-movflags","+faststart", out,
    ]
else:
    cmd = [
        "ffmpeg","-y","-i",silent,"-i",m4a,
        "-c:v","copy","-c:a","aac","-shortest","-movflags","+faststart", out,
    ]
subprocess.check_call(cmd)
# Trim if over 2:59
dur=float(subprocess.check_output([
    "ffprobe","-v","error","-show_entries","format=duration",
    "-of","default=nw=1:nk=1", out
], text=True).strip())
if dur >= 179:
    trimmed=out.replace(".mp4","-trimmed.mp4")
    subprocess.check_call(["ffmpeg","-y","-i",out,"-t","179","-c","copy",trimmed])
    print("Trimmed to 2:59 →", trimmed)
else:
    print("Wrote", out, f"({dur:.1f}s)")
PY

echo ""
echo "Done. Preview:"
echo "  open \"$OUT_MP4\""
open "$OUT_MP4" 2>/dev/null || true
