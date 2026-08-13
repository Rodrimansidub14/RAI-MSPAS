# Evidencias de implementación

Este archivo concentra las capturas que respaldan cada requisito del enunciado. Vive aparte de `doc_final.md` porque la documentación técnica tiene un límite de 5 páginas y las evidencias de tres despliegues distintos la desbordarían.

El enunciado pide capturas como entregable (alertas de billing en Semana 1, entre otras) pero no especifica en qué carpeta deben quedar. La organización por integrante es una decisión del equipo, coherente con que cada quien mantiene su propio proyecto de GCP y Firebase.

## Requisitos y su evidencia

| Requisito del enunciado | Semana | Captura correspondiente |
| --- | --- | --- |
| Alertas de billing al 50% y 90% | 1 | `*_BUDGET_EVIDENCE` |
| Cuota máxima diaria de Places API | 1 | `*_PLACES_API_QUOTA` |
| Función desplegada | 1 | `*_FUNCTIONS`, `PRUEBA_DEPLOY_1` |
| IP whitelist funcionando (403) | 1 | `prueba_whitelist_middleware`, `TEST_DEPLOY_ANOTHER_IP` |
| Colección en Firestore con datos reales | 2 | `*_FIRESTORE_DATA_REAL` |
| UI accesible vía Firebase Hosting | 3 | `*_WEB`, `*_HOSTING` |

Cada integrante despliega en su propio proyecto, así que las capturas se duplican por persona a propósito: son infraestructuras independientes, no repeticiones de la misma.

## Ricardo Chuy, proyecto `resp-ai`

**Alertas de billing al 50% y 90%**

<img src="../evidences/chuy_evidence/CHUY_BUDGET_EVIDENCE.png" alt="Alertas de presupuesto configuradas en GCP" width="520" />

**Cuota diaria de Places API**

<img src="../evidences/chuy_evidence/CHUY_PLACES_API_QUOTA_EVIDENCE.png" alt="Cuota maxima diaria de Places API" width="520" />

**Cloud Functions desplegadas**

<img src="../evidences/chuy_evidence/CHUY_FUNCTIONS.png" alt="Cloud Functions desplegadas" width="520" />

**Allowlist rechazando una IP no autorizada**

<img src="../evidences/chuy_evidence/prueba_whitelist_middleware.jpeg" alt="Respuesta 403 desde una red no autorizada" width="520" />

**Datos reales en Firestore**

<img src="../evidences/chuy_evidence/CHUY_FIRESTORE_DATA_REAL.png" alt="Coleccion medicos con datos reales" width="520" />

**Hosting y UI publicada**

<img src="../evidences/chuy_evidence/CHUY_HOSTING.png" alt="Firebase Hosting desplegado" width="520" />

<img src="../evidences/chuy_evidence/CHUY_WEB.png" alt="Interfaz web publicada" width="520" />

**Primer despliegue**

<img src="../evidences/chuy_evidence/PRUEBA_DEPLOY_1.png" alt="Primer despliegue verificado" width="520" />

## Sergio, proyecto `directorio-medicos-sergio`

**Alertas de billing al 50% y 90%**

<img src="../evidences/sergio_evidence/SERGIO_BUDGET_EVIDENCE.png" alt="Alertas de presupuesto configuradas en GCP" width="520" />

**Cuota diaria de Places API**

<img src="../evidences/sergio_evidence/SERGIO_PLACES_API_QUOTE.png" alt="Cuota maxima diaria de Places API" width="520" />

**Cloud Functions desplegadas**

<img src="../evidences/sergio_evidence/SERGIO_FUNCTIONS.png" alt="Cloud Functions desplegadas" width="520" />

**Allowlist rechazando una IP no autorizada**

<img src="../evidences/sergio_evidence/TEST_DEPLOY_ANOTHER_IP.jpeg" alt="Respuesta 403 desde otra IP" width="520" />

**Datos reales en Firestore**

<img src="../evidences/sergio_evidence/SERGIO_FIRESTONE_DATA_REAL.png" alt="Coleccion medicos con datos reales" width="520" />

**Hosting y UI publicada**

<img src="../evidences/sergio_evidence/SERGIO_HOSTING.png" alt="Firebase Hosting desplegado" width="520" />

<img src="../evidences/sergio_evidence/SERGIO_WEB.png" alt="Interfaz web publicada" width="520" />

**Primer despliegue**

<img src="../evidences/sergio_evidence/PRUEBA_DEPLOY_1.png" alt="Primer despliegue verificado" width="520" />

## Rodrigo Mansilla, proyecto `project-312d82e4-6f8b-42cf-824`

**Alertas de billing al 50% y 90%**

<img src="../evidences/mansilla_evidence/MANSILLA_BUDGET_EVIDENCE.png" alt="Alertas de presupuesto configuradas en GCP" width="520" />

**Cuota diaria de Places API**

<img src="../evidences/mansilla_evidence/MANSILLA_QUOTA.png" alt="Cuota máxima diaria de Places API" width="520" />

**Cloud Functions desplegadas**

<img src="../evidences/mansilla_evidence/MANSILLA_FUNCTIONS.png" alt="Cloud Functions desplegadas" width="520" />

**Allowlist rechazando una IP no autorizada**

<img src="../evidences/mansilla_evidence/MANSILLA_ALLOWLIST.jpeg" alt="Respuesta 403 desde una red no autorizada" width="520" />

**Datos reales en Firestore**

<img src="../evidences/mansilla_evidence/MANSILLA_FIRESTORE_REAL_DATA.png" alt="Colección medicos con datos reales" width="520" />

**Hosting y UI publicada**

<img src="../evidences/mansilla_evidence/MANSILLA_HOSTING.png" alt="Firebase Hosting desplegado" width="520" />

<img src="../evidences/mansilla_evidence/MANSILLA_WEB.png" alt="Interfaz web publicada" width="520" />

**Primer despliegue**

<img src="../evidences/mansilla_evidence/MANSILLA_DEPLOY.png" alt="Primer despliegue verificado" width="520" />

Las evidencias de los tres integrantes están incorporadas. Cada grupo corresponde a una infraestructura Firebase/GCP independiente.
