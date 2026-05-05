import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import TotemHome from "./totem/TotemHome";
import TotemPublications from "./totem/TotemPublications";
import TotemPosterDetail from "./totem/TotemPosterDetail";
import LoginPage from "./admin/LoginPage";
import AdminLayout from "./admin/AdminLayout";
import EventsAdmin from "./admin/EventsAdmin";
import PublicationsAdmin from "./admin/PublicationsAdmin";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      {/* Front-Office : Visiteurs Totem */}
      <Route path="/totem" element={<TotemHome />} />
      <Route path="/totem/publications" element={<TotemPublications />} />
      <Route path="/totem/publications/:id" element={<TotemPosterDetail />} />
      
      {/* Redirection racine vers totem par défaut */}
      <Route path="/" element={<Navigate to="/totem" replace />} />

      {/* Back-Office : Admin */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/admin/publications" replace /> : <LoginPage />} />
      
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/publications" replace />} />
        <Route path="events" element={<EventsAdmin />} />
        <Route path="publications" element={<PublicationsAdmin />} />
      </Route>
    </Routes>
  );
}
