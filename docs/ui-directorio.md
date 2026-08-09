# UI del Directorio y contrato de datos

Esta guía complementa [el runbook](runbook.md). El runbook cubre la configuración de Firebase, Firestore, Places API y las Functions; este archivo describe la interfaz web agregada al proyecto, el formato actual de los médicos y cómo cada integrante puede levantarla o publicarla en su propio proyecto.

## 1. Qué se agregó

La interfaz React/Vite está en la carpeta `web/`. Consume exclusivamente la Function `directorio` mediante `/api/directorio`; **no usa ni expone la API key de Google Places**.

Incluye:

- búsqueda por nombre, especialidad o dirección;
- filtros de especialidad y zona, donde las zonas se ajustan a la especialidad seleccionada;
- tarjetas por especialidad, paginación de 8 resultados y modal de detalle;
- enlaces de teléfono, sitio web y Google Maps cuando esos datos existen;
- estados de carga, error y acceso rechazado por la allowlist.

Las tarjetas se generan a partir de los documentos recibidos: si se agrega una nueva especialidad en Firestore, aparece automáticamente en los filtros y en las tarjetas, sin cambiar el código de la UI.

## 2. Estructura actual del documento `medicos`

Cada documento usa `place_id` como ID de Firestore. La Function `buscarMedicos` guarda o actualiza el documento y mantiene los campos de clasificación propios del proyecto (`especialidad`, `zona`, `keyword_usado` y `fecha_recoleccion`). Además, ahora solicita detalles de Places y guarda los campos siguientes:

| Campo | Tipo | Origen / uso |
| --- | --- | --- |
| `place_id` | string | ID único de Google Places; también es el ID del documento. |
| `nombre` | string | Nombre mostrado del lugar o profesional. |
| `direccion` | string | Dirección formateada de Google. |
| `especialidad` / `zona` | string | Clasificación usada por el directorio. |
| `telefono` / `sitio_web` | string | Valor original para enlaces y compatibilidad. |
| `tipos_google` | string[] | Tipos devueltos por Google Places. |
| `google_maps_url` | string | Enlace directo al lugar en Google Maps. |
| `ubicacion` | objeto o `null` | `{ latitud, longitud }` cuando Google la entrega. |
| `fuente` | string | Actualmente `Google Places API (New)`. |
| `datos_contacto` | objeto | Valores original y formateado para mostrar. |
| `horarios.descripcion_semanal` | string[] | Horario semanal proporcionado por Google, si existe. |
| `estado_negocio` | string | Estado de operación que entrega Google. |
| `keyword_usado` / `fecha_recoleccion` | string / timestamp | Trazabilidad de la búsqueda inicial. |
| `actualizado_en` | timestamp | Última actualización de detalles. |

Ejemplo reducido:

```json
{
  "place_id": "ChIJ...",
  "nombre": "Clínica de ejemplo",
  "direccion": "Zona 10, Ciudad de Guatemala",
  "especialidad": "cardiologo",
  "zona": "zona10",
  "telefono": "+502 2222 3333",
  "sitio_web": "https://ejemplo.com",
  "tipos_google": ["doctor", "health"],
  "google_maps_url": "https://maps.google.com/...",
  "ubicacion": {"latitud": 14.6, "longitud": -90.5},
  "fuente": "Google Places API (New)",
  "datos_contacto": {
    "telefono_original": "+502 2222 3333",
    "telefono_mostrado": "+502 2222-3333",
    "sitio_web_original": "https://ejemplo.com",
    "sitio_web_mostrado": "ejemplo.com"
  },
  "horarios": {"descripcion_semanal": ["lunes: 08:00–17:00"]},
  "estado_negocio": "OPERATIONAL"
}
```

Los campos pueden venir vacíos, como `ubicacion: null` u horarios vacíos. La UI contempla estos casos y no debe asumirse que todo lugar tiene teléfono, sitio web u horario.

### 2.1 Actualizar los 40 registros iniciales sin crear duplicados

La Function temporal `actualizarMedicosIniciales` existe para enriquecer los 40 `place_id` iniciales definidos en `functions/src/medicalPlaceData.ts`. Hace una consulta de detalles a Places por cada ID y actualiza los campos nuevos mediante `merge`.

