# Progress Tracker — System Design Prep Tracker

_সর্বশেষ আপডেট: ২০২৬-০৭-২৫_

---

## ✅ সম্পন্ন কাজ

### Content / ডেটা সোর্স
- [x] `context/system_design_workbook/` — ৬ পার্ট, ১৭ চ্যাপ্টার, ৩৫ ডক
- [x] প্রতিটা পার্ট ও চ্যাপ্টারের index ফাইল (বাংলা heading সহ)
- [x] `AGENTS.md` — এজেন্ট নিয়মাবলী

### Context ফাইল
- [x] `project-overview.md` — লক্ষ্য, স্ট্যাক, ডেটা কাঠামো, ডেটা মডেল
- [x] `build-plan.md` — ফেজ ০–৩ রোডম্যাপ
- [x] `progress-tracker.md` — (এই ফাইল)
- [x] `ui-tokens.md` — target ডিজাইন টোকেন
- [x] `ui-rules.md` — target UI/UX নিয়ম
- [x] `ui-registry.md` — কম্পোনেন্ট রেজিস্ট্রি (এখনো ফাঁকা, app হলে ভরবে)

---

## 🔄 বর্তমানে চলমান

_কিছু নেই — context ফাইল তৈরি সম্পূর্ণ, ফেজ ০ শুরুর অপেক্ষায়।_

---

## ⏳ বাকি কাজ

### ফেজ ০ — ভিত্তি (Blocker)
- [ ] Next.js 15 + TypeScript + Tailwind v4 scaffold
- [ ] Geist Sans + Geist Mono লোড
- [ ] `globals.css` — CSS custom properties (design tokens) + `.glass-panel`
- [ ] `useLocalStorage.ts` hook
- [ ] `workbookParser.ts` — nested directory walk → `Part[]`
- [ ] `page.tsx` (Server) + `TrackerClient.tsx` (Client)

### ফেজ ১ — MVP
- [ ] Navbar (logo + progress pill + dark mode toggle)
- [ ] Sidebar (part list + chapter buttons + per-part counter)
- [ ] Doc Panel (Markdown কনটেন্ট রেন্ডার)
- [ ] "পড়া হয়েছে" checkbox → localStorage
- [ ] Per-doc notes (সারাংশ + অস্পষ্ট বিষয়)
- [ ] Dark/Light mode
- [ ] Overall + per-part progress
- [ ] Mobile responsive drawer

### ফেজ ২ — High Priority
- [ ] 🔄 "রিভাইজ দরকার" flag + filter
- [ ] Search / Filter
- [ ] Filter by status (unread / রিভাইজ দরকার)
- [ ] Interview drill mode
- [ ] Keyboard navigation

### ফেজ ২ — Medium / Low
- [ ] Export / Import progress (JSON)
- [ ] Read date tracking
- [ ] Spaced repetition
- [ ] Markdown রেন্ডারিং লাইব্রেরি
- [ ] Syntax highlighting
- [ ] Confetti
- [ ] App metadata + favicon

---

## 🐛 পরিচিত সমস্যা / টেকনিক্যাল ঋণ

| সমস্যা | প্রভাব | সমাধানের পথ |
|--------|--------|------------|
| `system_design_workbook.md` লাইন ৫ ও ১২ corrupt — বাক্য মাঝপথে কেটে গেছে | root index ফাইলটা পড়ার অযোগ্য; পার্ট ১-এর লিংক নেই | ফাইলটা নতুন করে লিখুন (৬ পার্টের পরিষ্কার তালিকা) |
| সব index ফাইলে `file:///c:/Users/Sojib Rd/Documents/Projects/...` absolute path | এই মেশিনে (`d:/document-files/...`) লিংক ভাঙা | relative path-এ রূপান্তর |
| root index-এ পুরনো `context/docs/` ফোল্ডারের লিংক | সেই ফোল্ডার আর নেই — সব `system_design_workbook/`-এ সরানো হয়েছে | পুরনো লিংক মুছুন |
| `AGENTS.md`-এর context লিংক `DSA_Prep/`-এ পয়েন্ট করত | এজেন্ট ভুল প্রজেক্টের context পড়ত | ✅ সমাধান হয়েছে — এই প্রজেক্টের পাথে আপডেট |

---

## 📊 System Design পড়াশোনার অগ্রগতি

| পার্ট | চ্যাপ্টার | ডক | পড়া | অবস্থা |
|------|----------|-----|------|--------|
| 1. Networking basics | 4 | 6 | 0 | 🔴 শুরু হয়নি |
| 2. System Architecture & Scaling | 3 | 6 | 0 | 🔴 শুরু হয়নি |
| 3. Data & Speed Up | 2 | 3 | 0 | 🔴 শুরু হয়নি |
| 4. Security & Pipelines | 2 | 3 | 0 | 🔴 শুরু হয়নি |
| 5. Advanced & AI | 2 | 3 | 0 | 🔴 শুরু হয়নি |
| 6. Case Studies | 4 | 11 | 0 | 🔴 শুরু হয়নি |
| **মোট** | **17** | **35** | **0** | **0%** |

> এই টেবিল ম্যানুয়ালি আপডেট করুন অথবা app তৈরি হলে UI থেকে দেখুন।
