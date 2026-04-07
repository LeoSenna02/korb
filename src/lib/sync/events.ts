export const DATA_SYNC_EVENT = "korb:data-synced";

export function emitDataSyncEvent(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(DATA_SYNC_EVENT));
}

export function subscribeToDataSync(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => {
    callback();
  };

  window.addEventListener(DATA_SYNC_EVENT, handler);

  return () => {
    window.removeEventListener(DATA_SYNC_EVENT, handler);
  };
}
