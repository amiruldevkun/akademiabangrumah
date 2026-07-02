# -*- coding: utf-8 -*-
"""
Generates sidebar.html for Akademi Abang Rumah — fully automated.

Features:
- Parses the whole file and groups items under the same "Kerja" section.
- Skips duplicate video URLs so you don't get the same video twice.
- Automatically converts both YouTube and Google Drive links into embed formats.
- Supports a verbose flag (-v or --verbose) for detailed console logging.
- Uses <details> and <summary> tags for a collapsible UI.

Usage:
    python3 build_sidebar.py [path/to/exported_doc.txt] [-v]
"""

import re
import sys
import os
import argparse
from html import escape as _html_escape

# ---------------------------------------------------------------------
# Configuration & Globals
# ---------------------------------------------------------------------

INPUT_TXT_PATH = "/mnt/user-data/uploads/Video_Panduan_VVIP_Akademi_Abang_Rumah.txt"
OUTPUT_PATH = "C:\\Users\\m1rul\\Documents\\akademiabangrumah\\sidebar.html"
DEFAULT_FIRST_SECTION_TITLE = "BAHAN-BAHAN PEMBINAAN"

VERBOSE = False

def vprint(*args, **kwargs):
    """Custom print function that only outputs if VERBOSE is True."""
    if VERBOSE:
        print(*args, **kwargs)

def esc(text):
    """Escape text for safe use inside HTML attributes and content."""
    return _html_escape(text, quote=True)

# ---------------------------------------------------------------------
# URL Normalizing (YouTube & Google Drive)
# ---------------------------------------------------------------------

def to_embed(raw_url):
    """
    Converts standard YouTube or Google Drive links into the embed format 
    the iframe player needs. 
    """
    if not raw_url:
        return None

    # 1. Try Google Drive first
    gdrive_patterns = [
        r'drive\.google\.com/file/d/([a-zA-Z0-9_-]+)',
        r'drive\.google\.com/open\?id=([a-zA-Z0-9_-]+)'
    ]
    for pattern in gdrive_patterns:
        m = re.search(pattern, raw_url)
        if m:
            file_id = m.group(1)
            return f"https://drive.google.com/file/d/{file_id}/preview"

    # 2. Try YouTube
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

    # If it's neither, raise an error
    raise ValueError(f"Could not extract video ID from URL: {raw_url}")


# ---------------------------------------------------------------------
# Parsing & Deduplication Logic
# ---------------------------------------------------------------------

