import { useMemo, useState } from "react";
import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useAuthStore } from "./stores/authStore";
import TotemHome from "./totem/TotemHome";
import TotemPublications from "./totem/TotemPublications";
import TotemPosterDetail from "./totem/TotemPosterDetail";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch {
      setError("Identifiants invalides");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 320, margin: "40px auto" }}>
      <h2>Admin Login</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
      <button type="submit">Se connecter</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}

function useCrud(resource, page, size, q) {
  const queryClient = useQueryClient();
  const listKey = [resource, page, size, q];

  const endpoint = useMemo(() => {
    if (q?.trim()) return `/${resource}/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`;
    return `/${resource}?page=${page}&size=${size}`;
  }, [resource, page, size, q]);

  const listQuery = useQuery({
    queryKey: listKey,
    queryFn: async () => (await api.get(endpoint)).data
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [resource] });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post(`/${resource}`, payload),
    onSuccess: invalidate
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/${resource}/${id}`, payload),
    onSuccess: invalidate
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/${resource}/${id}`),
    onSuccess: invalidate
  });

  return { listQuery, createMutation, updateMutation, deleteMutation };
}

function ResourcePage({ resource, title, defaultPayload }) {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(defaultPayload);
  const [editingId, setEditingId] = useState(null);

  const { listQuery, createMutation, updateMutation, deleteMutation } = useCrud(resource, page, size, q);
  const data = listQuery.data || { items: [], page: 0, totalPages: 1 };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload: form });
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(form);
    }
    setForm(defaultPayload);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{title}</h2>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(0);
        }}
        placeholder="Recherche full-text MongoDB"
      />
      <form onSubmit={submit} style={{ margin: "16px 0", display: "grid", gap: 8, maxWidth: 480 }}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        {"status" in form && (
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        )}
        <button type="submit">{editingId ? "Mettre a jour" : "Creer"}</button>
      </form>

      {listQuery.isLoading ? <p>Chargement...</p> : null}

      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            {"status" in defaultPayload && <th>Status</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.description}</td>
              {"status" in defaultPayload && <td>{item.status}</td>}
              <td>
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setForm({
                      title: item.title || "",
                      description: item.description || "",
                      ...(defaultPayload.status ? { status: item.status || "DRAFT" } : {})
                    });
                  }}
                >
                  Editer
                </button>
                <button onClick={() => deleteMutation.mutate(item.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
          Precedent
        </button>
        <span style={{ margin: "0 8px" }}>
          Page {data.page + 1} / {Math.max(data.totalPages, 1)}
        </span>
        <button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
          Suivant
        </button>
      </div>
    </div>
  );
}

function Home() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div style={{ padding: 20 }}>
      <h1>E-Poster Back Office</h1>
      <nav style={{ display: "flex", gap: 8 }}>
        <Link to="/events">Events</Link>
        <Link to="/publications">Publications</Link>
        <button onClick={logout}>Logout</button>
      </nav>
      <p>Choisissez un module.</p>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route path="/totem" element={<TotemHome />} />
      <Route path="/totem/publications" element={<TotemPublications />} />
      <Route path="/totem/publications/:id" element={<TotemPosterDetail />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <ResourcePage resource="events" title="CRUD Events" defaultPayload={{ title: "", description: "" }} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publications"
        element={
          <ProtectedRoute>
            <ResourcePage
              resource="publications"
              title="CRUD Publications"
              defaultPayload={{ eventId: "", title: "", description: "", status: "DRAFT", posterUrl: "" }}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
