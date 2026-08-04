# Communication Styles — Polling vs Long Polling vs SSE vs Webhook

ওয়ার্কবুক: 1.3.1 Polling vs Long Polling vs Webhook vs SSE

## চালানো

```bash
node server.js
```

তারপর ব্রাউজারে খুলুন: **http://localhost:4001**

চারটা প্যানেল — প্রতিটাতে নিজে নিজে বাটনে ক্লিক করে চালু করুন, আর ব্রাউজারের DevTools →
Network tab খুলে request pattern-এর পার্থক্য চোখে দেখুন:

| প্যানেল | কী দেখবেন |
|--------|----------|
| Polling | প্রতি ১.৫ সেকেন্ডে নতুন request — বেশিরভাগ বার "PREPARING" ফেরত আসে |
| Long Polling | request পাঠানোর পর কয়েক সেকেন্ড আটকে থাকে, তারপর উত্তর আসে |
| SSE | একটাই connection (Network tab-এ pending থাকবে), সার্ভার push করে |
| Webhook | ট্রিগার করার ২-৪ সেকেন্ড পর সার্ভার নিজে থেকে event পাঠায় (SSE চ্যানেল দিয়ে দেখানো হয়েছে, কারণ ব্রাউজার নিজে server হতে পারে না) |

## নোট: Webhook সিমুলেশন কেন SSE দিয়ে

বাস্তব webhook-এ সার্ভার (যেমন Stripe) আপনার **নিজের সার্ভারের** একটা URL-এ POST করে
(আপনার backend সেটা registered callback URL হিসেবে আগেই দিয়ে রাখে)। ব্রাউজার নিজে
একটা publicly-reachable server হতে পারে না, তাই এই ডেমোতে "webhook fired" ঘটনাটা
একই SSE চ্যানেল দিয়ে ব্রাউজারে জানানো হয়েছে — তবে ধারণাটা এক: **ক্লায়েন্ট কিছুই পোল করছে না,
সার্ভারই ঘটনা ঘটলে জানাচ্ছে।**
