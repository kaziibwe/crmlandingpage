"use client";

import { useState } from "react";
import PhoneField from "./PhoneField";

export default function DemoForm() {
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setBusy(true);
    setStatus(null);
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          company: fd.get("company"),
          phone,
          size: fd.get("size"),
          message: fd.get("message"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ type: "ok", text: data.message ?? "Thanks! Your demo request has been received — we will reach out shortly." });
        form.reset();
      } else {
        setStatus({ type: "err", text: data.error ?? "Something went wrong. Please try again." });
      }
    } catch {
      setStatus({ type: "err", text: "Network error — please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="reveal card p-6 md:p-8 mt-10 space-y-4" data-delay="1" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="f_name" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Full name *</label>
          <input id="f_name" name="name" type="text" required placeholder="Amina Okello" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div>
          <label htmlFor="f_email" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Work email *</label>
          <input id="f_email" name="email" type="email" required placeholder="amina@company.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none transition" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="f_company" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Company *</label>
          <input id="f_company" name="company" type="text" required placeholder="Company Ltd" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none transition" />
        </div>
        <div>
          <label htmlFor="f_size" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Team size</label>
          <select id="f_size" name="size" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none transition">
            <option value="">Select</option>
            <option>1–10</option>
            <option>11–50</option>
            <option>51–200</option>
            <option>200+</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="f_phone" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">WhatsApp number *</label>
        <PhoneField value={phone} onChange={setPhone} />
      </div>
      <div>
        <label htmlFor="f_msg" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">What do you want to see? *</label>
        <textarea id="f_msg" name="message" rows={4} required placeholder="e.g. WhatsApp campaigns, pipeline management, AI agents…" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:border-blue-500 outline-none transition resize-none"></textarea>
      </div>
      <button type="submit" disabled={busy || !phone.trim()} className="btn-primary w-full disabled:opacity-60">
        {busy ? "Sending…" : <>Request a demo <i className="fas fa-arrow-right text-sm"></i></>}
      </button>
      {status && (
        <p role="status" className={`text-sm text-center ${status.type === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {status.text}
        </p>
      )}
      <p className="text-[11px] text-slate-400 text-center">We'll only use your details to arrange the demo.</p>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
        Prefer to reach out directly? <a href="mailto:info@eternitycrm.com" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">info@eternitycrm.com</a> · <a href="mailto:alfredkaziibwe19@gmail.com" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">alfredkaziibwe19@gmail.com</a> · <a href="tel:+256785557587" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">+256 785 557 587</a>
      </p>
    </form>
  );
}
