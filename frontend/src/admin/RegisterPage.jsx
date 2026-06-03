import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicApi } from "../api";
import { Lock, User, Presentation, Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await publicApi.post("/auth/register", { email, password, firstName, lastName });
      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (err) {
      const data = err?.response?.data;
      // Spring Boot can return a plain string or an error object {timestamp, status, error, path}
      const msg = typeof data === "string"
        ? data
        : data?.message || data?.error || "Erreur lors de la création du compte";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans bg-dot-grid relative overflow-hidden">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-zinc-200/80 rounded-3xl p-10 shadow-xl relative z-10 animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Presentation className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">S'enregistrer</h1>
          <p className="text-sm font-semibold text-zinc-500 mt-1">Espace Responsable d'Événement</p>
          <p className="text-zinc-400 mt-1 text-xs">Créez votre compte pour gérer vos congrès</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Prénom & Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Prénom</label>
              <input
                id="register-firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 rounded-xl focus:border-zinc-450 focus:bg-white outline-none transition-all text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Nom</label>
              <input
                id="register-lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 rounded-xl focus:border-zinc-450 focus:bg-white outline-none transition-all text-xs"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Adresse email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="responsable@example.com"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 pl-11 pr-4 py-2.5 rounded-xl focus:border-zinc-450 focus:bg-white outline-none transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 pl-11 pr-4 py-2.5 rounded-xl focus:border-zinc-450 focus:bg-white outline-none transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-650 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 text-xs mt-2 shadow-md active:scale-[0.98] font-display"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
          <Link to="/login" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
            <ArrowLeft size={13} /> Se connecter
          </Link>
          <Link to="/" className="text-zinc-400 hover:text-zinc-700">Retour au portail</Link>
        </div>
      </div>
    </div>
  );
}
