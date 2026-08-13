import {FieldValue} from "firebase-admin/firestore";

export const PLACE_DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "nationalPhoneNumber",
  "websiteUri",
  "types",
  "googleMapsUri",
  "location",
  "businessStatus",
  "regularOpeningHours",
].join(",");

export interface PlaceDetails {
  id?: string;
  displayName?: {text?: string};
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  types?: string[];
  googleMapsUri?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  businessStatus?: string;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
  };
}

interface MedicalPlaceFields {
  nombre: string;
  direccion: string;
  telefono: string;
  sitio_web: string;
  tipos_google: string[];
  google_maps_url: string;
  ubicacion: {
    latitud: number;
    longitud: number;
  } | null;
  fuente: string;
  datos_contacto: {
    telefono_original: string;
    telefono_mostrado: string;
    sitio_web_original: string;
    sitio_web_mostrado: string;
  };
  horarios: {
    descripcion_semanal: string[];
  };
  estado_negocio: string;
  actualizado_en: FieldValue;
}

const formatPhoneForDisplay = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  if (digits.length === 11 && digits.startsWith("502")) {
    return `+502 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return phone;
};

const formatWebsiteForDisplay = (website: string): string => {
  if (!website) {
    return "";
  }

  try {
    return new URL(website).hostname.replace(/^www\./i, "");
  } catch {
    return website;
  }
};

export const toMedicalPlaceFields = (
  place: PlaceDetails
): MedicalPlaceFields => {
  const phone = place.nationalPhoneNumber || "";
  const website = place.websiteUri || "";
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  const hasLocation = typeof latitude === "number" &&
    typeof longitude === "number";

  return {
    nombre: place.displayName?.text || "",
    direccion: place.formattedAddress || "",
    telefono: phone,
    sitio_web: website,
    tipos_google: place.types || [],
    google_maps_url: place.googleMapsUri || "",
    ubicacion: hasLocation ? {
      latitud: latitude,
      longitud: longitude,
    } : null,
    fuente: "Google Places API (New)",
    datos_contacto: {
      telefono_original: phone,
      telefono_mostrado: formatPhoneForDisplay(phone),
      sitio_web_original: website,
      sitio_web_mostrado: formatWebsiteForDisplay(website),
    },
    horarios: {
      descripcion_semanal:
        place.regularOpeningHours?.weekdayDescriptions || [],
    },
    estado_negocio: place.businessStatus || "",
    actualizado_en: FieldValue.serverTimestamp(),
  };
};

