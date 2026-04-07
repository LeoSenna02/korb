"use client";

import { createClient } from "@/lib/supabase/client";
import { getDB } from "@/lib/db";
import {
  enqueue,
  getPendingEntries,
  dequeue,
  incrementAttempt,
} from "./queue";
import { STORE_TO_TABLE } from "./mappers";
import type { StoreName, SyncQueueEntry } from "./types";

class SyncEngine {
  private isOnline =
    typeof navigator !== "undefined" ? navigator.onLine : true;
  private listening = false;

  startOnlineListener(): void {
    if (this.listening || typeof window === "undefined") return;
    this.listening = true;

    window.addEventListener("online", () => {
      this.isOnline = true;
      this.drainQueue();
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    // Drain on startup if already online
    if (this.isOnline) {
      this.drainQueue();
    }
  }

  async drainQueue(): Promise<void> {
    const entries = await getPendingEntries();
    for (const entry of entries) {
      await this.processEntry(entry);
    }
  }

  private async processEntry(entry: SyncQueueEntry): Promise<void> {
    const supabase = createClient();
    const table = STORE_TO_TABLE[entry.store];
    if (!table) return;

    try {
      if (entry.operation === "upsert") {
        const { error } = await supabase
          .from(table as never)
          .upsert(entry.payload as never, { onConflict: "id" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table as never)
          .delete()
          .eq("id", entry.recordId);
        if (error) throw error;
      }

      await dequeue(entry.queueId);
      await this.markSynced(entry.store, entry.recordId);
    } catch {
      await incrementAttempt(entry.queueId);
    }
  }

  async syncRecord(
    store: StoreName,
    row: Record<string, unknown>,
    operation: "upsert" | "delete"
  ): Promise<void> {
    const recordId = row["id"] as string;

    if (!this.isOnline) {
      await enqueue({ store, recordId, operation, payload: row });
      return;
    }

    const supabase = createClient();
    const table = STORE_TO_TABLE[store];

    try {
      if (operation === "upsert") {
        const { error } = await supabase
          .from(table as never)
          .upsert(row as never, { onConflict: "id" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table as never)
          .delete()
          .eq("id", recordId);
        if (error) throw error;
      }

      await this.markSynced(store, recordId);
    } catch {
      // Supabase failed — enqueue for retry
      await enqueue({ store, recordId, operation, payload: row });
    }
  }

  private async markSynced(store: StoreName, id: string): Promise<void> {
    try {
      const db = await getDB();
      const record = await db.get(store as never, id);
      if (record) {
        await db.put(store as never, { ...record, synced: true });
      }
    } catch {
      // Non-critical — silently ignore
    }
  }
}

export const syncEngine = new SyncEngine();
