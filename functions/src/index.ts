import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {FieldValue} from "firebase-admin/firestore";
import axios from "axios";
import {withIpAllowlist} from "./middleware/ipAllowlist";
import {getDb} from "./firestoreDb";
import {seedDevAllowlistIfMissing} from "./devSeed";

initializeApp();
const db = getDb();

setGlobalOptions({maxInstances: 10});

seedDevAllowlistIfMissing();

// Función 1: Buscar médicos en Places API y guardar en Firestore
export const buscarMedicos = onRequest(withIpAllowlist(async (req, res) => {
  const {keyword, zona} = req.query;

  if (!keyword || !zona) {
    res.status(400).json({error: "Se requieren keyword y zona"});
    return;
  }

  try {
    const apiKey = process.env.PLACES_API_KEY;
    const query = `${keyword} ${zona} Ciudad de Guatemala`;

    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      {textQuery: query, pageSize: 20},
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.nationalPhoneNumber",
            "places.websiteUri",
            "places.types",
          ].join(","),
        },
      }
    );

    const places = response.data.places || [];

    const batch = db.batch();
    let guardados = 0;
    places.forEach((place: any) => {
      if (!place.id) {
        logger.warn("Resultado de Places sin place_id, se omite", {query});
        return;
      }

      const ref = db.collection("medicos").doc(place.id);
      batch.set(ref, {
        nombre: place.displayName?.text || "",
        direccion: place.formattedAddress || "",
        telefono: place.nationalPhoneNumber || "",
        sitio_web: place.websiteUri || "",
        especialidad: keyword,
        zona: zona,
        place_id: place.id,
        keyword_usado: query,
        fecha_recoleccion: FieldValue.serverTimestamp(),
      });
      guardados++;
    });

    await batch.commit();

    res.json({
      mensaje: `${guardados} médicos guardados en Firestore`,
      total: guardados,
    });
  } catch (error) {
    logger.error("Error buscando médicos", error);
    res.status(500).json({error: "Error al consultar Places API"});
  }
}));

// Función 2: Directorio paginado con filtros
export const directorio = onRequest(withIpAllowlist(async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 10);
    const {especialidad, zona} = req.query;

    let query: FirebaseFirestore.Query = db.collection("medicos");

    if (especialidad) query = query.where("especialidad", "==", especialidad);
    if (zona) query = query.where("zona", "==", zona);

    const snapshot = await query
      .orderBy("nombre")
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    const data = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    res.json({page, pageSize, total: data.length, data});
  } catch (error) {
    logger.error("Error en directorio", error);
    res.status(500).json({error: "Error al consultar el directorio"});
  }
}));
