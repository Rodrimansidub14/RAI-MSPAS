# Runbook: Directorio de Médicos Especialistas

Guía operativa para el equipo: qué hacer para tener el proyecto
corriendo, qué configurar en su propio GCP, y cómo probar antes de
desplegar. Se va actualizando a medida que avanza el proyecto.

## 1. Setup inicial

### 1.0 Empezar rápido, sin proyecto propio de GCP todavía

Para clonar el repo y correr el emulador o `npm run test:allowlist` no
hace falta tener ya una cuenta de GCP lista. Firebase soporta project
IDs que empiezan con `demo-` (por ejemplo `demo-resp-ai`) para correr
los emuladores completamente offline: sin login, sin proyecto real, sin
billing de por medio.

```
cd RAI-MSPAS/functions
npm install
firebase emulators:start --project demo-resp-ai --only functions,firestore
```

Esto sirve para explorar el código, correr el smoke test del allowlist,
o probar `directorio` con datos falsos. Lo único que no se puede probar
así es `buscarMedicos`, porque esa función sí llama a la Places API real
por internet (no hay emulador de Google Places), y eso necesita una
`PLACES_API_KEY` real de un proyecto real con billing habilitado.

El truco de `demo-*` solo funciona pasándolo como flag directo, como en
el comando de arriba. `firebase use default` (o cualquier alias que
apunte a un project ID `demo-*`) falla con "Invalid project selection",
porque ese comando sí valida acceso real contra la cuenta con la que se
hizo login. Para el modo offline siempre hay que usar `--project
demo-resp-ai` explícito en el comando, no cambiarse de proyecto con
`firebase use`.

### 1.1 Proyecto propio de GCP/Firebase (uno por persona, una vez)

Esto es equivalente a un workspace de Terraform: mismo código para
todos, pero cada quien lo apunta a su propio backend/proyecto en vez de
compartir uno. La diferencia con Terraform es que `firebase use --add`
no crea el proyecto, solo registra en este repo un proyecto que ya
existe. Crearlo es un paso aparte. Orden completo:

