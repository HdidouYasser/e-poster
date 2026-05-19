import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  eventId: z.string().min(1, "L'événement est requis")
});

export default function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: eventsData } = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => (await api.get(`/events?page=0&size=100`)).data
  });

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get(`/categories`)).data
  });

  const invalidate = () => queryClient.invalidateQueries(["categories"]);

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/categories", payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Catégorie créée"); },
    onError: () => toast.error("Erreur lors de la création")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/categories/${id}`, payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Catégorie modifiée"); },
    onError: () => toast.error("Erreur lors de la modification")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => { invalidate(); toast.success("Catégorie supprimée"); },
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
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", type: "", eventId: "" }
  });

  const openForm = (cat = null) => {
    setEditingCategory(cat);
    if (cat) reset({ name: cat.name, type: cat.type || "", eventId: cat.event?.id ? String(cat.event.id) : "" });
    else reset({ name: "", type: "", eventId: "" });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (values) => {
    const payload = { ...values, eventId: Number(values.eventId) };
    if (editingCategory) updateMutation.mutate({ id: editingCategory.id, payload });
    else createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Catégories</h2>
        <button onClick={() => openForm()} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> Nouvelle Catégorie
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200 p-6 rounded-lg space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">{editingCategory ? "Modifier la catégorie" : "Créer une catégorie"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nom</label>
              <input {...register("name")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Type (ex: THEME, SESSION)</label>
              <input {...register("type")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
              {errors.type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.type.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Événement</label>
              <select {...register("eventId")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors">
                <option value="">Sélectionner un événement</option>
                {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              {errors.eventId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.eventId.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-zinc-100">
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
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Événement</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400 font-medium">Chargement...</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400 font-medium">Aucune catégorie trouvée</td></tr>
            ) : (
              data?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-zinc-900">{item.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{item.type}</td>
                  <td className="px-6 py-4 text-zinc-500">{item.event?.title}</td>
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
    </div>
  );
}
