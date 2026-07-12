# -*- coding: utf-8 -*-
"""
Generates sidebar-data.json for Akademi Abang Rumah — fully automated.

Reads the course outline from a plain-text export of the Google Doc
(File -> Download -> Plain text (.txt) in Google Docs) and parses it
using the rule:

    Any line that starts with "Kerja" = a new big section title.
    Every line under it (until the next "Kerja" line) = content in
    that section. A content line is followed by zero or more video
    link lines (0 = "Akan Datang" / coming soon, 1 = a normal item,
    2+ = numbered items "- 1", "- 2", etc, unless already distinctly
    labeled by the source doc).

Features:
- Groups items under the same "Kerja" section wherever it appears in
  the doc (not just contiguous blocks), merging duplicate headers.
- Skips duplicate videos globally, and duplicate coming-soon labels,
  so the same content pasted twice anywhere in the doc doesn't produce
  duplicate entries.
- Converts both YouTube and Google Drive links into embed formats.
- Assigns a stable slug `id` to every item, derived from its final
  label. This is the key the Supabase video_progress table uses to
  track per-user watched/resume state, so it needs to survive
  re-running this script on an updated doc export — re-running with
  unchanged labels reproduces the same ids. Only a label edit (typo
  fix, rewording) changes an id, which orphans that item's existing
  progress rows; that's an accepted tradeoff since the source doc has
  no other stable identifier to key off of.
- Supports a verbose flag (-v / --verbose) for detailed console logging
  of what got added, merged, or skipped and why.
- Outputs sidebar-data.json, which sidebar_filter.js fetches and
  renders client-side as collapsible <details>/<summary> sections.

Usage:
    python3 build_sidebar.py [path/to/exported_doc.txt] [-v]

If no path is given, it looks for INPUT_TXT_PATH below.
"""

import re
import sys
import os
import json
import argparse
import unicodedata

INPUT_TXT_PATH = "/mnt/user-data/uploads/Video_Panduan_VVIP_Akademi_Abang_Rumah.txt"
OUTPUT_PATH = r"C:\Users\m1rul\Documents\akademiabangrumah\sidebar-data.json"

# The very first block of items (before any "Kerja ..." header appears)
# doesn't have a natural section title in the source doc, so we give it
# one manually. Change this if you'd like a different name.
DEFAULT_FIRST_SECTION_TITLE = "BAHAN-BAHAN PEMBINAAN"

VERBOSE = False


def vprint(*args, **kwargs):
    """Prints only when --verbose is passed."""
    if VERBOSE:
        print(*args, **kwargs)


# ---------------------------------------------------------------------
# Stable id generation
# ---------------------------------------------------------------------

def slugify(label):
    """
    Turns an item label into a lowercase, ASCII-ish, hyphenated slug
    suitable for use as a Supabase row key. Strips diacritics (so
    "Teknik Nak Elak" and any accented variant slug the same way),
    drops punctuation, collapses whitespace to single hyphens.
    """
    normalized = unicodedata.normalize("NFKD", label)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9\s-]", "", ascii_text)
    ascii_text = re.sub(r"[\s_-]+", "-", ascii_text).strip("-")
    return ascii_text[:80] or "item"


def make_unique_id(label, used_ids):
    """
    Slugifies `label` and, if that slug is already taken (e.g. two
    different sections happen to contain an identically worded step),
    appends -2, -3, ... until it's unique. Mutates `used_ids`.
    """
    base = slugify(label)
    candidate = base
    n = 2
    while candidate in used_ids:
        candidate = f"{base}-{n}"
        n += 1
    used_ids.add(candidate)
    return candidate


# ---------------------------------------------------------------------
# URL normalizing (YouTube & Google Drive)
# ---------------------------------------------------------------------

