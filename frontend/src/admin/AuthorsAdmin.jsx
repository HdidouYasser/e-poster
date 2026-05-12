import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const authorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").or(z.literal("")),
  affiliation: z.string().optional(),
  isCorresponding: z.boolean().default(false)
});

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Auteurs</h2>
        <button onClick={() => openForm()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} /> Nouvel Auteur
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-md">
          <h3 className="text-xl font-bold text-slate-800 mb-4">{editingAuthor ? "Modifier l'auteur" : "Créer un auteur"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Prénom</label>
              <input {...register("firstName")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
              <input {...register("lastName")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input type="email" {...register("email")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Affiliation</label>
              <input {...register("affiliation")} className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isCorresponding" {...register("isCorresponding")} className="w-4 h-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-400" />
              <label htmlFor="isCorresponding" className="text-sm font-medium text-slate-600">Auteur correspondant (Contact)</label>
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
              <th className="px-6 py-4 font-semibold">Nom & Prénom</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Affiliation</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Aucun auteur trouvé</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {item.lastName} {item.firstName}
                    {item.isCorresponding && <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200">Contact</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.email || "-"}</td>
                  <td className="px-6 py-4 text-slate-500">{item.affiliation || "-"}</td>
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

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft size={20} /></button>
          <span className="font-medium bg-slate-100 px-4 py-2 rounded-lg text-slate-700">Page {page + 1} / {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
}
