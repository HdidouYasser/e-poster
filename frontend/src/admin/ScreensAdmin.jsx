import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../api";
import { Plus, Edit2, Trash2, Loader2, Layers, GripVertical, X, Monitor, ChevronUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const screenSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  location: z.string().optional(),
  mode: z.string().min(1, "Le mode est requis"),
  eventId: z.number().min(1, "L'événement est requis"),
});

const inputCls = "form-input";
const labelCls = "form-label";

export default function ScreensAdmin() {
  const queryClient = useQueryClient();
  const [editingScreen, setEditingScreen] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [layoutModal, setLayoutModal] = useState({ isOpen: false, screen: null });

  const { data: screens, isLoading } = useQuery({
    queryKey: ["screens"],
    queryFn: async () => (await api.get("/screens")).data
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => (await api.get("/events?page=0&size=100")).data
  });

  const invalidate = () => queryClient.invalidateQueries(["screens"]);

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/screens", payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Écran créé avec succès"); },
    onError: () => toast.error("Erreur lors de la création de l'écran")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/screens/${id}`, payload),
    onSuccess: () => { invalidate(); closeForm(); toast.success("Écran modifié"); },
    onError: () => toast.error("Erreur lors de la modification")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/screens/${id}`),
    onSuccess: () => { invalidate(); toast.success("Écran supprimé"); },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 font-sans">
        <p className="font-semibold text-zinc-900 text-sm">Confirmer la suppression ?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-50 text-zinc-700">Annuler</button>
          <button onClick={() => { toast.dismiss(t.id); deleteMutation.mutate(id); }} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100">Supprimer</button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#fff', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: '1rem' } });
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(screenSchema),
    defaultValues: { name: "", location: "", mode: "INTERACTIVE", eventId: 0 }
  });

  const openForm = (screen = null) => {
    setEditingScreen(screen);
    if (screen) {
      reset({ name: screen.name, location: screen.location || "", mode: screen.mode, eventId: screen.event?.id || 0 });
    } else {
      reset({ name: "", location: "", mode: "INTERACTIVE", eventId: 0 });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingScreen(null);
    reset();
  };

  const onSubmit = (values) => {
    if (editingScreen) updateMutation.mutate({ id: editingScreen.id, payload: values });
    else createMutation.mutate(values);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Écrans / Totems</h2>
          <p className="page-subtitle">Configurez les kiosques et totems d'affichage</p>
        </div>
        <button
          onClick={() => openForm()}
          className="btn btn-primary"
        >
          <Plus size={16} /> Nouvel Écran
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200/80 p-7 rounded-3xl space-y-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-zinc-900 font-display">{editingScreen ? "Modifier l'écran" : "Créer un écran"}</h3>
            <button type="button" onClick={closeForm} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nom / Identifiant <span className="text-red-400 normal-case">*</span></label>
              <input {...register("name")} placeholder="Ex: Totem Hall Accueil" className={inputCls} />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Événement Associé <span className="text-red-400 normal-case">*</span></label>
              <select {...register("eventId", { valueAsNumber: true })} className="form-select">
                <option value={0}>Sélectionner un événement</option>
                {eventsData?.items?.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              {errors.eventId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.eventId.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Mode d'affichage</label>
              <select {...register("mode")} className="form-select">
                <option value="INTERACTIVE">Interactif (Recherche & Navigation)</option>
                <option value="SLIDESHOW">Diaporama Automatique (Slideshow)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Emplacement <span className="normal-case font-normal text-zinc-400">(optionnel)</span></label>
              <input {...register("location")} placeholder="Ex: RDC, Salle 1..." className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-100 mt-2">
            <button type="button" onClick={closeForm} className="btn btn-ghost">Annuler</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="animate-spin" size={15} />} Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50/80 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Nom & Emplacement</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Événement</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400">Mode</th>
              <th className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-zinc-400 font-medium"><Loader2 className="animate-spin inline mr-2" size={16} />Chargement...</td></tr>
            ) : screens?.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-zinc-400 font-medium">
                <Monitor className="mx-auto mb-2 text-zinc-300" size={24} />
                Aucun écran configuré
              </td></tr>
            ) : (
              screens?.map((screen) => (
                <tr key={screen.id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900">{screen.name}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{screen.location || "Aucun emplacement"}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">{screen.event?.title || "Non assigné"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                      screen.mode === 'SLIDESHOW'
                        ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        : 'bg-zinc-900 text-white border-zinc-900'
                    }`}>
                      {screen.mode === 'SLIDESHOW' ? 'Diaporama' : 'Interactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => setLayoutModal({ isOpen: true, screen })}
                        className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.97] transition-all rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Layers size={13} /> Parcours
                      </button>
                      <button onClick={() => openForm(screen)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors rounded-xl"><Edit2 size={15} /></button>
                      <button onClick={() => confirmDelete(screen.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {layoutModal.isOpen && (
        <ScreenLayoutModal
          screen={layoutModal.screen}
          onClose={() => setLayoutModal({ isOpen: false, screen: null })}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-component: Layout Editor Modal
// ─────────────────────────────────────────────────────────
function ScreenLayoutModal({ screen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);

  const { data: publications } = useQuery({
    queryKey: ["pubs-for-screen", screen.event?.id],
    queryFn: async () => (await api.get(`/publications?eventId=${screen.event?.id}&size=500`)).data?.items || [],
    enabled: !!screen.event?.id
  });

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: { sections: [] }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sections"
  });

  useQuery({
    queryKey: ["screen-layout", screen.id],
    queryFn: async () => {
      const data = (await api.get(`/screens/${screen.id}/layout`)).data;
      reset({
        sections: data.map(s => ({
          title: s.title || "",
          publicationId: s.publication?.id || ""
        }))
      });
      setIsLoading(false);
      return data;
    }
  });

  const updateLayoutMutation = useMutation({
    mutationFn: (sections) => api.put(`/screens/${screen.id}/layout`, sections),
    onSuccess: () => { toast.success("Parcours mis à jour"); onClose(); },
    onError: () => toast.error("Erreur lors de la mise à jour du parcours")
  });

  const onSubmit = (data) => {
    const payload = data.sections.map((s, index) => ({
      title: s.title,
      publicationId: s.publicationId ? Number(s.publicationId) : null,
      position: index + 1
    }));
    updateLayoutMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] border border-zinc-200/80">

        {/* Modal header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 font-display">Parcours : {screen.name}</h3>
            <p className="text-sm text-zinc-400 mt-0.5">Gérez les sections et publications pour cet écran.</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors ml-4">
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-zinc-400" size={28} />
            </div>
          ) : (
            <>
              {fields.length === 0 ? (
                <div className="text-center p-10 bg-white border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm font-medium">
                  <Layers className="mx-auto mb-2 text-zinc-300" size={24} />
                  Aucune section configurée. Cliquez ci-dessous pour en ajouter.
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 bg-white p-3.5 border border-zinc-200/80 rounded-2xl shadow-sm">
                    <div className="flex flex-col gap-0.5 items-center">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                        className="p-1 hover:bg-zinc-100 hover:text-zinc-900 rounded disabled:opacity-25 text-zinc-400 transition-colors cursor-pointer"
                        title="Monter"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <span className="font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded-lg text-zinc-500 font-bold">{index + 1}</span>
                      <button
                        type="button"
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                        className="p-1 hover:bg-zinc-100 hover:text-zinc-900 rounded disabled:opacity-25 text-zinc-400 transition-colors cursor-pointer"
                        title="Descendre"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        {...register(`sections.${index}.title`)}
                        placeholder="Titre de la section (ex: Session Matin)"
                        className="form-input"
                      />
                      <select
                        {...register(`sections.${index}.publicationId`)}
                        className="form-select"
                      >
                        <option value="">— Sélectionner une publication —</option>
                        {publications?.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Supprimer la section"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={() => append({ title: "", publicationId: "" })}
                className="w-full py-3.5 bg-white border-2 border-dashed border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={15} /> Ajouter une publication au parcours
              </button>
            </>
          )}
        </div>

        {/* Modal footer */}
        <div className="p-5 border-t border-zinc-100 bg-white flex justify-end gap-3 rounded-b-3xl">
          <button onClick={onClose} className="btn btn-ghost">Annuler</button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={updateLayoutMutation.isPending}
            className="btn btn-primary"
          >
            {updateLayoutMutation.isPending && <Loader2 className="animate-spin" size={15} />}
            Enregistrer le parcours
          </button>
        </div>
      </div>
    </div>
  );
}
