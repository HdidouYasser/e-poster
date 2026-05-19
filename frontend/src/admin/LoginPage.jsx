import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Lock, User, FileText } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">E-Poster Back Office</h2>
          <p className="text-zinc-500 mt-2 text-sm">Connectez-vous pour gérer les contenus</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nom d'utilisateur</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                className="w-full bg-white border border-zinc-200 text-zinc-900 pl-10 pr-4 py-2.5 rounded-md focus:border-zinc-400 outline-none transition-colors text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-zinc-200 text-zinc-900 pl-10 pr-4 py-2.5 rounded-md focus:border-zinc-400 outline-none transition-colors text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-md font-semibold transition-colors disabled:opacity-50 text-sm mt-2"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
