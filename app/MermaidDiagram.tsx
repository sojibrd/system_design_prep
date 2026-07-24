"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";

/**
 * Mermaid ডায়াগ্রাম রেন্ডারার।
 *
 * `DocContent.tsx` থেকে শুধু ```mermaid fence-এর জন্য ডাকা হয়; বাকি সব code
 * fence আগের মতোই <pre> হিসেবে থাকে।
 *
 * তিনটে সিদ্ধান্ত যেগুলো বদলানোর আগে পড়ুন:
 *
 * ১. `mermaid` প্যাকেজটা ভারী (~2.5MB) — তাই static import নয়, effect-এর
 *    ভেতরে dynamic `import()`। ডক expand না করলে bundle-টা কখনো লোডই হয় না।
 *
 * ২. Dark mode জানতে `useSyncExternalStore` + MutationObserver — <html>-এর
 *    `.dark` class শোনে। useEffect + setState দিয়ে করলে Next 16-এর
 *    `react-hooks/set-state-in-effect` error দেয় (ui-rules.md §১)।
 *
 * ৩. SVG DOM-এ বসে ref.innerHTML দিয়ে, React state দিয়ে নয় — mermaid নিজেই
 *    SVG string ফেরায়। `securityLevel: "strict"` HTML label ও script বন্ধ
 *    রাখে, তাই এটা ui-rules.md §৭-এর `dangerouslySetInnerHTML` নিষেধাজ্ঞার
 *    আওতায় পড়ে না — এখানে ইনপুট ব্যবহারকারীর নয়, নিজেদের workbook।
 */

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getIsDark() {
  return document.documentElement.classList.contains("dark");
}

// server ও hydration pass-এ light — layout.tsx-এর FOUC script ক্লায়েন্টে
// class বসিয়ে দেয়, MutationObserver সেটা ধরে ফেলে।
function getIsDarkOnServer() {
  return false;
}

export default function MermaidDiagram({ chart }: { chart: string }) {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getIsDark,
    getIsDarkOnServer,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  // mermaid-এর id CSS selector হিসেবে ব্যবহার হয়, তাই useId-এর `:` বাদ
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = containerRef.current;
      if (!container) return;

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark ? "dark" : "default",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        });

        const { svg } = await mermaid.render(diagramId, chart);
        if (cancelled) return;
        container.innerHTML = svg;

        // mermaid ডিফল্টে svg-তে `max-width` বসিয়ে দেয়, ফলে চওড়া ডায়াগ্রাম
        // 72ch বাক্সে ঢুকতে গিয়ে এত ছোট হয়ে যায় যে লেখা পড়া যায় না।
        // তার বদলে natural size রাখা হচ্ছে — বাক্সটা নিজে scroll করবে।
        const rendered = container.querySelector("svg");
        if (rendered) {
          const viewBox = rendered.getAttribute("viewBox")?.split(/[\s,]+/);
          const naturalWidth = viewBox ? Number(viewBox[2]) : 0;
          rendered.style.maxWidth = "none";
          if (naturalWidth > 0) {
            rendered.style.width = `${naturalWidth}px`;
            rendered.style.height = "auto";
          }
        }
      } catch (error) {
        if (cancelled) return;
        // একটা ডায়াগ্রাম ভাঙলে পুরো ডক যেন অপাঠ্য না হয় — ui-rules.md §১
        console.warn(`Mermaid render failed (${diagramId}):`, error);
        container.textContent = "⚠️ এই ডায়াগ্রামটি রেন্ডার করা যায়নি।";
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, isDark, diagramId]);

  return (
    <div className="my-5 overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-4">
      <div
        ref={containerRef}
        role="img"
        aria-label="আর্কিটেকচার ডায়াগ্রাম"
        // justify-start — svg বাক্সের চেয়ে চওড়া হলে justify-center কিছু
        // ব্রাউজারে বাঁ দিকটা কেটে ফেলে; ছোট ডায়াগ্রাম mx-auto দিয়ে মাঝে বসে
        className="flex min-h-20 items-center justify-start text-sm text-zinc-500 [&_svg]:mx-auto"
      >
        ডায়াগ্রাম লোড হচ্ছে…
      </div>
    </div>
  );
}
