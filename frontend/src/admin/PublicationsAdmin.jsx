import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Search, Loader2, UploadCloud, FileImage } from "lucide-react";
import toast from "react-hot-toast";

const pubSchema = z.object({
  eventId: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  authors: z.string().optional(),
  description: z.string().optional(),
  abstractText: z.string().optional(),
  status: z.string().default("DRAFT"),
  session: z.string().optional(),
  category: z.string().optional(),
  room: z.string().optional(),
  posterUrl: z.string().optional()
});

export default function PublicationsAdmin() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [editingPub, setEditingPub] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["publications", page, q],
    queryFn: async () => {
      const endpoint = q.trim()
        ? `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=10`
        : `/publications?page=${page}&size=10`;
      return (await api.get(endpoint)).data;
    }
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => (await api.get(`/events?page=0&size=100`)).data
  });

  const invalidate = () => queryClient.invalidateQueries(["publications"]);

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/publications", payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Publication créée avec succès"); },
    onError: () => toast.error("Erreur lors de la création")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/publications/${id}`, payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Publication modifiée"); },
    onError: () => toast.error("Erreur lors de la modification")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/publications/${id}`),
    onSuccess: () => { invalidate(); toast.success("Publication supprimée"); },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-slate-800">Confirmer la suppression ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm hover:bg-slate-200 transition-colors text-slate-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm hover:bg-red-100 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' } });
  };

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(pubSchema),
    defaultValues: { eventId: "", title: "", description: "", abstractText: "", authors: "", status: "DRAFT", posterUrl: "", session: "", room: "", category: "" }
  });

  const posterUrlValue = watch("posterUrl");

  const openForm = (pub = null) => {
    setEditingPub(pub);
    if (pub) reset({
      eventId: pub.event?.id ? String(pub.event.id) : "",
      title: pub.title,
      description: pub.description || "",
      abstractText: pub.abstractText || "",
      authors: pub.authors || "",
      status: pub.status || "DRAFT",
      posterUrl: pub.posterUrl || "",
      session: pub.session || "",
      room: pub.room || "",
      category: pub.category || ""
    });
    else reset({ eventId: "", title: "", description: "", abstractText: "", authors: "", status: "DRAFT", posterUrl: "", session: "", room: "", category: "" });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPub(null);
    reset();
  };

  const onSubmit = (values) => {
    if (editingPub) updateMutation.mutate({ id: editingPub.id, payload: values });
    else createMutation.mutate(values);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/files", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://localhost:8080";
      setValue("posterUrl", baseUrl + res.data.url);
      toast.success("Fichier téléversé avec succès");
    } catch {
      toast.error("Erreur lors de l'upload du fichier");
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Publications</h2>
        <button onClick={() => openForm()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} /> Nouvelle Publication
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Rechercher une publication (titre, description)..."
          className="w-full bg-white border border-slate-200 text-slate-800 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all shadow-sm"
        />
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-md">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{editingPub ? "Modifier la publication" : "Créer une publication"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Événement (Optionnel)</label>
              <select {...register("eventId")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none">
                <option value="">Aucun événement sélectionné</option>
                {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Titre <span className="text-red-500">*</span></label>
              <input {...register("title")} placeholder="Titre de la publication" className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Auteurs</label>
              <input {...register("authors")} placeholder="Ex: Jean Dupont, Marie Curie" className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Description / Résumé</label>
              <textarea {...register("description")} placeholder="Résumé de l'étude..." rows={4} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Résumé (Abstract)</label>
              <textarea {...register("abstractText")} placeholder="Résumé scientifique long..." rows={6} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Catégorie</label>
              <input {...register("category")} placeholder="Ex: Santé, Technologie..." className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Session</label>
              <input {...register("session")} placeholder="Ex: Session 1" className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Salle</label>
              <input {...register("room")} placeholder="Ex: Salle A" className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Statut</label>
              <select {...register("status")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none">
                <option value="DRAFT">Brouillon (Draft)</option>
                <option value="PUBLISHED">Publié (Visible Totem)</option>
              </select>
            </div>
            <div className="md:col-span-2 bg-slate-50 p-5 border border-slate-200 rounded-xl">
              <label className="block text-sm font-medium text-slate-600 mb-3">Fichier Média (Poster Image/PDF)</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {posterUrlValue ? (
                  <div className="relative group shrink-0">
                    <img src={posterUrlValue} alt="Preview" className="h-32 w-24 object-cover rounded-lg border border-slate-200 bg-white shadow-sm" />
                  </div>
                ) : (
                  <div className="h-32 w-24 bg-white border border-slate-200 border-dashed rounded-lg flex items-center justify-center shrink-0">
                    <FileImage size={24} className="text-slate-300" />
                  </div>
                )}
                <div className="flex-1 space-y-3 w-full">
                  <input {...register("posterUrl")} placeholder="URL du fichier (générée après upload ou manuelle)" className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-emerald-300" />
                  <div>
                    <input type="file" id="fileUpload" onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                    <label htmlFor="fileUpload" className="inline-flex items-center gap-2 cursor-pointer bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
                      {uploadingFile ? <Loader2 className="animate-spin text-emerald-500" size={18} /> : <UploadCloud size={18} className="text-emerald-500" />}
                      {uploadingFile ? "Upload en cours..." : "Téléverser un fichier"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
            <button type="button" onClick={closeForm} className="px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={18} />}
              Enregistrer la publication
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Aperçu</th>
              <th className="px-6 py-4 font-semibold">Titre & Auteurs</th>
              <th className="px-6 py-4 font-semibold hidden md:table-cell">Événement</th>
              <th className="px-6 py-4 font-semibold">Statut</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2" size={18} />Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Aucune publication trouvée</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    {item.posterUrl
                      ? <img src={item.posterUrl} className="h-16 w-12 object-cover bg-slate-100 border border-slate-200 rounded shadow-sm" alt="poster" />
                      : <div className="h-16 w-12 bg-slate-100 rounded border border-slate-200 flex items-center justify-center"><FileImage size={16} className="text-slate-400" /></div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 text-base mb-1">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.authors || "Auteurs non renseignés"}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">{item.event?.title || <span className="italic opacity-50">Aucun</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openForm(item)} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl"><Edit2 size={18} /></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500 pt-2">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm">Précédent</button>
          <span className="font-medium bg-slate-100 px-4 py-2 rounded-lg text-slate-700">Page {page + 1} sur {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm">Suivant</button>
        </div>
      )}
    </div>
  );
}
