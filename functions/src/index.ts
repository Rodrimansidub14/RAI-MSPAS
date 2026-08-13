import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {FieldValue} from "firebase-admin/firestore";
import axios, {isAxiosError} from "axios";
import {withIpAllowlist} from "./middleware/ipAllowlist";
import {getDb} from "./firestoreDb";
import {
  PLACE_DETAILS_FIELD_MASK,
  PlaceDetails,
  toMedicalPlaceFields,
} from "./medicalPlaceData";

const TEXT_SEARCH_FIELD_MASK = PLACE_DETAILS_FIELD_MASK
  .split(",")
  .map((field) => `places.${field}`)
  .join(",");
initializeApp();
const db = getDb();

setGlobalOptions({maxInstances: 10});


// Función 1: Buscar médicos en Places API y guardar en Firestore
export const buscarMedicos = onRequest(withIpAllowlist(async (req, res) => {
  const keyword = typeof req.query.keyword === "string" ?
    req.query.keyword.trim() : "";
  const zona = typeof req.query.zona === "string" ?
    req.query.zona.trim() : "";

  if (!keyword || !/^zona\d+$/.test(zona)) {
    res.status(400).json({
      error: "keyword debe ser un texto no vacío y zona debe tener " +
        "el formato zona<numero>",
    });
    return;
  }

  try {
    const apiKey = process.env.PLACES_API_KEY;
    const query = `${keyword} ${zona} Ciudad de Guatemala`;

    logger.info("Inicio de recolección en Places", {
      operation: "buscarMedicos",
      keyword,
      zona,
      query,
      pageSize: 20,
    });

    const response = await axios.post<{places?: PlaceDetails[]}>(
      "https://places.googleapis.com/v1/places:searchText",
      {textQuery: query, pageSize: 20},
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": TEXT_SEARCH_FIELD_MASK,
        },
      }
    );

    const places = response.data.places || [];

    const batch = db.batch();
    let guardados = 0;
    places.forEach((place) => {
      if (!place.id) {
        logger.warn("Resultado de Places sin place_id, se omite", {query});
        return;
      }

      const ref = db.collection("medicos").doc(place.id);
      batch.set(ref, {
        ...toMedicalPlaceFields(place),
        especialidad: keyword,
        zona: zona,
        place_id: place.id,
        keyword_usado: query,
        fecha_recoleccion: FieldValue.serverTimestamp(),
      });
      guardados++;
    });

    await batch.commit();

    logger.info("Recolección completada", {
      operation: "buscarMedicos",
      keyword,
      zona,
      resultadosRecibidos: places.length,
      registrosGuardados: guardados,
    });

    res.json({
      mensaje: `${guardados} médicos guardados en Firestore`,
      total: guardados,
    });
  } catch (error) {
    logger.error("Error buscando médicos", {
      operation: "buscarMedicos",
      message: error instanceof Error ? error.message : String(error),
      status: isAxiosError(error) ? error.response?.status : undefined,
    });
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

    logger.info("Consulta de directorio completada", {
      operation: "directorio",
      page,
      pageSize,
      especialidad: typeof especialidad === "string" ? especialidad : undefined,
      zona: typeof zona === "string" ? zona : undefined,
      registrosDevueltos: data.length,
    });

    res.json({page, pageSize, total: data.length, data});
  } catch (error) {
    logger.error("Error en directorio", {
      operation: "directorio",
      message: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({error: "Error al consultar el directorio"});
  }
}));
