# RAI-MSPAS

Directorio de Médicos Especialistas para el Ministerio de Educación de Guatemala. Proyecto del curso CC3106 Responsible AI, UVG

## Qué hace

Una Cloud Function en TypeScript busca médicos especialistas en Google Places API y guarda los resultados en Firestore. Otra Cloud Function expone esos datos como una API paginada, con filtros por especialidad y zona. Ambas están protegidas por un middleware de IP allowlist: solo las IPs autorizadas en Firestore pueden usarlas.

## Empezar

Todos los pasos de setup, cómo correr el emulador local, cómo probar el allowlist, y cómo hacer un deploy real están en [`docs/runbook.md`](docs/runbook.md). Ese documento se actualiza a medida que avanza el proyecto, es la referencia operativa del equipo.

Para arrancar rápido sin tener todavía una cuenta propia de GCP, ver la sección 1.0 del runbook (modo `demo`, sin login ni proyecto real).

El diagrama de arquitectura está en [`docs/arquitectura.md`](docs/arquitectura.md), y la propuesta de especialidades y zonas para poblar el directorio en [`docs/estrategia-keywords.md`](docs/estrategia-keywords.md).

## Stack

TypeScript, Firebase Functions v2, Firestore, Google Places API, Firebase Hosting para la UI. Desarrollo local con el emulador de Firebase; producción solo para pruebas finales y la demo.
