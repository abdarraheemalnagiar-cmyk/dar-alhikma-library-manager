/**
 * Generated book covers.
 *
 * When a book has no real cover uploaded from the admin dashboard we render a
 * simple, house-style cover: title + author + the library identity, tinted by
 * category. No invented imagery, no fake data — only what the book record has.
 */

type Palette = { bg: string; deep: string; ink: string; accent: string };

const PALETTES: Record<string, Palette> = {
  islamic: { bg: "#0f3b32", deep: "#0a2a24", ink: "#f3efe4", accent: "#c9a227" },
  law: { bg: "#1e2a44", deep: "#141d31", ink: "#f1f2f6", accent: "#c9a227" },
  computer: { bg: "#12303d", deep: "#0c222c", ink: "#eef5f7", accent: "#63c9c0" },
  engineering: { bg: "#3a2a1c", deep: "#291d13", ink: "#f6efe6", accent: "#e0a860" },
  history: { bg: "#40241f", deep: "#2c1815", ink: "#f6ece6", accent: "#c9a227" },
  literature: { bg: "#3b2340", deep: "#28182c", ink: "#f5eef6", accent: "#d7b06b" },
  biology: { bg: "#1d3a24", deep: "#142919", ink: "#eef6ef", accent: "#8ec07c" },
  math: { bg: "#232a3d", deep: "#171c2a", ink: "#eef0f6", accent: "#8fa7e0" },
  sociology: { bg: "#33313f", deep: "#22212b", ink: "#f1f0f4", accent: "#c9a227" },
  physics: { bg: "#13253f", deep: "#0d1a2c", ink: "#eef2f8", accent: "#7fb2e5" },
  arabic: { bg: "#2f2a1d", deep: "#211d14", ink: "#f6f2e6", accent: "#c9a227" },
  english: { bg: "#1b3340", deep: "#12232c", ink: "#eef4f7", accent: "#7fc4d8" },
  medicine: { bg: "#3a1f27", deep: "#28151b", ink: "#f7eef0", accent: "#e08f9a" },
  chemistry: { bg: "#1f3a37", deep: "#152827", ink: "#eef6f5", accent: "#79c7b8" },
  general: { bg: "#2b2b2b", deep: "#1d1d1d", ink: "#f2f2f2", accent: "#c9a227" },
  geography: { bg: "#20353a", deep: "#162528", ink: "#eef4f5", accent: "#84c1b2" },
  economics: { bg: "#1f3629", deep: "#15251c", ink: "#eef5f0", accent: "#9ec98a" },
  statistics: { bg: "#25303f", deep: "#19212b", ink: "#eff2f6", accent: "#94add0" },
  philosophy: { bg: "#2d2740", deep: "#1f1b2c", ink: "#f1eef7", accent: "#b9a6e0" },
  education: { bg: "#33283f", deep: "#231b2b", ink: "#f2eef6", accent: "#c9a227" },
  agriculture: { bg: "#26391f", deep: "#1a2715", ink: "#eff5ec", accent: "#a5c97f" },
  management: { bg: "#243139", deep: "#182228", ink: "#eff3f5", accent: "#c9a227" },
  geology: { bg: "#3a3327", deep: "#28231b", ink: "#f5f2ea", accent: "#d0ac6d" },
  dictionaries: { bg: "#2a3540", deep: "#1c242c", ink: "#eff3f6", accent: "#c9a227" },
  accounting: { bg: "#1f333a", deep: "#152328", ink: "#eef4f6", accent: "#8dc2c9" },
  politics: { bg: "#382330", deep: "#261821", ink: "#f5eef2", accent: "#c9a227" },
  pharmacy: { bg: "#25373a", deep: "#192628", ink: "#eff5f6", accent: "#8ec7c3" },
  "public-health": { bg: "#31232c", deep: "#22181f", ink: "#f4eef1", accent: "#dba0ab" },
  criticism: { bg: "#332b2b", deep: "#231e1e", ink: "#f4f1f1", accent: "#c9a227" },
  grammar: { bg: "#2d3327", deep: "#1f231b", ink: "#f2f4ee", accent: "#c9a227" },
  environment: { bg: "#1f3a2e", deep: "#152820", ink: "#eef6f1", accent: "#8ec99f" },
  "fiqh-law": { bg: "#123531", deep: "#0c2523", ink: "#eef6f4", accent: "#c9a227" },
  sports: { bg: "#2c3140", deep: "#1e212b", ink: "#f0f1f6", accent: "#9fb0dd" },
  botany: { bg: "#24391f", deep: "#182715", ink: "#eff5ec", accent: "#a3c982" },
};

const FALLBACK: Palette = { bg: "#2b2b2b", deep: "#1d1d1d", ink: "#f2f2f2", accent: "#c9a227" };

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text: string, perLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > perLine && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1] ?? "";
    const consumed = lines.join(" ").length;
    if (consumed < text.trim().length) lines[maxLines - 1] = `${last.slice(0, perLine - 1)}…`;
  }
  return lines;
}

export function generatedCover(input: {
  title: string;
  author?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
}): string {
  const palette = PALETTES[input.categorySlug ?? ""] ?? FALLBACK;
  const titleLines = wrap(input.title || "كتاب", 20, 4);
  const startY = 470 - (titleLines.length - 1) * 26;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900" role="img">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${palette.bg}"/><stop offset="1" stop-color="${palette.deep}"/>
</linearGradient></defs>
<rect width="600" height="900" fill="url(#g)"/>
<rect x="34" y="34" width="532" height="832" fill="none" stroke="${palette.accent}" stroke-opacity="0.55" stroke-width="2"/>
<rect x="0" y="0" width="14" height="900" fill="${palette.accent}" fill-opacity="0.8"/>
<text x="300" y="130" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="30" fill="${palette.accent}" letter-spacing="1">دار الحكمة</text>
<line x1="200" y1="156" x2="400" y2="156" stroke="${palette.accent}" stroke-opacity="0.7" stroke-width="2"/>
${
  input.categoryName
    ? `<text x="300" y="196" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="22" fill="${palette.ink}" fill-opacity="0.7">${esc(input.categoryName)}</text>`
    : ""
}
${titleLines
  .map(
    (line, index) =>
      `<text x="300" y="${startY + index * 52}" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="40" font-weight="bold" fill="${palette.ink}">${esc(line)}</text>`,
  )
  .join("")}
${
  input.author
    ? `<text x="300" y="${startY + titleLines.length * 52 + 34}" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="26" fill="${palette.ink}" fill-opacity="0.75">${esc(
        wrap(input.author, 28, 1)[0] ?? "",
      )}</text>`
    : ""
}
<line x1="150" y1="790" x2="450" y2="790" stroke="${palette.accent}" stroke-opacity="0.5" stroke-width="1"/>
<text x="300" y="828" text-anchor="middle" font-family="Tahoma, Arial, sans-serif" font-size="20" fill="${palette.ink}" fill-opacity="0.6">مكتبة دار الحكمة — منذ 1990</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\n/g, ""))}`;
}