def to_embed(raw_url):
    """
    Converts a YouTube or Google Drive link into the embed format the
    iframe player needs. Handles YouTube shorts/, youtu.be/, watch?v=,
    already-embedded links, and Google Drive file/preview links.
    Returns None if raw_url is falsy; raises ValueError if the URL is
    non-empty but doesn't match any known pattern.
    """
    if not raw_url:
        return None

    # 1. Google Drive
    gdrive_patterns = [
        r'drive\.google\.com/file/d/([a-zA-Z0-9_-]+)',
        r'drive\.google\.com/open\?id=([a-zA-Z0-9_-]+)',
    ]
    for pattern in gdrive_patterns:
        m = re.search(pattern, raw_url)
        if m:
            file_id = m.group(1)
            return f"https://drive.google.com/file/d/{file_id}/preview"

    # 2. YouTube
    si_match = re.search(r'[?&]si=([^&]+)', raw_url)
    si = si_match.group(1) if si_match else None

    yt_patterns = [
        r'youtube\.com/shorts/([A-Za-z0-9_-]+)',
        r'youtu\.be/([A-Za-z0-9_-]+)',
        r'[?&]v=([A-Za-z0-9_-]+)',
        r'youtube\.com/embed/([A-Za-z0-9_-]+)',
    ]
    for pattern in yt_patterns:
        m = re.search(pattern, raw_url)
        if m:
            video_id = m.group(1)
            if si:
                return f"https://www.youtube.com/embed/{video_id}?si={si}"
            return f"https://www.youtube.com/embed/{video_id}"

    raise ValueError(f"Could not extract video ID from URL: {raw_url}")


# ---------------------------------------------------------------------
# Parsing the exported doc text into (label, [urls]) entries
# ---------------------------------------------------------------------

def load_entries(text):
    """
    Returns an ordered list of (label, [raw_url, ...]) tuples. Filters
    out repeated document title/heading lines wherever they appear
    (not just as a one-time cutoff), so a doc with the whole list
    pasted in twice doesn't choke — actual de-duplication of the
    *items* happens later in group_into_sections.
    """
    vprint("Cleaning up text and finding start of content...")

    lines = [l.strip() for l in text.splitlines()]
    non_empty = [l for l in lines if l != ""]

    start = 0
    for i, l in enumerate(non_empty):
        if l.lower().startswith("tajuk modul video"):
            start = i + 1
            break

    entries = []
    i = start
    while i < len(non_empty):
        line = non_empty[i]

        if line.lower().startswith("http"):
            # Orphan URL with no preceding label — skip defensively
            i += 1
            continue

        lower_line = line.lower()
        if (lower_line == "video panduan vvip akademi abang rumah"
                or lower_line.startswith("senarai tajuk kerja")):
            i += 1
            continue

        label = line
        i += 1
        urls = []
        while i < len(non_empty) and non_empty[i].lower().startswith("http"):
            urls.append(non_empty[i])
            i += 1
        entries.append((label, urls))

    vprint(f"Extracted {len(entries)} raw item entries from text.")
    return entries


def _add_items(section_list, label, raw_urls, seen_urls, seen_labels_no_url, used_ids):
    """
    Appends items for one entry to section_list, skipping anything
    already seen globally:
      - a video already added under ANY section (same embed URL) is skipped
      - a no-video "Akan Datang" label already added under ANY section is skipped

    Each appended item is a (id, label, url_or_None) triple — the id is
    assigned here, once, per final label (post multi-part suffixing),
    using the same global `used_ids` set across the whole document so
    ids never collide even across sections.
    """
    if not raw_urls:
        if label.lower() not in seen_labels_no_url:
            item_id = make_unique_id(label, used_ids)
            section_list.append((item_id, label, None))
            seen_labels_no_url.add(label.lower())
            vprint(f"      + Added: {label} (Akan Datang) [id={item_id}]")
        else:
            vprint(f"      ~ Skipped duplicate label: {label}")
        return

    valid = []
    for u in raw_urls:
        try:
            embed_u = to_embed(u)
        except ValueError:
            vprint(f"      ! WARNING: Unrecognized URL format, skipping: {u}")
            continue
        if embed_u in seen_urls:
            vprint(f"      ~ Skipped duplicate video: {u}")
            continue
        valid.append(embed_u)
        seen_urls.add(embed_u)

    if len(valid) == 1:
        item_id = make_unique_id(label, used_ids)
        section_list.append((item_id, label, valid[0]))
        vprint(f"      + Added video: {label} [id={item_id}]")
    elif len(valid) > 1:
        for idx, embed_u in enumerate(valid, start=1):
            item_label = f"{label} - {idx}"
            item_id = make_unique_id(item_label, used_ids)
            section_list.append((item_id, item_label, embed_u))
            vprint(f"      + Added multi-part video: {item_label} [id={item_id}]")


