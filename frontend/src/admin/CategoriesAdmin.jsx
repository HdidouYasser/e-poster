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
      <div className="flex flex-col gap-3">
        <p className="font-medium text-slate-800">Confirmer la suppression ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm hover:bg-slate-200 transition-colors text-slate-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm hover:bg-red-100 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' } });
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Catégories</h2>
        <button onClick={() => openForm()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} /> Nouvelle Catégorie
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-md">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{editingCategory ? "Modifier la catégorie" : "Créer une catégorie"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
              <input {...register("name")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Type (ex: THEME, SESSION)</label>
              <input {...register("type")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Événement</label>
              <select {...register("eventId")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none">
                <option value="">Sélectionner un événement</option>
                {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              {errors.eventId && <p className="text-red-500 text-sm mt-1">{errors.eventId.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={closeForm} className="px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={18} />} Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Nom</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Événement</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Aucune catégorie trouvée</td></tr>
            ) : (
              data?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500">{item.type}</td>
                  <td className="px-6 py-4 text-slate-500">{item.event?.title}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openForm(item)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"><Trash2 size={18} /></button>
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
