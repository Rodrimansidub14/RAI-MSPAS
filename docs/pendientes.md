# Pendientes

Lista de trabajo abierto del proyecto. **Cuando un punto se completa, se borra de este archivo**, no se marca como hecho. Así el documento siempre refleja lo que falta y no crece indefinidamente. Si un punto se descarta en vez de completarse, conviene anotar la razón en el documento que corresponda antes de borrarlo de aquí.

Cada punto indica dónde está el problema y por qué importa, para que quien lo tome no tenga que reconstruir el contexto.

## Código

### Validar los parámetros de `buscarMedicos`

`functions/src/index.ts` solo verifica que `keyword` y `zona` **existan**, no que tengan sentido. Una llamada con `?keyword=pediatria&zona=zona` (sin el número) pasa la validación, gasta una consulta real a Places y guarda hasta 20 documentos con `zona: "zona"`, que luego aparecen como una zona basura en los filtros de la UI. Ya ocurrió una vez y hubo que limpiar la colección.

Propuesta: validar que `zona` cumpla un patrón tipo `zona\d+` y que `keyword` no venga vacío ni con solo espacios, devolviendo 400 con un mensaje claro antes de llamar a Places. El costo de no hacerlo es dinero gastado más datos que hay que borrar a mano.

### La UI nunca muestra más de 50 registros

`web/src/api.ts` hace una sola llamada fija:

```js
fetch("/api/directorio?page=1&pageSize=50")
```

Siempre pide la página 1 con 50 como tope y luego pagina del lado del cliente. Como `directorio` además limita `pageSize` a 50 por diseño, la interfaz tiene un techo duro de 50 médicos sin importar cuántos haya en Firestore. Ya hay más de 50 documentos en al menos un proyecto, así que el problema es real y no teórico: la UI muestra un subconjunto en silencio, sin error ni aviso.

Propuesta: que la UI consuma la paginación real del endpoint (pedir páginas sucesivas o paginar del lado del servidor según la página que el usuario esté viendo) en lugar de traer un bloque fijo. Afecta directamente la demo en vivo.

### Marcar `actualizarMedicosIniciales` como fuera de uso

Decisión (Opinion de Chuy jeje): la función se conserva documentada como algo que sirvió en su momento, pero debe quedar explícito que **no forma parte del flujo de la versión final**.

Contexto para quien lo redacte: es una migración temporal con una lista de 40 `place_id` fija en `functions/src/medicalPlaceData.ts`. Esos IDs salieron de la recolección de un integrante, así que en los proyectos de los demás reporta la mayoría en `no_encontrados` y no hace nada útil. Además, el `buscarMedicos` actual ya guarda todos los campos enriquecidos de una vez, por lo que la migración solo aplica a datos recolectados con una versión anterior del código.

Qué hacer:

- Agregar una nota de "fuera de uso" en `docs/ui-directorio.md` sección 2.1, que hoy la describe como si fuera parte del procedimiento normal.
- Ajustar la mención en `docs/doc_final.md` sección 3 para que quede claro que fue una migración puntual y no una capacidad del sistema.
- Decidir si además se retira del despliegue. Mientras siga desplegada sigue siendo un endpoint invocable, aunque esté protegido por la allowlist y exija confirmación explícita.

### `vite.config.ts` tiene el proyecto de un integrante como valor por defecto

```js
const projectId = env.VITE_FIREBASE_PROJECT_ID || "directorio-medicos-sergio";
```

Solo afecta el servidor de desarrollo de Vite (`npm run dev`), no el build de producción, así que no rompe despliegues. Pero cualquier integrante que corra la UI en local sin crear su `web/.env.local` va a apuntar al proyecto de otra persona y ver un error confuso. Conviene dejar el valor por defecto vacío y fallar con un mensaje explícito, o usar un `demo-` genérico.

## Datos

### Completar la tabla de registro de ejecución

`docs/estrategia-keywords.md` ya tiene la tabla con las cuatro combinaciones del alcance y sus `keyword_usado` exactos, pero falta llenar la columna de resultados guardados por cada búsqueda. Falta también anotar quiénes del equipo aprobaron el alcance definido.

Para obtener el conteo por combinación se puede usar el filtro del endpoint, que no tiene costo de Places:

```
https://us-central1-<project-id>.cloudfunctions.net/directorio?especialidad=cardiologia&zona=zona10&pageSize=50
```

## Documentación

### Ajustar el documento final a lo que pide el enunciado

`docs/doc_final.md` tiene diez secciones y un diagrama. El enunciado limita la documentación técnica a **5 páginas**, así que probablemente hay que recortar. Además falta confirmar el formato de entrega, porque el enunciado dice "documentación técnica (máx. 5 páginas)" sin especificar si se entrega en PDF, documento de texto o Markdown. Conviene preguntarlo antes de dar el documento por cerrado.

### Preparar la presentación de 20 minutos

Es un entregable de Semana 4 y vale **15% de la nota**, incluyendo demo en vivo y preguntas. No está empezada. Vale la pena definir quién presenta qué y, sobre todo, desde qué red se hará la demo, porque la IP de ese lugar tiene que estar en `config/ipAllowlist` de antemano o la demo falla en vivo.

### Actualizar la documentación después de cada cambio

Varios documentos describen el comportamiento actual del código con detalle. Cuando se resuelvan los puntos de la sección de código, hay que revisar y ajustar:

- `docs/arquitectura.md`, sobre todo la sección de limitaciones conocidas.
- `docs/ui-directorio.md`, si cambia la paginación o el contrato de datos.
- `docs/runbook.md`, si cambian los comandos o la validación de parámetros.
- `docs/doc_final.md`, que cita el techo de 50 registros como una decisión deliberada.

## Repositorio

### Falta la carpeta de evidencias del tercer integrante

`evidences/` tiene `chuy_evidence/` y `sergio_evidence/`. Falta la del tercero. `docs/evidencias.md` ya tiene la estructura lista y la convención de nombres para que se agregue sin reorganizar nada.
