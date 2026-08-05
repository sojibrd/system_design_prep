/**
 * labs/-এর browser-only ডেমোগুলো public/labs/-এ কপি করে দেয়, যাতে
 * Next static export (`output: "export"`) সেগুলো হুবহু `out/`-এ নিয়ে যায়
 * এবং GitHub Pages-এ লাইভ চলে।
 *
 * শুধু pure client-side ডেমো কপি হয় — Node.js সার্ভার/স্ক্রিপ্টভিত্তিক
 * ডেমো (যেগুলোর জন্য `node xxx.js` লাগে) static hosting-এ চলতেই পারবে না,
 * তাই বাদ দেওয়া হয়েছে।
 *
 * `labs/` হলো একমাত্র সোর্স-অফ-ট্রুথ — এখানেই এডিট করবেন।
 * `public/labs/` অটো-জেনারেটেড (.gitignore-এ আছে, কমিট হয় না)।
 *
 *   node scripts/copy-labs.mjs
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const SRC_ROOT = "labs";
const DEST_ROOT = "public/labs";

// browser-only ডেমো — Node সার্ভার/স্ক্রিপ্ট নির্ভর নয়
const BROWSER_ONLY_DEMOS = [
  "1-networking-basics/index.html",
  "1-networking-basics/1-url-and-browser",
  "1-networking-basics/2-protocols-and-ssh/ssh-handshake.html",
  "1-networking-basics/4-concurrency-vs-parallelism",
];

if (existsSync(DEST_ROOT)) rmSync(DEST_ROOT, { recursive: true });
mkdirSync(DEST_ROOT, { recursive: true });

let copied = 0;
for (const relPath of BROWSER_ONLY_DEMOS) {
  const src = join(SRC_ROOT, relPath);
  const dest = join(DEST_ROOT, relPath);
  if (!existsSync(src)) {
    console.warn(`⚠️  পাওয়া যায়নি, স্কিপ করা হলো: ${src}`);
    continue;
  }
  mkdirSync(join(dest, ".."), { recursive: true });
  cpSync(src, dest, { recursive: true });
  copied += 1;
}

console.log(`✅ ${copied}/${BROWSER_ONLY_DEMOS.length} labs আইটেম public/labs/-এ কপি হলো`);
