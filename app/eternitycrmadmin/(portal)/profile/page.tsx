"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Own-profile management for the signed-in administrator:
 * name, email (used as the login username) and password.
 * Password changes always require the current password.
 */
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace("/eternitycrmadmin/login");
        return;
      }
      if (!res.ok) {
        setPageError(data.error ?? "Failed to load profile.");
        return;
      }
      setProfile(data.admin);
      setName(data.admin.name);
      setEmail(data.admin.email);
    } catch {
      setPageError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileMsg({ ok: false, text: data.error ?? "Update failed." });
        return;
      }
      setProfile(data.admin);
      setProfileMsg({ ok: true, text: "Profile updated." });
      router.refresh();
    } catch {
      setProfileMsg({ ok: false, text: "Network error — please try again." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "New password and confirmation do not match." });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordMsg({ ok: false, text: data.error ?? "Password change failed." });
        return;
      }
      setPasswordMsg({ ok: true, text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg({ ok: false, text: "Network error — please try again." });
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <p className="admin-card p-8 text-center text-slate-400 text-sm">Loading profile…</p>;
  }

  if (pageError || !profile) {
    return (
      <p className="admin-card p-8 text-center text-rose-600 dark:text-rose-400 text-sm">
        {pageError ?? "Profile unavailable."}
      </p>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your administrator account details.
        </p>
      </header>

      {/* Account details */}
      <section className="admin-card p-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Account details</h2>
        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label htmlFor="p_name" className="admin-label">Name</label>
            <input id="p_name" value={name} onChange={(e) => setName(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <label htmlFor="p_email" className="admin-label">Email <span className="font-normal text-slate-400">(used to sign in)</span></label>
            <input id="p_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="admin-input" />
          </div>
          <div>
            <span className="admin-label">Role</span>
            <p className="text-sm text-slate-600 dark:text-slate-300">{profile.role}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Roles and permissions are managed by a super administrator.</p>
          </div>
          {profileMsg && (
            <p className={`text-sm ${profileMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {profileMsg.text}
            </p>
          )}
          <button type="submit" disabled={savingProfile} className="admin-btn-primary disabled:opacity-60">
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="admin-card p-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Change password</h2>
        <form onSubmit={savePassword} className="space-y-3">
          <div>
            <label htmlFor="p_current" className="admin-label">Current password</label>
            <input id="p_current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" className="admin-input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="p_new" className="admin-label">New password</label>
              <input id="p_new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="admin-input" />
            </div>
            <div>
              <label htmlFor="p_confirm" className="admin-label">Confirm new password</label>
              <input id="p_confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="admin-input" />
            </div>
          </div>
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {passwordMsg.text}
            </p>
          )}
          <button type="submit" disabled={savingPassword} className="admin-btn-primary disabled:opacity-60">
            {savingPassword ? "Changing…" : "Change password"}
          </button>
        </form>
      </section>
    </div>
  );
}
