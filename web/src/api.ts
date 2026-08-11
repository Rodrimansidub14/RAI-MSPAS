export interface Doctor {
  id: string;
  nombre: string;
  direccion?: string;
  especialidad?: string;
  zona?: string;
  telefono?: string;
  sitio_web?: string;
  google_maps_url?: string;
  estado_negocio?: string;
  datos_contacto?: {
    telefono_mostrado?: string;
  };
  horarios?: {
    descripcion_semanal?: string[];
  };
}

interface DirectoryResponse {
  data: Doctor[];
}

export const getDoctors = async (): Promise<Doctor[]> => {
  const pageSize = 50;
  const doctors: Doctor[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `/api/directorio?page=${page}&pageSize=${pageSize}`
    );

    if (!response.ok) {
      const message = response.status === 403 ?
        "Esta red no está autorizada para ver el directorio." :
        "No se pudo cargar el directorio. Intenta de nuevo.";
      throw new Error(message);
    }

    const payload = await response.json() as DirectoryResponse;
    doctors.push(...payload.data);

    if (payload.data.length < pageSize) {
      return doctors;
    }

    page++;
  }
};
