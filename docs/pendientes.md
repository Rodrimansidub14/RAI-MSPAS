# Pendientes

Lista de trabajo abierto del proyecto. **Cuando un punto se completa, se borra de este archivo**, no se marca como hecho. Así el documento siempre refleja lo que falta y no crece indefinidamente. Si un punto se descarta en vez de completarse, conviene anotar la razón en el documento que corresponda antes de borrarlo de aquí.

Cada punto indica dónde está el problema y por qué importa, para que quien lo tome no tenga que reconstruir el contexto.

## Datos

### Completar la tabla de registro de ejecución

`docs/estrategia-keywords.md` ya tiene la tabla con las cuatro combinaciones del alcance, sus `keyword_usado` exactos y los resultados guardados. Falta únicamente anotar quiénes del equipo aprobaron el alcance definido.

Para obtener el conteo por combinación se puede usar el filtro del endpoint, que no tiene costo de Places:

```
https://us-central1-<project-id>.cloudfunctions.net/directorio?especialidad=cardiologia&zona=zona10&pageSize=50
```

## Documentación

### Ajustar el documento final a lo que pide el enunciado

`docs/doc_final.md` ya fue reescrito con redacción técnica breve y controlada. Falta validar su extensión al renderizarlo y confirmar el formato de entrega, porque el enunciado dice "documentación técnica (máx. 5 páginas)" sin especificar si se entrega en PDF, documento de texto o Markdown.

### Preparar la presentación de 20 minutos

Es un entregable de Semana 4 y vale **15% de la nota**, incluyendo demo en vivo y preguntas. No está empezada. Vale la pena definir quién presenta qué y, sobre todo, desde qué red se hará la demo, porque la IP de ese lugar tiene que estar en `config/ipAllowlist` de antemano o la demo falla en vivo.

## Repositorio

### Falta la carpeta de evidencias del tercer integrante

`evidences/` tiene `chuy_evidence/` y `sergio_evidence/`. Falta la del tercero. `docs/evidencias.md` ya tiene la estructura lista y la convención de nombres para que se agregue sin reorganizar nada.
