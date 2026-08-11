# Estrategia de búsqueda para poblar el directorio

Documento pedido por el enunciado: qué especialidades y qué zonas cubre el equipo, decidido y escrito antes de ejecutar las búsquedas. `buscarMedicos` es genérico (acepta cualquier `keyword` y `zona`), así que este documento es lo que define cómo se usa esa herramienta, no algo que viva en el código.

## Alcance definido

El directorio cubre **dos especialidades en dos zonas**, cuatro combinaciones en total:

| Especialidad | Zona |
| --- | --- |
| cardiologia | zona1 |
| cardiologia | zona10 |
| pediatria | zona1 |
| pediatria | zona10 |

Este alcance es una decisión deliberada del equipo, no un plan incompleto. Las razones:

**Volumen contra capacidad de revisión.** Las cuatro combinaciones ya produjeron más de 50 registros. Una propuesta inicial de diez especialidades por ocho zonas habría generado del orden de 800 a 1200 registros. El enunciado pide revisar manualmente la relevancia de los resultados, y esa revisión deja de ser real a esa escala: se convierte en recolectar sin mirar.

**Coherencia con el control de costo del proyecto.** El proyecto define alertas de presupuesto, cuota diaria de Places y desarrollo local con emuladores precisamente para no gastar sin criterio. Recolectar cientos de registros que nadie va a revisar ni mostrar contradice ese mismo principio.

**Capacidad real de la interfaz.** La API entrega como máximo 50 documentos por página y la UI solicita páginas sucesivas, mostrando ocho tarjetas por página. Un conjunto de 800 seguiría siendo demasiado grande para revisar y demostrar, aunque ya no quedaría oculto por el límite de una sola llamada.

**Minimización de datos.** Para un proyecto académico que consume datos de terceros bajo los términos de Google, almacenar el conjunto mínimo que demuestra el sistema es una postura más defendible que acumular todo lo alcanzable. Esto se conecta con la sección de postura ética del documento final.

La calidad y trazabilidad de estos registros importan más que la cantidad. El sistema soporta cualquier combinación sin cambios de código, así que ampliar el alcance es una decisión operativa, no un desarrollo pendiente.

## Cómo se construye cada búsqueda

El código arma la consulta como `{keyword} {zona} Ciudad de Guatemala` y pide un máximo de 20 resultados por invocación, que es el límite del enunciado. Cada combinación es una llamada distinta a `buscarMedicos`.

## Convención de ortografía

Los términos se escriben **sin tilde**: `cardiologia` y `pediatria`.

Esto no es un detalle cosmético. El valor de `keyword` se guarda tal cual en el campo `especialidad`, y la interfaz construye sus filtros a partir de ese campo. Si una persona busca `cardiologia` y otra `cardiología`, la UI las muestra como dos especialidades distintas y el directorio queda fragmentado. Se eligió la forma sin tilde porque evita tener que codificar caracteres en la URL al invocar la función.

Quien ejecute una búsqueda debe usar exactamente los valores de la tabla de alcance.

## Regla de deduplicación

`place_id` es la llave única del documento. Si un mismo lugar aparece en más de una combinación no se crea un documento adicional, se conserva un solo registro.

La implementación actual sobrescribe el documento con la información de la búsqueda más reciente, por lo que `especialidad`, `zona` y `keyword_usado` quedan asociados a la última combinación que encontró ese lugar. Un centro médico general que aparezca tanto en cardiología como en pediatría queda clasificado bajo la última que se ejecutó. Es un comportamiento conocido y aceptado para este alcance.

## Nomenclatura inconsistente

Google Maps no usa una taxonomía médica uniforme. Si una búsqueda no da buenos resultados con el término elegido, se prueba una variante (por ejemplo `cardiologo` o `clinica cardiologica`) y se anota en la tabla de registro cuál se usó realmente, para que quede claro por qué el `keyword_usado` guardado puede no coincidir con el término de la tabla de alcance.

## Hallazgos de calidad del piloto

Estos casos salieron de la ejecución real y se documentan sin corregirlos, tal como pide el enunciado (los campos vacíos o imprecisos se documentan, no se rellenan ni se infieren):

- **Resultados fuera de Ciudad de Guatemala.** Una búsqueda de cardiología devolvió un centro con dirección en Zacapa, a unos 150 kilómetros, pese a que la consulta incluye "Ciudad de Guatemala" de forma explícita.
- **El campo `zona` no está verificado contra la dirección.** Guarda el parámetro de búsqueda, no la zona real del lugar. Hay registros etiquetados `zona10` cuya dirección corresponde a la zona 9.
- **Especialidades cruzadas.** Buscando cardiología aparecieron otorrinolaringólogos, neurólogos, un neurocirujano y medicina estética, todos guardados con `especialidad: cardiologia`. Es exactamente la nomenclatura inconsistente que advierte el enunciado.
- **`sitio_web` que no apunta a una clínica.** Varios registros tienen como sitio web una página de Facebook, Instagram, Páginas Amarillas o un blog. El campo se conserva tal como lo entrega Google.
- **Campos ausentes.** Hay registros sin teléfono, sin sitio web o sin horarios. Se dejan vacíos.

## Registro de ejecución

| Especialidad | Zona | `keyword_usado` exacto | Resultados guardados | Notas |
| --- | --- | --- | --- | --- |
| cardiologia | zona10 | `cardiologia zona10 Ciudad de Guatemala` | 15 | HTTP 200; búsqueda devolvió 20 |
| cardiologia | zona1 | `cardiologia zona1 Ciudad de Guatemala` | 13 | HTTP 200; búsqueda devolvió 13 |
| pediatria | zona10 | `pediatria zona10 Ciudad de Guatemala` | 18 | HTTP 200; búsqueda devolvió 20 |
| pediatria | zona1 | `pediatria zona1 Ciudad de Guatemala` | 20 | HTTP 200; búsqueda devolvió 20 |

Ejecuciones descartadas, registradas por transparencia:

| Descripción | Resultado |
| --- | --- |
| Llamada con `zona=zona` (parámetro incompleto por error de tecleo) | Guardó registros con una zona inválida. La colección se borró por completo y se repobló con las cuatro combinaciones de la tabla de alcance. |
| Búsquedas iniciales con `keyword=cardiologo` y una versión anterior del código | Guardaron documentos con ID aleatorio y campos incompletos. Se eliminaron al repoblar. |

Aprobación del alcance por el equipo: Ricardo Chuy, Rodrigo Mansilla y
SergioAle210 (identidades registradas en el historial de Git).

## Cómo escalaría

Si el directorio necesitara más cobertura, no haría falta tocar código. Bastaría con ejecutar `buscarMedicos` con combinaciones adicionales y registrarlas en la tabla de arriba. Las especialidades y zonas que se consideraron en la propuesta inicial, por si el alcance se amplía más adelante:

- Especialidades: medicina general, ginecología y obstetricia, dermatología, oftalmología, otorrinolaringología, traumatología y ortopedia, psiquiatría, medicina interna.
- Zonas con concentración de clínicas privadas: zona 4, zona 9, zona 11, zona 13, zona 14, zona 15.

Antes de ampliar habría que definir un criterio adicional de revisión y presentación, porque la interfaz puede cargar páginas sucesivas pero una colección de cientos de registros seguiría siendo difícil de validar en la demo.
