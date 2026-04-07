import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "korb-db";
const DB_VERSION = 8;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (!db.objectStoreNames.contains("babies")) {
          const s = db.createObjectStore("babies", { keyPath: "id" });
          s.createIndex("byUserId", "userId", { unique: true });
        }

        if (!db.objectStoreNames.contains("feedings")) {
          const s = db.createObjectStore("feedings", { keyPath: "id" });
          s.createIndex("byBabyId", "babyId");
          s.createIndex("byCreatedAt", "createdAt");
          s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          s.createIndex("byBabyIdAndStarted", ["babyId", "startedAt"]);
        } else if (oldVersion > 0 && oldVersion < 5 && tx) {
          const s = tx.objectStore("feedings");
          if (!s.indexNames.contains("byBabyIdAndCreated")) s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          if (!s.indexNames.contains("byBabyIdAndStarted")) s.createIndex("byBabyIdAndStarted", ["babyId", "startedAt"]);
        }

        if (!db.objectStoreNames.contains("diapers")) {
          const s = db.createObjectStore("diapers", { keyPath: "id" });
          s.createIndex("byBabyId", "babyId");
          s.createIndex("byCreatedAt", "createdAt");
          s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          s.createIndex("byBabyIdAndChanged", ["babyId", "changedAt"]);
        } else if (oldVersion > 0 && oldVersion < 5 && tx) {
          const s = tx.objectStore("diapers");
          if (!s.indexNames.contains("byBabyIdAndCreated")) s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          if (!s.indexNames.contains("byBabyIdAndChanged")) s.createIndex("byBabyIdAndChanged", ["babyId", "changedAt"]);
        }

        if (!db.objectStoreNames.contains("growth")) {
          const s = db.createObjectStore("growth", { keyPath: "id" });
          s.createIndex("byBabyId", "babyId");
          s.createIndex("byCreatedAt", "createdAt");
          s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          s.createIndex("byBabyIdAndMeasured", ["babyId", "measuredAt"]);
        } else if (oldVersion > 0 && oldVersion < 5 && tx) {
          const s = tx.objectStore("growth");
          if (!s.indexNames.contains("byBabyIdAndCreated")) s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          if (!s.indexNames.contains("byBabyIdAndMeasured")) s.createIndex("byBabyIdAndMeasured", ["babyId", "measuredAt"]);
        }

        if (!db.objectStoreNames.contains("sleeps")) {
          const s = db.createObjectStore("sleeps", { keyPath: "id" });
          s.createIndex("byBabyId", "babyId");
          s.createIndex("byCreatedAt", "createdAt");
          s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          s.createIndex("byBabyIdAndStarted", ["babyId", "startedAt"]);
        } else if (oldVersion > 0 && oldVersion < 5 && tx) {
          const s = tx.objectStore("sleeps");
          if (!s.indexNames.contains("byBabyIdAndCreated")) s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          if (!s.indexNames.contains("byBabyIdAndStarted")) s.createIndex("byBabyIdAndStarted", ["babyId", "startedAt"]);
        }

        if (!db.objectStoreNames.contains("milestones")) {
          const s = db.createObjectStore("milestones", { keyPath: "id" });
          s.createIndex("byBabyId", "babyId");
          s.createIndex("byCategory", "category");
          s.createIndex("byCreatedAt", "createdAt");
          s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          s.createIndex("byBabyIdAndCategory", ["babyId", "category"]);
        } else if (oldVersion > 0 && oldVersion < 5 && tx) {
          const s = tx.objectStore("milestones");
          if (!s.indexNames.contains("byBabyIdAndCreated")) s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          if (!s.indexNames.contains("byBabyIdAndCategory")) s.createIndex("byBabyIdAndCategory", ["babyId", "category"]);
        }

        if (!db.objectStoreNames.contains("vaccines")) {
          const s = db.createObjectStore("vaccines", { keyPath: "id" });
          s.createIndex("byBabyId", "babyId");
          s.createIndex("byCreatedAt", "createdAt");
          s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          s.createIndex("byBabyIdAndScheduledMonth", ["babyId", "scheduledMonth"]);
          s.createIndex("byBabyIdAndAppliedDate", ["babyId", "appliedDate"]);
        } else if (oldVersion > 0 && oldVersion < 6 && tx) {
          const s = tx.objectStore("vaccines");
          if (!s.indexNames.contains("byCreatedAt")) s.createIndex("byCreatedAt", "createdAt");
          if (!s.indexNames.contains("byBabyIdAndCreated")) s.createIndex("byBabyIdAndCreated", ["babyId", "createdAt"]);
          if (!s.indexNames.contains("byBabyIdAndScheduledMonth")) s.createIndex("byBabyIdAndScheduledMonth", ["babyId", "scheduledMonth"]);
          if (!s.indexNames.contains("byBabyIdAndAppliedDate")) s.createIndex("byBabyIdAndAppliedDate", ["babyId", "appliedDate"]);
        }

        if (!db.objectStoreNames.contains("appointments")) {
          const s = db.createObjectStore("appointments", { keyPath: "id" });
          s.createIndex("byBabyId", "babyId");
          s.createIndex("byStatus", "status");
          s.createIndex("byScheduledAt", "scheduledAt");
          s.createIndex("byBabyIdAndScheduledAt", ["babyId", "scheduledAt"]);
          s.createIndex("byBabyIdAndStatus", ["babyId", "status"]);
        }

        // v8: sync queue for offline-first write-through to Supabase
        if (!db.objectStoreNames.contains("sync_queue")) {
          const sq = db.createObjectStore("sync_queue", { keyPath: "queueId" });
          sq.createIndex("byStore", "store");
          sq.createIndex("byCreatedAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}
