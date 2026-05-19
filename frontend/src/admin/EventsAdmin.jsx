import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  status: z.string().default("ACTIVE")
});

export default function EventsAdmin() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["events", page, q],
    queryFn: async () => {
      const endpoint = q.trim()
        ? `/events/search?q=${encodeURIComponent(q)}&page=${page}&size=10`
        : `/events?page=${page}&size=10`;
      return (await api.get(endpoint)).data;
    }
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
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-xs font-semibold hover:bg-zinc-50 transition-colors text-zinc-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-semibold hover:bg-red-100 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#fff', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: '0.5rem' } });
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: "", description: "", status: "ACTIVE" }
  });

  const openForm = (evt = null) => {
    setEditingEvent(evt);
    if (evt) reset({ title: evt.title, description: evt.description || "", status: evt.status || "ACTIVE" });
    else reset({ title: "", description: "", status: "ACTIVE" });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
    reset();
  };

  const onSubmit = (values) => {
    if (editingEvent) updateMutation.mutate({ id: editingEvent.id, payload: values });
    else createMutation.mutate(values);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Événements</h2>
        <button onClick={() => openForm()} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> Nouvel Événement
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Rechercher un événement..."
          className="w-full bg-white border border-zinc-200 text-zinc-900 pl-10 pr-4 py-2.5 rounded-md focus:outline-none focus:border-zinc-400 transition-colors text-sm"
        />
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200 p-6 rounded-lg space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">{editingEvent ? "Modifier l'événement" : "Créer un événement"}</h3>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Titre</label>
            <input {...register("title")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Description</label>
            <textarea {...register("description")} rows={3} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Statut</label>
            <select {...register("status")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors">
              <option value="ACTIVE">Actif</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 mt-6">
            <button type="button" onClick={closeForm} className="px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent rounded-md text-sm font-semibold transition-colors">Annuler</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={16} />} Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400 font-medium">Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400 font-medium">Aucun événement trouvé</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-zinc-900">{item.title}</td>
                  <td className="px-6 py-4 text-zinc-500 truncate max-w-xs">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${item.status === 'ACTIVE' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
                      {item.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mr-1.5" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openForm(item)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors rounded-md"><Edit2 size={16} /></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-md"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-sm text-zinc-500">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors font-semibold">Précédent</button>
          <span className="font-semibold text-zinc-600">Page {page + 1} sur {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors font-semibold">Suivant</button>
        </div>
      )}
    </div>
  );
}
