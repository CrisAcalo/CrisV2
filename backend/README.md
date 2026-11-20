# Portfolio Backend (RESTful API)

Backend para gestionar el portafolio personal. El dashboard utiliza sesiones revocables y la API pública sirve el contenido publicado y recibe mensajes de contacto.

## Stack Tecnológico 🛠️
- **Runtime:** Node.js (v20+)
- **Framework:** Express con TypeScript (`ts-node` / `tsc`)
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Validación de Datos:** Zod
- **Autenticación:** sesiones opacas revocables, bcrypt y TOTP para administración
- **Documentación de API:** Swagger (`swagger-ui-express`, `swagger-jsdoc`)

## Arquitectura (Clean Architecture) 🏗️
El proyecto sigue principios de separación de responsabilidades:
- **`domain/`**: Entidades core y contratos de repositorios (Interfaces). Cero acoplamiento a librerías externas.
- **`application/`**: Casos de uso (Use Cases) y DTOs, dictando la lógica de negocio orquestada.
- **`infrastructure/`**: Web (Controllers, Express Routes, Middlewares), la capa de base de datos (`PrismaRepositories`) y Servicios de terceros (LinkedIn API - en progreso).

## Iniciar el Proyecto Localmente 🚀

### 1. Requisitos Previos
Necesitas tener instalado:
- Node.js (v18+)
- Docker y Docker Compose (para levantar la base de datos PostgreSQL)

### 2. Variables de Entorno
Copie `.env.example` a `.env` en `/backend` y sustituya los marcadores por valores únicos. Docker Compose usa `LOCAL_DB_PASSWORD` y `LOCAL_PGADMIN_PASSWORD`; `DATABASE_URL` debe incluir la misma contraseña de PostgreSQL.

```env
# URL de conexión directa construida con lo configurado en docker-compose
DATABASE_URL="postgresql://cris:<LOCAL_DB_PASSWORD>@localhost:5432/crisv2?schema=public"

# Duración absoluta de la sesión del dashboard, en minutos (5 a 720).
AUTH_SESSION_TTL_MINUTES=30

# (Opcional) Tokens para integración con LinkedIn en el futuro
LINKEDIN_API_TOKEN="<TOKEN_OPCIONAL>"
```

### 3. Levantar Infraestructura e Instalar
```bash
# Levantar el contenedor PostgreSQL local en segundo plano (Requisito: estar en directorio raíz que contenga docker-compose.yml o si no levántalo aparte)
docker compose up -d --wait postgres

# Instalar dependencias del backend
npm install
```

### 4. Migraciones y Base de Datos (Muy Importante)
Antes de poder probar el API, necesitas que la base de datos obtenga su estructura de tablas y, opcionalmente, datos falsos de arranque:

