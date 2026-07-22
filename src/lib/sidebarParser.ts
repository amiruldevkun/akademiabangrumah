// src/lib/server/sidebarParser.ts
//
// TypeScript port of build_sidebarV3.py — same rules, same output shape.
// Kept as a 1:1 port so behavior matches the Python script exactly:
//   - "Kerja ..." lines start a new section
//   - sections with the same title anywhere in the doc get merged
//   - duplicate videos / duplicate "Akan Datang" labels are skipped globally
//   - stable slug ids, unique across the whole document
//   - YouTube + Google Drive links normalized to embed URLs
//
// If you ever update build_sidebarV3.py, mirror the change here too —
// this file is not auto-generated from it.

export interface SidebarItem {
	id: string;
	label: string;
	video: string | null;
}

export interface SidebarSection {
	title: string;
	items: SidebarItem[];
}

export interface ParseStats {
	totalSections: number;
	totalItems: number;
	videosReady: number;
	akanDatang: number;
	warnings: string[]; // unrecognized URLs, etc. — surfaced to the admin UI
}

export interface ParseResult {
	sections: SidebarSection[];
	stats: ParseStats;
}

const DEFAULT_FIRST_SECTION_TITLE = 'BAHAN-BAHAN PEMBINAAN';

// ---------------------------------------------------------------------
// Stable id generation
// ---------------------------------------------------------------------

function slugify(label: string): string {
	const normalized = label.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); // strip diacritics
	let ascii = normalized.toLowerCase();
	ascii = ascii.replace(/[^a-z0-9\s-]/g, '');
	ascii = ascii.replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
	return ascii.slice(0, 80) || 'item';
}

function makeUniqueId(label: string, usedIds: Set<string>): string {
	const base = slugify(label);
	let candidate = base;
	let n = 2;
	while (usedIds.has(candidate)) {
		candidate = `${base}-${n}`;
		n += 1;
	}
	usedIds.add(candidate);
	return candidate;
}

// ---------------------------------------------------------------------
// URL normalizing (YouTube & Google Drive)
// ---------------------------------------------------------------------

function toEmbed(rawUrl: string, warnings: string[]): string | null {
	if (!rawUrl) return null;

	const gdrivePatterns = [
		/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
		/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
	];
	for (const pattern of gdrivePatterns) {
		const m = rawUrl.match(pattern);
		if (m) {
			return `https://drive.google.com/file/d/${m[1]}/preview`;
		}
	}

	const siMatch = rawUrl.match(/[?&]si=([^&]+)/);
	const si = siMatch ? siMatch[1] : null;

	const ytPatterns = [
		/youtube\.com\/shorts\/([A-Za-z0-9_-]+)/,
		/youtu\.be\/([A-Za-z0-9_-]+)/,
		/[?&]v=([A-Za-z0-9_-]+)/,
		/youtube\.com\/embed\/([A-Za-z0-9_-]+)/
	];
	for (const pattern of ytPatterns) {
		const m = rawUrl.match(pattern);
		if (m) {
			const videoId = m[1];
			return si
				? `https://www.youtube.com/embed/${videoId}?si=${si}`
				: `https://www.youtube.com/embed/${videoId}`;
		}
	}

	warnings.push(`Could not extract video ID from URL: ${rawUrl}`);
	return null; // Python raises; here we warn + skip so one bad link doesn't kill the whole parse
}

// ---------------------------------------------------------------------
// Parsing the exported doc text into (label, [urls]) entries
// ---------------------------------------------------------------------

type Entry = [label: string, urls: string[]];

