'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Renders AI replies as clean formatted text: tables, lists, bold, code, links. */
export default function ChatMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-[13.5px] leading-relaxed text-adm-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-adm-text">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-adm-accent-ink underline underline-offset-2">
              {children}
            </a>
          ),
          h1: ({ children }) => <h3 className="text-[16px] font-semibold">{children}</h3>,
          h2: ({ children }) => <h3 className="text-[15px] font-semibold">{children}</h3>,
          h3: ({ children }) => <h4 className="text-[14px] font-semibold">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 marker:text-adm-accent">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5 marker:text-adm-subtle">{children}</ol>,
          code: ({ children, className }) =>
            className ? (
              <code className={`${className} block overflow-x-auto rounded-xl bg-adm-bg p-3 font-mono text-[12.5px]`}>{children}</code>
            ) : (
              <code className="rounded-md bg-adm-raised px-1.5 py-0.5 font-mono text-[12.5px]">{children}</code>
            ),
          pre: ({ children }) => <pre className="whitespace-pre">{children}</pre>,
          hr: () => <hr className="border-adm-line" />,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-adm-accent pl-3 text-adm-muted">{children}</blockquote>,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-xl border border-adm-line-strong">
              <table className="w-full border-collapse text-left text-[13px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-adm-raised">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-adm-subtle uppercase">{children}</th>
          ),
          tr: ({ children }) => <tr className="border-t border-adm-line first:border-t-0 even:bg-adm-raised/30">{children}</tr>,
          td: ({ children }) => {
            const s = typeof children === 'string' ? children.trim() : '';
            const tone = /^(cancel|fail|declin|reject|not)/i.test(s)
              ? 'bg-red-500/10 text-red-400'
              : /^(confirm|done|paid|qualified|complete|active|resolved|open)/i.test(s)
                ? 'bg-green-500/15 text-green-400'
                : /^(pending|new|waiting|schedul)/i.test(s)
                  ? 'bg-adm-accent/15 text-adm-accent-ink'
                  : '';
            return (
              <td className="px-3 py-2.5 align-top whitespace-nowrap text-adm-text-2">
                {tone ? <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium ${tone}`}>{children}</span> : children}
              </td>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
