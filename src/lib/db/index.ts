import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "korb-db";
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("babies")) {
          const babyStore = db.createObjectStore("babies", { keyPath: "id" });
          babyStore.createIndex("byUserId", "userId", { unique: true });
        }

        if (!db.objectStoreNames.contains("feedings")) {
          const feedingStore = db.createObjectStore("feedings", { keyPath: "id" });
          feedingStore.createIndex("byBabyId", "babyId");
          feedingStore.createIndex("byCreatedAt", "createdAt");
        }

        if (!db.objectStoreNames.contains("diapers")) {
          const diaperStore = db.createObjectStore("diapers", { keyPath: "id" });
          diaperStore.createIndex("byBabyId", "babyId");
          diaperStore.createIndex("byCreatedAt", "createdAt");
        }

        if (!db.objectStoreNames.contains("growth")) {
          const growthStore = db.createObjectStore("growth", { keyPath: "id" });
          growthStore.createIndex("byBabyId", "babyId");
          growthStore.createIndex("byCreatedAt", "createdAt");
        }

        if (!db.objectStoreNames.contains("sleeps")) {
          const sleepStore = db.createObjectStore("sleeps", { keyPath: "id" });
          sleepStore.createIndex("byBabyId", "babyId");
          sleepStore.createIndex("byCreatedAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}
