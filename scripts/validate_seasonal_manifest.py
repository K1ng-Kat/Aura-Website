#!/usr/bin/env python3
"""Validate public seasonal manifest consistency without external dependencies."""
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1] / "docs" / "seasonal-icons"
MANIFEST = ROOT / "manifest.json"
ORIGIN = "https://aura-macos.vercel.app"
MAX_ENTRIES = 32
MAX_BYTES = 5_000_000
KEYS = {"id", "title", "unlockAtUTC", "imageURL", "sha256"}

def check(ok, message):
    if not ok:
        raise SystemExit("Invalid Aura seasonal feed: " + message)

feed = json.loads(MANIFEST.read_text(encoding="utf-8"))
check(isinstance(feed, dict) and feed.get("schemaVersion") == 1,
      "schemaVersion must be 1")
entries = feed.get("entries")
check(isinstance(entries, list) and len(entries) <= MAX_ENTRIES,
      "entries must be an array of at most 32")
ids = set()
for i, entry in enumerate(entries):
    label = f"entry {i}"
    check(isinstance(entry, dict) and set(entry) == KEYS,
          label + " fields do not match the Aura client schema")
    release_id = entry["id"]
    check(isinstance(release_id, str) and 0 < len(release_id) <= 40
          and re.fullmatch(r"[A-Za-z0-9-]+", release_id),
          label + " has an invalid id")
    check(release_id not in ids, label + " has a duplicate id")
    ids.add(release_id)
    title = entry["title"]
    check(isinstance(title, str) and 0 < len(title) <= 64,
          label + " has an invalid title")
    date = entry["unlockAtUTC"]
    check(isinstance(date, str) and date.endswith("Z")
          and re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", date),
          label + " must use UTC seconds")
    try:
        datetime.fromisoformat(date.replace("Z", "+00:00"))
    except ValueError:
        raise SystemExit(label + " has an invalid activation time")
    image_url = entry["imageURL"]
    check(isinstance(image_url, str), label + " imageURL is not text")
    parsed = urlparse(image_url)
    check(parsed.scheme == "https" and parsed.netloc == "aura-macos.vercel.app"
          and parsed.path.startswith("/seasonal-icons/")
          and not parsed.query and not parsed.fragment,
          label + " image must be on the official HTTPS host")
    filename = parsed.path.rsplit("/", 1)[-1]
    check(re.fullmatch(r"[a-zA-Z0-9-]+\.(png|jpg|jpeg)", filename),
          label + " has a bad file name")
    check(image_url == ORIGIN + "/seasonal-icons/" + filename,
          label + " image URL is not canonical")
    art = ROOT / filename
    check(art.is_file(), label + " image file is missing from docs/")
    data = art.read_bytes()
    check(0 < len(data) <= MAX_BYTES, label + " exceeds the 5 MB cap")
    valid_signature = (
        filename.endswith(".png") and data.startswith(b"\x89PNG\r\n\x1a\n")
        or filename.endswith((".jpg", ".jpeg")) and data.startswith(b"\xff\xd8\xff")
    )
    check(valid_signature, label + " file format does not match extension")
    digest = hashlib.sha256(data).hexdigest()
    check(entry["sha256"] == digest, label + " SHA-256 mismatch")
print(f"Valid Aura public seasonal manifest: {len(entries)} releases")
