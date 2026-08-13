# Directorio de Médicos Especialistas

## Documentación técnica final

**Curso:** CC3106 Responsible AI · **Institución:** Universidad del Valle de Guatemala  
**Tecnología:** TypeScript, Firebase Functions v2, Firestore, Google Places API (New), React/Vite y Firebase Hosting.
**Estudiantes:** Sergio Orellana, Rodrigo Mansilla, Ricardo Chuy

## 1. Objetivo y alcance

El sistema crea un directorio académico de médicos y centros médicos de Ciudad de Guatemala. El sistema recolecta datos de Google Places, los guarda en Firestore y los muestra en una interfaz web.

El sistema no diagnostica, no recomienda y no valida credenciales médicas. Los datos sirven como referencia. Cada registro conserva su fuente y su fecha de recolección. El alcance actual cubre dos especialidades y dos zonas. Son cuatro combinaciones de búsqueda.

## 2. Arquitectura

El sistema tiene dos funciones HTTP. `buscarMedicos` recolecta datos. `directorio` consulta los datos existentes. Las dos funciones usan el mismo middleware de lista de IP permitidas (`allowlist`).

```mermaid
flowchart TB
  subgraph clientes["1. Clientes"]
    equipo["Equipo de búsqueda"]
    navegador["Navegador"]
  end

  subgraph acceso["2. Acceso y seguridad"]
    hosting["Firebase Hosting\nUI + rewrite"]
    allowlist["IP Allowlist\n(en cada función)"]
    denied["HTTP 403"]
  end

  subgraph logica["3. Lógica"]
    buscar["buscarMedicos"]
    directorio["directorio"]
  end

  subgraph datos["4. Datos y servicios"]
    firestore[("Firestore\nmedicos + config/ipAllowlist")]
    places["Google Places API"]
  end

  equipo --> allowlist
  navegador --> hosting --> allowlist

  allowlist -->|No| denied
  allowlist -->|Sí| buscar
  allowlist -->|Sí| directorio

  buscar --> places
  buscar --> firestore
  directorio --> firestore
  allowlist -.-> firestore

  classDef client fill:#E8F0FE,stroke:#1A73E8,color:#174EA6
  classDef access fill:#FEF7E0,stroke:#F9AB00,color:#8A4B00
  classDef logic fill:#F3E8FD,stroke:#9334E6,color:#681DA8
  classDef data fill:#E8EAED,stroke:#5F6368,color:#202124
  classDef external fill:#FCE8E6,stroke:#D93025,color:#A50E0E
  classDef error fill:#FCE8E6,stroke:#D93025,color:#A50E0E

  class equipo,navegador client
  class hosting,allowlist access
  class buscar,directorio logic
  class firestore data
  class places external
  class denied error

  style clientes fill:#F8FBFF,stroke:#1A73E8,stroke-width:2px
  style acceso fill:#FFFDF5,stroke:#F9AB00,stroke-width:2px
  style logica fill:#FCF8FF,stroke:#9334E6,stroke-width:2px
  style datos fill:#F8F9FA,stroke:#5F6368,stroke-width:2px

```

La ruta de escritura y la de lectura están separadas deliberadamente. Solo el equipo invoca `buscarMedicos`, siguiendo las keywords aprobadas; la interfaz no expone esa ruta ni llama a Places. En cambio, el navegador pide `/api/directorio` al mismo dominio de Hosting. El *rewrite* de Hosting lo entrega a `directorio`, por lo que no hace falta CORS ni incluir una URL de Function en el frontend.

Los dos rombos representan el mismo patrón de middleware aplicado de forma independiente a cada Function. Ambos usan `config/ipAllowlist`; si la IP no está en `ips`, devuelven 403 y no llegan a la lógica de negocio, Places ni la colección `medicos`. La base se llama `directorio-medicos-db`, las reglas bloquean todo acceso directo de clientes y las Functions usan Admin SDK.

## 3. Implementación

### Recolección

`buscarMedicos` recibe `keyword` y `zona`. Construye la consulta:

```text
{keyword} {zona} Ciudad de Guatemala
```

