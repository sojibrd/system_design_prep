"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Doc-এর Markdown কনটেন্ট রেন্ডার করে।
 *
 * ui-rules.md §৭ — `dangerouslySetInnerHTML` ব্যবহার করা হয় না; react-markdown
 * HTML পার্স না করেই নিরাপদে React node বানায়।
 *
 * `@tailwindcss/typography` (prose) ব্যবহার করা হয়নি — তাহলে রঙ ও স্পেসিং
 * প্লাগইনের ডিফল্ট থেকে আসত, `ui-tokens.md` থেকে নয়। প্রতিটা element এখানে
 * নিজেদের টোকেন দিয়ে ম্যাপ করা।
 */

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold mt-6 mb-2 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold mt-6 mb-2 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold mt-4 mb-1 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-3 list-disc pl-5 space-y-1.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal pl-5 space-y-1.5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-500 transition-colors"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 pl-4 border-l-2 border-cyan-500/40 bg-cyan-500/5 py-2 pr-3 rounded-r-xl text-sm">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-zinc-200 dark:border-zinc-800" />
  ),
  code: ({ className, children }) => {
    // fenced block হলে react-markdown `language-*` class দেয়; inline হলে দেয় না
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className="font-mono text-sm leading-relaxed">{children}</code>
      );
    }
    return (
      <code className="font-mono text-[0.85em] bg-zinc-200/60 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-4 bg-zinc-900 text-zinc-100 dark:bg-black border border-zinc-800 p-5 rounded-2xl overflow-x-auto">
      {children}
    </pre>
  ),
  // চওড়া টেবিল যেন পেজ নয়, নিজের ভেতরে scroll করে
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-100/70 dark:bg-zinc-900/70">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left font-semibold px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 align-top">
      {children}
    </td>
  ),
};

export default function DocContent({ content }: { content: string }) {
  return (
    <div className="max-w-[72ch] text-base bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
