# 🧪 Networking Basics — Hands-on Labs

`context/system_design_workbook/1. Networking basics/` পড়ার সাথে সাথে বাস্তবে চালিয়ে দেখার জন্য
৪টা ছোট, নিজে-থেকে-চলা ডেমো। কোনো `npm install` লাগে না — শুধু Node.js (server demo-গুলোর জন্য)
আর একটা ব্রাউজার।

> এই ফোল্ডারটা মূল Tracker app থেকে সম্পূর্ণ আলাদা ও স্বাধীন — শেখার জন্য পাশাপাশি রাখা হয়েছে।

## কী আছে

| ফোল্ডার | কোন ডক কভার করে | কীভাবে চালাবেন |
|---------|-----------------|----------------|
| `1-url-and-browser/` | 1.1.1 Parts of a URL, 1.1.2 What Happens When You Type URL | `index.html` ব্রাউজারে খুলুন |
| `2-protocols-and-ssh/` | 1.2.1 Network Protocols, 1.2.2 How SSH Works | `node tcp-vs-udp.js` + `ssh-handshake.html` ব্রাউজারে খুলুন |
| `3-communication-styles/` | 1.3.1 Polling vs Long Polling vs Webhook vs SSE | `node server.js` তারপর http://localhost:4001 |
| `4-concurrency-vs-parallelism/` | 1.4.1 Concurrency vs Parallelism | `index.html` ব্রাউজারে খুলুন |

## কেন এভাবে বানানো হলো

- **কোনো dependency/build step নেই** — খালি Node.js built-in মডিউল (`http`, `net`, `dgram`) আর vanilla JS/HTML
- প্রতিটা ডেমো **standalone** — একটা বাদ দিয়ে আরেকটা চালানো যায়
- ডিজাইন মূল app-এর `context/ui-tokens.md` টোকেন (indigo/cyan gradient, zinc dark theme, glassmorphism) অনুসরণ করে — একই রকম দেখতে লাগে

## পড়ার সাথে সংযোগ

প্রতিটা ডেমোর ভেতরেই ছোট নোট আছে — কোন কনসেপ্ট, ওয়ার্কবুকের কোন ডকের সাথে মেলে, বাস্তবে কী দেখা উচিত।
