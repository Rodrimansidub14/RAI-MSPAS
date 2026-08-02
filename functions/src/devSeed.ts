import * as logger from "firebase-functions/logger";
import {getDb} from "./firestoreDb";

const DEV_IPS = ["127.0.0.1", "::1"];

// Solo corre bajo el emulador de Functions (variable que pone el propio
// Firebase Functions Framework, no existe en producción). Siembra una
// allowlist de desarrollo si config/ipAllowlist todavía no existe, para
// que probar en local no dependa de un paso manual en la UI del
// emulador cada vez que se reinicia.
export const seedDevAllowlistIfMissing = async (): Promise<void> => {
  if (process.env.FUNCTIONS_EMULATOR !== "true") {
    return;
  }

  const ref = getDb().collection("config").doc("ipAllowlist");

  try {
    const snapshot = await ref.get();
    if (snapshot.exists) {
      return;
    }

    await ref.set({ips: DEV_IPS, enabled: true});
    logger.info("Emulador: allowlist de desarrollo sembrada automáticamente", {
      ips: DEV_IPS,
    });
  } catch (error) {
    logger.error(
      "Emulador: no se pudo sembrar la allowlist de desarrollo",
      error
    );
  }
};
