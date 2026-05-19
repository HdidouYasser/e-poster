import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Search, Loader2, UploadCloud, FileImage, Download, Upload } from "lucide-react";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { Link } from "react-router-dom";

const pubSchema = z.object({
  eventId: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  authorIds: z.array(z.number()).optional(),
  categoryIds: z.array(z.number()).optional(),
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
  
  // Modals for inline creation
  const [inlineAuthorModal, setInlineAuthorModal] = useState({ isOpen: false, initialName: "" });
  const [inlineCategoryModal, setInlineCategoryModal] = useState({ isOpen: false, initialName: "" });

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

  const { data: authorsData } = useQuery({
    queryKey: ["authors-all"],
    queryFn: async () => (await api.get(`/authors?page=0&size=1000`)).data
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get(`/categories`)).data
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
      <div className="flex flex-col gap-3 font-sans">
        <p className="font-semibold text-zinc-900 text-sm">Confirmer la suppression ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-xs font-semibold hover:bg-zinc-50 transition-colors text-zinc-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-semibold hover:bg-red-100 transition-colors">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#fff', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: '0.5rem' } });
  };

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm({
    resolver: zodResolver(pubSchema),
    defaultValues: { eventId: "", title: "", description: "", abstractText: "", authors: "", status: "DRAFT", posterUrl: "", session: "", room: "", category: "", authorIds: [], categoryIds: [] }
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
      category: pub.category || "",
      authorIds: pub.publicationAuthors?.map(pa => pa.author?.id) || [],
      categoryIds: pub.publicationCategories?.map(pc => pc.category?.id) || []
    });
    else reset({ eventId: "", title: "", description: "", abstractText: "", authors: "", status: "DRAFT", posterUrl: "", session: "", room: "", category: "", authorIds: [], categoryIds: [] });
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
  
  // Handlers for inline creations
  const createInlineAuthorMutation = useMutation({
    mutationFn: (payload) => api.post("/authors", payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["authors-all"]);
      const currentIds = watch("authorIds") || [];
      setValue("authorIds", [...currentIds, res.data.id]);
      setInlineAuthorModal({ isOpen: false, initialName: "" });
      toast.success("Auteur créé et ajouté");
    }
  });

  const createInlineCategoryMutation = useMutation({
    mutationFn: (payload) => api.post("/categories", payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["categories"]);
      const currentIds = watch("categoryIds") || [];
      setValue("categoryIds", [...currentIds, res.data.id]);
      setInlineCategoryModal({ isOpen: false, initialName: "" });
      toast.success("Catégorie créée et ajoutée");
    }
  });

  const exportCSV = async () => {
    try {
      toast.loading("Génération du CSV...", { id: "export" });
      const res = await api.get("/publications?page=0&size=10000");
      const items = res.data.items || [];
      if (items.length === 0) {
        toast.error("Aucune donnée à exporter", { id: "export" });
        return;
      }

      const headers = ["ID", "Titre", "Auteurs", "Catégorie", "Session", "Salle", "Statut", "Événement"];
      const rows = items.map(p => [
        p.id,
        `"${p.title?.replace(/"/g, '""') || ''}"`,
        `"${p.authors?.replace(/"/g, '""') || ''}"`,
        `"${p.category || ''}"`,
        `"${p.session || ''}"`,
        `"${p.room || ''}"`,
        p.status,
        `"${p.event?.title || ''}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "publications_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export réussi", { id: "export" });
    } catch (e) {
      toast.error("Erreur lors de l'export", { id: "export" });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Publications</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/import-bulk" className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
            <Upload size={16} /> Importer
          </Link>
          <button onClick={exportCSV} className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
            <Download size={16} /> Exporter CSV
          </button>
          <button onClick={() => openForm()} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
            <Plus size={16} /> Nouvelle Publication
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Rechercher une publication (titre, description)..."
          className="w-full bg-white border border-zinc-200 text-zinc-900 pl-10 pr-4 py-2.5 rounded-md focus:outline-none focus:border-zinc-400 transition-colors text-sm"
        />
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200 p-6 rounded-lg space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">{editingPub ? "Modifier la publication" : "Créer une publication"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Événement (Optionnel)</label>
              <select {...register("eventId")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors">
                <option value="">Aucun événement sélectionné</option>
                {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
              <input {...register("title")} placeholder="Titre de la publication" className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
              {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Auteurs (Base de données)</label>
              <Controller
                name="authorIds"
                control={control}
                render={({ field: { onChange, value } }) => {
                  const options = authorsData?.items?.map(a => ({ value: a.id, label: `${a.firstName} ${a.lastName}` })) || [];
                  const selectedOptions = options.filter(opt => value?.includes(opt.value));
                  return (
                    <CreatableSelect
                      isMulti
                      options={options}
                      value={selectedOptions}
                      onChange={(selected) => onChange(selected.map(s => s.value))}
                      onCreateOption={(inputValue) => setInlineAuthorModal({ isOpen: true, initialName: inputValue })}
                      placeholder="Sélectionner ou taper pour créer..."
                      formatCreateLabel={(inputValue) => `Créer l'auteur "${inputValue}"`}
                      className="text-sm"
                      styles={{ control: (base) => ({ ...base, borderColor: '#e4e4e7', padding: '1px' }) }}
                    />
                  );
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Auteurs libres (Texte brut, séparés par virgule)</label>
              <input {...register("authors")} placeholder="Ex: Jean Dupont, Marie Curie (Optionnel)" className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Description / Résumé court</label>
              <textarea {...register("description")} placeholder="Résumé court..." rows={3} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Résumé Complet (Abstract)</label>
              <textarea {...register("abstractText")} placeholder="Résumé scientifique détaillé..." rows={6} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Catégories (Base de données)</label>
              <Controller
                name="categoryIds"
                control={control}
                render={({ field: { onChange, value } }) => {
                  const options = categoriesData?.map(c => ({ value: c.id, label: c.name })) || [];
                  const selectedOptions = options.filter(opt => value?.includes(opt.value));
                  return (
                    <CreatableSelect
                      isMulti
                      options={options}
                      value={selectedOptions}
                      onChange={(selected) => onChange(selected.map(s => s.value))}
                      onCreateOption={(inputValue) => setInlineCategoryModal({ isOpen: true, initialName: inputValue })}
                      placeholder="Sélectionner ou créer..."
                      formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
                      className="text-sm"
                      styles={{ control: (base) => ({ ...base, borderColor: '#e4e4e7' }) }}
                    />
                  );
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Catégorie (Texte libre)</label>
              <input {...register("category")} placeholder="Ex: Santé, Technologie..." className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Session</label>
              <input {...register("session")} placeholder="Ex: Session 1" className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Salle</label>
              <input {...register("room")} placeholder="Ex: Salle A" className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Statut</label>
              <select {...register("status")} className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md focus:border-zinc-400 outline-none text-sm transition-colors">
                <option value="DRAFT">Brouillon (Draft)</option>
                <option value="PUBLISHED">Publié (Visible Totem)</option>
              </select>
            </div>
            <div className="md:col-span-2 bg-zinc-50 p-4 border border-zinc-200 rounded-md">
              <label className="block text-sm font-semibold text-zinc-700 mb-3">Fichier Média (Poster Image/PDF)</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {posterUrlValue ? (
                  <div className="relative group shrink-0">
                    <img src={posterUrlValue} alt="Preview" className="h-24 w-16 object-cover rounded border border-zinc-200 bg-white" />
                  </div>
                ) : (
                  <div className="h-24 w-16 bg-white border border-zinc-200 border-dashed rounded flex items-center justify-center shrink-0">
                    <FileImage size={20} className="text-zinc-300" />
                  </div>
                )}
                <div className="flex-1 space-y-3 w-full">
                  <input {...register("posterUrl")} placeholder="URL du fichier" className="w-full bg-white border border-zinc-200 text-zinc-900 px-3 py-2 rounded-md outline-none focus:border-zinc-400 text-sm" />
                  <div>
                    <input type="file" id="fileUpload" onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
                    <label htmlFor="fileUpload" className="inline-flex items-center gap-2 cursor-pointer bg-white hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-zinc-200">
                      {uploadingFile ? <Loader2 className="animate-spin text-zinc-900" size={16} /> : <UploadCloud size={16} className="text-zinc-600" />}
                      {uploadingFile ? "Upload en cours..." : "Téléverser un fichier"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-zinc-100">
            <button type="button" onClick={closeForm} className="px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent rounded-md text-sm font-semibold transition-colors">Annuler</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={16} />}
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Inline Author Modal */}
      {inlineAuthorModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Créer un auteur</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              createInlineAuthorMutation.mutate({
                firstName: fd.get("firstName"),
                lastName: fd.get("lastName"),
                email: fd.get("email"),
                affiliation: fd.get("affiliation"),
                isCorresponding: false
              });
            }} className="space-y-4">
              <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Prénom</label><input required name="firstName" defaultValue={inlineAuthorModal.initialName.split(" ")[0]} className="w-full border rounded p-2 text-sm" /></div>
              <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Nom</label><input required name="lastName" defaultValue={inlineAuthorModal.initialName.split(" ").slice(1).join(" ")} className="w-full border rounded p-2 text-sm" /></div>
              <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Email</label><input type="email" name="email" className="w-full border rounded p-2 text-sm" /></div>
              <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Affiliation</label><input name="affiliation" className="w-full border rounded p-2 text-sm" /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setInlineAuthorModal({ isOpen: false, initialName: "" })} className="px-3 py-1.5 border rounded text-sm hover:bg-zinc-50">Annuler</button>
                <button type="submit" disabled={createInlineAuthorMutation.isPending} className="px-3 py-1.5 bg-zinc-900 text-white rounded text-sm flex items-center gap-2">
                  {createInlineAuthorMutation.isPending && <Loader2 size={14} className="animate-spin"/>} Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Category Modal */}
      {inlineCategoryModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Créer une catégorie</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              createInlineCategoryMutation.mutate({
                name: fd.get("name"),
                type: fd.get("type"),
                eventId: Number(fd.get("eventId"))
              });
            }} className="space-y-4">
              <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Nom</label><input required name="name" defaultValue={inlineCategoryModal.initialName} className="w-full border rounded p-2 text-sm" /></div>
              <div><label className="block text-sm font-semibold text-zinc-700 mb-1">Type</label><input required name="type" placeholder="Ex: THEME" className="w-full border rounded p-2 text-sm" /></div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Événement</label>
                <select required name="eventId" className="w-full border rounded p-2 text-sm">
                  <option value="">Sélectionner</option>
                  {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setInlineCategoryModal({ isOpen: false, initialName: "" })} className="px-3 py-1.5 border rounded text-sm hover:bg-zinc-50">Annuler</button>
                <button type="submit" disabled={createInlineCategoryMutation.isPending} className="px-3 py-1.5 bg-zinc-900 text-white rounded text-sm flex items-center gap-2">
                  {createInlineCategoryMutation.isPending && <Loader2 size={14} className="animate-spin"/>} Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider w-20">Aperçu</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Titre & Auteurs</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Événement</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-zinc-400 font-medium"><Loader2 className="animate-spin inline mr-2" size={16} />Chargement...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-zinc-400 font-medium">Aucune publication trouvée</td></tr>
            ) : (
              data?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    {item.posterUrl
                      ? <img src={item.posterUrl} className="h-12 w-9 object-cover bg-white border border-zinc-200 rounded" alt="poster" />
                      : <div className="h-12 w-9 bg-zinc-50 rounded border border-zinc-200 flex items-center justify-center"><FileImage size={14} className="text-zinc-300" /></div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900 text-sm mb-0.5">{item.title}</div>
                    <div className="text-xs text-zinc-500">{item.authors || "Auteurs non renseignés"}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 hidden md:table-cell text-sm">{item.event?.title || <span className="italic opacity-50">Aucun</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${item.status === 'PUBLISHED' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
                      {item.status === 'PUBLISHED' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mr-1.5" />}
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
