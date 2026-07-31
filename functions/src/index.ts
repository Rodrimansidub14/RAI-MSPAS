import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {FieldValue} from "firebase-admin/firestore";
import axios from "axios";
import {withIpAllowlist} from "./middleware/ipAllowlist";
import {getDb} from "./firestoreDb";

initializeApp();
const db = getDb();

setGlobalOptions({maxInstances: 10});

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
    places.forEach((place: any) => {
      const ref = db.collection("medicos").doc();
      batch.set(ref, {
        nombre: place.displayName?.text || "",
        direccion: place.formattedAddress || "",
        telefono: place.nationalPhoneNumber || "",
        sitioWeb: place.websiteUri || "",
        especialidad: keyword,
        zona: zona,
        creadoEn: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    res.json({
      mensaje: `${places.length} médicos guardados en Firestore`,
      total: places.length,
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
