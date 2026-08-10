# Estrategia de búsqueda para poblar el directorio

Documento pedido por el enunciado (Semana 2): qué especialidades y qué zonas va a cubrir el equipo, decidido y escrito antes de correr búsquedas reales en serio. `buscarMedicos` es genérico (acepta cualquier `keyword` y `zona`), así que este documento es lo que define cómo se usa esa herramienta para construir el directorio, no algo que viva en el código.

Estado: propuesta revisada, pendiente de aprobación final del equipo antes de ejecutar la campaña oficial.

## Cómo se construye cada búsqueda

El código ya arma la query así: `{keyword} {zona} Ciudad de Guatemala`, y pide hasta 20 resultados por invocación (límite del enunciado). Cada combinación de especialidad y zona que el equipo decida ejecutar es una llamada distinta a `buscarMedicos`.

## Especialidades propuestas

Diez especialidades comunes para un directorio general, pensado desde la perspectiva de qué buscaría un padre de familia o un paciente:

1. Medicina general
2. Pediatría
3. Ginecología y obstetricia
4. Cardiología
5. Dermatología
6. Oftalmología
7. Otorrinolaringología
8. Traumatología y ortopedia
9. Psiquiatría
10. Medicina interna

Pendiente: el equipo decide si esta lista se queda así, se recorta, o se amplía.

## Zonas propuestas

Ocho zonas de Ciudad de Guatemala con concentración conocida de clínicas y hospitales privados, en vez de las 25 zonas completas, para no gastar búsquedas en zonas mayormente residenciales o industriales sin oferta médica relevante:

Zona 1, zona 4, zona 9, zona 10, zona 11, zona 13, zona 14, zona 15.

Pendiente: el equipo decide si agregan o quitan zonas, por ejemplo si alguien conoce zonas con oferta médica relevante que no estén en esta lista.

## Costo estimado

Con la propuesta de arriba: 10 especialidades por 8 zonas son 80 combinaciones. A $0.017 por búsqueda, serían aproximadamente $1.36 en total, muy por debajo del crédito mensual de $200. El costo no es la restricción real en este proyecto, la calidad y el tiempo de revisión sí lo son.

## Plan de ejecución

Antes de iniciar, el equipo debe aprobar esta lista de especialidades y zonas. La aprobación debe quedar registrada en este documento junto con la fecha y los nombres o iniciales de quienes la validaron.

1. Piloto: correr estas 4 combinaciones primero: `cardiología` en `zona10`, `cardiología` en `zona1`, `pediatría` en `zona10` y `pediatría` en `zona1`.
2. Revisar manualmente los resultados del piloto en Firestore. Para aprobarlo, se debe confirmar que los lugares corresponden al ámbito médico, que los campos principales vienen bien formados y que no se están guardando resultados claramente irrelevantes.
3. Si alguna combinación da pocos o ningún resultado, probar variantes del texto de búsqueda antes de escalar (por ejemplo `cardiólogo`, `cardiología` o `clínica cardiológica`) y anotar en el registro cuál variante se usó realmente.
4. Una vez validado el piloto, ejecutar el resto de combinaciones planeadas, respetando la cuota diaria configurada.
5. No ejecutar todas las combinaciones sin una revisión intermedia. Así se pueden detectar problemas de nomenclatura y detener la campaña antes de gastar búsquedas en una consulta mal planteada.

## Regla de deduplicación y coincidencias entre búsquedas

`place_id` continúa siendo la llave única del documento. Si un mismo lugar aparece en más de una combinación, no se crea un documento adicional: se conserva un solo registro. La implementación actual actualiza el documento con la información de la búsqueda más reciente, por lo que `especialidad`, `zona` y `keyword_usado` pueden quedar asociados a la última combinación que encontró ese lugar. Durante la revisión del piloto y de la campaña oficial se deben anotar estos casos para comprobar que la clasificación final sea razonable.

## Nomenclatura inconsistente (aviso del enunciado)

Google Maps no tiene nomenclatura consistente para especialidades médicas. Si una búsqueda planeada no da buenos resultados con el término de la lista de especialidades, se documenta en la tabla de registro qué variante de texto se usó en vez del término original, para que quede claro por qué el `keyword_usado` guardado en Firestore no siempre va a ser idéntico al de esta lista.

## Datos de prueba ya generados

Ya se corrió una búsqueda de prueba en producción (`cardiólogo` / `zona10`) para confirmar que el deploy funcionaba, antes de que existiera este plan. Como `place_id` es la clave del documento, si esa combinación queda dentro del plan final, la campaña oficial simplemente actualiza esos mismos registros sin duplicarlos. Pendiente: el equipo decide si prefiere borrar esos datos de prueba antes de la campaña oficial para que la base quede con trazabilidad exacta al plan, o si los deja porque de todas formas son datos reales y probablemente se solapan con el plan.

## Registro de ejecución

Tabla para llenar a medida que se corre cada búsqueda real (no las de prueba/desarrollo):

| Fecha | Especialidad | Zona | keyword_usado exacto | Resultados guardados | Duplicados revisados | Notas |
|---|---|---|---|---|---|---|
| | | | | | | |
