import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { createTotemSync } from "./totemSync";

const sync = createTotemSync();

export default function TotemPosterDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const screen = params.get("screen") || "1";

  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pubQuery = useQuery({
    queryKey: ["totem-pub", id],
    queryFn: async () => (await api.get(`/publications/${id}`)).data
  });

  const posterUrl = useMemo(() => pubQuery.data?.posterUrl, [pubQuery.data]);

  useIdleTimer({
    timeoutMs: 45_000,
    onIdle: () => navigate(`/totem?screen=${screen}`),
    enabled: true
  });

  useEffect(() => {
    return sync.onMessage((msg) => {
      if (!msg || msg.type !== "NAVIGATE") return;
      if (String(msg.screen) === String(screen)) return;
      navigate(msg.path);
    });
  }, [navigate, screen]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.toolbar}>
        <Link style={styles.bigBtn} to={`/totem/publications?screen=${screen}`}>
          Retour
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={styles.bigBtn} onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}>
            −
          </button>
          <button style={styles.bigBtn} onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}>
            +
          </button>
          <button style={styles.bigBtn} onClick={() => setZoom(1)}>
            Reset
          </button>
          <button style={styles.bigBtn} onClick={requestFullscreen}>
            {isFullscreen ? "Quitter écran" : "Plein écran"}
          </button>
        </div>
      </div>

      <div style={styles.stage}>
        {pubQuery.isLoading ? <div>Chargement…</div> : null}
        {!pubQuery.isLoading && !pubQuery.data ? <div>Poster introuvable.</div> : null}
        {pubQuery.data ? (
          <>
            <div style={styles.title}>{pubQuery.data.title}</div>
            <div style={styles.viewer}>
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={pubQuery.data.title}
                  style={{
                    ...styles.poster,
                    transform: `scale(${zoom})`
                  }}
                />
              ) : (
                <div style={styles.placeholder}>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Aucun posterUrl</div>
                  <div style={{ opacity: 0.85 }}>
                    Ajoutez une URL d’image au champ <code>posterUrl</code> dans la publication.
                  </div>
                </div>
              )}
            </div>
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
    padding: 18
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  stage: {
    borderRadius: 16,
    border: "1px solid #233252",
    background: "#111b2f",
    padding: 16,
    minHeight: "calc(100vh - 110px)"
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 12
  },
  viewer: {
    height: "calc(100vh - 190px)",
    overflow: "auto",
    borderRadius: 14,
    border: "1px solid #233252",
    background: "#0e1930",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 16
  },
  poster: {
    transformOrigin: "top center",
    maxWidth: "100%",
    height: "auto",
    borderRadius: 10,
    border: "1px solid #233252",
    background: "white"
  },
  placeholder: {
    width: "100%",
    padding: 24
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
  }
};

