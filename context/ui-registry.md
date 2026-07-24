# UI Registry — System Design Prep Tracker

বিদ্যমান সমস্ত UI কম্পোনেন্টের রেজিস্ট্রি। নতুন কম্পোনেন্ট তৈরির আগে এখানে দেখুন — হয়তো ইতিমধ্যে আছে।

_সর্বশেষ আপডেট: ২০২৬-০৭-২৫ (ফেজ ০ + ফেজ ১ শেষে)_

---

## ফাইল ম্যাপ

| ফাইল | উদ্দেশ্য | টাইপ |
|------|---------|------|
| `app/page.tsx` | Root page — `parseWorkbook()` কল করে TrackerClient-এ props পাঠায় | Server Component |
| `app/TrackerClient.tsx` | সম্পূর্ণ UI (monolithic) | Client Component |
| `app/DocContent.tsx` | Markdown → React, টোকেন দিয়ে স্টাইল করা | Client Component |
| `app/MermaidDiagram.tsx` | ```mermaid fence → SVG ডায়াগ্রাম | Client Component |
| `scripts/check-diagrams.mjs` | সব mermaid ব্লক পার্স করে যাচাই (`npm run check:diagrams`) | Node script |
| `app/hooks/useLocalStorage.ts` | SSR-safe localStorage state hook | Custom Hook |
| `app/utils/workbookParser.ts` | Nested Markdown ডিরেক্টরি walk | Utility (server-only) |
| `app/globals.css` | Design tokens + glass + animation + scrollbar | CSS |
| `app/layout.tsx` | Root layout, Geist font, metadata, dark-mode FOUC script | Server Component |

> সব কম্পোনেন্ট বর্তমানে `TrackerClient.tsx`-এ আছে। শুধু `DocCard` আলাদা function হিসেবে একই ফাইলে।
> ভবিষ্যতে আলাদা ফাইলে split করলে এই registry আপডেট করতে হবে।

---

## কম্পোনেন্ট ইনভেন্টরি

### 🏗️ Layout

#### `<AppShell>` (implicit — TrackerClient root div)
- **Classes:** `min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300`

---

### 🧭 Navigation

#### `<Navbar>` (`<header>` element)
- **Classes:** `sticky top-0 z-40 w-full glass-panel border-b py-4 px-4 md:px-12 flex items-center justify-between gap-4`
- **বাঁ পাশ:** hamburger (`lg:hidden`) + 🗺️ + gradient title "System Design Workbook" + tagline (`hidden sm:block`)
- **ডান পাশ:** ProgressPill + dark mode toggle

#### `<ProgressPill>` (inline in Navbar)
- **Classes:** `hidden sm:flex items-center gap-3 glass-panel px-4 py-1.5 rounded-full text-sm`
- **কনটেন্ট:** `{read}/{total} ({percent}%)` + `w-20 h-1.5` bar
- **Bar fill:** `bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500`

#### Dark mode toggle
- `☀️` / `🌙` — `setDarkMode(prev => !prev)`, `document.documentElement.classList.toggle('dark')` via `useEffect`

---

### 📋 Sidebar (`<aside>`)

- **Desktop:** `lg:static lg:block lg:w-[360px] lg:shrink-0` — glass বাদ, স্বচ্ছ
- **Mobile drawer:** `fixed inset-y-0 left-0 z-50 w-[85%] max-w-[360px] glass-panel animate-slide-in-left`
- **Overlay:** `lg:hidden fixed inset-0 z-40 bg-black/40`, ক্লিকে বন্ধ
- **Body scroll lock:** drawer খোলা থাকলে `document.body.style.overflow = 'hidden'`
- **Auto-close:** chapter select করলে drawer বন্ধ

#### `<MobileProgressDashboard>` (`lg:hidden`)
- **Classes:** `lg:hidden glass-panel p-5 rounded-2xl flex items-center gap-4`
- বড় `{percent}%` + `{read}/{total} ডক পড়া হয়েছে`

#### `<PartGroup>` (mapped)
- Header: `{part.id}. {part.name}` + `{read}/{total}` badge (`text-[10px] font-mono`)
- Chapter list: `border-l border-zinc-200 dark:border-zinc-800 pl-1`

#### `<ChapterButton>` (mapped)
- **Active:** `bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500`
- **Inactive:** `text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900`
- ডান পাশে `({read}/{total})` — `text-[10px] font-mono`

---

### 📄 Main Panel (`<main>`)

#### `<ChapterPanel>`
- **Wrapper:** `glass-panel p-6 md:p-8 rounded-3xl flex flex-col gap-6`
- **Breadcrumb:** `text-xs font-bold text-indigo-500 uppercase tracking-wider` — `{part.id}. {part.name}`
- **Title:** `text-2xl md:text-3xl font-extrabold` — chapter-এর বাংলা `title`, না থাকলে `name`
- **Doc list header:** `"ডকুমেন্ট ({count})"` — `text-lg font-bold`
- **Empty states:** chapter নেই → `"কোনো চ্যাপ্টার সিলেক্ট করা নেই।"`; doc নেই → `"এই চ্যাপ্টারে কোনো ডকুমেন্ট নেই।"`

---

### 📖 `<DocCard>` (আলাদা function, একই ফাইলে)

**Props:** `doc, isRead, needsRevise, isExpanded, note, onToggleRead, onToggleRevise, onToggleExpand, onNoteChange`

- **State classes (অগ্রাধিকার ক্রমে):**
  - রিভাইজ দরকার → `bg-amber-500/5 border-amber-500/20`
  - পড়া হয়েছে → `bg-emerald-500/5 border-emerald-500/20`
  - বাকি → `bg-zinc-100/30 border-zinc-200/60 dark:bg-zinc-900/30 dark:border-zinc-800/60`
- **Wrapper:** `p-4 rounded-2xl border transition-colors`
- **বাঁ পাশ — দুটো আলাদা ক্লিক-এলাকা** (একসাথে `<label>`-এ মুড়বেন না, দেখুন `ui-rules.md` §৪):
  - `<input type="checkbox">` — `accent-emerald-500`, `aria-label="{doc.name} — পড়া হয়েছে"`; শুধু বক্সে ক্লিকেই read toggle
  - `<button type="button" onClick={onToggleExpand} aria-expanded>` — doc ID (`font-mono text-[10px] text-zinc-400`) + নাম (`text-sm font-semibold`) + source (`text-xs italic`)। ক্লিক করলে ডক খোলে/বন্ধ হয়, read মার্ক **হয় না**
- **ডান পাশ:** status badge + 🔄 revise বাটন (`disabled` যদি `!isRead`) + expand toggle ("পড়ুন / নোট ▼" / "Collapse ▲")

#### Status badges
| অবস্থা | Classes |
|--------|---------|
| ✅ পড়া হয়েছে | `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ... border border-emerald-500/10` |
| 🔄 রিভাইজ দরকার | `bg-amber-500/10 text-amber-600 dark:text-amber-400 ... border border-amber-500/10` |
| ⚪ বাকি | `bg-zinc-200 dark:bg-zinc-800 text-zinc-500` |

#### `<DocContent>` — `app/DocContent.tsx` (expand করলে)
- **Wrapper:** `max-w-[72ch] text-base bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50`
- **Props:** `{ content: string }`
- `react-markdown` + `remark-gfm` (টেবিল, strikethrough, task list)
- `@tailwindcss/typography` (prose) **ব্যবহার করা হয়নি** — তাহলে রঙ/স্পেসিং প্লাগইনের ডিফল্ট থেকে আসত, `ui-tokens.md` থেকে নয়। প্রতিটা element `components` map-এ নিজেদের টোকেন দিয়ে স্টাইল করা
- **Element ম্যাপিং:**

| Element | Classes |
|---------|---------|
| `h1` / `h2` / `h3` | `text-xl` / `text-lg` / `text-base` font-bold, `mt-6 mb-2 first:mt-0` |
| `p` | `my-3 leading-relaxed` |
| `ul` / `ol` | `my-3 list-disc\|list-decimal pl-5 space-y-1.5` |
| `strong` | `font-semibold text-zinc-900 dark:text-zinc-100` |
| `a` | `text-indigo-600 dark:text-indigo-400 underline underline-offset-2`, `target="_blank" rel="noopener noreferrer"` |
| `blockquote` | `pl-4 border-l-2 border-cyan-500/40 bg-cyan-500/5 rounded-r-xl` |
| inline `code` | `font-mono text-[0.85em] bg-zinc-200/60 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded` |
| `pre` | `bg-zinc-900 text-zinc-100 dark:bg-black border border-zinc-800 p-5 rounded-2xl overflow-x-auto` |
| `table` | `overflow-x-auto` wrapper + `rounded-xl border` — চওড়া টেবিল পেজ নয়, নিজের ভেতরে scroll করে |
| ` ```mermaid ` | `<MermaidDiagram>` — বাধা `pre`-তে দেওয়া, `code`-এ নয় (নাহলে ডায়াগ্রাম কালো code-block-এর ভেতরে আটকা পড়ে) |

