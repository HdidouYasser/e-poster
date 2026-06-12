import { useState, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { api } from "../api";
import { useQuery } from "@tanstack/react-query";
import { Camera, User, Lock, Save, Loader2, Check, ShieldCheck, Mail, Calendar, FileText, Eye, Building, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

export default function ProfilePage() {
  const { username, firstName, lastName, avatarUrl, role, updateProfile } = useAuthStore();
  const isManager = role === "ROLE_EVENT_MANAGER";

  if (!isManager) {
    return <Navigate to="/admin/stats" replace />;
  }

  const eventsQuery = useQuery({
    queryKey: ["manager-profile-events"],
    queryFn: async () => (await api.get("/events?page=0&size=100")).data
  });

  const statsQuery = useQuery({
    queryKey: ["manager-profile-stats"],
    queryFn: async () => (await api.get("/dashboard/stats")).data
  });

  const [firstName2, setFirstName2] = useState(firstName || "");
  const [lastName2,  setLastName2]  = useState(lastName  || "");
  const [avatar,     setAvatar]     = useState(avatarUrl  || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile,   setSavingProfile]   = useState(false);

  const [oldPassword,  setOldPassword]  = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [confirmPass,  setConfirmPass]  = useState("");
  const [savingPass,   setSavingPass]   = useState(false);

  const fileInputRef = useRef(null);

  const initials = (() => {
    if (firstName2 || lastName2)
      return `${firstName2.charAt(0)}${lastName2.charAt(0)}`.toUpperCase();
    return (username || "??").substring(0, 2).toUpperCase();
  })();

  const roleLabel = isManager ? "Responsable d'Événement" : "Administrateur";
  const roleBadgeCls = isManager
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-zinc-900 text-white border-zinc-900";

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/files", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const baseUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace("/api", "")
        : "http://localhost:8080";
      const newAvatarUrl = baseUrl + res.data.url;
      setAvatar(newAvatarUrl);
      await updateProfile({ avatarUrl: newAvatarUrl });
      toast.success("Photo de profil mise à jour !");
    } catch {
      toast.error("Erreur lors de l'upload de la photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Save profile info ─────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ firstName: firstName2, lastName: lastName2 });
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPass) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setSavingPass(true);
    try {
      await updateProfile({ password: newPassword, oldPassword });
      toast.success("Mot de passe modifié avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmPass("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setSavingPass(false);
    }
  };

  const inputCls = "w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-4 py-3 rounded-2xl focus:border-zinc-400 focus:bg-white outline-none transition-all text-sm";

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Mon Profil</h2>
          <p className="page-subtitle">Gérez vos informations personnelles et votre sécurité</p>
        </div>
      </div>

      {/* ── Avatar + Identity Card ── */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 border-2 border-zinc-200 shadow-md">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" referrerpolicy="no-referrer" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white ${isManager ? "bg-blue-600" : "bg-zinc-900"}`}>
                  {initials}
                </div>
              )}
            </div>
            {/* Upload button overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-zinc-200 rounded-xl flex items-center justify-center shadow-md hover:bg-zinc-50 transition-colors"
              title="Changer la photo"
            >
              {uploadingAvatar
                ? <Loader2 size={13} className="animate-spin text-zinc-400" />
                : <Camera size={13} className="text-zinc-600" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Identity info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-zinc-900 font-display">
              {firstName2 || lastName2 ? `${firstName2} ${lastName2}`.trim() : username}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">{username}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${roleBadgeCls}`}>
                <ShieldCheck size={11} />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Statistiques de l'activité ── */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Congrès Gérés</p>
              <h4 className="text-xl font-extrabold text-zinc-900 mt-0.5">{statsQuery.data.totalEvents || 0}</h4>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">E-Posters</p>
              <h4 className="text-xl font-extrabold text-zinc-900 mt-0.5">{statsQuery.data.totalPublications || 0}</h4>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Lectures Totales</p>
              <h4 className="text-xl font-extrabold text-zinc-900 mt-0.5">{statsQuery.data.totalViews || 0}</h4>
            </div>
          </div>
        </div>
      )}

      {/* ── Informations personnelles ── */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-7 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center">
            <User size={15} className="text-zinc-600" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 font-display">Informations personnelles</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Email (lecture seule) */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
              <Mail size={13} className="text-zinc-400" /> Adresse email
            </label>
            <input
              value={username || ""}
              readOnly
              className={inputCls + " opacity-60 cursor-not-allowed"}
            />
            <p className="text-[11px] text-zinc-400 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Prénom</label>
              <input
                value={firstName2}
                onChange={(e) => setFirstName2(e.target.value)}
                placeholder="Votre prénom"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nom</label>
              <input
                value={lastName2}
                onChange={(e) => setLastName2(e.target.value)}
                placeholder="Votre nom"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
            >
              {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {savingProfile ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Sécurité — Changer le mot de passe ── */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-7 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
            <Lock size={15} className="text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 font-display">Sécurité — Mot de passe</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Mot de passe actuel</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
              required
            />
            {newPassword && confirmPass && newPassword !== confirmPass && (
              <p className="text-red-500 text-xs mt-1 font-medium">Les mots de passe ne correspondent pas.</p>
            )}
            {newPassword && confirmPass && newPassword === confirmPass && confirmPass.length >= 6 && (
              <p className="text-emerald-600 text-xs mt-1 font-medium flex items-center gap-1">
                <Check size={11} /> Les mots de passe correspondent.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPass || !newPassword || newPassword !== confirmPass}
              className="btn btn-primary"
            >
              {savingPass ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              {savingPass ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Liste des Congrès Assignés ── */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-7 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center">
            <Building size={15} className="text-zinc-600" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 font-display">Mes Congrès sous responsabilité</h3>
        </div>

        {eventsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-zinc-400" />
          </div>
        ) : !eventsQuery.data?.items || eventsQuery.data.items.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-xs font-semibold">
            Aucun congrès ne vous est assigné actuellement.
          </div>
        ) : (
          <div className="space-y-3">
            {eventsQuery.data.items.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 rounded-2xl transition-all gap-4">
                <div className="flex items-center gap-4">
                  {event.logoUrl ? (
                    <img src={api.defaults.baseURL.replace("/api", "") + event.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white border border-zinc-100 p-1 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-white border border-zinc-100 rounded-lg flex items-center justify-center text-xs font-black text-zinc-400 shrink-0 uppercase">
                      {event.title.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 leading-snug">{event.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 flex items-center gap-1.5">
                      <Calendar size={11} />
                      {new Date(event.startDate).toLocaleDateString("fr-FR")} → {new Date(event.endDate).toLocaleDateString("fr-FR")}
                      {event.location && (
                        <>
                          <span>·</span>
                          <MapPin size={11} />
                          {event.location}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                    event.status?.toUpperCase() === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-zinc-100 text-zinc-500 border-zinc-200"
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
