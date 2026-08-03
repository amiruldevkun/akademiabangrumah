// src/lib/markdown.ts
//
// Hand-rolled mini-markdown for announcement text -- deliberately NOT a
// markdown library (marked, remark, etc.). Only three inline patterns:
//   **bold**
//   *italic*
//   [link text](https://...)
//
// Safety: escapes ALL HTML first, then only ever inserts pre-built tags via
// regex replacement afterward -- there's no path for raw HTML to pass
// through, so this needs no sanitizer dependency either (unlike a real
// markdown parser, which can be told to allow raw HTML passthrough and
// then requires something like DOMPurify to stay safe). Links are
// restricted to http(s) schemes only, so a pasted `javascript:` URI gets
// stripped as plain text instead of rendered as a clickable link.
//
// Still requires {@html} wherever this is used, since it returns HTML —
// never interpolate the raw, unescaped `text` field directly.

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderAnnouncementMarkdown(raw: string): string {
  let html = escapeHtml(raw);

  // Links first -- [text](url), http(s) only. Runs before bold/italic so a
  // link label containing * doesn't get mangled by the patterns below.
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Bold before italic, so **x** isn't half-consumed by the single-* rule.
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return html;
}
