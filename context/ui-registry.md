# UI Registry — System Design Prep Tracker

বিদ্যমান সমস্ত UI কম্পোনেন্টের রেজিস্ট্রি। নতুন কম্পোনেন্ট তৈরির আগে এখানে দেখুন — হয়তো ইতিমধ্যে আছে।

---

## ⚠️ বর্তমান অবস্থা: ফাঁকা

**এই প্রজেক্টে এখনো কোনো কোড নেই।** কোনো কম্পোনেন্ট তৈরি হয়নি।

নিচের অংশটা **পরিকল্পিত (planned)** — ফেজ ০/১-এ যেসব ফাইল ও কম্পোনেন্ট তৈরি হবে তার তালিকা।
প্রতিটা কম্পোনেন্ট আসলে তৈরি হওয়ার পর এই ফাইলে তার **প্রকৃত** class, prop ও আচরণ লিখে রাখুন — অনুমান নয়।

---

## পরিকল্পিত ফাইল ম্যাপ

| ফাইল | উদ্দেশ্য | টাইপ | অবস্থা |
|------|---------|------|--------|
| `app/page.tsx` | Root page, workbook parsing | Server Component | ⏳ পরিকল্পিত |
| `app/TrackerClient.tsx` | সম্পূর্ণ UI | Client Component | ⏳ পরিকল্পিত |
| `app/hooks/useLocalStorage.ts` | localStorage state hook | Custom Hook | ⏳ পরিকল্পিত |
| `app/utils/workbookParser.ts` | Nested Markdown পার্সার | Utility | ⏳ পরিকল্পিত |
| `app/globals.css` | Design tokens + global styles | CSS | ⏳ পরিকল্পিত |
| `app/layout.tsx` | Root layout, font, metadata | Server Component | ⏳ পরিকল্পিত |

---

## পরিকল্পিত কম্পোনেন্ট ইনভেন্টরি

> DSA Prep Tracker-এর মতো শুরুতে সব `TrackerClient.tsx`-এ monolithic থাকবে।
> পরে split করলে এই registry আপডেট করতে হবে।

### 🏗️ Layout
- **`<AppShell>`** — full-height flex container, bg/text color, dark mode transition

### 🧭 Navigation
- **`<Navbar>`** — sticky top bar: logo + gradient title, overall progress pill, dark mode toggle
- **`<ProgressPill>`** — `{read}/{total} ({percent}%)` + mini progress bar (mobile-এ hidden)
- **`<MobileDrawerToggle>`** — hamburger button, `lg:hidden`

### 📋 Sidebar
- **`<Sidebar>`** — Part list + chapter navigation; desktop `w-[360px]`, mobile slide-in drawer
- **`<MobileProgressDashboard>`** — mobile-only circular progress ring, `lg:hidden`
- **`<PartGroup>`** — একটা Part-এর header + chapter button list + `{read}/{total}` badge
- **`<ChapterButton>`** — clickable chapter selector; active state indigo left-border

### 📄 Main Panel
- **`<ChapterPanel>`** — selected chapter-এর সম্পূর্ণ বিবরণ; wrapper `glass-panel p-6 md:p-8 rounded-3xl`
- **`<ChapterHeader>`** — part breadcrumb + chapter নাম + বাংলা title
- **`<DocList>`** — চ্যাপ্টারের ডকগুলোর list, header `"ডকুমেন্ট ({count})"`

### 📖 Doc
- **`<DocCard>`** — একটা ডকের card; states: read (emerald) / revise (amber) / unread (zinc)
  - Read checkbox → `toggleRead()`
  - Doc ID (mono, muted) + doc নাম
  - Source attribution (থাকলে)
  - 🔄 Revise toggle button
  - "নোট / রিভাইজ ▼" expand toggle
- **`<DocContent>`** — Markdown কনটেন্ট রেন্ডার; `max-w-[72ch] text-base leading-relaxed`
- **`<NotesSection>`** — expandable, দুটো textarea:
  - "নিজের ভাষায় সারাংশ (২–৩ লাইনে):"
  - "যেটা এখনো পরিষ্কার নয়:"

---

## পরিকল্পিত Custom Hooks

### `useLocalStorage<T>(key: string, initialValue: T)`
- **অবস্থান:** `app/hooks/useLocalStorage.ts`
- **কাজ:** `useState`-এর মতো — কিন্তু `localStorage`-এ persist করে
- **Return:** `[value, setValue]`
- **ব্যবহার:**
  ```tsx
  const [readIds, setReadIds] = useLocalStorage<string[]>('sd_read_ids', []);
  const [reviseIds, setReviseIds] = useLocalStorage<string[]>('sd_revise_ids', []);
  const [notes, setNotes] = useLocalStorage<Record<string, DocNote>>('sd_doc_notes', {});
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('sd_dark_mode', false);
  ```

---

## পরিকল্পিত LocalStorage Keys

| Key | Type | Default | ব্যবহার |
|-----|------|---------|--------|
| `sd_read_ids` | `string[]` | `[]` | পড়া হয়েছে এমন doc IDs |
| `sd_revise_ids` | `string[]` | `[]` | রিভাইজ দরকার এমন doc IDs |
| `sd_doc_notes` | `Record<string, DocNote>` | `{}` | Doc-wise নোট |
| `sd_dark_mode` | `boolean` | `false` | Dark mode on/off |

> `sd_` prefix ব্যবহার করা হচ্ছে যাতে DSA Prep Tracker-এর `dsa_` key-গুলোর সাথে সংঘর্ষ না হয় (একই localhost origin-এ চললে গুরুত্বপূর্ণ)।

---

## পরিকল্পিত Utility Functions

### `parseWorkbook(): Part[]`
- **অবস্থান:** `app/utils/workbookParser.ts`
- **কাজ:** `context/system_design_workbook/` ফোল্ডার walk করে `Part[]` return করে
- **শুধু Server-side** — `fs` module ব্যবহার করে
- **পার্স করে:** `N. Name.md` → Part, `N.M Name.md` → Chapter, `N.M.K Name.md` → Doc
- **পার্স করে না:** index ফাইলের `file:///` লিংক (ভাঙা ও absolute — দেখুন `project-overview.md`)

### `getPartProgress(part: Part): { read: number, total: number }`
- **অবস্থান:** `TrackerClient.tsx` (inline function)
- **কাজ:** একটা Part-এর পড়া ডকের সংখ্যা গণনা
