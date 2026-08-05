"use client";

import { useEffect, useState } from "react";
import DocContent from "./DocContent";
import useLocalStorage from "./hooks/useLocalStorage";
import type { Chapter, Doc, Part } from "./utils/workbookParser";

interface DocNote {
  summary?: string;
  unclear?: string;
}

interface TrackerClientProps {
  parts: Part[];
}

/** কোন Part-এর ভেতর এই chapter, সেটাসহ ফেরত দেয় */
function findChapter(parts: Part[], chapterId: string) {
  for (const part of parts) {
    const chapter = part.chapters.find((c) => c.id === chapterId);
    if (chapter) return { part, chapter };
  }
  return null;
}

export default function TrackerClient({ parts }: TrackerClientProps) {
  const [readIds, setReadIds] = useLocalStorage<string[]>("sd_read_ids", []);
  const [reviseIds, setReviseIds] = useLocalStorage<string[]>(
    "sd_revise_ids",
    [],
  );
  const [notes, setNotes] = useLocalStorage<Record<string, DocNote>>(
    "sd_doc_notes",
    {},
  );
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(
    "sd_dark_mode",
    false,
  );

  const firstChapterId = parts[0]?.chapters[0]?.id ?? "";
  const [selectedChapterId, setSelectedChapterId] = useState(firstChapterId);
  const [readingDocId, setReadingDocId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // drawer বা modal খোলা থাকলে body scroll বন্ধ
  useEffect(() => {
    document.body.style.overflow = drawerOpen || readingDocId !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, readingDocId]);

  // Next 16-এ React Compiler চালু — manual `useMemo` লাগে না, কম্পাইলার নিজেই
  // memoize করে। হাতে লিখলে `react-hooks/preserve-manual-memoization` error দেয়।
  const totalDocs = parts.reduce(
    (sum, part) => sum + part.chapters.reduce((s, ch) => s + ch.docs.length, 0),
    0,
  );
  const readCount = readIds.length;
  const percent = totalDocs === 0 ? 0 : Math.round((readCount / totalDocs) * 100);

  const selected = findChapter(parts, selectedChapterId);

  // find currently reading doc info
  let readingDocInfo: { doc: Doc; part: Part; chapter: Chapter } | null = null;
  if (readingDocId) {
    for (const part of parts) {
      for (const chapter of part.chapters) {
        const doc = chapter.docs.find((d) => d.id === readingDocId);
        if (doc) {
          readingDocInfo = { doc, part, chapter };
          break;
        }
      }
      if (readingDocInfo) break;
    }
  }

  function getPartProgress(part: Part) {
    const docs = part.chapters.flatMap((c) => c.docs);
    return {
      read: docs.filter((d) => readIds.includes(d.id)).length,
      total: docs.length,
    };
  }

  function getChapterProgress(chapter: Chapter) {
    return {
      read: chapter.docs.filter((d) => readIds.includes(d.id)).length,
      total: chapter.docs.length,
    };
  }

  function toggleRead(docId: string) {
    setReadIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
    // না-পড়া ডক রিভাইজে থাকার মানে নেই (ui-rules.md §৪)
    if (readIds.includes(docId)) {
      setReviseIds((prev) => prev.filter((id) => id !== docId));
    }
  }

  function toggleRevise(docId: string) {
    setReviseIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
  }

  function updateNote(docId: string, field: keyof DocNote, value: string) {
    setNotes((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], [field]: value },
    }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
      {/* ---------------- Navbar ---------------- */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b py-4 px-4 md:px-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            title="মেনু খুলুন"
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          >
            ☰
          </button>
          <span className="text-xl">🗺️</span>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent truncate max-w-[175px] sm:max-w-none">
              System Design Workbook
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Google প্রস্তুতির ব্যক্তিগত ট্র্যাকার
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 glass-panel px-4 py-1.5 rounded-full text-sm">
            <span className="font-semibold">
              {readCount}/{totalDocs} ({percent}%)
            </span>
            <div className="w-20 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/labs/1-networking-basics/index.html`}
            title="Hands-on Labs — ব্রাউজারে চালানো যায় এমন ডেমো"
            className="hidden sm:flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-full text-sm font-medium hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
          >
            🧪 Labs
          </a>
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            title={darkMode ? "লাইট মোড" : "ডার্ক মোড"}
            className="p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1600px] mx-auto flex gap-6 p-4 md:p-6 lg:p-8">
        {/* ---------------- Sidebar ---------------- */}
        {drawerOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <aside
          className={`${
            drawerOpen
              ? "fixed inset-y-0 left-0 z-50 w-[85%] max-w-[360px] p-4 overflow-y-auto bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-xl animate-slide-in-left"
              : "hidden"
          } lg:static lg:block lg:w-[360px] lg:shrink-0 lg:p-0 lg:bg-transparent lg:shadow-none lg:border-0 lg:backdrop-blur-none`}
        >
          <div className="flex flex-col gap-5">
            {/* Drawer header — মোবাইলে close button */}
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">বিষয়সূচি</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                title="বন্ধ করুন"
                className="p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors text-zinc-500 dark:text-zinc-400"
              >
                ✕
              </button>
            </div>

            {/* Mobile progress dashboard */}
            <div className="lg:hidden glass-panel p-5 rounded-2xl flex items-center gap-4">
              <div className="text-2xl font-extrabold">{percent}%</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {readCount}/{totalDocs} ডক পড়া হয়েছে
              </div>
            </div>

            {parts.map((part) => {
              const progress = getPartProgress(part);
              return (
                <div key={part.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <h2 className="text-sm font-bold">
                      {part.id}. {part.name}
                    </h2>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                      {progress.read}/{progress.total}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-800 pl-1">
                    {part.chapters.map((chapter) => {
                      const chapterProgress = getChapterProgress(chapter);
                      const isSelected = chapter.id === selectedChapterId;
                      return (
                        <button
                          key={chapter.id}
                          type="button"
                          onClick={() => {
                            setSelectedChapterId(chapter.id);
                            setDrawerOpen(false);
                          }}
                          className={`text-left text-sm px-3 py-2.5 sm:py-2 rounded-lg flex items-center justify-between gap-2 transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none ${
                            isSelected
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <span>
                            {chapter.id} {chapter.name}
                          </span>
                          <span className="text-[10px] font-mono shrink-0">
                            ({chapterProgress.read}/{chapterProgress.total})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ---------------- Main panel ---------------- */}
        <main className="flex-1 min-w-0">
          {!selected ? (
            <div className="glass-panel p-8 rounded-3xl text-center text-zinc-500">
              কোনো চ্যাপ্টার সিলেক্ট করা নেই।
            </div>
          ) : (
            <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col gap-6">
              <div>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                  {selected.part.id}. {selected.part.name}
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold mt-1">
                  {selected.chapter.title ?? selected.chapter.name}
                </h2>
              </div>

              <h3 className="text-lg font-bold">
                ডকুমেন্ট ({selected.chapter.docs.length})
              </h3>

              {selected.chapter.docs.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  এই চ্যাপ্টারে কোনো ডকুমেন্ট নেই।
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selected.chapter.docs.map((doc) => (
                    <DocCard
                      key={doc.id}
                      doc={doc}
                      isRead={readIds.includes(doc.id)}
                      needsRevise={reviseIds.includes(doc.id)}
                      onToggleRead={() => toggleRead(doc.id)}
                      onToggleRevise={() => toggleRevise(doc.id)}
                      onOpen={() => setReadingDocId(doc.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ---------------- Fullscreen Reading Modal ---------------- */}
      {readingDocInfo && (
        <ReadingModal
          doc={readingDocInfo.doc}
          part={readingDocInfo.part}
          chapter={readingDocInfo.chapter}
          isRead={readIds.includes(readingDocInfo.doc.id)}
          needsRevise={reviseIds.includes(readingDocInfo.doc.id)}
          note={notes[readingDocInfo.doc.id] ?? {}}
          onToggleRead={() => toggleRead(readingDocInfo!.doc.id)}
          onToggleRevise={() => toggleRevise(readingDocInfo!.doc.id)}
          onNoteChange={(field, val) => updateNote(readingDocInfo!.doc.id, field, val)}
          onClose={() => setReadingDocId(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface DocCardProps {
  doc: Doc;
  isRead: boolean;
  needsRevise: boolean;
  onToggleRead: () => void;
  onToggleRevise: () => void;
  onOpen: () => void;
}

function DocCard({
  doc,
  isRead,
  needsRevise,
  onToggleRead,
  onToggleRevise,
  onOpen,
}: DocCardProps) {
  const stateClasses = needsRevise
    ? "bg-amber-500/5 border-amber-500/20"
    : isRead
      ? "bg-emerald-500/5 border-emerald-500/20"
      : "bg-zinc-100/30 border-zinc-200/60 dark:bg-zinc-900/30 dark:border-zinc-800/60";

  return (
    <div className={`p-4 rounded-2xl border transition-colors ${stateClasses}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isRead}
            onChange={onToggleRead}
            className="mt-1 size-4 accent-emerald-500 shrink-0 cursor-pointer focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            aria-label={`${doc.name} — পড়া হয়েছে`}
            title="পড়া হয়েছে"
          />
          <button
            type="button"
            onClick={onOpen}
            title="পড়ুন"
            className="min-w-0 flex-1 text-left cursor-pointer rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <span className="font-mono text-[10px] text-zinc-400 mr-2">
              {doc.id}
            </span>
            <span className="text-sm font-semibold">{doc.name}</span>
            {doc.source && (
              <span className="block text-xs italic text-zinc-400 dark:text-zinc-500 mt-0.5">
                Source: {doc.source}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto sm:shrink-0 justify-between sm:justify-end">
          {needsRevise ? (
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/10">
              🔄 রিভাইজ দরকার
            </span>
          ) : isRead ? (
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/10">
              ✅ পড়া হয়েছে
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
              ⚪ বাকি
            </span>
          )}

          {isRead && (
            <button
              type="button"
              onClick={onToggleRevise}
              title="রিভাইজ দরকার — টগল করুন"
              className="text-[10px] font-bold px-3 py-2 sm:py-1 sm:px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
            >
              🔄
            </button>
          )}

          <button
            type="button"
            onClick={onOpen}
            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 sm:py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors flex-1 sm:flex-none text-center"
          >
            পড়ুন 📖
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface ReadingModalProps {
  doc: Doc;
  part: Part;
  chapter: Chapter;
  isRead: boolean;
  needsRevise: boolean;
  note: DocNote;
  onToggleRead: () => void;
  onToggleRevise: () => void;
  onNoteChange: (field: keyof DocNote, value: string) => void;
  onClose: () => void;
}

function ReadingModal({
  doc,
  part,
  chapter,
  isRead,
  needsRevise,
  note,
  onToggleRead,
  onToggleRevise,
  onNoteChange,
  onClose,
}: ReadingModalProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950 animate-slide-up overflow-hidden">
      {/* Top Header / Breadcrumb */}
      <header className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider truncate">
            {part.id}. {part.name} › {chapter.name}
          </p>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {doc.id} {doc.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
          title="বন্ধ করুন"
        >
          ✕
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
        {doc.source && (
          <p className="text-xs italic text-zinc-400 dark:text-zinc-500 mb-4">
            Source: {doc.source}
          </p>
        )}

        <DocContent content={doc.content} />

        {/* Notes Collapsible Section */}
        {showNotes && (
          <div className="mt-6 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex flex-col gap-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              📝 ব্যক্তিগত নোট
            </h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                নিজের ভাষায় সারাংশ (২–৩ লাইনে):
              </label>
              <textarea
                value={note.summary ?? ""}
                onChange={(e) => onNoteChange("summary", e.target.value)}
                rows={3}
                className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-y"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                যেটা এখনো পরিষ্কার নয়:
              </label>
              <textarea
                value={note.unclear ?? ""}
                onChange={(e) => onNoteChange("unclear", e.target.value)}
                rows={3}
                className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-y"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Action Bar */}
      <footer className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
        <button
          type="button"
          onClick={onToggleRead}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors ${
            isRead
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          <span>{isRead ? "✅ পড়া হয়েছে" : "☐ পড়া হয়েছে?"}</span>
        </button>

        {isRead && (
          <button
            type="button"
            onClick={onToggleRevise}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
              needsRevise
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
            title="রিভাইজ দরকার টগল"
          >
            🔄 {needsRevise ? "রিভাইজ" : ""}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowNotes((prev) => !prev)}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
            showNotes || note.summary || note.unclear
              ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          📝 নোট {note.summary || note.unclear ? "•" : ""}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
        >
          ✕ বন্ধ
        </button>
      </footer>
    </div>
  );
}
