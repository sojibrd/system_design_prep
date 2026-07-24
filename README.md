# 🗺️ System Design Workbook

System Design পড়াশোনার ব্যক্তিগত ট্র্যাকার — Google বা যেকোনো বড় টেক কোম্পানির
সিস্টেম ডিজাইন রাউন্ডের প্রস্তুতির জন্য।

**লাইভ:** https://sojibrd.github.io/system_design_prep/

## কী করে

- `context/system_design_workbook/`-এর ৬ পার্ট → ১৭ চ্যাপ্টার → ৩৫ ডক পার্স করে দেখায়
- প্রতিটা ডক "পড়া হয়েছে" মার্ক করা যায়
- "🔄 রিভাইজ দরকার" আলাদা করে মার্ক করা যায় — ইন্টারভিউয়ের আগে দ্রুত ঝালিয়ে নিতে
- প্রতিটা ডকে নোট — নিজের ভাষায় সারাংশ + যেটা এখনো পরিষ্কার নয়
- সব progress ব্রাউজারের `localStorage`-এ, কোনো backend নেই

## টেক স্ট্যাক

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 · react-markdown

## লোকালি চালানো

```bash
npm install
npm run dev
```

http://localhost:3000 খুলুন।

## ডিপ্লয়

`master`-এ push করলে GitHub Actions নিজে থেকেই build করে GitHub Pages-এ পাঠায়
(`.github/workflows/deploy.yml`)।

## ডকুমেন্টেশন

এই প্রজেক্টের সব সিদ্ধান্ত ও নিয়ম `context/` ফোল্ডারে:

| ফাইল | কী আছে |
|------|--------|
| `project-overview.md` | লক্ষ্য, স্ট্যাক, ডেটা কাঠামো, ডেটা মডেল |
| `build-plan.md` | ফেজ-ভিত্তিক রোডম্যাপ |
| `progress-tracker.md` | কী হয়েছে, কী বাকি, টেকনিক্যাল ঋণ |
| `ui-tokens.md` | রং, টাইপোগ্রাফি, স্পেসিং টোকেন |
| `ui-rules.md` | UI/UX নিয়ম ও anti-pattern |
| `ui-registry.md` | সব কম্পোনেন্ট, hook, localStorage key |
