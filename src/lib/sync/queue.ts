import { getDB } from "@/lib/db";
import { generateId } from "@/lib/db/utils";
import type { SyncQueueEntry, StoreName } from "./types";

export async function enqueue(
  entry: Omit<SyncQueueEntry, "queueId" | "createdAt" | "attempts">
): Promise<void> {
  const db = await getDB();
  const record: SyncQueueEntry = {
    ...entry,
    queueId: generateId(),
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  await db.put("sync_queue", record);
}

export async function getPendingEntries(): Promise<SyncQueueEntry[]> {
  const db = await getDB();
  const all = await db.getAll("sync_queue");
  return all
    .filter((e) => e.attempts < 5)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function dequeue(queueId: string): Promise<void> {
  const db = await getDB();
  await db.delete("sync_queue", queueId);
}

export async function incrementAttempt(queueId: string): Promise<void> {
  const db = await getDB();
  const entry = await db.get("sync_queue", queueId);
  if (!entry) return;
  await db.put("sync_queue", { ...entry, attempts: entry.attempts + 1 });
}

export async function clearQueue(store?: StoreName): Promise<void> {
  const db = await getDB();
  if (!store) {
    await db.clear("sync_queue");
    return;
  }
  const all = await db.getAll("sync_queue");
  for (const entry of all) {
    if (entry.store === store) {
      await db.delete("sync_queue", entry.queueId);
    }
  }
}
