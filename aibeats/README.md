# Beat Analyzer

Extract beat timing metadata from MP3 files for the FreestyleFlow mobile app.

## Overview

A Python-based tool that analyzes audio files and outputs JSON metadata containing:

- BPM (tempo)
- Beat timestamps (every beat position in seconds)
- Downbeat timestamps (beat 1 of each measure)
- Beat drop time (when the main beat kicks in after intro)
- Song duration and analysis confidence

## Requirements

- Python 3.9+
- ffmpeg (for MP3 decoding)

## Installation

### 1. Install ffmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

### 2. Set up Python environment

```bash
cd beat-analyzer
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Optional: Enhanced beat detection with madmom

The project uses librosa for beat detection by default, which works with all Python versions.
For more accurate neural-network-based beat detection, you can install madmom (requires Python 3.9-3.11):

```bash
pip install cython numpy
pip install madmom
```

The analyzer will automatically use madmom if available.

## Usage

### Analyze a single song

```bash
python scripts/analyze_song.py path/to/song.mp3
python scripts/analyze_song.py path/to/song.mp3 --output path/to/output.json
python scripts/analyze_song.py path/to/song.mp3 --pretty
```

### Batch analyze all songs in a directory

```bash
python scripts/batch_analyze.py path/to/songs/
python scripts/batch_analyze.py path/to/songs/ --output-dir path/to/output/
python scripts/batch_analyze.py path/to/songs/ --skip-existing
```

### Generate click track for verification

```bash
python scripts/generate_click_track.py song.mp3 song.json
python scripts/generate_click_track.py song.mp3 song.json --output verification.wav
```

### Verification UI

Open `verification-ui/index.html` in a browser to review beat detection results. Load an MP3 and its JSON file to:

- Play audio and view metadata
- Adjust beat drop time
- Export corrected JSON

## Output Format

```json
{
  "song_id": "are_we_cooked",
  "filename": "are_we_cooked.mp3",
  "bpm": 96.0,
  "beats_per_measure": 4,
  "beat_drop_time": 20.1,
  "beats": [20.1, 20.725, 21.35, ...],
  "downbeats": [20.1, 22.6, 25.1, ...],
  "duration": 201.0,
  "confidence": 0.94,
  "end_time": null
}
```

## Project Structure

```
beat-analyzer/
├── src/
│   ├── __init__.py
│   ├── analyzer.py          # Core beat detection logic
│   ├── beat_drop.py         # Beat drop detection
│   └── schemas.py           # Pydantic models
├── scripts/
│   ├── analyze_song.py      # CLI: Analyze single song
│   ├── batch_analyze.py     # CLI: Batch analysis
│   └── generate_click_track.py
├── verification-ui/         # Web UI for reviewing results
├── input/                   # Place MP3 files here
├── output/                  # Generated JSON files
└── tests/
```

## Integration with FreestyleFlow

1. Copy generated JSON files to the mobile app:

   ```bash
   cp output/*.json /path/to/freestyleflow/beat-data/
   ```

2. Import beat data in `songList.ts` and use beat timestamps for sync.

## Running Tests

```bash
pip install pytest
pytest tests/
```
