import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export default function TotemHome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";

  const eventsQuery = useQuery({
    queryKey: ["totem-events", 0, 20],
    queryFn: async () => (await api.get(`/events?page=0&size=20`)).data
  });

  const firstEvent = useMemo(() => eventsQuery.data?.items?.[0], [eventsQuery.data]);

  return (
    <div style={styles.shell}>
      <div style={styles.header}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>Totem</div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link style={styles.bigBtn} to={`/totem/publications?screen=${screen}`}>
            Publications
          </Link>
          <button
            style={styles.bigBtn}
            onClick={() => {
              // Open a second window that will follow (multi-screen)
              window.open(`${window.location.origin}/totem?screen=2`, "totem-screen-2");
            }}
          >
            Multi-écrans
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Accueil événement</div>
        {eventsQuery.isLoading ? <div>Chargement…</div> : null}
        {!eventsQuery.isLoading && !firstEvent ? <div>Aucun événement trouvé.</div> : null}
        {firstEvent ? (
          <>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{firstEvent.title}</div>
            <div style={{ opacity: 0.8, marginBottom: 12 }}>{firstEvent.description}</div>
            <button
              style={styles.bigBtn}
              onClick={() => navigate(`/totem/publications?eventId=${firstEvent.id}&screen=${screen}`)}
            >
              Voir les posters
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "white",
    padding: 24
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18
  },
  card: {
    background: "#111b2f",
    border: "1px solid #233252",
    borderRadius: 14,
    padding: 18,
    maxWidth: 900
  },
  bigBtn: {
    fontSize: 20,
    padding: "14px 18px",
    borderRadius: 14,
    border: "1px solid #2f4166",
    background: "#17243d",
    color: "white",
    textDecoration: "none",
    cursor: "pointer"
  }
};