#### `<MermaidDiagram>` — `app/MermaidDiagram.tsx`
- **Props:** `{ chart: string }`
- **Wrapper:** `my-5 overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-4` — টেবিলের মতোই, চওড়া ডায়াগ্রাম পেজ scroll করায় না
- **Dynamic import** — `mermaid` (~2.5MB) শুধু ডক expand করলে লোড হয়, static import নয়
- **Dark mode:** `useSyncExternalStore` + MutationObserver `<html>`-এর `.dark` class শোনে → mermaid theme `dark`/`default`-এ re-init। `useEffect` + `setState` নয় (Next 16 lint rule)
- **SVG বসে `ref.innerHTML` দিয়ে** — mermaid নিজেই SVG string ফেরায়, `securityLevel: "strict"`
- **Error:** একটা ডায়াগ্রাম ভাঙলে `console.warn` + "⚠️ এই ডায়াগ্রামটি রেন্ডার করা যায়নি।", বাকি ডক অক্ষত

#### `<NotesSection>` (expand করলে)
- দুটো textarea: `"নিজের ভাষায় সারাংশ (২–৩ লাইনে):"` ও `"যেটা এখনো পরিষ্কার নয়:"`
- **Classes:** `w-full text-sm p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all resize-y`

---

## Custom Hooks

