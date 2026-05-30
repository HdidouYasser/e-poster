import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Loader2, Tags, X } from "lucide-react";
import toast from "react-hot-toast";

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  eventId: z.string().min(1, "L'événement est requis")
});

const inputCls = "w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 rounded-xl focus:border-zinc-400 focus:bg-white outline-none text-sm transition-all shadow-inner";
const labelCls = "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5";

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
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-50 transition-colors text-zinc-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#fff', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: '1rem' } });
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">Catégories</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Thèmes, sessions et sous-groupes de publications</p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus size={16} /> Nouvelle Catégorie
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200/80 p-7 rounded-3xl space-y-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-zinc-900 font-display">{editingCategory ? "Modifier la catégorie" : "Créer une catégorie"}</h3>
            <button type="button" onClick={closeForm} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nom <span className="text-red-400 normal-case">*</span></label>
              <input {...register("name")} className={inputCls} />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Type (ex: THEME, SESSION) <span className="text-red-400 normal-case">*</span></label>
              <input {...register("type")} placeholder="THEME" className={inputCls} />
              {errors.type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.type.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Événement <span className="text-red-400 normal-case">*</span></label>
              <select {...register("eventId")} className={inputCls}>
                <option value="">Sélectionner un événement</option>
                {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              {errors.eventId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.eventId.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-100 mt-2">
            <button type="button" onClick={closeForm} className="px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl text-sm font-semibold transition-all">Annuler</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={16} />} Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50/80 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Nom</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Type</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Événement</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-zinc-400 font-medium"><Loader2 className="animate-spin inline mr-2" size={16} />Chargement...</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-zinc-400 font-medium">
                <Tags className="mx-auto mb-2 text-zinc-300" size={24} />
                Aucune catégorie trouvée
              </td></tr>
            ) : (
              data?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-zinc-900">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-lg border border-zinc-200">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{item.event?.title}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openForm(item)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors rounded-xl"><Edit2 size={15} /></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"><Trash2 size={15} /></button>
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
