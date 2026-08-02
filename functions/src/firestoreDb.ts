import {getApp} from "firebase-admin/app";
import {getFirestore, Firestore} from "firebase-admin/firestore";

// El proyecto usa una base Firestore con nombre (no la "(default)").
// Debe existir con este ID exacto en cada proyecto de GCP donde se
// despliegue (personal o compartido) — ver docs/runbook.md.
const FIRESTORE_DATABASE_ID = "directorio-medicos-db";

export const getDb = (): Firestore => {
  return getFirestore(getApp(), FIRESTORE_DATABASE_ID);
};
