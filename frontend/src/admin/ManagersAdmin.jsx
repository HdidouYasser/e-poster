import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import {
  Plus, Edit2, Trash2, Search, Loader2, X, UserCog,
  Mail, User, KeyRound, Shield, Link as LinkIcon
} from "lucide-react";
import toast from "react-hot-toast";

const inputCls = "form-input";
const labelCls = "form-label";

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  passwordHash: "",
};

export default function ManagersAdmin() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { data: managers = [], isLoading } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => (await api.get("/users/managers")).data,
  });

  const filtered = managers.filter((m) => {
    if (!q.trim()) return true;
    const lower = q.toLowerCase();
    return (
      m.email?.toLowerCase().includes(lower) ||
      m.firstName?.toLowerCase().includes(lower) ||
      m.lastName?.toLowerCase().includes(lower)
    );
  });

  const invalidate = () => queryClient.invalidateQueries(["managers"]);

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/users/managers", data),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Responsable créé avec succès"); },
    onError: (err) => {
      const d = err?.response?.data;
      toast.error(typeof d === "string" ? d : d?.message || d?.error || "Erreur lors de la création");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/users/managers/${id}`, data),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Responsable modifié"); },
    onError: (err) => {
      const d = err?.response?.data;
      toast.error(typeof d === "string" ? d : d?.message || d?.error || "Erreur lors de la modification");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/managers/${id}`),
    onSuccess: () => { invalidate(); toast.success("Responsable supprimé"); },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const confirmDelete = (m) => {
    toast((t) => (
      <div className="flex flex-col gap-3 font-sans">
        <p className="font-semibold text-zinc-900 text-sm">
          Supprimer <span className="text-red-600">{m.email}</span> ?
        </p>
        <p className="text-xs text-zinc-500">Cet utilisateur perdra l'accès à son tableau de bord.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-50 transition-colors text-zinc-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(m.id); }} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 6000, style: { background: '#fff', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: '1rem' } });
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "L'adresse email est requise";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email invalide";
    if (!editingManager && !form.passwordHash.trim()) e.passwordHash = "Le mot de passe est requis pour un nouveau compte";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openForm = (manager = null) => {
    setEditingManager(manager);
    setForm(
      manager
        ? { email: manager.email, firstName: manager.firstName || "", lastName: manager.lastName || "", passwordHash: "" }
        : emptyForm
    );
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingManager(null);
    setForm(emptyForm);
    setErrors({});
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (editingManager) {
      updateMutation.mutate({ id: editingManager.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getInitials = (m) => {
    if (m.firstName && m.lastName) return (m.firstName[0] + m.lastName[0]).toUpperCase();
    return m.email.substring(0, 2).toUpperCase();
  };

  const getFullName = (m) => {
    if (m.firstName || m.lastName) return `${m.firstName || ""} ${m.lastName || ""}`.trim();
    return "—";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Responsables</h2>
          <p className="page-subtitle">Gérez les comptes des responsables d'événements</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/register"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost flex items-center gap-2"
          >
            <LinkIcon size={14} /> Lien d'inscription
          </a>
          <button onClick={() => openForm()} className="btn btn-primary">
            <Plus size={16} /> Nouveau Responsable
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl px-5 py-3.5 flex items-center gap-3">
        <Shield size={16} className="text-blue-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-800">Comment ça marche ?</p>
          <p className="text-[11px] text-blue-600 mt-0.5">
            Les responsables peuvent s'inscrire via <strong>/register</strong> ou être créés ici. Ils accèdent à leur tableau de bord
            et voient uniquement les événements et e-posters qui leur sont assignés.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom, email..."
          className="form-input"
          style={{ paddingLeft: "2.75rem" }}
        />
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={onSubmit} className="bg-white border border-zinc-200/80 p-7 rounded-3xl space-y-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UserCog size={18} className="text-blue-600" />
              <h3 className="text-base font-bold text-zinc-900 font-display">
                {editingManager ? "Modifier le responsable" : "Créer un responsable"}
              </h3>
            </div>
            <button type="button" onClick={closeForm} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label className={labelCls}>Prénom</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Jean"
                  className={inputCls}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className={labelCls}>Nom</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Dupont"
                  className={inputCls}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className={labelCls}>Adresse email <span className="text-red-500 normal-case">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="responsable@example.com"
                  className={inputCls}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className={labelCls}>
                {editingManager ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input
                  type="password"
                  value={form.passwordHash}
                  onChange={(e) => setForm({ ...form, passwordHash: e.target.value })}
                  placeholder="••••••••"
                  className={inputCls}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {errors.passwordHash && <p className="text-red-500 text-xs mt-1 font-medium">{errors.passwordHash}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-100 mt-2">
            <button type="button" onClick={closeForm} className="btn btn-ghost">Annuler</button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn btn-primary"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={15} />}
              {editingManager ? "Enregistrer" : "Créer le compte"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50/80 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Responsable</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Email</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Rôle</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Créé le</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-zinc-400 font-medium">
                  <Loader2 className="animate-spin inline mr-2" size={16} />Chargement...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <UserCog className="mx-auto mb-3 text-zinc-300" size={32} />
                  <p className="text-sm font-semibold text-zinc-500">Aucun responsable trouvé</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Invitez un responsable à s'inscrire via <strong>/register</strong> ou créez un compte manuellement.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0 shadow-sm">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(m)
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 text-sm">{getFullName(m)}</div>
                        {(m.firstName || m.lastName) && (
                          <div className="text-[11px] text-zinc-400 font-medium">Responsable d'événement</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600 font-medium">{m.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200/60">
                      <Shield size={11} /> Responsable
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400 font-medium">
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openForm(m)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors rounded-xl">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => confirmDelete(m)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer stats */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-6 py-3 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">
              {filtered.length} responsable{filtered.length > 1 ? "s" : ""} enregistré{filtered.length > 1 ? "s" : ""}
            </span>
            <span className="text-xs text-zinc-400">
              Ils peuvent se connecter via <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-600">/login</code>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
