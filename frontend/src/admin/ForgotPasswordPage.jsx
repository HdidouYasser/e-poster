import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Mail, ArrowLeft, Loader2, CheckCircle2, Presentation } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message || "Un lien de réinitialisation vous a été envoyé.");
      setSubmitted(true);
      toast.success("Demande envoyée !");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans bg-dot-grid relative overflow-hidden">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-zinc-200/80 rounded-3xl p-10 shadow-xl relative z-10 animate-fade-in">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <Presentation className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">Mot de passe oublié</h1>
          <p className="text-xs font-semibold text-zinc-500 mt-1">Saisissez votre email pour récupérer l'accès</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-900 font-display">Demande enregistrée</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                {message}
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100">
              <Link to="/login" className="btn btn-ghost w-full justify-center">
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-400" /> Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: manager@example.com"
                className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-4 py-3 rounded-2xl focus:border-zinc-400 focus:bg-white outline-none transition-all text-sm shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 text-sm mt-2 shadow-md active:scale-[0.98] font-display flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Envoi en cours..." : "Recevoir le lien de réinitialisation"}
            </button>

            <div className="pt-4 border-t border-zinc-100">
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors">
                <ArrowLeft size={13} /> Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
