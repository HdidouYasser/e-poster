import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";

const sync = createTotemSync();

export default function TotemPublications() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const screen = params.get("screen") || "1";
  const eventId = params.get("eventId") || "";
  const [page, setPage] = useState(Number(params.get("page") || 0));
  const size = 12;

  const [q, setQ] = useState(params.get("q") || "");
  const endpoint = useMemo(() => {
    const base = q.trim()
      ? `/publications/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`
      : `/publications?page=${page}&size=${size}`;
    return eventId ? `${base}&eventId=${encodeURIComponent(eventId)}` : base;
  }, [q, page, size, eventId]);

  const pubsQuery = useQuery({
    queryKey: ["totem-pubs", page, size, q, eventId],
    queryFn: async () => (await api.get(endpoint)).data
  });

  const data = pubsQuery.data || { items: [], page: 0, totalPages: 1 };

  useEffect(() => {
    setParams((p) => {
      p.set("page", String(page));
      p.set("screen", screen);
      if (eventId) p.set("eventId", eventId);
      if (q) p.set("q", q);
      else p.delete("q");
      return p;
    });
  }, [page, q, eventId, screen, setParams]);

  useIdleTimer({
    timeoutMs: 60_000,
    onIdle: () => navigate(`/totem?screen=${screen}`),
    enabled: true
  });

  useEffect(() => {
    // follower behavior: if another screen opens a poster, follow it
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return; // ignore self
      // follow any other screen
      navigate(msg.path);
    });
  }, [navigate, screen]);

  return (
    <div style={styles.shell}>
      <div style={styles.topBar}>
        <Link style={styles.bigBtn} to={`/totem?screen=${screen}`}>
          Accueil
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            style={styles.search}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Rechercher un poster…"
          />
          <button
            style={styles.bigBtn}
            onClick={() => {
              window.open(`${window.location.origin}/totem/publications?screen=${Number(screen) + 1}`, `totem-screen-${Number(screen) + 1}`);
            }}
          >
            + écran
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {(data.items || []).map((p) => (
          <button
            key={p.id}
            style={styles.tile}
            onClick={() => {
              const path = `/totem/publications/${p.id}?screen=${screen}`;
              sync.send({ type: "NAVIGATE", screen, path });
              navigate(path);
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{p.title}</div>
            <div style={{ opacity: 0.85, fontSize: 16, lineHeight: 1.2, maxHeight: 58, overflow: "hidden" }}>
              {p.description}
            </div>
            <div style={{ marginTop: 10, opacity: 0.7 }}>{p.status}</div>
          </button>
        ))}
      </div>

      <div style={styles.pager}>
        <button style={styles.bigBtn} disabled={page <= 0} onClick={() => setPage((x) => x - 1)}>
          Précédent
        </button>
        <div style={{ fontSize: 18 }}>
          Page {data.page + 1} / {Math.max(data.totalPages, 1)}
        </div>
        <button style={styles.bigBtn} disabled={page + 1 >= data.totalPages} onClick={() => setPage((x) => x + 1)}>
          Suivant
        </button>
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
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 18
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16
  },
  tile: {
    textAlign: "left",
    borderRadius: 16,
    border: "1px solid #233252",
    background: "#111b2f",
    padding: 16,
    color: "white",
    minHeight: 150,
    cursor: "pointer"
  },
  pager: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  bigBtn: {
    fontSize: 20,
    padding: "14px 18px",
    borderRadius: 14,
    border: "1px solid #2f4166",
    background: "#17243d",
    color: "white",
    cursor: "pointer",
    textDecoration: "none"
  },
  search: {
    fontSize: 20,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #2f4166",
    background: "#0e1930",
    color: "white",
    minWidth: 340
  }
};