1. **Crear el proyecto** (una vez, desde el navegador): entrar a
   [console.firebase.google.com](https://console.firebase.google.com),
   "Agregar proyecto", ponerle un nombre reconocible (por ejemplo
   `resp-ai-ricardo`). Esto crea el proyecto de Firebase y el de GCP
   detrás, ya vinculados.
2. **Login del CLI** (una vez por máquina), con la cuenta de Google
   dueña de ese proyecto:
   ```
   firebase login
   ```
3. **Registrar ese proyecto como alias local**, sin tocar el de nadie
   más:
   ```
   firebase use --add
   ```
   Este comando es interactivo: primero muestra la lista de proyectos
   de Firebase de la cuenta con la que se hizo login (ahí debería
   aparecer el que se acaba de crear), lo selecciona, y después pide un
   nombre corto para el alias (por ejemplo `ricardo`). Esto agrega el
   proyecto a `.firebaserc` (que sí se commitea, no tiene secretos) sin
   afectar el de los demás:
   ```json
   {
     "projects": {
       "default": "resp-ai",
       "ricardo": "resp-ai-ricardo"
     }
   }
   ```
   De ahí en adelante, `firebase use ricardo` selecciona ese proyecto
   para `deploy` o `emulators:start`, como cambiar de workspace. Sin
   ese comando, el CLI sigue usando el alias `default`.
4. **Habilitar "Places API (New)"** en ese proyecto de GCP y crear una
   API key en Credenciales. Restringir la key por API (solo Places API
   New). No hace falta restricción por IP: la llamada a Places sale
   desde el servidor (Cloud Function), no desde el navegador, y
   restringir por IP de salida requeriría una IP estática (Serverless
   VPC Connector + Cloud NAT) con costo aparte que no está configurado.
   La key nunca se expone al cliente de todas formas: va en variable de
   entorno, nunca en código ni en la respuesta al navegador.
5. **Alertas de billing** al 50% y 90% del presupuesto (consola de GCP,
   Billing, Budgets & alerts). Guardar screenshot como evidencia.
6. **Cuota máxima diaria** de llamadas a Places API (APIs & Services,
   Places API (New), Quotas). Guardar screenshot como evidencia.
7. **Crear la base de datos de Firestore con el nombre exacto**
   `directorio-medicos-db` (no usar `(default)`). Este paso solo hace
   falta para un deploy real a este proyecto; el emulador no lo
   necesita, simula cualquier nombre de base sin validarlo contra GCP.
   - Consola de Firebase, Firestore Database, Crear base de datos.
   - Database ID: `directorio-medicos-db`.
   - Modo: Native.
   - Ubicación: `nam5` (tiene que coincidir con `firebase.json`).

   El código (`functions/src/firestoreDb.ts`) apunta específicamente a
   esta base por nombre. Si un proyecto tiene una base con otro ID, las
   funciones no van a encontrar ni guardar los datos donde se espera.
8. **Configurar la API key localmente**: copiar
   `functions/.env.example` a `functions/.env` y poner ahí la
   `PLACES_API_KEY` de cada quien. Este archivo no se commitea (está en
   `.gitignore`, incluyendo variantes `.env.*` salvo `.env.example`).

## 2. Desarrollo local (emulador): 90% del trabajo va aquí

```
cd functions
npm run serve
```

Esto compila y levanta `functions` y `firestore` en local. UI del
emulador: `http://127.0.0.1:4000`.

### 2.0 Verificar el allowlist con un solo comando (recomendado)

No hace falta levantar nada a mano ni sembrar datos manualmente para
confirmar que el allowlist funciona. Hacerlo a mano cada vez sería
frágil y poco reproducible entre computadoras. Hay un smoke test
committeado en el repo que hace todo el ciclo solo:

```
cd functions
npm run test:allowlist
```

Este comando compila, levanta `functions` y `firestore` desde cero
(sin ningún estado previo), siembra `config/ipAllowlist` con una IP de
prueba (código en `functions/src/scripts/testAllowlist.ts`), llama a
`directorio` una vez con una IP no autorizada (debe dar 403) y otra vez
con la IP autorizada (no debe dar 403), imprime el resultado, y apaga
los emuladores solo. No hace falta `firebase login` para esto: el
emulador no habla con GCP real en ningún punto de este flujo.

Salida esperada:
```
IP no autorizada (203.0.113.5) -> 403 (OK)
IP autorizada (127.0.0.1) -> 200 (OK)
Allowlist de IPs: OK
```

Si alguien cambia el middleware y rompe algo, este comando termina con
un exit code distinto de 0. Se puede correr después de cualquier
cambio relacionado con el allowlist, sin depender de que alguien haya
sembrado datos a mano de antemano.

### 2.1 Crear la allowlist de IPs a mano (para explorar o debuggear)

El comando de la sección 2.0 ya prueba el allowlist de punta a punta.
Lo de acá sirve para cuando alguien quiera dejar el emulador corriendo
y explorar manualmente (por ejemplo probar `buscarMedicos` con su
propia key, o ver datos en la UI).

El middleware (`functions/src/middleware/ipAllowlist.ts`) lee el
documento `config/ipAllowlist` de Firestore. Ese documento no existe
por defecto: sin él, todas las requests dan 403. Para crearlo en el
emulador:

- Abrir `http://127.0.0.1:4000/firestore`.
- Colección `config`, documento `ipAllowlist`.
- Campos:
  - `ips` (array de strings): `127.0.0.1` y `::1` para pruebas locales.
  - `enabled` (boolean): `true`.

El cambio puede tardar hasta 60 segundos en reflejarse por el cache en
memoria del middleware (a menos que sea la primera request desde que
arrancó el emulador, ahí no hay cache previo que esperar). Alternativa
por línea de comandos, usando el token especial `owner` que el
emulador acepta para saltarse las reglas de seguridad:

```
curl -X PATCH \
  "http://127.0.0.1:8080/v1/projects/<project-id>/databases/directorio-medicos-db/documents/config/ipAllowlist" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer owner" \
  -d '{"fields":{"ips":{"arrayValue":{"values":[{"stringValue":"127.0.0.1"},{"stringValue":"::1"}]}},"enabled":{"booleanValue":true}}}'
```

### 2.2 Por qué hay que mandar X-Forwarded-For a mano en local

Pegándole directo al puerto del emulador (`:5001`), el request va a
dar 403 siempre, incluso con la IP correcta ya en la allowlist. La
razón: el emulador de Functions no simula un proxy real, así que
`req.socket.remoteAddress` llega vacío y tampoco hay header
`x-forwarded-for`. En producción esto no pasa, porque el tráfico pasa
por el load balancer de Google, que siempre setea ese header. Para
probar el 403 o el 200 en local hay que mandarlo a mano:

```
# IP autorizada, no debería dar 403
curl -i -H "X-Forwarded-For: 127.0.0.1" \
  "http://127.0.0.1:5001/<project-id>/us-central1/directorio"

# IP no autorizada, debe dar 403
curl -i -H "X-Forwarded-For: 9.9.9.9" \
  "http://127.0.0.1:5001/<project-id>/us-central1/directorio"
```

## 3. Antes de cualquier deploy real

- **Confirmar a qué proyecto se está apuntando**, con `firebase use`
  (sin argumentos). Imprime el project ID activo en ese momento. Como
  cada quien tiene su propio proyecto y su propio alias, este chequeo
  evita desplegar por error sobre el proyecto de otra persona. Si no es
  el correcto, cambiar con `firebase use <alias>` antes de continuar.
- `npm run lint && npm run build` en `functions/` deben pasar, porque
  es un hook `predeploy` en `firebase.json`: si falla, no despliega.
- Confirmar que `config/ipAllowlist` existe en el proyecto de
  producción (Firestore real, no el emulador; son bases separadas)
  antes de desplegar, o todo el tráfico va a dar 403.
- El deploy real es solo para pruebas finales y la demo, no para el
  desarrollo del día a día. Así lo pide el enunciado, y además cada
  deploy a producción tiene costo real.

### 3.1 Crear el allowlist en el proyecto real, antes de desplegar

Igual que en el emulador, pero en la consola real de Firebase
(console.firebase.google.com), no en la UI del emulador:

1. Conseguir la IP pública real de quien va a probar, con
   `curl ifconfig.me` o cualquier página de "what is my ip".
2. Entrar a Firestore Database en la consola, y antes de crear nada
   confirmar en el selector de bases que se está viendo
   `directorio-medicos-db`, no `(default)`. Si se crea el documento en
   la base equivocada, el código nunca lo va a encontrar.
3. Pestaña Data, "Start collection", collection ID `config`, Next.
4. Document ID exacto `ipAllowlist` (mayúscula en la "A").
5. Agregar campo `ips`, tipo array, con la IP pública como string.
6. Agregar campo `enabled`, tipo boolean, valor `true`.
7. Guardar.

### 3.2 Deploy y verificación

```
firebase use
firebase deploy --only functions,firestore:rules,firestore:indexes
```

`firebase use` sin argumentos debe confirmar el proyecto correcto antes
de seguir. El deploy corre desde la raíz de `RAI-MSPAS` (donde está
`firebase.json`), no desde `functions/`.

La primera vez que se despliega una función v2 en un proyecto, el CLI
puede preguntar cuántos días conservar las imágenes de contenedor antes
de borrarlas (Artifact Registry). Aceptar el valor por defecto (1 día)
es suficiente, es solo para no acumular storage de builds viejos y no
hay necesidad de volver a una imagen anterior.

Al terminar, el CLI imprime la URL real de cada función. Para probarlas:

- `directorio` es un GET simple, se puede pegar la URL directo en el
  navegador. Con la IP ya en la allowlist, responde algo como
  `{"page":1,"pageSize":10,"total":0,"data":[]}`, sin necesidad de
  curl ni headers a mano (eso era solo para el emulador).
- `buscarMedicos` necesita los parámetros `keyword` y `zona` en la
  URL, por ejemplo:
  ```
  https://us-central1-<project-id>.cloudfunctions.net/buscarMedicos?keyword=cardiologo&zona=zona10
  ```
  Esta sí llama a la Places API real y tiene costo (aprox. $0.017 por
  llamada). No conviene probarla en loop, una vez alcanza para
  confirmar que el deploy funciona. Si además cuenta como una búsqueda
  real para poblar el directorio, definir antes la estrategia de
  keywords como equipo (pedido en la Semana 2), no improvisar el
  primer `keyword`/`zona` que se le ocurra a quien esté probando.
  La respuesta no trae la lista de médicos, solo un resumen
  (`{"mensaje": "...", "total": N}`); los datos se revisan llamando de
  nuevo a `directorio`, o directo en la consola de Firestore, colección
  `medicos`.

## 4. Convenciones del repo

- La API key de Places nunca va en código, solo en `functions/.env` (o
  `functions/.env.<project-id>` para overrides por proyecto).
- La API key se restringe por API (solo "Places API (New)"), no por IP,
  aunque la consola de GCP sí ofrece un campo de "IP addresses" en
  Application restrictions. Ese campo funciona solo si hay una IP fija
  que poner ahí, y Cloud Functions Gen2 no tiene una IP de salida fija
  por defecto: cada llamada a Places API puede salir por una IP
  distinta de un pool compartido con otros clientes de Google, no
  propia del proyecto. Poner la IP de una persona del equipo ahí no
  funciona, porque esa nunca es la IP que Google ve llegar de verdad.
  Para tener una IP de salida fija haría falta un Serverless VPC
  Connector más Cloud NAT, con costo aparte (unos 40 a 50 dólares
  mensuales como mínimo), que no se justifica para el alcance de este
  proyecto. Esta es una decisión de alcance tomada conscientemente, no
  un pendiente. Documentarla también en la sección de seguridad de la
  entrega de Semana 4.
- La allowlist de IPs vive en Firestore (`config/ipAllowlist`), no en
  el código. La variable de entorno `IPS_AUTORIZADAS` (CSV) es solo un
  respaldo si ese documento no existe.
- Toda Cloud Function HTTP nueva debe envolverse con
  `withIpAllowlist(...)` (ver `buscarMedicos` y `directorio` en
  `index.ts` como ejemplo), en vez de repetir el chequeo a mano.
- Usar siempre `getDb()` de `functions/src/firestoreDb.ts` para
  obtener el cliente de Firestore, no `getFirestore()` directo, así
  todo el código apunta a la base `directorio-medicos-db` de forma
  consistente.

## 5. Estado del checklist

- [x] Proyecto Firebase/GCP configurado
- [x] Alertas de billing (50%/90%), evidencia en `chuy_evidence/`
- [x] Cuota máxima diaria de Places API, evidencia en `chuy_evidence/`
- [x] Middleware de IP whitelist implementado, con smoke test
      reproducible (`npm run test:allowlist`, ver sección 2.0)
- [ ] Función "hello world" o funciones actuales desplegadas a un
      proyecto real (pendiente, ver sección 3 antes de intentarlo)
- [ ] `config/ipAllowlist` creado en un proyecto real, no solo probado
      en el emulador
- [ ] Cada integrante completa su propio setup (sección 1) si decide
      tener su proyecto personal
