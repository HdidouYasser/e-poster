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
      const endpoint = q.trim() ? `/events/search?q=${encodeURIComponent(q)}&page=${page}&size=10` : `/events?page=${page}&size=10`;
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
      <div className="flex flex-col gap-3">
        <p className="font-medium">Confirmer la suppression ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-neutral-800 rounded-md text-sm hover:bg-neutral-700 transition-colors">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-sm hover:bg-red-500/30 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000 });
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Événements</h2>
        <button onClick={() => openForm()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={20} /> Nouvel Événement
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
        <input 
          type="text" 
          value={q} 
          onChange={(e) => { setQ(e.target.value); setPage(0); }} 
          placeholder="Rechercher un événement..."
          className="w-full bg-neutral-900 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">{editingEvent ? "Modifier l'événement" : "Créer un événement"}</h3>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Titre</label>
            <input {...register("title")} className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
            <textarea {...register("description")} rows={3} className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Statut</label>
            <select {...register("status")} className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="ACTIVE">Actif</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeForm} className="px-4 py-2 text-neutral-300 hover:text-white transition-colors">Annuler</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={18}/>} Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="bg-neutral-800/50 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium">Titre</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-neutral-500">Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-neutral-500">Aucun événement trouvé</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                  <td className="px-6 py-4 text-neutral-400 truncate max-w-xs">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-500/10 text-neutral-400 border border-neutral-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openForm(item)} className="p-2 text-neutral-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-neutral-800"><Edit2 size={18}/></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-2 text-neutral-400 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-800"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm text-neutral-400">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:text-white disabled:opacity-50 transition-colors">Précédent</button>
          <span>Page {page + 1} / {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:text-white disabled:opacity-50 transition-colors">Suivant</button>
        </div>
      )}
    </div>
  );
}
