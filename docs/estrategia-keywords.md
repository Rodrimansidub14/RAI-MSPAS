# Estrategia de búsqueda para poblar el directorio

Documento pedido por el enunciado (Semana 2): qué especialidades y qué zonas va a cubrir el equipo, decidido y escrito antes de correr búsquedas reales en serio. `buscarMedicos` es genérico (acepta cualquier `keyword` y `zona`), así que este documento es lo que define cómo se usa esa herramienta para construir el directorio, no algo que viva en el código.

Estado: propuesta inicial, pendiente de que el equipo la confirme o ajuste antes de ejecutarla.

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

1. Piloto: correr 2 especialidades por 2 zonas (4 combinaciones) primero, y revisar manualmente los resultados guardados en Firestore. Confirmar que los campos vienen bien formados y que la cantidad de resultados por búsqueda es razonable.
2. Si alguna combinación del piloto da pocos o ningún resultado, probar variantes del texto de búsqueda antes de escalar (por ejemplo "cardiólogo" contra "cardiología" contra "clínica cardiológica"), y anotar en la sección de registro cuál variante se usó de verdad.
3. Una vez validado el piloto, correr el resto de combinaciones planeadas.
4. No correr todas las combinaciones de una sola sentada sin revisar nada en medio, para poder detectar problemas de nomenclatura temprano y no desperdiciar búsquedas repitiendo el mismo error en las 80 combinaciones.

## Nomenclatura inconsistente (aviso del enunciado)

Google Maps no tiene nomenclatura consistente para especialidades médicas. Si una búsqueda planeada no da buenos resultados con el término de la lista de especialidades, se documenta en la tabla de registro qué variante de texto se usó en vez del término original, para que quede claro por qué el `keyword_usado` guardado en Firestore no siempre va a ser idéntico al de esta lista.

## Datos de prueba ya generados

Ya se corrió una búsqueda de prueba en producción (`cardiólogo` / `zona10`) para confirmar que el deploy funcionaba, antes de que existiera este plan. Como `place_id` es la clave del documento, si esa combinación queda dentro del plan final, la campaña oficial simplemente actualiza esos mismos registros sin duplicarlos. Pendiente: el equipo decide si prefiere borrar esos datos de prueba antes de la campaña oficial para que la base quede con trazabilidad exacta al plan, o si los deja porque de todas formas son datos reales y probablemente se solapan con el plan.

## Registro de ejecución

Tabla para llenar a medida que se corre cada búsqueda real (no las de prueba/desarrollo):

| Fecha | Especialidad | Zona | keyword_usado exacto | Resultados guardados | Notas |
|---|---|---|---|---|---|
| | | | | | |
