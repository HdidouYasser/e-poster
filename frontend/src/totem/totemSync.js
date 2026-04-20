const CHANNEL = "eposter_totem";

export function createTotemSync() {
  const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

  const send = (message) => {
    try {
      bc?.postMessage(message);
    } catch {
      // noop
    }
  };

  const onMessage = (handler) => {
    if (!bc) return () => {};
    const listener = (ev) => handler(ev.data);
    bc.addEventListener("message", listener);
    return () => bc.removeEventListener("message", listener);
  };

  return { send, onMessage };
}