Su comportamiento es intencionalmente limitado:

- solo recorre la lista hardcodeada de 40 IDs iniciales;
- antes de consultar Places, comprueba si el documento ya existe en la colección `medicos`;
- si el documento no existe, lo reporta en `no_encontrados` y **no lo crea**;
- conserva `especialidad`, `zona`, `keyword_usado` y `fecha_recoleccion`;
- no afecta nuevos médicos obtenidos después con `buscarMedicos`.

Para usarla en un proyecto propio, primero confirmar que esos 40 documentos ya están en Firestore, que `PLACES_API_KEY` está configurada y que la versión de la Function que contiene esta migración está desplegada:

```powershell
cd C:\ruta\a\RAI-MSPAS
firebase use <mi-alias>
firebase deploy --only functions:actualizarMedicosIniciales
```

Después invocarla una sola vez desde una IP autorizada. En PowerShell se debe incluir `-d ""`, pues el endpoint usa `POST` y Google requiere `Content-Length`:

```powershell
curl.exe -X POST -d "" "https://us-central1-<project-id>.cloudfunctions.net/actualizarMedicosIniciales?confirmar=actualizar-40"
```

La respuesta indica `actualizados`, `no_encontrados` y `errores`. Ejecutarla otra vez vuelve a consultar Places y puede generar costo, por lo que no debe usarse como parte del flujo normal. Para médicos nuevos se usa `buscarMedicos`, que guarda por `place_id` y no duplica un documento existente.

## 3. Preparar y ejecutar la UI localmente

Desde la raíz del repositorio:

```powershell
cd web
npm install
Copy-Item .env.example .env.local
```

En `web/.env.local`, ajustar `VITE_FIREBASE_PROJECT_ID` al ID del proyecto que se está usando. Para trabajar contra emuladores no hace falta configurar una URL adicional. En una terminal aparte, levantar el backend:

```powershell
cd functions
npm run serve
```

Luego levantar Vite:

```powershell
cd web
npm run dev
```

Vite reenvía `/api/directorio` al emulador y agrega la IP local necesaria para la prueba. Para consultar la Function desplegada durante desarrollo, agregar a `web/.env.local` una línea como:

```dotenv
VITE_DIRECTORIO_API_TARGET=https://us-central1-<project-id>.cloudfunctions.net
```

La red desde la que se abra el navegador debe estar en `config/ipAllowlist` de Firestore. El archivo `.env.local` no se commitea.

Antes de entregar cambios de frontend, validar:

```powershell
cd web
npm run lint
npm run build
```

## 4. Desplegar solo la UI en Firebase Hosting

Antes del primer deploy, el proyecto Firebase debe tener Functions y Firestore ya configurados según el runbook. También debe existir `config/ipAllowlist`, porque la interfaz obtiene los datos a través de la Function `directorio`.

Desde la raíz del repositorio, comprobar y seleccionar el alias propio:

```powershell
firebase use
firebase use <mi-alias>
```

Después desplegar únicamente Hosting:

```powershell
firebase deploy --only hosting
```

El bloque `predeploy` de `firebase.json` ejecuta automáticamente `npm --prefix web run lint` y `npm --prefix web run build`. Si cualquiera falla, el deploy se detiene y no publica una versión incompleta. Al finalizar, Firebase imprime la URL del sitio.

Este comando **no despliega Functions**, no modifica Firestore y no invoca `buscarMedicos`; solamente publica los archivos estáticos de `web/dist` y configura el enrutamiento `/api/directorio` hacia la Function existente.

## 5. Verificación después del deploy

1. Abrir la URL de Firebase Hosting desde una IP autorizada.
2. Confirmar que se cargan los médicos, filtros, paginación y enlaces.
3. Probar desde una red no autorizada (por ejemplo, datos móviles): debe mostrarse el mensaje de acceso rechazado y no datos médicos.
4. Si se observa `403`, confirmar la IP pública actual y el documento `config/ipAllowlist` en la base **`directorio-medicos-db`**.

Para volver a publicar únicamente un ajuste visual, repetir `firebase deploy --only hosting`. Solo se usa `firebase deploy --only functions,firestore:rules,firestore:indexes` cuando hubo cambios en las Functions, reglas o índices.
