import {FieldValue} from "firebase-admin/firestore";

export const INITIAL_MEDICAL_PLACE_IDS: string[] = [
  "ChIJ1eiTphSiiYUR4zrP4tYA_ys",
  "ChIJ2W0WPaKjiYURINz1HBY6VME",
  "ChIJ3arVNc6jiYURwL7zjCaij8w",
  "ChIJ53VPxsujiYURUxmTirHHjjk",
  "ChIJAX3ERsujiYURw8_IsFmwXHE",
  "ChIJD8XEZcSjiYURtpv2YmFLOfE",
  "ChIJE9USIIKjiYURCH8K6g6Ag8k",
  "ChIJHSZGg7yjiYURiSTZx-AWxG8",
  "ChIJIcampBmiiYUR2Jdo-kvbz_c",
  "ChIJKwGRF3mjiYURi77ejJ1nb30",
  "ChIJKxv7wDqjiYURPZG2JWiZDwM",
  "ChIJLSzE6jyjiYURx98_Rudcn40",
  "ChIJNWpe2oOjiYURt-za9m4Swt4",
  "ChIJNflso9mjiYUROB9ccue9tj8",
  "ChIJR9VyPcujiYURhE-i24vTWlY",
  "ChIJR__9V3ejiYURN0k-ImTTFBU",
  "ChIJTymONAWjiYURAgUF6CepZr8",
  "ChIJU2XwZcSjiYUR2EDf6N-a5Ro",
  "ChIJcesPD9GjiYURF2XwqdBdZAk",
  "ChIJdztO1bmjiYURQIzjwpCJbjI",
  "ChIJfyu34fOliYURdLb4BDya6Yk",
  "ChIJg8Fh64KjiYURdhQlOXsrj48",
  "ChIJg_fiwdmjiYURuv7AMsyjMH8",
  "ChIJj7o4__ujiYURDyOWIYRGl30",
  "ChIJjSoyNV6jiYURyqdLxRAF5V0",
  "ChIJl2DANACjiYURpqdu1Ey6XJw",
  "ChIJm5B5IxeiiYURKV_vK-6GOpA",
  "ChIJmxv7ez2iiYUR0U9M-VS22oo",
  "ChIJn17XYcCjiYURBMqfD2NZoro",
  "ChIJnbB5sMWjiYURSwlhvAffZAc",
  "ChIJo-KxS_SjiYURTruEdVmINCU",
  "ChIJo2TNWwCjiYUR_852_LP-3FY",
  "ChIJo3rfU16jiYURgs_wDM6odio",
  "ChIJo7cF_RSiiYURqeXFHdWpDUw",
  "ChIJoXTByiajiYURU24aF1RWK8k",
  "ChIJp08zc4mgiYURp7r8QZ8vGgk",
  "ChIJsYEL4IWjiYURqzER4elUz60",
  "ChIJyczliz2iiYURCyo6eWTdb6A",
  "ChIJywJubbqjiYURGBE-V9QuMu0",
  "ChIJz_JTsNejiYURKzMrKRa6F18",
];

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