def load_entries(text):
    """
    Returns an ordered list of (label, [raw_url, ...]) tuples.
    Filters out system tags and redundant title blocks.
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
            i += 1
            continue
            
        lower_line = line.lower()
        if lower_line == "video panduan vvip akademi abang rumah" or lower_line.startswith("senarai tajuk kerja"):
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


def _add_items(section_list, label, raw_urls, seen_urls, seen_labels_no_url):
    """Helper to add items to a section while preventing duplicates and logging output."""
    if not raw_urls:
        if label.lower() not in seen_labels_no_url:
            section_list.append((label, None))
            seen_labels_no_url.add(label.lower())
            vprint(f"      + Added: {label} (Akan Datang)")
        else:
            vprint(f"      ~ Skipped duplicate label: {label}")
        return

    valid_urls = []
    for u in raw_urls:
        try:
            embed_u = to_embed(u)
            if embed_u and embed_u not in seen_urls:
                valid_urls.append((u, embed_u))
                seen_urls.add(embed_u)
            else:
                vprint(f"      ~ Skipped duplicate video: {u}")
        except ValueError:
            vprint(f"      ! WARNING: Unrecognized URL format, skipping: {u}")
            continue

    if len(valid_urls) == 1:
        section_list.append((label, valid_urls[0][1]))
        vprint(f"      + Added video: {label}")
    elif len(valid_urls) > 1:
        for idx, (u, embed_u) in enumerate(valid_urls, start=1):
            item_label = f"{label} - {idx}"
            section_list.append((item_label, embed_u))
            vprint(f"      + Added multi-part video: {item_label}")


def group_into_sections(entries):
    """
    Turns the flat entry list into a structured dictionary to merge duplicate 
    sections, logging the process to the terminal.
    """
    vprint("\n--- Starting Deduplication and Section Grouping ---")
    sections_dict = {}
    section_order = []
    current_title = DEFAULT_FIRST_SECTION_TITLE

    seen_urls = set()
    seen_labels_no_url = set()

    for label, raw_urls in entries:
        is_header = label.lower().startswith("kerja")

        if is_header:
            current_title = label.upper()
            
            if current_title not in sections_dict:
                vprint(f"\n  [NEW SECTION] {current_title}")
                sections_dict[current_title] = []
                section_order.append(current_title)
            else:
                vprint(f"\n  [MERGING INTO EXISTING SECTION] {current_title}")

            if raw_urls:
                _add_items(sections_dict[current_title], label, raw_urls, seen_urls, seen_labels_no_url)
        else:
            if current_title not in sections_dict:
                vprint(f"\n  [NEW SECTION] {current_title}")
                sections_dict[current_title] = []
                section_order.append(current_title)
            
            _add_items(sections_dict[current_title], label, raw_urls, seen_urls, seen_labels_no_url)

    vprint("\n--- Finalizing Data Structure ---")
    sections = []
    for title in section_order:
        items = sections_dict[title]
        if not items:
            items.append((title, None))
        sections.append((title, items))

    return sections


# ---------------------------------------------------------------------
# HTML rendering
# ---------------------------------------------------------------------

def render_item(label, url, first=False):
    base_classes = ("lesson-item cursor-pointer hover:text-white p-1 rounded transform "
                     "transition-all duration-200 hover:translate-y-0.5 hover:shadow-md "
                     "active:translate-y-0 active:shadow-sm")
    if first:
        base_classes += " bg-blue-800 text-white"

    if url:
        return (f'            <li class="{base_classes}" '
                f'data-lesson="{esc(label)}" data-video="{esc(url)}">{esc(label)}</li>')
    else:
        disabled_classes = ("lesson-item lesson-item-disabled p-1 rounded text-slate-400 "
                             "italic cursor-not-allowed select-none")
        return (f'            <li class="{disabled_classes}" '
                f'data-lesson="{esc(label)}">{esc(label)} <span class="text-xs">(Akan Datang)</span></li>')

def render_section(title, items, is_first_section=False):
    lines = []
    
    # Use <details> instead of <div>. Open the first section by default.
    open_attr = ' open' if is_first_section else ''
    lines.append(f'        <details class="lesson-section space-y-2"{open_attr}>')
    
    # Use <summary> instead of <div> for the title. Added cursor-pointer and select-none.
    lines.append(f'            <summary class="lesson-section-title bg-white text-black font-semibold px-3 py-1.5 rounded text-center shadow-sm cursor-pointer select-none">{esc(title)}</summary>')
    
    # Added a little top padding (pt-2) so the list doesn't hug the summary tag too tightly when opened
    lines.append('            <ul class="pl-2 pt-2 space-y-1 text-sm text-slate-200">')
    
    for idx, (label, url) in enumerate(items):
        first_item = is_first_section and idx == 0
        lines.append(render_item(label, url, first=first_item))
        
    lines.append('            </ul>')
    lines.append('        </details>')
    return "\n".join(lines)

def render_all(sections):
    vprint("Rendering HTML structure...")
    parts = []
    parts.append('<div class="mb-6">')
    parts.append('  <input')
    parts.append('    type="text"')
    parts.append('    id="sidebar-search"')
    parts.append('    placeholder="Cari topik/video..."')
    parts.append('    class="w-full px-3 py-2 text-sm text-black rounded bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-inner">')
    parts.append('</div>')
    parts.append('<div class="space-y-6">')
    parts.append('')
    for i, (title, items) in enumerate(sections):
        parts.append(f'        ')
        parts.append(render_section(title, items, is_first_section=(i == 0)))
        parts.append('')
    parts.append('</div>')
    return "\n".join(parts)


# ---------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------

if __name__ == "__main__":
    # Setup argparse for command line arguments
    parser = argparse.ArgumentParser(description="Generate sidebar.html for Akademi Abang Rumah.")
    parser.add_argument("input_path", nargs="?", default=INPUT_TXT_PATH, 
                        help="Path to the input text file (optional).")
    parser.add_argument("-v", "--verbose", action="store_true", 
                        help="Enable detailed verbose output.")
    
    args = parser.parse_args()
    
    # Set the global VERBOSE flag based on user input
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
    html = render_all(sections)

    vprint(f"Writing file to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    total_items = sum(len(items) for _, items in sections)
    ready = sum(1 for _, items in sections for _, u in items if u)
    
    # Always print the final summary, regardless of verbosity
    print("\n==================================================")
    print("                     SUMMARY                      ")
    print("==================================================")
    print(f"Parsed file         : {input_path}")
    print(f"Total Sections      : {len(sections)}")
    print(f"Total Lesson Items  : {total_items}")
    print(f"Videos Ready        : {ready}")
    print(f"Marked Akan Datang  : {total_items - ready}")
    print("==================================================\n")