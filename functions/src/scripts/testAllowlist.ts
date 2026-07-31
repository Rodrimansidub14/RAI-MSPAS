// Smoke test reproducible del middleware de IP allowlist. Pensado para
// correr con `npm run test:allowlist`, que lo envuelve en
// `firebase emulators:exec` (levanta functions+firestore, corre este
// script, apaga los emuladores y propaga el exit code).
//
// Nunca toca producción: fuerza FIRESTORE_EMULATOR_HOST a localhost
// antes de tocar el Admin SDK, sin importar qué haya en el entorno de
// quien lo corra.
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

import {initializeApp} from "firebase-admin/app";
import {getDb} from "../firestoreDb";

const FUNCTIONS_HOST =
  `http://127.0.0.1:${process.env.FUNCTIONS_EMULATOR_PORT || "5001"}`;
const REGION = "us-central1";
const AUTHORIZED_IP = "127.0.0.1";
const UNAUTHORIZED_IP = "203.0.113.5";

const projectId = process.env.GCLOUD_PROJECT || "resp-ai";

const callDirectorio = async (ip: string): Promise<number> => {
  const url = `${FUNCTIONS_HOST}/${projectId}/${REGION}/directorio`;
  const response = await fetch(url, {
    headers: {"X-Forwarded-For": ip},
  });
  return response.status;
};

const main = async (): Promise<void> => {
  initializeApp({projectId});

  await getDb().collection("config").doc("ipAllowlist").set({
    ips: [AUTHORIZED_IP],
    enabled: true,
  });

  const blockedStatus = await callDirectorio(UNAUTHORIZED_IP);
  const allowedStatus = await callDirectorio(AUTHORIZED_IP);

  const blockedOk = blockedStatus === 403;
  const allowedOk = allowedStatus !== 403;

  console.log(
    `IP no autorizada (${UNAUTHORIZED_IP}) -> ${blockedStatus} ` +
    `(${blockedOk ? "OK" : "FALLA, se esperaba 403"})`
  );
  console.log(
    `IP autorizada (${AUTHORIZED_IP}) -> ${allowedStatus} ` +
    `(${allowedOk ? "OK" : "FALLA, no debía ser 403"})`
  );

  if (!blockedOk || !allowedOk) {
    console.error("Allowlist de IPs: FALLA");
    process.exit(1);
  }

  console.log("Allowlist de IPs: OK");
};

main().catch((error) => {
  console.error("Error corriendo el smoke test de la allowlist:", error);
  process.exit(1);
});