def group_into_sections(entries):
    """
    Turns the flat entry list into
    [(section_title, [(id, item_label, embed_url_or_None), ...]), ...]
    per the "Kerja = big title" rule. Sections with the same title
    anywhere in the doc are merged into one, and items are de-duplicated
    globally (see _add_items), so scattered or repeated content doesn't
    produce repeated entries.
    """
    vprint("\n--- Starting section grouping & deduplication ---")
    sections_dict = {}
    section_order = []
    current_title = DEFAULT_FIRST_SECTION_TITLE

    seen_urls = set()
    seen_labels_no_url = set()
    used_ids = set()

    def ensure_section(title):
        if title not in sections_dict:
            vprint(f"\n  [NEW SECTION] {title}")
            sections_dict[title] = []
            section_order.append(title)
        else:
            vprint(f"\n  [MERGING INTO EXISTING SECTION] {title}")

    for label, raw_urls in entries:
        is_header = label.lower().startswith("kerja")

        if is_header:
            current_title = label.upper()
            ensure_section(current_title)
            if raw_urls:
                _add_items(sections_dict[current_title], label, raw_urls, seen_urls, seen_labels_no_url, used_ids)
        else:
            ensure_section(current_title)
            _add_items(sections_dict[current_title], label, raw_urls, seen_urls, seen_labels_no_url, used_ids)

    vprint("\n--- Finalizing data structure ---")
    sections = []
    for title in section_order:
        items = sections_dict[title]
        if not items:
            item_id = make_unique_id(title, used_ids)
            items.append((item_id, title, None))
        sections.append((title, items))

    return sections


# ---------------------------------------------------------------------
# JSON export
# ---------------------------------------------------------------------

def to_json_structure(sections):
    """
    Converts [(title, [(id, label, url_or_None), ...]), ...] into a plain
    JSON-serializable structure the frontend JS renders directly:

    [
      {
        "title": "BAHAN-BAHAN PEMBINAAN",
        "items": [
          {"id": "jenis2-jenis-simen", "label": "Jenis2 jenis simen", "video": "https://www.youtube.com/embed/..."},
          {"id": "kerja-pengorekan-tapak-asas", "label": "Kerja Pengorekan Tapak Asas", "video": null}
        ]
      },
      ...
    ]
    """
    return [
        {
            "title": title,
            "items": [{"id": item_id, "label": label, "video": url} for item_id, label, url in items],
        }
        for title, items in sections
    ]


# ---------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate sidebar-data.json for Akademi Abang Rumah.")
    parser.add_argument("input_path", nargs="?", default=INPUT_TXT_PATH,
                         help="Path to the input text file (optional).")
    parser.add_argument("-v", "--verbose", action="store_true",
                         help="Enable detailed verbose output.")
    args = parser.parse_args()

    VERBOSE = args.verbose
    input_path = args.input_path

    vprint("==================================================")
    vprint("   Akademi Abang Rumah Sidebar Generator (VERBOSE)  ")
    vprint("==================================================")
    vprint(f"Input Target : {input_path}")
    vprint(f"Output Target: {OUTPUT_PATH}")
    vprint("--------------------------------------------------\n")

    if not os.path.exists(input_path):
        print(f"ERROR: Input file not found: {input_path}")
        sys.exit(1)

    vprint("Reading file...")
    with open(input_path, "r", encoding="utf-8") as f:
        text = f.read()

    entries = load_entries(text)
    sections = group_into_sections(entries)
    data = to_json_structure(sections)

    vprint(f"Writing file to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    total_items = sum(len(s["items"]) for s in data)
    ready = sum(1 for s in data for item in s["items"] if item["video"])

    print("\n==================================================")
    print("                     SUMMARY                      ")
    print("==================================================")
    print(f"Parsed file         : {input_path}")
    print(f"Total Sections      : {len(data)}")
    print(f"Total Lesson Items  : {total_items}")
    print(f"Videos Ready        : {ready}")
    print(f"Marked Akan Datang  : {total_items - ready}")
    print("==================================================\n")