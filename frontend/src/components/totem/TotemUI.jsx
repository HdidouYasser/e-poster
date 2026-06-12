import { forwardRef } from "react";
import { cn } from "../lib/cn";

/**
 * Bouton tactile accessible (≥48px)
 */
export const TotemButton = forwardRef(
  (
    {
      className,
      variant = "primary", // primary | secondary | outline | ghost
      size = "md", // sm | md | lg | xl
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
      outline:
        "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
      ghost:
        "text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    };

    const sizes = {
      sm: "h-10 px-3 text-sm gap-2",
      md: "h-12 px-4 text-base gap-2",
      lg: "h-14 px-5 text-lg gap-3",
      xl: "h-16 px-6 text-xl gap-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TotemButton.displayName = "TotemButton";

/**
 * Carte d'événement
 */
export function EventCard({ event, isSelected, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left",
        "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "p-4 min-h-[200px] flex flex-col justify-between",
        isSelected
          ? "border-blue-600 bg-blue-50"
          : "border-zinc-200 bg-white hover:border-blue-400",
        className
      )}
    >
      {/* Background accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-blue-500 to-orange-500 transition-opacity" />

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-zinc-900 line-clamp-2">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-sm text-zinc-600 line-clamp-2 mt-2">
            {event.description}
          </p>
        )}
      </div>

      {/* Footer info */}
      <div className="relative z-10 flex flex-col gap-1 text-xs text-zinc-500 mt-4">
        {event.startDate && (
          <p>
            📅{" "}
            {new Date(event.startDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
        {event.posterCount && (
          <p>📄 {event.posterCount} affiches</p>
        )}
      </div>
    </button>
  );
}

/**
 * Affiche poster en miniature
 */
export function PosterCard({ poster, thumbnail, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-300",
        "hover:shadow-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
        "flex flex-col",
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-zinc-100 aspect-video">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={poster.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <span className="text-4xl">📄</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        <h4 className="font-semibold text-sm text-zinc-900 line-clamp-2">
          {poster.title}
        </h4>
        {poster.authors && poster.authors.length > 0 && (
          <p className="text-xs text-zinc-600 line-clamp-1">
            {poster.authors.map((a) => a.name || a.firstName + " " + a.lastName).join(", ")}
          </p>
        )}
        {poster.category && (
          <p className="text-xs text-blue-600 font-medium">
            {poster.category.name}
          </p>
        )}
      </div>
    </button>
  );
}

/**
 * Loading skeleton
 */
export function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-zinc-100 animate-pulse",
        className
      )}
    />
  );
}

/**
 * Badge de catégorie/tag
 */
export function Badge({ label, isActive = false, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        "border border-zinc-200",
        isActive
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-zinc-700 hover:border-blue-400 hover:bg-blue-50",
        className
      )}
    >
      {label}
    </button>
  );
}
