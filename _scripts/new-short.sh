#!/usr/bin/env bash
# Usage:
#   ./_scripts/new-short.sh <video_id> [tag] [mood] [location]
#
# Example:
#   ./_scripts/new-short.sh fdc0f70c-dab4-44cc-bf69-8ae4952ce4d1 "Sports" "refreshing 💦" "Chennai"
#
# Requires: BUNNY_API_KEY env var set
#   export BUNNY_API_KEY="your-stream-api-key"

set -e

LIBRARY_ID="628897"
VIDEO_ID="${1:?Usage: new-short.sh <video_id> [tag] [mood] [location]}"
TAG="${2:-}"
MOOD="${3:-}"
LOCATION="${4:-}"

if [[ -z "$BUNNY_API_KEY" ]]; then
  echo "❌  Set BUNNY_API_KEY first:  export BUNNY_API_KEY=your-key"
  exit 1
fi

# Fetch video details from Bunny API
echo "⬇️  Fetching video details from Bunny Stream..."
RESPONSE=$(curl -s \
  --request GET \
  --url "https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${VIDEO_ID}" \
  --header "AccessKey: ${BUNNY_API_KEY}")

# Parse fields
TITLE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('title',''))")
DATE_RAW=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('dateUploaded',''))")
DESCRIPTION=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('description','') or '')")
THUMB_FILE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('thumbnailFileName','') or '')")

if [[ -z "$TITLE" ]]; then
  echo "❌  Could not fetch video. Check VIDEO_ID and BUNNY_API_KEY."
  echo "$RESPONSE"
  exit 1
fi

# Format date as YYYY-MM-DD
DATE=$(echo "$DATE_RAW" | python3 -c "import sys,datetime; raw=sys.stdin.read().strip(); print(datetime.datetime.fromisoformat(raw.replace('Z','+00:00')).strftime('%Y-%m-%d'))")

# Generate slug from title: lowercase, replace spaces/special chars with hyphens
SLUG=$(echo "$TITLE" | python3 -c "
import sys, re, unicodedata
s = sys.stdin.read().strip()
s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
s = s.lower()
s = re.sub(r'[^a-z0-9]+', '-', s)
s = s.strip('-')
print(s)
")

# Thumbnail path — Bunny serves it at: https://video.bunnycdn.com/library/{lib}/videos/{id}/thumbnail
# We store just the filename for OG image use via ImageKit (if uploaded there), or leave as bunny thumb URL
THUMBNAIL="https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${VIDEO_ID}/thumbnail"
if [[ -n "$THUMB_FILE" ]]; then
  THUMBNAIL="Thumbnails/${THUMB_FILE}"
fi

# Output file path
OUTFILE="$(dirname "$0")/../_shorts/${SLUG}.md"

if [[ -f "$OUTFILE" ]]; then
  echo "⚠️  File already exists: _shorts/${SLUG}.md"
  read -r -p "Overwrite? (y/N) " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 0
fi

# Build YAML front matter
{
  echo "---"
  echo "title: \"${TITLE}\""
  echo "slug: ${SLUG}"
  echo "video_id: ${VIDEO_ID}"
  if [[ "$THUMBNAIL" == Thumbnails/* ]]; then
    echo "thumbnail: \"${THUMBNAIL}\""
  else
    echo "thumbnail: \"\"  # upload to ImageKit at: ${THUMBNAIL}"
  fi
  echo "date: ${DATE}"
  if [[ -n "$TAG" ]]; then
    echo "tag: [${TAG}]"
  else
    echo "tag: []"
  fi
  if [[ -n "$MOOD" ]]; then
    echo "mood: [\"${MOOD}\"]"
  else
    echo "mood: []"
  fi
  if [[ -n "$LOCATION" ]]; then
    echo "location: \"${LOCATION}\""
  else
    echo "location: \"\""
  fi
  if [[ -n "$DESCRIPTION" ]]; then
    echo "caption: \"${DESCRIPTION}\""
  else
    echo "caption: \"\""
  fi
  echo "---"
} > "$OUTFILE"

echo "✅  Created: _shorts/${SLUG}.md"
echo "   Title   : ${TITLE}"
echo "   Date    : ${DATE}"
echo "   Slug    : ${SLUG}"
echo "   Caption : ${DESCRIPTION:-<empty>}"
echo ""
echo "👉  Edit _shorts/${SLUG}.md to fill in tag, mood, location if not provided."
