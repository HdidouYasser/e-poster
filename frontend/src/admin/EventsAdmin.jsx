import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Search, Loader2, UploadCloud, X, Calendar, UserCheck, Eye, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";

const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  status: z.string().default("ACTIVE"),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  programUrl: z.string().optional(),
  revueUrl: z.string().optional(),
  managerEmail: z.string().optional(),
});

const inputCls = "form-input";
const labelCls = "form-label";

export default function EventsAdmin() {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.role);
  const isAdmin = role !== "ROLE_EVENT_MANAGER";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["events", page, q],
    queryFn: async () => {
      const endpoint = q.trim()
        ? `/events/search?q=${encodeURIComponent(q)}&page=${page}&size=10`
        : `/events?page=${page}&size=10`;
      return (await api.get(endpoint)).data;
    }
  });

  // Fetch managers list (only relevant for admin)
  const { data: managersData } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => (await api.get("/users/managers")).data,
    enabled: isAdmin,
  });

  const invalidate = () => queryClient.invalidateQueries(["events"]);

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/events", payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Événement créé avec succès"); },
    onError: () => toast.error("Erreur lors de la création")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/events/${id}`, payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Événement modifié"); },
    onError: () => toast.error("Erreur lors de la modification")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => { invalidate(); toast.success("Événement supprimé"); },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 font-sans">
        <p className="font-semibold text-zinc-900 text-sm">Confirmer la suppression ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-50 transition-colors text-zinc-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#fff', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: '1rem' } });
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: "", description: "", status: "ACTIVE", logoUrl: "", bannerUrl: "", startDate: "", endDate: "", programUrl: "", revueUrl: "", managerEmail: "" }
  });

  const logoUrlValue = watch("logoUrl");
  const bannerUrlValue = watch("bannerUrl");

  const formatForInput = (isoString) => isoString ? isoString.substring(0, 16) : "";
  const formatForBackend = (localString) => localString ? new Date(localString).toISOString() : null;

  const openForm = (evt = null) => {
    setEditingEvent(evt);
    if (evt) {
      reset({
        title: evt.title,
        description: evt.description || "",
        status: evt.status || "ACTIVE",
        logoUrl: evt.logoUrl || "",
        bannerUrl: evt.bannerUrl || "",
        startDate: formatForInput(evt.startDate),
        endDate: formatForInput(evt.endDate),
        programUrl: evt.programUrl || "",
        revueUrl: evt.revueUrl || "",
        managerEmail: evt.manager?.email || ""
      });
    } else {
      reset({ title: "", description: "", status: "ACTIVE", logoUrl: "", bannerUrl: "", startDate: "", endDate: "", programUrl: "", revueUrl: "", managerEmail: "" });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
    reset();
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      startDate: formatForBackend(values.startDate),
      endDate: formatForBackend(values.endDate)
    };
    if (editingEvent) updateMutation.mutate({ id: editingEvent.id, payload });
    else createMutation.mutate(payload);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    type === 'logo' ? setUploadingLogo(true) : setUploadingBanner(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/files", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://localhost:8080";
      setValue(type === 'logo' ? "logoUrl" : "bannerUrl", baseUrl + res.data.url);
      toast.success("Image téléversée avec succès");
    } catch {
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      type === 'logo' ? setUploadingLogo(false) : setUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Événements</h2>
          <p className="page-subtitle">Gérez les congrès et événements médicaux</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openForm()}
            className="btn btn-primary"
          >
            <Plus size={16} /> Nouvel Événement
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Rechercher un événement..."
          className="form-input"
          style={{ paddingLeft: '2.75rem' }}
        />
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200/80 p-7 rounded-3xl space-y-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-zinc-900 font-display">
              {editingEvent 
                ? isAdmin ? "Modifier l'événement" : "Consulter l'événement" 
                : "Créer un événement"}
            </h3>
            <button type="button" onClick={closeForm} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Titre <span className="text-red-500 normal-case">*</span></label>
              <input {...register("title")} disabled={!isAdmin} className={inputCls} />
              {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select {...register("status")} disabled={!isAdmin} className="form-select">
                <option value="ACTIVE">Actif</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
              {watch("endDate") && new Date(watch("endDate")) < new Date() && (
                <p className="text-amber-700 text-xs mt-2 flex items-center gap-1.5 font-medium bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <AlertTriangle size={12} className="shrink-0" />
                  Date de fin dépassée — cet événement sera archivé automatiquement.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea {...register("description")} disabled={!isAdmin} rows={2} className="form-textarea resize-none" />
            </div>

            <div>
              <label className={labelCls}>Date de début</label>
              <input type="datetime-local" {...register("startDate")} disabled={!isAdmin} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date de fin</label>
              <input type="datetime-local" {...register("endDate")} disabled={!isAdmin} className={inputCls} />
            </div>



            <div className="bg-zinc-50/80 border border-zinc-200/80 p-4 rounded-2xl">
              <label className={labelCls}>Logo Événement</label>
              <div className="flex flex-col gap-3">
                {logoUrlValue && <img src={logoUrlValue} alt="Logo Preview" className="h-16 w-16 object-contain bg-white border border-zinc-200 rounded-xl shadow-sm" />}
                {isAdmin && (
                  <>
                    <input type="file" id="logoUpload" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
                    <label htmlFor="logoUpload" className="inline-flex w-fit items-center gap-2 cursor-pointer bg-white hover:bg-zinc-100 text-zinc-700 px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 transition-colors">
                      {uploadingLogo ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />} {uploadingLogo ? "Upload..." : "Changer le logo"}
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="bg-zinc-50/80 border border-zinc-200/80 p-4 rounded-2xl">
              <label className={labelCls}>Bannière (Optionnel)</label>
              <div className="flex flex-col gap-3">
                {bannerUrlValue && <img src={bannerUrlValue} alt="Banner Preview" className="h-16 w-full object-cover bg-white border border-zinc-200 rounded-xl shadow-sm" />}
                {isAdmin && (
                  <>
                    <input type="file" id="bannerUpload" onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" accept="image/*" />
                    <label htmlFor="bannerUpload" className="inline-flex w-fit items-center gap-2 cursor-pointer bg-white hover:bg-zinc-100 text-zinc-700 px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 transition-colors">
                      {uploadingBanner ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />} {uploadingBanner ? "Upload..." : "Changer la bannière"}
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="bg-zinc-50/80 border border-zinc-200/80 p-4 rounded-2xl">
              <label className={labelCls}>Lien Programme (URL PDF)</label>
              <input {...register("programUrl")} disabled={!isAdmin} placeholder="https://.../programme.pdf" className={inputCls} />
            </div>

            <div className="bg-zinc-50/80 border border-zinc-200/80 p-4 rounded-2xl">
              <label className={labelCls}>Lien Revue Médicale (URL)</label>
              <input {...register("revueUrl")} disabled={!isAdmin} placeholder="https://.../revue" className={inputCls} />
            </div>

            {isAdmin && (
              <div className="md:col-span-2 bg-blue-50/60 border border-blue-100 p-4 rounded-2xl">
                <label className={labelCls + " flex items-center gap-2"}>
                  <UserCheck size={14} className="text-blue-600" />
                  Responsable d'Événement
                </label>
                <select {...register("managerEmail")} className="form-select">
                  <option value="">-- Aucun responsable --</option>
                  {managersData?.map((m) => {
                    const fullName = (m.firstName || m.lastName) 
                      ? `${m.firstName || ""} ${m.lastName || ""}`.trim() 
                      : m.email;
                    return (
                      <option key={m.email} value={m.email}>
                        {fullName} ({m.email})
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-blue-500 mt-1.5 font-medium">Ce responsable aura accès uniquement à cet événement.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-100 mt-2">
            <button type="button" onClick={closeForm} className="btn btn-ghost">{isAdmin ? "Annuler" : "Fermer"}</button>
            {isAdmin && (
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={15} />} Enregistrer
              </button>
            )}
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50/80 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Titre</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Description</th>
              {isAdmin && <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Responsable</th>}
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Statut</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-10 text-center text-zinc-400 font-medium"><Loader2 className="animate-spin inline mr-2" size={16} />Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-10 text-center text-zinc-400 font-medium">
                <Calendar className="mx-auto mb-2 text-zinc-300" size={24} />
                Aucun événement trouvé
              </td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-zinc-900">{item.title}</td>
                  <td className="px-6 py-4 text-zinc-500 truncate max-w-xs">{item.description}</td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      {item.manager ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white uppercase">
                            {item.manager.firstName && item.manager.lastName
                              ? (item.manager.firstName.substring(0, 1) + item.manager.lastName.substring(0, 1)).toUpperCase()
                              : item.manager.email.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-zinc-700">
                            {(item.manager.firstName || item.manager.lastName)
                              ? `${item.manager.firstName || ""} ${item.manager.lastName || ""}`.trim()
                              : item.manager.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Non assigné</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                      item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-zinc-100 text-zinc-500 border-zinc-200/60'
                    }`}>
                      {item.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {item.status === 'ACTIVE' ? 'Actif' : 'Archivé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {isAdmin ? (
                        <>
                          <button onClick={() => openForm(item)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors rounded-xl" title="Modifier"><Edit2 size={15} /></button>
                          <button onClick={() => confirmDelete(item.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl" title="Supprimer"><Trash2 size={15} /></button>
                        </>
                      ) : (
                        <button onClick={() => openForm(item)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors rounded-xl" title="Consulter"><Eye size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm text-zinc-500">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-40 transition-all font-semibold text-xs">← Précédent</button>
          <span className="font-semibold text-zinc-500 text-xs">Page {page + 1} / {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-40 transition-all font-semibold text-xs">Suivant →</button>
        </div>
      )}
    </div>
  );
}
