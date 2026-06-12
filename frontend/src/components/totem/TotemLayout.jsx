import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn";

/**
 * En-tête du TOTEM
 */
export function TotemHeader({
  title,
  subtitle,
  logo,
  onBack,
  showHome = true,
  className,
}) {
  const navigate = useNavigate();

  return (
    <header className={cn(
      "flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-100",
      "shadow-sm",
      className
    )}>
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={24} className="text-zinc-600" />
          </button>
        )}
        
        {logo && (
          <img
            src={logo}
            alt="Logo"
            className="h-12 object-contain"
          />
        )}
        
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-zinc-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-zinc-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {showHome && (
        <button
          onClick={() => navigate("/totem")}
          className="p-3 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Accueil"
        >
          <Home size={24} className="text-zinc-600" />
        </button>
      )}
    </header>
  );
}

/**
 * Pied de page du TOTEM
 */
export function TotemFooter({ screenId, className }) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn(
      "flex items-center justify-between px-6 py-3 bg-zinc-50 border-t border-zinc-100 text-xs text-zinc-500",
      className
    )}>
      <div>
        © {year} Plateforme E-Poster — Borne Interactive
      </div>
      {screenId && (
        <div className="px-3 py-1 bg-white border border-zinc-200 rounded-lg font-mono">
          Écran {screenId}
        </div>
      )}
    </footer>
  );
}

/**
 * Conteneur principal du TOTEM
 */
export function TotemLayout({
  header,
  children,
  footer = true,
  screenId = "1",
  className,
}) {
  return (
    <div className={cn(
      "h-screen flex flex-col bg-white text-zinc-900 overflow-hidden",
      className
    )}>
      {/* Header */}
      {header && header}
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Footer */}
      {footer && <TotemFooter screenId={screenId} />}
    </div>
  );
}