La función solicita hasta 20 resultados por llamada. Rechaza un `keyword` vacío y una zona que no tenga el formato `zona<numero>`. Guarda los campos del enunciado: `nombre`, `especialidad`, `direccion`, `telefono`, `sitio_web`, `zona`, `place_id`, `fecha_recoleccion` y `keyword_usado`. También guarda datos enriquecidos de Places, como ubicación, horarios, estado y tipos de Google.

`place_id` es el ID del documento. Este ID evita duplicados. Si un lugar aparece en varias búsquedas, el documento se conserva una sola vez. La última búsqueda puede cambiar su especialidad, zona y `keyword_usado`.

### Modelo de datos y trazabilidad

Cada documento de `medicos` conserva la información necesaria para interpretar su origen y no presentar inferencias como hechos:

| Campo | Origen o regla | Propósito |
| --- | --- | --- |
| `place_id` | Google Places; también es el ID del documento | Identificador estable y deduplicación. |
| `nombre`, `direccion`, `telefono`, `sitio_web` | Respuesta de Places | Datos de contacto; pueden estar vacíos. |
| `especialidad`, `zona` | Parámetros de la búsqueda | Clasificación operacional, no credencial médica ni zona verificada. |
| `keyword_usado` | Consulta construida por la Function | Permite repetir y auditar la recolección. |
| `fecha_recoleccion` | Timestamp del servidor | Indica cuándo se obtuvo o actualizó el registro. |
| ubicación, horarios, estado y tipos | Respuesta de Places | Contexto adicional para la interfaz; no se infiere ni corrige. |

### Consulta e interfaz

`directorio` implementa `GET /directorio` con estos parámetros:

- `page` y `pageSize`; `pageSize` tiene un máximo de 50.
- `especialidad` y `zona` como filtros opcionales.

La consulta usa un índice compuesto para combinar los filtros y ordenar por `nombre`. La API puede recibir filtros y páginas en el servidor. Para mantener la demo simple, la UI actual descarga el directorio completo en bloques de hasta 50 documentos y después realiza la búsqueda textual, los filtros y la paginación visual de ocho tarjetas en el navegador. La UI incluye tarjetas por especialidad, modal de detalle, enlaces de contacto y estados de carga, error y acceso rechazado.

La UI no llama a Places y no lee Firestore directamente. Solo hace `fetch` a `/api/directorio`; Firebase Hosting reescribe esa ruta a la Function `directorio`, por lo que para el navegador ambas están en el mismo origen y no se configura CORS. La clave de Places permanece en el backend.

### Contrato de la API

| Endpoint | Uso | Parámetros | Respuestas principales |
| --- | --- | --- | --- |
| `GET /buscarMedicos` | Herramienta interna de recolección | `keyword` no vacío; `zona` con formato `zona<numero>` | `200` con el número guardado; `400` si los parámetros son inválidos; `403` si la IP no está autorizada; `500` ante un error de Places. |
| `GET /directorio` | Consulta de la UI | `page` (desde 1), `pageSize` (máximo 50), `especialidad` y `zona` opcionales | `200` con `{ page, pageSize, total, data }`; `403` por allowlist; `500` por error de consulta. |

En la implementación actual, `total` representa la cantidad de documentos devueltos en esa página, no el total global de coincidencias. La UI itera páginas de hasta 50 registros y aplica su búsqueda textual, filtros y paginación visual de ocho tarjetas en el navegador. Para un directorio mucho mayor, la mejora prioritaria sería mover esos filtros al servidor, calcular un total independiente y usar cursores en vez de `offset`.

## 4. Seguridad, operación y costo

Cada Function HTTP usa `withIpAllowlist`. El middleware lee `config/ipAllowlist` antes de ejecutar la lógica de negocio. Si la IP no está en `ips`, la respuesta es HTTP 403. El campo `enabled` permite activar o desactivar el control. El middleware compara la IP completa; no acepta rangos CIDR.

La clave `PLACES_API_KEY` vive en `functions/.env`. Este archivo no se publica en Git. La clave está restringida a Places API (New). El frontend nunca recibe la clave. Si el documento de allowlist no existe o Firestore no puede leerse, el middleware usa `IPS_AUTORIZADAS` como respaldo; en condiciones normales la configuración vive en Firestore para poder actualizar IPs sin volver a desplegar.