### `useLocalStorage<T>(key: string, initialValue: T)`
- **অবস্থান:** `app/hooks/useLocalStorage.ts`
- **Return:** `[value, setValue] as const`
- **`useSyncExternalStore` দিয়ে লেখা**, `useEffect` + `setState` দিয়ে নয় — Next 16-এর `react-hooks/set-state-in-effect` rule effect-ভিত্তিক লেখাটাকে error দেয়
- **SSR-safe:** server ও hydration pass-এ `getServerSnapshot` → `initialValue`, তারপর React নিজেই client snapshot-এ সুইচ করে
- **⚠️ দুটো ফাঁদ যেটা এড়ানো হয়েছে** (এই ফাইল বদলানোর আগে পড়ুন):
  - `getSnapshot` প্রতিবার নতুন object ফেরালে React অসীম লুপে পড়ে → module-level `snapshotCache` raw string না বদলালে আগের reference ফেরত দেয়
  - কলার literal (`[]`, `{}`) দেয় = প্রতি render-এ নতুন reference → `initialRef` দিয়ে প্রথম মানটা ধরে রাখা হয়
- **Cross-tab sync:** `storage` event শোনে
- **ব্যবহার:**
  ```tsx
  const [readIds, setReadIds] = useLocalStorage<string[]>('sd_read_ids', []);
  const [reviseIds, setReviseIds] = useLocalStorage<string[]>('sd_revise_ids', []);
  const [notes, setNotes] = useLocalStorage<Record<string, DocNote>>('sd_doc_notes', {});
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('sd_dark_mode', false);
  ```

---

## LocalStorage Keys

| Key | Type | Default | ব্যবহার |
|-----|------|---------|--------|
| `sd_read_ids` | `string[]` | `[]` | পড়া হয়েছে এমন doc IDs |
| `sd_revise_ids` | `string[]` | `[]` | রিভাইজ দরকার এমন doc IDs |
| `sd_doc_notes` | `Record<string, DocNote>` | `{}` | Doc-wise নোট (`{ summary?, unclear? }`) |
| `sd_dark_mode` | `boolean` | `false` | Dark mode on/off |

> `sd_` prefix — DSA Prep Tracker-এর `dsa_` key-র সাথে সংঘর্ষ এড়াতে (একই localhost origin-এ চললে জরুরি)।
> `sd_dark_mode` `layout.tsx`-এর inline script-ও পড়ে (FOUC এড়াতে) — key বদলালে সেখানেও বদলাতে হবে।

---

## Utility Functions

### `parseWorkbook(): Part[]`
- **অবস্থান:** `app/utils/workbookParser.ts`
- **শুধু Server-side** — `node:fs` ব্যবহার করে
- **পার্স করে:** `N. Name.md` → Part, `N.M Name.md` → Chapter, `N.M.K Name.md` → Doc
- **Doc-এ আলাদা করে:** প্রথম `# heading` → `name`, `*Source: ...*` → `source`, বাকিটা → `content`
- **পার্স করে না:** index ফাইলের `file:///` লিংক (ভাঙা ও absolute)
- **Sort:** `compareIds()` — numeric prefix ধরে, তাই `1.10` আসে `1.2`-এর পরে
- **Error handling:** কোনো ডক পড়তে ব্যর্থ হলে `console.warn` দিয়ে skip, build ভাঙে না

### `countDocs(parts: Part[]): number`
- **অবস্থান:** `app/utils/workbookParser.ts` — মোট doc সংখ্যা

### `getPartProgress(part) / getChapterProgress(chapter)`
- **অবস্থান:** `TrackerClient.tsx` (inline) — `{ read, total }` ফেরে

---

## TypeScript Interfaces

| Interface | অবস্থান | ফিল্ড |
|-----------|---------|-------|
| `Doc` | `workbookParser.ts` | `id, name, filePath, source?, content` |
| `Chapter` | `workbookParser.ts` | `id, name, title?, docs` |
| `Part` | `workbookParser.ts` | `id, name, title?, chapters` |
| `DocNote` | `TrackerClient.tsx` | `summary?, unclear?` |
