import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { Lock, ArrowLeft, Loader2, Check, Presentation, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Jeton de réinitialisation manquant.");
      return;
    }
    if (!email) {
      toast.error("L'adresse email est requise.");
      return;
    }
    if (password !== confirmPass) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, email, password });
      toast.success("Mot de passe réinitialisé avec succès !");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans bg-dot-grid relative overflow-hidden">
      {/* Floating Back to Home button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-955 bg-white/80 hover:bg-white backdrop-blur-sm border border-zinc-200/80 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] z-20 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Retour au portail</span>
      </Link>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-zinc-200/80 rounded-3xl p-10 shadow-xl relative z-10 animate-fade-in">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <Presentation className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">Réinitialiser le mot de passe</h1>
          <p className="text-xs font-semibold text-zinc-500 mt-1">Saisissez votre nouveau mot de passe</p>
        </div>

        {!token ? (
          <div className="text-center space-y-4 animate-fade-in text-red-600">
            <p className="text-xs font-semibold">Le jeton de récupération est manquant ou invalide.</p>
            <div className="pt-4 border-t border-zinc-100">
              <Link to="/login" className="btn btn-ghost w-full justify-center text-zinc-600">
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email field — readonly if provided via URL, editable otherwise */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-400" /> Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!emailParam}
                placeholder="votre@email.com"
                className={`w-full border text-zinc-900 px-4 py-3 rounded-2xl outline-none transition-all text-sm shadow-inner ${
                  emailParam
                    ? 'bg-zinc-100 border-zinc-200 cursor-not-allowed text-zinc-500'
                    : 'bg-zinc-50/70 border-zinc-200 focus:border-zinc-400 focus:bg-white'
                }`}
                required
              />
              {emailParam && (
                <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                  Email vérifié depuis le lien de réinitialisation.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-zinc-400" /> Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-4 py-3 rounded-2xl focus:border-zinc-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-zinc-400" /> Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-4 py-3 rounded-2xl focus:border-zinc-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
                required
              />
              {password && confirmPass && password !== confirmPass && (
                <p className="text-red-500 text-xs mt-1 font-medium">Les mots de passe ne correspondent pas.</p>
              )}
              {password && confirmPass && password === confirmPass && confirmPass.length >= 6 && (
                <p className="text-emerald-600 text-xs mt-1 font-medium flex items-center gap-1">
                  <Check size={11} /> Les mots de passe correspondent.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || password !== confirmPass}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 text-sm mt-2 shadow-md active:scale-[0.98] font-display flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Modification..." : "Valider le nouveau mot de passe"}
            </button>

            <div className="pt-4 border-t border-zinc-100">
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors">
                <ArrowLeft size={13} /> Annuler et revenir
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
