"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Topic =
  | "general"
  | "course_rule_of_10x"
  | "course_marketing_templates"
  | "career_application_status"
  | "partnership_followup"
  | "billing"
  | "other";

const TOPIC_OPTIONS: { value: Topic; label: string }[] = [
  { value: "general", label: "General Inquiry" },
  { value: "course_rule_of_10x", label: "Course Help — Rule of 10X" },
  { value: "course_marketing_templates", label: "Course Help — Marketing Templates" },
  { value: "career_application_status", label: "Career Application Status" },
  { value: "partnership_followup", label: "Partnership Follow-Up" },
  { value: "billing", label: "Billing / Payment" },
  { value: "other", label: "Other" },
];

const SUPPORT_EMAIL = "support@jazamedia.com";
const MAX_MESSAGE_CHARS = 2000;

const INPUT_CLASS =
  "w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 font-heading text-sm text-white " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: ReactNode };

export function SupportContactCard() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [messageChars, setMessageChars] = useState(0);
  const successHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // WCAG 2.4.3 — when the form swaps to the thank-you state, move keyboard
  // focus to the success heading so the user has a discoverable position.
  useEffect(() => {
    if (state.kind === "success") {
      successHeadingRef.current?.focus();
    }
  }, [state.kind]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setState({ kind: "submitting" });

    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim() || undefined,
      topic: String(fd.get("topic") ?? ""),
      subject: String(fd.get("subject") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      _hp: String(fd.get("_hp") ?? ""),
    };

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setState({ kind: "success" });
        return;
      }

      if (res.status === 400) {
        const data = (await res.json().catch(() => ({}))) as {
          issues?: { path: (string | number)[]; message: string }[];
        };
        const errs: Record<string, string> = {};
        for (const issue of data.issues ?? []) {
          const key = String(issue.path[0] ?? "");
          if (key) errs[key] = issue.message;
        }
        setFieldErrors(errs);
        setState({ kind: "error", message: "Check the fields marked in red." });
        return;
      }

      if (res.status === 429) {
        setState({
          kind: "error",
          message: "You're sending messages too quickly. Please wait a few minutes and try again.",
        });
        return;
      }

      setState({
        kind: "error",
        message: (
          <>
            Couldn&apos;t send your message right now. Please try again, or email us directly at{" "}
            <a className="underline hover:text-red-300" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            .
          </>
        ),
      });
    } catch {
      setState({
        kind: "error",
        message: (
          <>
            Couldn&apos;t reach our servers. Please try again, or email us directly at{" "}
            <a className="underline hover:text-red-300" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            .
          </>
        ),
      });
    }
  }

  function resetForm() {
    setFieldErrors({});
    setMessageChars(0);
    setState({ kind: "idle" });
  }

  if (state.kind === "success") {
    return (
      <section className="bg-brand-black py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-2xl border border-brand-yellow/30 bg-white/5 p-10">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-brand-yellow">
              Message received
            </p>
            <h2
              ref={successHeadingRef}
              tabIndex={-1}
              className="mt-4 font-heading text-2xl font-extrabold text-white md:text-3xl focus:outline-none"
            >
              We&apos;ve got your message.
            </h2>
            <p className="mt-3 font-heading text-base text-white/70 md:text-lg">
              We&apos;ll reply to the email you provided within 2 business days.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-8 inline-flex items-center rounded-full bg-brand-yellow px-6 py-2.5 font-heading text-sm font-bold text-brand-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
            >
              Send another message
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isSubmitting = state.kind === "submitting";

  return (
    <section className="bg-brand-black py-16 md:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-center font-heading text-2xl font-extrabold text-white md:text-3xl">
          Still need help?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-heading text-sm text-white/70 md:text-base">
          Send us a message and we&apos;ll reply within 2 business days.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
          noValidate
        >
          <Field
            label="Full name"
            name="fullName"
            required
            autoComplete="name"
            error={fieldErrors.fullName}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />
          <Field
            label="Phone (optional)"
            name="phone"
            autoComplete="tel"
            error={fieldErrors.phone}
          />

          <div>
            <label
              htmlFor="topic"
              className="mb-1.5 block font-heading text-sm font-semibold text-white"
            >
              Topic <span className="text-brand-yellow">*</span>
            </label>
            <select
              id="topic"
              name="topic"
              required
              defaultValue=""
              className={INPUT_CLASS}
            >
              <option value="" disabled>
                Select a topic
              </option>
              {TOPIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.topic && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.topic}</p>
            )}
          </div>

          <Field label="Subject" name="subject" required error={fieldErrors.subject} />

          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block font-heading text-sm font-semibold text-white"
            >
              Message <span className="text-brand-yellow">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              maxLength={MAX_MESSAGE_CHARS}
              onChange={(e) => setMessageChars(e.currentTarget.value.length)}
              className={`${INPUT_CLASS} resize-y`}
              aria-describedby="message-counter"
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              {fieldErrors.message ? (
                <p className="text-xs text-red-400">{fieldErrors.message}</p>
              ) : (
                <span aria-hidden="true" />
              )}
              <p
                id="message-counter"
                className="font-heading text-xs text-white/50"
                aria-live="polite"
              >
                {messageChars} / {MAX_MESSAGE_CHARS}
              </p>
            </div>
          </div>

          {/* Honeypot — wrapped in aria-hidden div so iOS VoiceOver swipe never finds it */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label>
              Leave this field empty
              <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {state.kind === "error" && (
            <p className="text-sm text-red-400" role="alert">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 font-heading text-sm font-bold text-brand-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block font-heading text-sm font-semibold text-white">
        {label}
        {required && <span className="text-brand-yellow"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={INPUT_CLASS}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
