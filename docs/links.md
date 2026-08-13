# Enlaces listos para la demo y preguntas del proyecto

Esta guía reúne los enlaces que el equipo puede abrir durante la demo o ante preguntas sobre infraestructura, seguridad, presupuesto y datos. Cada integrante tiene su propio proyecto Firebase/GCP; por eso existen tres grupos de enlaces. Si un enlace público devuelve **403**, la IP actual no está en `config/ipAllowlist`; no significa que la Function esté caída.

## Enlaces compartidos

| Recurso | Enlace | Uso |
| --- | --- | --- |
| Repositorio del proyecto | [GitHub: RAI-MSPAS](https://github.com/Rodrimansidub14/RAI-MSPAS) | Código, documentación y evidencias. |
| Documento técnico final | [docs/doc_final.md](doc_final.md) | Arquitectura, ética, API y verificación. |
| Estrategia de keywords | [docs/estrategia-keywords.md](estrategia-keywords.md) | Búsquedas autorizadas para poblar el directorio. |
| Runbook | [docs/runbook.md](runbook.md) | Configuración, emuladores, pruebas y despliegue. |
| Evidencias | [docs/evidencias.md](evidencias.md) | Capturas de presupuesto, cuota, Functions, Firestore y Hosting. |
| Firebase Console | [console.firebase.google.com](https://console.firebase.google.com/) | Consola general de Firebase. |
| Google Cloud Console | [console.cloud.google.com](https://console.cloud.google.com/) | Consola general de GCP. |
| Documentación de Places API (New) | [Text Search](https://developers.google.com/maps/documentation/places/web-service/text-search) | Explica la búsqueda que usa `buscarMedicos`. |
| Políticas de Places API | [Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies) | Referencia para límites de uso y redistribución de datos. |

## Sergio — `directorio-medicos-sergio`

| Recurso | Enlace listo | Qué mostrar o verificar |
| --- | --- | --- |
| UI publicada | [directorio-medicos-sergio.web.app](https://directorio-medicos-sergio.web.app/) | Directorio visible para una IP autorizada. |
| API de lectura | [`directorio`](https://us-central1-directorio-medicos-sergio.cloudfunctions.net/directorio?page=1&pageSize=10) | Consulta paginada de médicos ya almacenados. |
| API de recolección | [`buscarMedicos`](https://us-central1-directorio-medicos-sergio.cloudfunctions.net/buscarMedicos?keyword=pediatria&zona=zona10) | Ejecuta una búsqueda real y puede generar costo; usar solo si se acordó hacerlo. |
| Resumen de Firebase | [proyecto en Firebase](https://console.firebase.google.com/project/directorio-medicos-sergio/overview) | Estado general del proyecto. |
| Hosting | [Firebase Hosting](https://console.firebase.google.com/project/directorio-medicos-sergio/hosting/sites) | URL, historial y despliegues de la UI. |
| Firestore: médicos | [colección `medicos`](https://console.firebase.google.com/project/directorio-medicos-sergio/firestore/databases/directorio-medicos-db/data/~2Fmedicos) | Datos reales y `place_id` como ID del documento. |
| Firestore: allowlist | [`config/ipAllowlist`](https://console.firebase.google.com/project/directorio-medicos-sergio/firestore/databases/directorio-medicos-db/data/~2Fconfig~2FipAllowlist) | IPs autorizadas y el campo `enabled`. |
| Functions | [Cloud Functions](https://console.cloud.google.com/functions/list?project=directorio-medicos-sergio) | Estado de `buscarMedicos` y `directorio`. |
| Logs de las Functions | [Cloud Logging](https://console.cloud.google.com/logs/query?project=directorio-medicos-sergio) | Explorador general de logs. |
| Payload de `buscarMedicos` | [Logs filtrados de recolección](https://console.cloud.google.com/logs/query;query=jsonPayload.operation%3D%22buscarMedicos%22?project=directorio-medicos-sergio) | Abre los registros de `keyword`, `zona`, consulta, resultados recibidos y guardados. |
| Páginas servidas por `directorio` | [Logs filtrados de consulta](https://console.cloud.google.com/logs/query;query=jsonPayload.operation%3D%22directorio%22?project=directorio-medicos-sergio) | Debe mostrar las páginas 1, 2 y 3 con 50, 50 y 4 registros si existen 104 médicos. |
| Presupuesto | [Budgets & alerts](https://console.cloud.google.com/billing/budgets?project=directorio-medicos-sergio) | Alertas configuradas al 50% y 90%. |
| Cuota de Places | [Places API quotas](https://console.cloud.google.com/apis/api/places.googleapis.com/quotas?project=directorio-medicos-sergio) | Límite diario de llamadas a Places API (New). |
| Métricas de Places | [Places API metrics](https://console.cloud.google.com/apis/api/places.googleapis.com/metrics?project=directorio-medicos-sergio) | Cantidad de solicitudes, errores y latencia de Google Places; no expone el payload completo. |
| API y credenciales | [APIs & Services](https://console.cloud.google.com/apis/dashboard?project=directorio-medicos-sergio) | Confirmar que Places API (New) está habilitada y la key restringida. |

## Ricardo Chuy — `resp-ai`

| Recurso | Enlace listo | Qué mostrar o verificar |
| --- | --- | --- |
| UI publicada | [resp-ai.web.app](https://resp-ai.web.app/) | Directorio visible para una IP autorizada. |
| API de lectura | [`directorio`](https://us-central1-resp-ai.cloudfunctions.net/directorio?page=1&pageSize=10) | Consulta paginada de médicos ya almacenados. |
| API de recolección | [`buscarMedicos`](https://us-central1-resp-ai.cloudfunctions.net/buscarMedicos?keyword=pediatria&zona=zona10) | Ejecuta una búsqueda real y puede generar costo; usar solo si se acordó hacerlo. |
| Resumen de Firebase | [proyecto en Firebase](https://console.firebase.google.com/project/resp-ai/overview) | Estado general del proyecto. |
| Hosting | [Firebase Hosting](https://console.firebase.google.com/project/resp-ai/hosting/sites) | URL, historial y despliegues de la UI. |
| Firestore: médicos | [colección `medicos`](https://console.firebase.google.com/project/resp-ai/firestore/databases/directorio-medicos-db/data/~2Fmedicos) | Datos reales y `place_id` como ID del documento. |
| Firestore: allowlist | [`config/ipAllowlist`](https://console.firebase.google.com/project/resp-ai/firestore/databases/directorio-medicos-db/data/~2Fconfig~2FipAllowlist) | IPs autorizadas y el campo `enabled`. |
| Functions | [Cloud Functions](https://console.cloud.google.com/functions/list?project=resp-ai) | Estado de `buscarMedicos` y `directorio`. |
| Logs de las Functions | [Cloud Logging](https://console.cloud.google.com/logs/query?project=resp-ai) | Explorador general de logs. |
| Payload de `buscarMedicos` | [Logs filtrados de recolección](https://console.cloud.google.com/logs/query;query=jsonPayload.operation%3D%22buscarMedicos%22?project=resp-ai) | Abre los registros de `keyword`, `zona`, consulta, resultados recibidos y guardados. |
| Páginas servidas por `directorio` | [Logs filtrados de consulta](https://console.cloud.google.com/logs/query;query=jsonPayload.operation%3D%22directorio%22?project=resp-ai) | Debe mostrar las páginas 1, 2 y 3 con 50, 50 y 4 registros si existen 104 médicos. |
| Presupuesto | [Budgets & alerts](https://console.cloud.google.com/billing/budgets?project=resp-ai) | Alertas configuradas al 50% y 90%. |
| Cuota de Places | [Places API quotas](https://console.cloud.google.com/apis/api/places.googleapis.com/quotas?project=resp-ai) | Límite diario de llamadas a Places API (New). |
| Métricas de Places | [Places API metrics](https://console.cloud.google.com/apis/api/places.googleapis.com/metrics?project=resp-ai) | Cantidad de solicitudes, errores y latencia de Google Places; no expone el payload completo. |
| API y credenciales | [APIs & Services](https://console.cloud.google.com/apis/dashboard?project=resp-ai) | Confirmar que Places API (New) está habilitada y la key restringida. |

## Rodrigo Mansilla — `project-312d82e4-6f8b-42cf-824`

| Recurso | Enlace listo | Qué mostrar o verificar |
| --- | --- | --- |
| UI publicada | [project-312d82e4-6f8b-42cf-824.web.app](https://project-312d82e4-6f8b-42cf-824.web.app/) | Directorio visible para una IP autorizada. |
| API de lectura | [`directorio`](https://us-central1-project-312d82e4-6f8b-42cf-824.cloudfunctions.net/directorio?page=1&pageSize=10) | Consulta paginada de médicos ya almacenados. |
| API de recolección | [`buscarMedicos`](https://us-central1-project-312d82e4-6f8b-42cf-824.cloudfunctions.net/buscarMedicos?keyword=pediatria&zona=zona10) | Ejecuta una búsqueda real y puede generar costo; usar solo si se acordó hacerlo. |
| Resumen de Firebase | [proyecto en Firebase](https://console.firebase.google.com/project/project-312d82e4-6f8b-42cf-824/overview) | Estado general del proyecto. |
| Hosting | [Firebase Hosting](https://console.firebase.google.com/project/project-312d82e4-6f8b-42cf-824/hosting/sites) | URL, historial y despliegues de la UI. |
| Firestore: médicos | [colección `medicos`](https://console.firebase.google.com/project/project-312d82e4-6f8b-42cf-824/firestore/databases/directorio-medicos-db/data/~2Fmedicos) | Datos reales y `place_id` como ID del documento. |
| Firestore: allowlist | [`config/ipAllowlist`](https://console.firebase.google.com/project/project-312d82e4-6f8b-42cf-824/firestore/databases/directorio-medicos-db/data/~2Fconfig~2FipAllowlist) | IPs autorizadas y el campo `enabled`. |
| Functions | [Cloud Functions](https://console.cloud.google.com/functions/list?project=project-312d82e4-6f8b-42cf-824) | Estado de `buscarMedicos` y `directorio`. |
| Logs de las Functions | [Cloud Logging](https://console.cloud.google.com/logs/query?project=project-312d82e4-6f8b-42cf-824) | Explorador general de logs. |
| Payload de `buscarMedicos` | [Logs filtrados de recolección](https://console.cloud.google.com/logs/query;query=jsonPayload.operation%3D%22buscarMedicos%22?project=project-312d82e4-6f8b-42cf-824) | Abre los registros de `keyword`, `zona`, consulta, resultados recibidos y guardados. |
| Páginas servidas por `directorio` | [Logs filtrados de consulta](https://console.cloud.google.com/logs/query;query=jsonPayload.operation%3D%22directorio%22?project=project-312d82e4-6f8b-42cf-824) | Debe mostrar las páginas 1, 2 y 3 con 50, 50 y 4 registros si existen 104 médicos. |
| Presupuesto | [Budgets & alerts](https://console.cloud.google.com/billing/budgets?project=project-312d82e4-6f8b-42cf-824) | Alertas configuradas al 50% y 90%. |
| Cuota de Places | [Places API quotas](https://console.cloud.google.com/apis/api/places.googleapis.com/quotas?project=project-312d82e4-6f8b-42cf-824) | Límite diario de llamadas a Places API (New). |
| Métricas de Places | [Places API metrics](https://console.cloud.google.com/apis/api/places.googleapis.com/metrics?project=project-312d82e4-6f8b-42cf-824) | Cantidad de solicitudes, errores y latencia de Google Places; no expone el payload completo. |
| API y credenciales | [APIs & Services](https://console.cloud.google.com/apis/dashboard?project=project-312d82e4-6f8b-42cf-824) | Confirmar que Places API (New) está habilitada y la key restringida. |

## Enlaces locales para ensayar sin costo

Estos funcionan únicamente cuando el emulador está activo con `npm run serve` dentro de `functions/`. Para el 200 local se debe enviar `X-Forwarded-For: 127.0.0.1`, como se documenta en el [runbook](runbook.md).

| Recurso | Enlace |
| --- | --- |
| UI del emulador de Firebase | [http://127.0.0.1:4000](http://127.0.0.1:4000) |
| `directorio` local | [http://127.0.0.1:5001/demo-resp-ai/us-central1/directorio](http://127.0.0.1:5001/demo-resp-ai/us-central1/directorio) |
| Firestore REST local | [http://127.0.0.1:8080](http://127.0.0.1:8080) |

> Importante: no abrir repetidamente `buscarMedicos` en producción. Cada llamada consulta Google Places, puede consumir cuota y generar costo. Para demostrar la aplicación, basta con la UI y `directorio`; para demostrar la recolección, es preferible usar la evidencia ya guardada o hacer una única llamada planificada.

> Los logs estructurados aparecen después de desplegar la versión actual de Functions. Cloud Logging muestra el resumen que registra nuestra Function; Google Places muestra métricas de uso, pero no el cuerpo completo de cada solicitud.


### Guion mínimo para la demo en vivo

1. Mostrar la UI publicada y una consulta por especialidad o zona; confirmar que los resultados vienen de `/api/directorio`.
2. Abrir un registro y señalar `fecha_recoleccion` y el enlace de contacto como datos de referencia, no como validación clínica.
3. Mostrar la configuración `config/ipAllowlist` y ejecutar el smoke test: una IP no autorizada recibe 403 antes de consultar datos.
4. Mostrar una invocación planificada de `buscarMedicos` o su evidencia, el límite de 20 resultados y el documento guardado con `place_id` como ID.
5. Cerrar con las evidencias de cuota, presupuesto y las limitaciones de calidad de Places.
