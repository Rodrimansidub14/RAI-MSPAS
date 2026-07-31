import type {Request} from "firebase-functions/https";
import type {Response} from "express";
import * as logger from "firebase-functions/logger";
import {getFirestore} from "firebase-admin/firestore";

const ALLOWLIST_COLLECTION = "config";
const ALLOWLIST_DOCUMENT = "ipAllowlist";
const CACHE_TTL_MS = 60_000;
const IPV4_MAPPED_PREFIX = /^::ffff:/i;

interface IpAllowlistDoc {
  ips: string[];
  enabled: boolean;
}

interface AllowlistCache {
  ips: Set<string>;
  enabled: boolean;
  expiresAt: number;
}

type RequestHandler = (req: Request, res: Response) => void | Promise<void>;

let cache: AllowlistCache | null = null;

const normalizeIp = (ip: string): string => {
  return ip.trim().replace(IPV4_MAPPED_PREFIX, "");
};

const parseEnvIps = (): string[] => {
  return (process.env.IPS_AUTORIZADAS || "")
    .split(",")
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);
};

/**
 * Lee la allowlist de IPs desde Firestore (config/ipAllowlist), con
 * fallback a la variable de entorno IPS_AUTORIZADAS si el documento no
 * existe. El resultado se cachea en memoria por CACHE_TTL_MS para evitar
 * una lectura a Firestore en cada request.
 */
const loadAllowlist = async (): Promise<AllowlistCache> => {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache;
  }

  let ips: string[];
  let enabled: boolean;

  try {
    const snapshot = await getFirestore()
      .collection(ALLOWLIST_COLLECTION)
      .doc(ALLOWLIST_DOCUMENT)
      .get();

    if (snapshot.exists) {
      const data = snapshot.data() as Partial<IpAllowlistDoc>;
      ips = Array.isArray(data.ips) ? data.ips : [];
      enabled = data.enabled !== false;
    } else {
      ips = parseEnvIps();
      enabled = true;
    }
  } catch (error) {
    logger.error(
      "No se pudo leer config/ipAllowlist de Firestore, " +
        "usando IPS_AUTORIZADAS como respaldo",
      error
    );
    ips = parseEnvIps();
    enabled = true;
  }

  cache = {
    ips: new Set(ips.map(normalizeIp)),
    enabled,
    expiresAt: now + CACHE_TTL_MS,
  };

  return cache;
};

const resolveClientIp = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwardedFor) ?
    forwardedFor[0] :
    forwardedFor;
  const candidate = forwardedValue ?
    forwardedValue.split(",")[0] :
    req.socket.remoteAddress;

  return normalizeIp(candidate || "");
};

/**
 * Envuelve un handler HTTP para exigir que la IP del request esté
 * presente en la allowlist configurada en Firestore antes de
 * ejecutarlo. Si la IP no está autorizada responde 403 y no invoca
 * el handler original.
 */
export const withIpAllowlist = (handler: RequestHandler): RequestHandler => {
  return async (req, res) => {
    const {ips, enabled} = await loadAllowlist();

    if (enabled) {
      const clientIp = resolveClientIp(req);
      if (!ips.has(clientIp)) {
        logger.warn("Acceso rechazado: IP no autorizada", {
          ip: clientIp,
          path: req.path,
        });
        res.status(403).json({error: "IP no autorizada"});
        return;
      }
    }

    await handler(req, res);
  };
};
