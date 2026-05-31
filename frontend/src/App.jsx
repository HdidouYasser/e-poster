import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { Toaster } from "react-hot-toast";
import TotemHome from "./totem/TotemHome";
import TotemPublications from "./totem/TotemPublications";
import TotemPosterDetail from "./totem/TotemPosterDetail";
import TotemSlideshow from "./totem/TotemSlideshow";
import LoginPage from "./admin/LoginPage";
import AdminLayout from "./admin/AdminLayout";
import EventsAdmin from "./admin/EventsAdmin";
import PublicationsAdmin from "./admin/PublicationsAdmin";
import CategoriesAdmin from "./admin/CategoriesAdmin";
import AuthorsAdmin from "./admin/AuthorsAdmin";
import ScreensAdmin from "./admin/ScreensAdmin";
import ImportAdmin from "./admin/ImportAdmin";
import AuditAdmin from "./admin/AuditAdmin";
import StatsAdmin from "./admin/StatsAdmin";
import ExportAdmin from "./admin/ExportAdmin";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
          },
        }}
      />
      <Routes>
        {/* Front-Office : Visiteurs Totem */}
        <Route path="/totem" element={<TotemHome />} />
        <Route path="/totem/publications" element={<TotemPublications />} />
        <Route path="/totem/publications/:id" element={<TotemPosterDetail />} />
        <Route path="/totem/slideshow" element={<TotemSlideshow />} />
        
        {/* Redirection racine vers totem par défaut */}
        <Route path="/" element={<Navigate to="/totem" replace />} />

        {/* Back-Office : Admin */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/admin/stats" replace /> : <LoginPage />} />
        
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/stats" replace />} />
          <Route path="stats" element={<StatsAdmin />} />
          <Route path="events" element={<EventsAdmin />} />
          <Route path="publications" element={<PublicationsAdmin />} />
          <Route path="screens" element={<ScreensAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="authors" element={<AuthorsAdmin />} />
          <Route path="import" element={<ImportAdmin />} />
          <Route path="audit" element={<AuditAdmin />} />
          <Route path="export" element={<ExportAdmin />} />
        </Route>
      </Routes>
    </>
  );
}
