import type { NextConfig } from "next";

// GitHub Pages-এ ডিপ্লয় হয় — তাই static export।
// সাইট বসে https://sojibrd.github.io/system_design_prep/ -এ, তাই CI-তে basePath দরকার;
// লোকালে (`npm run dev`) basePath ফাঁকা রাখা হয় যাতে http://localhost:3000/ কাজ করে।
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/system_design_prep" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
