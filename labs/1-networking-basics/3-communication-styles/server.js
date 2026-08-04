/**
 * Polling vs Long Polling vs SSE vs Webhook — লাইভ ডেমো (ওয়ার্কবুক 1.3.1)
 *
 * চালান: node server.js
 * তারপর ব্রাউজারে খুলুন: http://localhost:4001
 *
 * চারটা এন্ডপয়েন্ট, একই "অর্ডার স্ট্যাটাস" সিমুলেশনের চারটা ভিন্ন ডেলিভারি কৌশল:
 *   GET  /api/polling        → সাথে সাথে current status রিটার্ন করে (client বারবার কল করে)
 *   GET  /api/long-polling   → status "READY" না হওয়া পর্যন্ত response আটকে রাখে (max 8s)
 *   GET  /api/sse            → এক connection-এ status stream করে (text/event-stream)
 *   POST /api/webhook/trigger→ সার্ভার নিজে থেকেই registered callback URL-এ POST করে
 *
 * public/index.html-এ চারটা প্যানেল আছে — Network tab খুলে request pattern-এর পার্থক্য দেখুন।
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4001;

// অর্ডার স্ট্যাটাস সিমুলেশন — কিছুক্ষণ পর "READY" হয়ে যায়, তারপর রিসেট হয়
let orderStatus = "PREPARING";
function resetOrderCycle() {
  orderStatus = "PREPARING";
  setTimeout(() => { orderStatus = "READY"; }, 4000 + Math.random() * 3000);
}
resetOrderCycle();
setInterval(() => {
  if (orderStatus === "READY") resetOrderCycle();
}, 500);

// SSE-তে connected client-দের রাখি
const sseClients = new Set();
setInterval(() => {
  const payload = `data: ${JSON.stringify({ status: orderStatus, ts: Date.now() })}\n\n`;
  for (const res of sseClients) res.write(payload);
}, 1500);

// webhook demo-র জন্য "রেজিস্টার্ড" callback (নিজের সার্ভারেই আরেকটা endpoint-এ POST করব)
function sendJSON(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // ---------- static files ----------
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const file = fs.readFileSync(path.join(__dirname, "public", "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(file);
    return;
  }

  // ---------- Polling ----------
  if (req.method === "GET" && url.pathname === "/api/polling") {
    sendJSON(res, 200, { status: orderStatus, ts: Date.now(), mode: "polling" });
    return;
  }

  // ---------- Long Polling ----------
  if (req.method === "GET" && url.pathname === "/api/long-polling") {
    const start = Date.now();
    const MAX_WAIT = 8000;
    const check = setInterval(() => {
      const waited = Date.now() - start;
      if (orderStatus === "READY") {
        clearInterval(check);
        sendJSON(res, 200, { status: orderStatus, ts: Date.now(), mode: "long-polling", waitedMs: waited });
      } else if (waited >= MAX_WAIT) {
        clearInterval(check);
        sendJSON(res, 200, { status: orderStatus, ts: Date.now(), mode: "long-polling", timedOut: true, waitedMs: waited });
      }
    }, 200);
    req.on("close", () => clearInterval(check));
    return;
  }

  // ---------- SSE ----------
  if (req.method === "GET" && url.pathname === "/api/sse") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(`data: ${JSON.stringify({ status: orderStatus, ts: Date.now() })}\n\n`);
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  // ---------- Webhook trigger (সার্ভার নিজে থেকেই ক্লায়েন্টকে POST করে "notify" করে) ----------
  if (req.method === "POST" && url.pathname === "/api/webhook/trigger") {
    // বাস্তবে এখানে একটা পেমেন্ট গেটওয়ে থাকত যেটা event ঘটলে
    // registered callback URL-এ POST করে। এখানে সিমুলেট করতে ২-৪ সেকেন্ড পর
    // client-কে জানাই যে "webhook fired" — SSE চ্যানেল দিয়েই দেখাচ্ছি চাহিদা মেটাতে।
    sendJSON(res, 202, { accepted: true, note: "সার্ভার এখন ইভেন্ট ঘটলে নিজে থেকেই আপনাকে জানাবে (নিচের webhook log দেখুন)" });
    setTimeout(() => {
      const payload = `event: webhook\ndata: ${JSON.stringify({ event: "payment.success", ts: Date.now() })}\n\n`;
      for (const c of sseClients) c.write(payload);
    }, 2000 + Math.random() * 2000);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`✅ Communication Styles demo চলছে: http://localhost:${PORT}`);
});
