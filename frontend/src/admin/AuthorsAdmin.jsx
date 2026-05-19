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
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Auteurs</h2>
        <button onClick={() => openForm()} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> Nouvel Auteur
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200 p-6 rounded-lg space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">{editingAuthor ? "Modifier l'auteur" : "Créer un auteur"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Prénom</label>
              <input {...register("firstName")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nom</label>
              <input {...register("lastName")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Email</label>
              <input type="email" {...register("email")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Affiliation</label>
              <input {...register("affiliation")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isCorresponding" {...register("isCorresponding")} className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900" />
              <label htmlFor="isCorresponding" className="text-sm font-semibold text-zinc-700">Auteur correspondant (Contact)</label>
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
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Nom & Prénom</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Affiliation</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400 font-medium">Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400 font-medium">Aucun auteur trouvé</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-zinc-900">
                    {item.lastName} {item.firstName}
                    {item.isCorresponding && <span className="ml-2 px-1.5 py-0.5 bg-zinc-100 text-zinc-900 text-[10px] uppercase font-bold rounded border border-zinc-200">Contact</span>}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{item.email || "-"}</td>
                  <td className="px-6 py-4 text-zinc-500">{item.affiliation || "-"}</td>
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
          <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors font-semibold"><ChevronLeft size={16} className="inline mr-1" /> Précédent</button>
          <span className="font-semibold text-zinc-600">Page {page + 1} sur {data.totalPages}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors font-semibold">Suivant <ChevronRight size={16} className="inline ml-1" /></button>
        </div>
      )}
    </div>
  );
}