```bash
# Sincroniza el schema de Prisma creando las tablas en PostgreSQL 
npx prisma migrate deploy

# Población de Data (Seeding)
npx prisma db seed
```
> **Importante:** El seed elimina el contenido local antes de cargar datos de ejemplo. Requiere `CONFIRM_DESTRUCTIVE_SEED=yes`, `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `.env`; se bloquea con `NODE_ENV=production` y para bases cuyo host no sea local. Nunca ejecute el seed contra Neon.

### 5. Ejecución del Servidor
```bash
# Modo desarrollo con auto-recarga (Nodemon)
npm run dev
```

La consola confirmará el arranque exitoso:
```text
✅ Conexión a la base de datos (PostgreSQL) establecida correctamente.
🚀 Servidor corriendo en http://localhost:4000
📑 Swagger UI disponible en http://localhost:4000/api-docs
```

## Explorar la API (Swagger) 📚

Una vez corriendo localmente, navega a tu navegador de preferencia:
➡️ **http://localhost:4000/api-docs**

Ahí verás la documentación estandarizada lista para interactuar. Puedes probar el logueo usando las credenciales del seed:
- Endpoint: `POST /api/auth/login`
- Use el correo y contraseña de `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` de su `.env` local.

Para pruebas locales de la API, el inicio de sesión devuelve un token opaco y su fecha de expiración. En Swagger, usa **Authorize** con ese token para probar rutas protegidas. `GET /api/auth/me` devuelve la identidad actual y `POST /api/auth/logout` revoca el token. El dashboard usa una cookie gestionada por el servidor de Next.js.

Para correr `npm run test:integration`, usa una base local aislada con las migraciones aplicadas. El comando requiere que `DATABASE_URL` apunte a loopback y que `CONFIRM_LOCAL_DB_TESTS=yes`. Las pruebas escriben registros temporales.

Para correr `npm run test:security`, apunta `SECURITY_TEST_DATABASE_URL` a una base local dedicada cuyo nombre termine en `_test` y aplica las migraciones antes de ejecutar la suite. Las pruebas simulan las llamadas a Resend y LinkedIn.

## Comandos Útiles 🔧
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia servidor de desarrollo con _nodemon_ y Hot-Reload. |
| `npm run build` | Transpila todo TypeScript hacia JavaScript puro alojándolo en la carpeta `/dist/`. |
| `npm run start` | Arranca el servidor listo para producción ejecutando los archivos dentro de `dist/`. |
| `npx prisma studio` | Abre una pestaña en tu UI con un manejador visual de tablas estilo DBeaver para ver la base de datos en crudo. |
| `npx prisma db seed` | Ejecuta el script de semilla localizado en `/prisma/seed.ts`. |

## Despliegue Render / Neon / Netlify

- En Render usa `backend` como directorio raíz y `npm run build` como comando de compilación. El build instala las dependencias del lockfile cuando se ejecuta en Render y regenera el cliente de Prisma antes de compilar TypeScript. Configura `DATABASE_URL` como secreto. `LINKEDIN_API_TOKEN` es opcional. Configura Resend para recibir avisos de contacto.
- En Netlify configura `NEXT_PUBLIC_API_URL` con la URL pública del backend en Render terminada en `/api`. Puedes usar `PORTFOLIO_API_URL` para definir la URL que usan las solicitudes desde el servidor de Next.js. La portada se genera durante el build y se revalida cada cinco minutos. Render debe responder durante el build. Si una revalidación posterior falla, Next.js conserva la última portada válida.
- `ALLOWED_ORIGINS` es una lista de orígenes exactos separados por comas, sin rutas ni comodines. Incluye los dominios reales del formulario público. `PUBLIC_SITE_ORIGIN` es el origen HTTPS canónico que usan los enlaces de los avisos de contacto.
- `TRUST_PROXY_HOPS` vale 0 en local y 1 en producción por defecto. Confirma el número de proxies de confianza antes de cambiarlo. Las solicitudes de login desde Netlify pueden compartir la IP de su proxy. El límite por cuenta se aplica por separado. Los límites de login residen en la memoria del proceso y se reinician con el servicio.
- La migración `20260927215953_sync_current_schema` conserva los valores antiguos de `Project.techStack` trasladándolos a `Skill` y `ProjectSkill`, y después elimina la columna. El backend anterior deja de ser compatible en cuanto se elimina esa columna: coordine la migración y el despliegue del backend en una misma ventana.
- Si alguna vez se ejecutó el seed antiguo en Neon, cambie la contraseña de `admin@portfolio.com` y revise las cuentas con rol `ADMIN`. El nuevo seed solo es para desarrollo local.
- Para rotar una contraseña administrativa, defina `ADMIN_EMAIL` y `ADMIN_NEW_PASSWORD` como variables privadas del proceso y ejecute `npm run admin:rotate-password` con `DATABASE_URL` apuntando a la base correspondiente. El comando no imprime la contraseña. No incluya esos valores en Git ni en un mensaje.
- La nueva autenticación reemplaza los JWT anteriores. Después de publicar backend y frontend, inicia sesión de nuevo. Puedes retirar `JWT_SECRET` y `JWT_EXPIRES_IN` después de completar el cambio.
- En Neon puede revisar las cuentas activas con `SELECT email FROM "User" WHERE role = 'ADMIN' AND "deletedAt" IS NULL;`. Investigue cualquier cuenta que no reconozca antes de desplegar la corrección.

### Sesiones y MFA para administradores

Las sesiones tienen una vigencia absoluta de 30 minutos por defecto. El backend guarda la huella del token y revoca la sesión al cerrar sesión. El cambio de correo, contraseña, rol o estado de la cuenta revoca todas sus sesiones.

1. Genera localmente una clave Base32 aleatoria de 32 caracteres por cuenta. Guárdala en un gestor de contraseñas. Esta orden muestra una clave nueva en tu terminal privada.

   ```bash
   node -e "console.log(Array.from(require('node:crypto').randomBytes(32), n => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[n & 31]).join(''))"
   ```

2. Añade cada cuenta manualmente a una app autenticadora con la opción basada en tiempo. Usa la clave que generaste, seis dígitos, intervalo de 30 segundos y algoritmo SHA-1. [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238.html)
3. Guarda `ADMIN_MFA_SECRETS` como secreto de Render. Su valor es un objeto JSON que asigna el correo de cada administrador a su clave. La forma es `{"admin@example.test":"CLAVE_BASE32_DE_32_CARACTERES"}`. Usa los valores reales solo en Render o en el `.env` local ignorado por Git.
4. Comprueba el inicio de sesión con código para cada cuenta. Activa `ADMIN_MFA_REQUIRED=true` después de comprobar todas las cuentas activas. La aplicación rechazará el inicio de sesión de cualquier administrador sin configurar. Guarda una copia de recuperación de cada clave en el gestor.

Para cambiar el autenticador, provisiona una clave nueva para esa cuenta y actualiza su entrada en Render. El servidor rechazará sus sesiones vigentes después del cambio.

### Avisos de contacto con Resend

1. [Verifique su dominio en Resend](https://resend.com/docs/dashboard/domains/introduction) con los registros DNS que indica el proveedor.
2. [Cree una clave con permiso de envío](https://resend.com/docs/dashboard/api-keys/introduction). Configure `RESEND_API_KEY` en el entorno del backend en Render y en el `.env` local si va a probar desde su equipo.
3. Configure `RESEND_FROM` con una dirección del dominio verificado, por ejemplo `contacto@crisacalo.com`, y `MAIL_TO` con el buzón que recibirá los avisos. Los avisos enlazan al dashboard y no incluyen el contenido ni los datos del remitente. Las antiguas variables `MAIL_USER` y `MAIL_PASS` se pueden retirar.
4. `CONTACT_EMAIL_DAILY_LIMIT` limita los intentos de aviso por día UTC. Su valor predeterminado es 80. Usa 0 para desactivar los avisos. Los mensajes recién recibidos siguen guardándose al llegar al límite.

El formulario guarda el mensaje antes de solicitar el aviso por HTTPS. La respuesta `201` incluye `notification` con el estado `accepted` si Resend aceptó el envío, `failed` si no pudo confirmarse o `disabled` si los avisos están desactivados, falta configuración o se agotó el cupo. Puede revisar los fallos del proveedor en Render buscando `[EmailService]`.

### Migración de Neon producción

1. Confirme en Neon que la cadena de conexión selecciona la rama de **producción** del proyecto `CrisV2`, no `TestChanges`. Mantenga la URL privada y fuera del repositorio. Compruebe con una consulta de solo lectura `SELECT current_database(), current_user;` y revise en Neon el nombre de la rama asociada al endpoint. El nombre de la base de datos por sí solo no identifica la rama.
2. Revise el historial con `npx prisma migrate status` desde `backend/`, con `DATABASE_URL` apuntando a producción. Esta versión requiere `20260927215953_sync_current_schema` y `20261119000000_add_project_showcase` si siguen pendientes, además de `20261119000050_add_revocable_auth_sessions` y `20261119000100_add_contact_email_budget`. Si falta `_prisma_migrations`, hay migraciones fallidas o el esquema de producción ya difiere, revise el estado antes de continuar. `migrate deploy` no detecta todos los cambios manuales del esquema.
3. Antes de modificar datos, cree en Neon un snapshot o una rama de respaldo desde producción y compruebe que contiene los registros esperados. `TestChanges` solo sirve como ensayo si fue creada a partir del estado actual de producción. Registre los conteos de `Project`, `Message` y `User`, además de los proyectos con valores en `techStack`.
4. Pause las ediciones del panel administrativo. Durante la ventana de despliegue, ejecute **una sola vez** `npx prisma migrate deploy` con la URL de producción, desde la versión del repositorio que contiene esta migración. En Render Free no hay comando pre-deploy; ejecute la migración de forma controlada antes de publicar el backend nuevo. No use `prisma db push`, `migrate dev`, `migrate reset` ni el seed en producción.
5. Despliegue el backend nuevo en Render y verifique `/api/health` y `/api/projects`. Confirme que los proyectos siguen publicados y que sus tecnologías aparecen en `skills`. Después despliegue el frontend en Netlify, con Render disponible durante el build. Revise la portada y el panel administrativo. Si la migración falla, detenga el despliegue: compruebe si hubo cambios parciales y evalúe restaurar el respaldo antes de repetir cualquier comando.

`20261119000000_add_project_showcase` es aditiva. Los proyectos actuales mantienen su publicación y quedan sin destacar hasta que seleccione uno desde **Proyectos** en el panel. Aplique esta migración antes de activar el nuevo backend y regenere Prisma Client con `npx prisma generate` durante el build. Al mover el destacado a la papelera o quitarle la publicación, la selección se libera.

Las migraciones de sesiones y presupuesto de correo son aditivas. Aplícalas antes de desplegar el backend nuevo. Coordina Render y Netlify en la misma ventana porque el dashboard anterior guarda JWT en el navegador y el nuevo usa la cookie de Next.js.
