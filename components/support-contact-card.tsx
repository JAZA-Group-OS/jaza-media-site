"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { Eyebrow, Gold, H2, SLIDE } from "@/components/support-ui";

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

const SUPPORT_EMAIL = "admin@jazamedia.com";
const MAX_MESSAGE_CHARS = 2000;

const INPUT_CLASS =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 transition " +
  "focus:outline-none focus-visible:border-gold/60 focus-visible:ring-2 focus-visible:ring-gold/60";

const LABEL_CLASS = "mb-1.5 block text-[10.5px] font-medium tracking-[0.2em] text-white/70 uppercase";

function Intro() {
  return (
    <div className="flex flex-col items-start gap-4 lg:gap-5">
      <Eyebrow>Contact</Eyebrow>
      <h2 className={H2}>
        Still need <Gold>help?</Gold>
      </h2>
      <p className="text-[16px] leading-[1.7] font-light text-white/60 md:text-[17px]">
        Send us a message and we&apos;ll reply within 2 business days.
      </p>
      <p className="hidden text-sm text-white/50 lg:block">
        Or email{" "}
        <a className="text-gold hover:text-white" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}

const SECTION = `${SLIDE} bg-[#0b0d0c]`;
const GLOW = (
  <div aria-hidden className="pointer-events-none absolute -bottom-80 left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[160px]" />
);
const GRID = "relative mx-auto grid w-full max-w-[1160px] items-center gap-8 px-4 md:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16";
const FRAME = "rounded-3xl bg-gradient-to-b from-gold/45 via-white/10 to-white/[0.03] p-px";
const PANEL = "rounded-[23px] bg-[linear-gradient(180deg,#1a1913_0%,#0f0f10_75%)]";
const GOLD_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-[12px] font-semibold tracking-[0.14em] text-ink uppercase transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f10] disabled:cursor-not-allowed disabled:opacity-60";

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
      <section id="contact" className={SECTION}>
        {GLOW}
        <div className={GRID}>
          <Intro />
          <div className={FRAME}>
            <div className={`${PANEL} p-10 text-center`}>
              <p className="text-[10.5px] font-medium tracking-[0.3em] text-gold uppercase">Message received</p>
              <h2
                ref={successHeadingRef}
                tabIndex={-1}
                className="mt-4 font-serif text-[36px] leading-tight text-white focus:outline-none md:text-[44px]"
              >
                We&apos;ve got your <Gold>message.</Gold>
              </h2>
              <p className="mt-3 text-base font-light text-white/65">
                We&apos;ll reply to the email you provided within 2 business days.
              </p>
              <button type="button" onClick={resetForm} className={`${GOLD_BTN} mt-8`}>
                Send another message
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isSubmitting = state.kind === "submitting";

  return (
    <section id="contact" className={SECTION}>
      {GLOW}
      <div className={GRID}>
        <Intro />
        <form onSubmit={handleSubmit} className={`relative ${FRAME}`} noValidate>
          <div className={`${PANEL} grid gap-4 p-5 sm:grid-cols-2 md:p-7`}>
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
              className={LABEL_CLASS}
            >
              Topic <span className="text-gold">*</span>
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

          <div className="sm:col-span-2">
            <Field label="Subject" name="subject" required error={fieldErrors.subject} />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="message"
              className={LABEL_CLASS}
            >
              Message <span className="text-gold">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              maxLength={MAX_MESSAGE_CHARS}
              onChange={(e) => setMessageChars(e.currentTarget.value.length)}
              className={`${INPUT_CLASS} resize-none`}
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
                className="text-xs text-white/50"
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
            <p className="text-sm text-red-400 sm:col-span-2" role="alert">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={`${GOLD_BTN} w-full sm:col-span-2`}
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
          </div>
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
      <label htmlFor={name} className={LABEL_CLASS}>
        {label}
        {required && <span className="text-gold"> *</span>}
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