function loadEntries(text: string): Entry[] {
	const lines = text.split(/\r?\n/).map((l) => l.trim());
	const nonEmpty = lines.filter((l) => l !== '');

	let start = 0;
	for (let i = 0; i < nonEmpty.length; i++) {
		if (nonEmpty[i].toLowerCase().startsWith('tajuk modul video')) {
			start = i + 1;
			break;
		}
	}

	const entries: Entry[] = [];
	let i = start;
	while (i < nonEmpty.length) {
		const line = nonEmpty[i];

		if (line.toLowerCase().startsWith('http')) {
			// Orphan URL with no preceding label — skip defensively
			i += 1;
			continue;
		}

		const lowerLine = line.toLowerCase();
		if (
			lowerLine === 'video panduan vvip akademi abang rumah' ||
			lowerLine.startsWith('senarai tajuk kerja')
		) {
			i += 1;
			continue;
		}

		const label = line;
		i += 1;
		const urls: string[] = [];
		while (i < nonEmpty.length && nonEmpty[i].toLowerCase().startsWith('http')) {
			urls.push(nonEmpty[i]);
			i += 1;
		}
		entries.push([label, urls]);
	}

	return entries;
}

function addItems(
	sectionList: SidebarItem[],
	label: string,
	rawUrls: string[],
	seenUrls: Set<string>,
	seenLabelsNoUrl: Set<string>,
	usedIds: Set<string>,
	warnings: string[]
): void {
	if (rawUrls.length === 0) {
		if (!seenLabelsNoUrl.has(label.toLowerCase())) {
			const itemId = makeUniqueId(label, usedIds);
			sectionList.push({ id: itemId, label, video: null });
			seenLabelsNoUrl.add(label.toLowerCase());
		}
		return;
	}

	const valid: string[] = [];
	for (const u of rawUrls) {
		const embedU = toEmbed(u, warnings);
		if (embedU === null) continue; // unrecognized URL, already warned
		if (seenUrls.has(embedU)) continue; // duplicate video, skip silently like the Python version
		valid.push(embedU);
		seenUrls.add(embedU);
	}

	if (valid.length === 1) {
		const itemId = makeUniqueId(label, usedIds);
		sectionList.push({ id: itemId, label, video: valid[0] });
	} else if (valid.length > 1) {
		valid.forEach((embedU, idx) => {
			const itemLabel = `${label} - ${idx + 1}`;
			const itemId = makeUniqueId(itemLabel, usedIds);
			sectionList.push({ id: itemId, label: itemLabel, video: embedU });
		});
	}
}

function groupIntoSections(entries: Entry[], warnings: string[]): SidebarSection[] {
	const sectionsMap = new Map<string, SidebarItem[]>();
	const sectionOrder: string[] = [];
	let currentTitle = DEFAULT_FIRST_SECTION_TITLE;

	const seenUrls = new Set<string>();
	const seenLabelsNoUrl = new Set<string>();
	const usedIds = new Set<string>();

	function ensureSection(title: string) {
		if (!sectionsMap.has(title)) {
			sectionsMap.set(title, []);
			sectionOrder.push(title);
		}
	}

	for (const [label, rawUrls] of entries) {
		const isHeader = label.toLowerCase().startsWith('kerja');

		if (isHeader) {
			currentTitle = label.toUpperCase();
			ensureSection(currentTitle);
			if (rawUrls.length > 0) {
				addItems(
					sectionsMap.get(currentTitle)!,
					label,
					rawUrls,
					seenUrls,
					seenLabelsNoUrl,
					usedIds,
					warnings
				);
			}
		} else {
			ensureSection(currentTitle);
			addItems(
				sectionsMap.get(currentTitle)!,
				label,
				rawUrls,
				seenUrls,
				seenLabelsNoUrl,
				usedIds,
				warnings
			);
		}
	}

	const sections: SidebarSection[] = [];
	for (const title of sectionOrder) {
		const items = sectionsMap.get(title)!;
		if (items.length === 0) {
			const itemId = makeUniqueId(title, usedIds);
			items.push({ id: itemId, label: title, video: null });
		}
		sections.push({ title, items });
	}

	return sections;
}

// ---------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------

export function parseSidebarText(text: string): ParseResult {
	const warnings: string[] = [];
	const entries = loadEntries(text);
	const sections = groupIntoSections(entries, warnings);

	const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
	const videosReady = sections.reduce(
		(sum, s) => sum + s.items.filter((i) => i.video).length,
		0
	);

	return {
		sections,
		stats: {
			totalSections: sections.length,
			totalItems,
			videosReady,
			akanDatang: totalItems - videosReady,
			warnings
		}
	};
}