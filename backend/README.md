# Portfolio Backend (RESTful API)

Back-end desarrollado para gestionar dinámicamente el contenido de un portafolio web personal utilizando **Clean Architecture**. Expone endpoints completos (CRUD + Soft Delete) protegidos bajo Autenticación JWT para un Dashboard administrativo, y endpoints públicos de solo-lectura para ser consumidos por el Frontend (React/Next.js).

## Stack Tecnológico 🛠️
- **Runtime:** Node.js (v20+)
- **Framework:** Express con TypeScript (`ts-node` / `tsc`)
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Validación de Datos:** Zod
- **Autenticación:** JSON Web Tokens (JWT) & bcrypt
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
Renombra el archivo `.env.example` a `.env` (si existe) o crea uno con la siguiente estructura en la raíz de la carpeta `/backend`:

```env
# URL de conexión directa construida con lo configurado en docker-compose
DATABASE_URL="postgresql://postgres:password123@localhost:5432/crisv2?schema=public"

# Secreto para firmar tokens de sesión
JWT_SECRET="TuSecretoSuperSeguroYMuyLargo123!"

# (Opcional) Tokens para integración con LinkedIn en el futuro
LINKEDIN_ACCESS_TOKEN="tu-token-aqui"
```

### 3. Levantar Infraestructura e Instalar
```bash
# Levantar el contenedor PostgreSQL local en segundo plano (Requisito: estar en directorio raíz que contenga docker-compose.yml o si no levántalo aparte)
docker-compose up -d

# Instalar dependencias del backend
npm install
```

### 4. Migraciones y Base de Datos (Muy Importante)
Antes de poder probar el API, necesitas que la base de datos obtenga su estructura de tablas y, opcionalmente, datos falsos de arranque:

```bash
# Sincroniza el schema de Prisma creando las tablas en PostgreSQL 
npx prisma migrate dev --name init

# Población de Data (Seeding)
npx prisma db seed
```
> **Nota de Seguridad del Seed**: El script de seed *(_prisma/seed.ts_)* crea un usuario administrador por defecto con correo `admin@portfolio.com` y contraseña `admin123`. **Cámbialo si se lleva a producción**.

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
- Body: `{"email": "admin@portfolio.com", "password": "admin123"}`

Esto retornará un Token. En la parte superior de Swagger haz click en **"Authorize"** y pega tu token para probar rutas protegidas (Como crear Proyectos o borrarlos).

## Comandos Útiles 🔧
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia servidor de desarrollo con _nodemon_ y Hot-Reload. |
| `npm run build` | Transpila todo TypeScript hacia JavaScript puro alojándolo en la carpeta `/dist/`. |
| `npm run start` | Arranca el servidor listo para producción ejecutando los archivos dentro de `dist/`. |
| `npx prisma studio` | Abre una pestaña en tu UI con un manejador visual de tablas estilo DBeaver para ver la base de datos en crudo. |
| `npx prisma db seed` | Ejecuta el script de semilla localizado en `/prisma/seed.ts`. |
