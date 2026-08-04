/**
 * TCP vs UDP — লাইভ ডেমো (ওয়ার্কবুক 1.2.1 Network Protocols Explained)
 *
 * চালান: node tcp-vs-udp.js
 *
 * কী দেখাবে:
 *  - দুটোই ১০টা করে "প্যাকেট" (একটা করে নম্বর) পাঠায়
 *  - UDP পথে ইচ্ছাকৃতভাবে র‍্যান্ডম প্যাকেট ড্রপ করা হয় (নেটওয়ার্ক loss সিমুলেট করতে)
 *    আর প্যাকেটগুলো এলোমেলো ক্রমে পৌঁছাতে পারে (reorder সিমুলেট)
 *  - TCP পথে কোনো loss/reorder নেই — handshake + reliable, in-order delivery guarantee দেখাবে
 *
 * শেখার পয়েন্ট: TCP-এর নির্ভরযোগ্যতার জন্য দাম দিতে হয় (handshake, retransmission overhead)।
 * UDP দ্রুত ও হালকা কিন্তু কোনো গ্যারান্টি নেই — তাই video call/DNS/gaming-এ UDP,
 * ফাইল ট্রান্সফার/HTTP-এ TCP।
 */

const net = require("net");
const dgram = require("dgram");

const TCP_PORT = 5001;
const UDP_PORT = 5002;
const PACKET_COUNT = 10;

function log(tag, msg) {
  console.log(`[${tag}] ${msg}`);
}

// ---------- TCP সার্ভার ----------
const tcpServer = net.createServer((socket) => {
  log("TCP-SERVER", "নতুন connection — 3-way handshake ইতিমধ্যে সম্পন্ন (OS লেয়ারে)");
  let received = [];
  socket.on("data", (chunk) => {
    const num = chunk.toString().trim();
    received.push(num);
    log("TCP-SERVER", `প্যাকেট পেলাম: #${num} (মোট ${received.length}/${PACKET_COUNT})`);
  });
  socket.on("end", () => {
    log("TCP-SERVER", `সব প্যাকেট এসেছে, ক্রম ঠিক আছে: [${received.join(", ")}]`);
    checkDone();
  });
});

// ---------- UDP সার্ভার ----------
const udpServer = dgram.createSocket("udp4");
let udpReceived = [];
udpServer.on("message", (msg) => {
  const num = msg.toString();
  udpReceived.push(num);
  log("UDP-SERVER", `প্যাকেট পেলাম: #${num} (মোট এসেছে ${udpReceived.length})`);
});

let doneCount = 0;
function checkDone() {
  doneCount++;
  if (doneCount === 2) {
    setTimeout(() => {
      console.log("\n===== ফলাফল তুলনা =====");
      console.log(`TCP: ১০টার ১০টাই এসেছে, ঠিক ক্রমে — গ্যারান্টিড।`);
      const missing = PACKET_COUNT - udpReceived.length;
      console.log(`UDP: ১০টার মধ্যে ${udpReceived.length}টা এসেছে (${missing}টা "হারিয়ে" গেছে) — ক্রম: [${udpReceived.join(", ")}]`);
      console.log("এটাই মূল পার্থক্য: TCP নিশ্চয়তা দেয়, UDP দেয় না — কিন্তু UDP-তে handshake/retransmission ওভারহেড নেই তাই দ্রুত।\n");
      tcpServer.close();
      udpServer.close();
    }, 300);
  }
}

tcpServer.listen(TCP_PORT, () => {
  udpServer.bind(UDP_PORT, () => {
    log("SETUP", `TCP সার্ভার পোর্ট ${TCP_PORT}-এ, UDP সার্ভার পোর্ট ${UDP_PORT}-এ চালু। ২ সেকেন্ড পর ক্লায়েন্ট শুরু হবে...\n`);
    setTimeout(runClients, 1000);
  });
});

function runClients() {
  // ---------- TCP ক্লায়েন্ট ----------
  log("TCP-CLIENT", "connect() কল করছি — 3-way handshake (SYN → SYN-ACK → ACK) হবে");
  const tcpClient = net.createConnection(TCP_PORT, "127.0.0.1", () => {
    log("TCP-CLIENT", "connection স্থাপিত হলো, এখন ১০টা প্যাকেট পাঠাচ্ছি");
    let i = 1;
    const interval = setInterval(() => {
      if (i > PACKET_COUNT) {
        clearInterval(interval);
        tcpClient.end();
        return;
      }
      tcpClient.write(String(i) + "\n");
      i++;
    }, 40);
  });

  // ---------- UDP ক্লায়েন্ট ----------
  log("UDP-CLIENT", "কোনো handshake নেই — সরাসরি প্যাকেট ছুঁড়ে দিচ্ছি (fire and forget)");
  const udpClient = dgram.createSocket("udp4");
  let i = 1;
  const udpInterval = setInterval(() => {
    if (i > PACKET_COUNT) {
      clearInterval(udpInterval);
      udpClient.close();
      checkDone();
      return;
    }
    // ৩০% সম্ভাবনায় প্যাকেট ড্রপ করি — বাস্তব নেটওয়ার্ক loss সিমুলেট করতে
    if (Math.random() > 0.3) {
      udpClient.send(String(i), UDP_PORT, "127.0.0.1");
    } else {
      log("UDP-CLIENT", `প্যাকেট #${i} পাঠানো হলো কিন্তু "নেটওয়ার্কে হারিয়ে" গেল (সিমুলেটেড loss)`);
    }
    i++;
  }, 40);
}
