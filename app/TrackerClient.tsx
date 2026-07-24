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
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // drawer খোলা থাকলে body scroll বন্ধ
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Next 16-এ React Compiler চালু — manual `useMemo` লাগে না, কম্পাইলার নিজেই
  // memoize করে। হাতে লিখলে `react-hooks/preserve-manual-memoization` error দেয়।
  const totalDocs = parts.reduce(
    (sum, part) => sum + part.chapters.reduce((s, ch) => s + ch.docs.length, 0),
    0,
  );
  const readCount = readIds.length;
  const percent = totalDocs === 0 ? 0 : Math.round((readCount / totalDocs) * 100);

  const selected = findChapter(parts, selectedChapterId);

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
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
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
              ? "fixed inset-y-0 left-0 z-50 w-[85%] max-w-[360px] p-4 overflow-y-auto glass-panel animate-slide-in-left"
              : "hidden"
          } lg:static lg:block lg:w-[360px] lg:shrink-0 lg:p-0 lg:bg-transparent lg:shadow-none lg:border-0 lg:backdrop-blur-none`}
        >
          <div className="flex flex-col gap-5">
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
                            setExpandedDocId(null);
                            setDrawerOpen(false);
                          }}
                          className={`text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none ${
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
                      isExpanded={expandedDocId === doc.id}
                      note={notes[doc.id] ?? {}}
                      onToggleRead={() => toggleRead(doc.id)}
                      onToggleRevise={() => toggleRevise(doc.id)}
                      onToggleExpand={() =>
                        setExpandedDocId((prev) =>
                          prev === doc.id ? null : doc.id,
                        )
                      }
                      onNoteChange={(field, value) =>
                        updateNote(doc.id, field, value)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface DocCardProps {
  doc: Doc;
  isRead: boolean;
  needsRevise: boolean;
  isExpanded: boolean;
  note: DocNote;
  onToggleRead: () => void;
  onToggleRevise: () => void;
  onToggleExpand: () => void;
  onNoteChange: (field: keyof DocNote, value: string) => void;
}

function DocCard({
  doc,
  isRead,
  needsRevise,
  isExpanded,
  note,
  onToggleRead,
  onToggleRevise,
  onToggleExpand,
  onNoteChange,
}: DocCardProps) {
  const stateClasses = needsRevise
    ? "bg-amber-500/5 border-amber-500/20"
    : isRead
      ? "bg-emerald-500/5 border-emerald-500/20"
      : "bg-zinc-100/30 border-zinc-200/60 dark:bg-zinc-900/30 dark:border-zinc-800/60";

  return (
    <div className={`p-4 rounded-2xl border transition-colors ${stateClasses}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* চেকবক্স ও নাম আলাদা ক্লিক-এলাকা। নামকে `<label>`-এর ভেতরে রাখা
            যাবে না — তাহলে নামে ক্লিক করলেই "পড়া হয়েছে" toggle হয়ে যায়
            (ui-rules.md §৪)। */}
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
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            title={isExpanded ? "বন্ধ করুন" : "পড়ুন"}
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

        <div className="flex items-center gap-2 shrink-0">
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

          <button
            type="button"
            onClick={onToggleRevise}
            disabled={!isRead}
            title={
              isRead
                ? "রিভাইজ দরকার — টগল করুন"
                : "আগে পড়ুন, তারপর রিভাইজ মার্ক করা যাবে"
            }
            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          >
            🔄
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg hover:bg-indigo-500/10 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
          >
            {isExpanded ? "Collapse ▲" : "পড়ুন / নোট ▼"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 flex flex-col gap-4">
          <DocContent content={doc.content} />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              নিজের ভাষায় সারাংশ (২–৩ লাইনে):
            </label>
            <textarea
              value={note.summary ?? ""}
              onChange={(e) => onNoteChange("summary", e.target.value)}
              rows={3}
              className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all resize-y"
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
              className="w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}