El proyecto usa emuladores durante el desarrollo. El despliegue usa Functions Gen2 y limita las instancias máximas a 10. Places API tiene una cuota diaria. El proyecto también tiene alertas de presupuesto al 50% y al 90%. La función `buscarMedicos` solo genera consumo de Places cuando el equipo la invoca. La UI se publica como archivos estáticos en Firebase Hosting.

Functions Gen2 no tiene una IP de salida fija por defecto. Por esta razón, la clave de Places no usa una restricción por IP de salida. Una IP fija requeriría VPC Connector y Cloud NAT, con costo adicional no justificado para este proyecto académico.

## 5. Estrategia y calidad de los datos

El equipo definió la estrategia antes de ejecutar las búsquedas. El alcance usa estos términos sin tilde:

| Especialidad | Zona | Resultados finales |
| --- | --- | ---: |
| cardiologia | zona10 | 15 |
| cardiologia | zona1 | 13 |
| pediatria | zona10 | 18 |
| pediatria | zona1 | 20 |

Places devolvió hasta 20 resultados en cada llamada. Los conteos finales son menores en algunas combinaciones por la deduplicación con `place_id` y por la clasificación de la última búsqueda.

La revisión identificó estas limitaciones:

- Algunos resultados están fuera de Ciudad de Guatemala.
- `zona` registra el parámetro usado en la búsqueda. No verifica la zona de la dirección.
- Google puede devolver una especialidad distinta a la buscada.
- Algunos registros no tienen teléfono, sitio web, horario o ubicación.
- Algunos sitios web son redes sociales o directorios externos.

El sistema no infiere los campos que faltan. Los datos se conservan como los entrega Places.

## 6. Postura ética y límites

El sistema es una demostración académica. Un resultado de Google Places no confirma que una persona tenga una especialidad médica. El sistema no muestra diagnósticos ni realiza recomendaciones clínicas.

El proyecto limita el acceso con una allowlist, conserva la fuente de los datos y reduce las consultas con un alcance pequeño y cuotas. Para un uso real se necesitarían verificación profesional, política de privacidad, términos de uso y un proceso para corregir o retirar datos.

Antes de usar los datos fuera del curso, el equipo debe revisar las políticas de Places API, las reglas de atribución y los términos de Google Maps Platform. El proyecto no declara conformidad para uso comercial o productivo.

## 7. Verificación y evidencias

El smoke test local se ejecuta con:

```powershell
cd functions
npm run test:allowlist
```

El test debe mostrar un 403 para una IP no autorizada y una respuesta distinta de 403 para una IP autorizada. La prueba real repite el mismo control desde una red autorizada y otra no autorizada.

Las Functions se despliegan en `us-central1`; Firestore usa la ubicación multirregional `nam5` y Hosting sirve la interfaz estática. Las capturas de billing, cuota de Places, Functions, allowlist, datos reales, Hosting y UI están organizadas en [`evidencias.md`](evidencias.md). Los archivos originales están en `evidences/`.

## 8. Reproducibilidad y despliegue

El procedimiento completo está en [`runbook.md`](runbook.md). Desde la raíz del repositorio, después de confirmar el proyecto correcto, se ejecuta:

```powershell
firebase deploy --only "functions,firestore:rules,firestore:indexes"
firebase deploy --only hosting
```

El predeploy ejecuta lint y build. Antes del despliegue se debe confirmar que existe `config/ipAllowlist` en la base `directorio-medicos-db`. Después se verifica una respuesta 200 desde una IP autorizada y una respuesta 403 desde una IP no autorizada.

## 9. Referencias

- [Repositorio del proyecto en GitHub](https://github.com/Rodrimansidub14/RAI-MSPAS)
- [Enlaces para demo, Firebase y GCP](links.md)
- [Instrucciones del proyecto](instrucciones_proy.md)
- [Runbook de configuración y pruebas](runbook.md)
- [Arquitectura detallada](arquitectura.md)
- [Estrategia de keywords](estrategia-keywords.md)
- [Evidencias de implementación](evidencias.md)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions/manage-functions)
- [Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart)
- [Places API (New)](https://developers.google.com/maps/documentation/places/web-service/text-search)
- [Políticas de Places API](https://developers.google.com/maps/documentation/places/web-service/policies)
