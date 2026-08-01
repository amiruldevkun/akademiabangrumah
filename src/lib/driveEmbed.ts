// src/lib/driveEmbed.ts
//
// Turns a Google Drive share link into the /preview embed URL used in an
// <iframe>. Same regexes as the gdrivePatterns block in sidebarParser.ts —
// kept separate because this one's consumed by the notes admin form, not
// the sidebar doc parser, and the two shouldn't need to change together.

export function toDriveEmbedUrl(rawUrl: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const m = rawUrl.match(pattern);
    if (m) {
      return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
  }

  return null;
}
