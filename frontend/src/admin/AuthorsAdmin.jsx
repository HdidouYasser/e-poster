import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Loader2, Users, X } from "lucide-react";
import toast from "react-hot-toast";

const authorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").or(z.literal("")),
  affiliation: z.string().optional(),
  isCorresponding: z.boolean().default(false)
});

const inputCls = "w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 px-3.5 py-2.5 rounded-xl focus:border-zinc-400 focus:bg-white outline-none text-sm transition-all shadow-inner";
const labelCls = "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5";

export default function AuthorsAdmin() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["authors", page],
    queryFn: async () => (await api.get(`/authors?page=${page}&size=10`)).data
  });

  const invalidate = () => queryClient.invalidateQueries(["authors"]);

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/authors", payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Auteur créé"); },
    onError: () => toast.error("Erreur lors de la création")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/authors/${id}`, payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Auteur modifié"); },
    onError: () => toast.error("Erreur lors de la modification")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/authors/${id}`),
    onSuccess: () => { invalidate(); toast.success("Auteur supprimé"); },
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
    resolver: zodResolver(authorSchema),
    defaultValues: { firstName: "", lastName: "", email: "", affiliation: "", isCorresponding: false }
  });

  const openForm = (author = null) => {
    setEditingAuthor(author);
    if (author) reset({ firstName: author.firstName, lastName: author.lastName, email: author.email || "", affiliation: author.affiliation || "", isCorresponding: author.isCorresponding || false });
    else reset({ firstName: "", lastName: "", email: "", affiliation: "", isCorresponding: false });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAuthor(null);
    reset();
  };

  const onSubmit = (values) => {
    if (editingAuthor) updateMutation.mutate({ id: editingAuthor.id, payload: values });
    else createMutation.mutate(values);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight font-display">Auteurs</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Chercheurs et correspondants des publications</p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus size={16} /> Nouvel Auteur
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200/80 p-7 rounded-3xl space-y-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-zinc-900 font-display">{editingAuthor ? "Modifier l'auteur" : "Créer un auteur"}</h3>
            <button type="button" onClick={closeForm} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Prénom <span className="text-red-400 normal-case">*</span></label>
              <input {...register("firstName")} className={inputCls} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Nom <span className="text-red-400 normal-case">*</span></label>
              <input {...register("lastName")} className={inputCls} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" {...register("email")} className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Affiliation</label>
              <input {...register("affiliation")} placeholder="Université, CHU..." className={inputCls} />
            </div>
            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200/80">
              <input
                type="checkbox"
                id="isCorresponding"
                {...register("isCorresponding")}
                className="w-4 h-4 accent-zinc-900 border-zinc-300 rounded"
              />
              <label htmlFor="isCorresponding" className="text-sm font-semibold text-zinc-700 cursor-pointer">
                Auteur correspondant <span className="text-zinc-400 font-normal">(Contact principal)</span>
              </label>
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
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Nom & Prénom</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Email</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Affiliation</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-zinc-400 font-medium"><Loader2 className="animate-spin inline mr-2" size={16} />Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-zinc-400 font-medium">
                <Users className="mx-auto mb-2 text-zinc-300" size={24} />
                Aucun auteur trouvé
              </td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-zinc-900">{item.lastName} {item.firstName}</span>
                    {item.isCorresponding && <span className="ml-2 px-2 py-0.5 bg-zinc-900 text-white text-[10px] uppercase font-bold rounded-lg">Contact</span>}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{item.email || "—"}</td>
                  <td className="px-6 py-4 text-zinc-500 truncate max-w-xs">{item.affiliation || "—"}</td>
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
