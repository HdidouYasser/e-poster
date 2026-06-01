import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { Toaster } from "react-hot-toast";
import Home from "./Home";
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
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#18181b',
            border: '1px solid #e4e4e7',
            borderRadius: '14px',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '13px',
            fontWeight: '500',
            padding: '10px 14px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
          loading: {
            iconTheme: { primary: '#18181b', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* Front-Office : Visiteurs Totem */}
        <Route path="/totem" element={<TotemHome />} />
        <Route path="/totem/publications" element={<TotemPublications />} />
        <Route path="/totem/publications/:id" element={<TotemPosterDetail />} />
        <Route path="/totem/slideshow" element={<TotemSlideshow />} />
        
        {/* Page d'accueil présentant le concept */}
        <Route path="/" element={<Home />} />

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
