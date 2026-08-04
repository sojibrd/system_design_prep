# Network Protocols & SSH

ওয়ার্কবুক: 1.2.1 Network Protocols Explained, 1.2.2 How SSH Works

## TCP vs UDP — লাইভ ডেমো

```bash
node tcp-vs-udp.js
```

লোকাল সার্ভার-ক্লায়েন্ট চালিয়ে দেখাবে TCP ১০০% প্যাকেট গ্যারান্টি করে (in-order), আর UDP-তে
ইচ্ছাকৃতভাবে সিমুলেটেড packet loss (~৩০%) থাকে। কনসোলে লাইভ লগ দেখুন।

**শেখার পয়েন্ট:** নির্ভরযোগ্যতা বিনামূল্যে আসে না — TCP-এর handshake + retransmission overhead
আছে বলেই UDP video call/DNS/gaming-এর মতো latency-sensitive কাজে বেশি ব্যবহৃত হয়।

## SSH Handshake — ভিজ্যুয়াল ওয়াকথ্রু

`ssh-handshake.html` ব্রাউজারে খুলুন এবং "▶ ওয়াকথ্রু চালান" চাপুন। ৮টা ধাপে দেখাবে
TCP connection থেকে শুরু করে key exchange, host verification, public-key authentication,
আর শেষে encrypted shell session পর্যন্ত পুরো প্রবাহ।
