import fs from "node:fs";
import path from "node:path";

/**
 * Workbook parser — server-side only (`node:fs` ব্যবহার করে)।
 *
 * ⚠️ গুরুত্বপূর্ণ নিয়ম (ui-rules.md §১, project-overview.md):
 * index ফাইলগুলোর ভেতরের `file:///c:/Users/Sojib Rd/...` লিংক পার্স করা হয় **না** —
 * সেগুলো absolute path ও এই মেশিনে ভাঙা। structure পুরোপুরি ফোল্ডার ও ফাইলের
 * নাম থেকে তৈরি হয়। index ফাইল থেকে শুধু বাংলা heading (`title`) নেওয়া হয়।
 *
 * ফোল্ডার কাঠামো:
 *   system_design_workbook/
 *   ├── 1. Networking basics.md            ← Part index (title উৎস)
 *   └── 1. Networking basics/
 *       ├── 1.1 URL and Browser.md         ← Chapter index (title উৎস)
 *       └── 1.1 URL and Browser/
 *           └── 1.1.1 Parts of a URL.md    ← Doc (আসল কনটেন্ট)
 */

export interface Doc {
  id: string; // "1.1.1"
  name: string; // "Parts of a URL"
  filePath: string; // context-relative path
  source?: string; // "*Source: Anup Panwar*" লাইন থেকে
  content: string; // Markdown body (h1 ও source লাইন বাদে)
}

export interface Chapter {
  id: string; // "1.1"
  name: string; // "URL and Browser"
  title?: string; // index ফাইলের বাংলা heading
  docs: Doc[];
}

export interface Part {
  id: number; // 1
  name: string; // "Networking basics"
  title?: string; // index ফাইলের বাংলা heading
  chapters: Chapter[];
}

const WORKBOOK_DIR = path.join(
  process.cwd(),
  "context",
  "system_design_workbook",
);

/** "1.1.1 Parts of a URL.md" → { id: "1.1.1", name: "Parts of a URL" } */
function splitEntry(fileName: string) {
  const base = fileName.replace(/\.md$/i, "");
  const match = base.match(/^(\d+(?:\.\d+)*)[.\s]+(.*)$/);
  if (!match) return null;
  return { id: match[1], name: match[2].trim() };
}

/** numeric prefix ধরে sort — alphabetical নয়, নাহলে 1.10 আসে 1.2-এর আগে */
function compareIds(a: string, b: string) {
  const as = a.split(".").map(Number);
  const bs = b.split(".").map(Number);
  for (let i = 0; i < Math.max(as.length, bs.length); i++) {
    const diff = (as[i] ?? 0) - (bs[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** একটা .md ফাইলের প্রথম `# heading` — index ফাইলের বাংলা title-এর জন্য */
function readHeading(filePath: string): string | undefined {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const match = raw.match(/^#\s+(.+)$/m);
    return match?.[1].trim();
  } catch {
    return undefined;
  }
}

/** Doc ফাইল পড়ে heading ও source লাইন আলাদা করে, বাকিটা content */
function readDoc(filePath: string, id: string, fallbackName: string): Doc {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);

  let name = fallbackName;
  let source: string | undefined;
  let start = 0;

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    if (!line) {
      start = i + 1;
      continue;
    }
    const heading = line.match(/^#\s+(.+)$/);
    if (heading) {
      name = heading[1].trim();
      start = i + 1;
      continue;
    }
    const src = line.match(/^\*Source:\s*(.+?)\*$/i);
    if (src) {
      source = src[1].trim();
      start = i + 1;
      continue;
    }
    break;
  }

  return {
    id,
    name,
    filePath: path
      .relative(process.cwd(), filePath)
      .split(path.sep)
      .join("/"),
    source,
    content: lines.slice(start).join("\n").trim(),
  };
}

/**
 * পুরো workbook পার্স করে `Part[]` ফেরে।
 * কোনো একটা ফাইল পড়তে ব্যর্থ হলে পুরো build ভাঙে না — সেটা skip করে warn দেয়
 * (ui-rules.md §১)।
 */
export function parseWorkbook(): Part[] {
  if (!fs.existsSync(WORKBOOK_DIR)) {
    console.warn(`[workbookParser] ডিরেক্টরি পাওয়া যায়নি: ${WORKBOOK_DIR}`);
    return [];
  }

  const parts: Part[] = [];

  for (const partFile of fs.readdirSync(WORKBOOK_DIR)) {
    if (!partFile.endsWith(".md")) continue;
    const partInfo = splitEntry(partFile);
    if (!partInfo || partInfo.id.includes(".")) continue; // Part-এ dot থাকে না

    const partDir = path.join(WORKBOOK_DIR, partFile.replace(/\.md$/i, ""));
    const chapters: Chapter[] = [];

    if (fs.existsSync(partDir) && fs.statSync(partDir).isDirectory()) {
      for (const chapterFile of fs.readdirSync(partDir)) {
        if (!chapterFile.endsWith(".md")) continue;
        const chapterInfo = splitEntry(chapterFile);
        if (!chapterInfo) continue;

        const chapterDir = path.join(
          partDir,
          chapterFile.replace(/\.md$/i, ""),
        );
        const docs: Doc[] = [];

        if (fs.existsSync(chapterDir) && fs.statSync(chapterDir).isDirectory()) {
          for (const docFile of fs.readdirSync(chapterDir)) {
            if (!docFile.endsWith(".md")) continue;
            const docInfo = splitEntry(docFile);
            if (!docInfo) continue;
            try {
              docs.push(
                readDoc(
                  path.join(chapterDir, docFile),
                  docInfo.id,
                  docInfo.name,
                ),
              );
            } catch (err) {
              console.warn(`[workbookParser] skip: ${docFile}`, err);
            }
          }
        }

        docs.sort((a, b) => compareIds(a.id, b.id));
        chapters.push({
          id: chapterInfo.id,
          name: chapterInfo.name,
          title: readHeading(path.join(partDir, chapterFile)),
          docs,
        });
      }
    }

    chapters.sort((a, b) => compareIds(a.id, b.id));
    parts.push({
      id: Number(partInfo.id),
      name: partInfo.name,
      title: readHeading(path.join(WORKBOOK_DIR, partFile)),
      chapters,
    });
  }

  parts.sort((a, b) => a.id - b.id);
  return parts;
}

/** সব Part মিলিয়ে মোট কতগুলো Doc */
export function countDocs(parts: Part[]): number {
  return parts.reduce(
    (sum, part) =>
      sum + part.chapters.reduce((s, chapter) => s + chapter.docs.length, 0),
    0,
  );
}
