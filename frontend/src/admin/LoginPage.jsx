import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Lock, User, Presentation } from "lucide-react";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setError("Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans bg-dot-grid relative overflow-hidden">


      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-zinc-200/80 rounded-3xl p-10 shadow-xl relative z-10 animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <Presentation className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">E-Poster</h1>
          <p className="text-sm font-semibold text-zinc-500 mt-1">Back Office Administration</p>
          <p className="text-zinc-400 mt-2 text-xs">Connectez-vous pour gérer les contenus</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nom d'utilisateur</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
              <input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 pl-11 pr-4 py-3 rounded-2xl focus:border-zinc-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 pl-11 pr-4 py-3 rounded-2xl focus:border-zinc-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
                required
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 text-sm mt-2 shadow-md active:scale-[0.98] font-display"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-[10px] text-zinc-400 mt-8 font-medium">
          © 2026 AMPIIC · Plateforme E-Poster
        </p>
      </div>
    </div>
  );
}
