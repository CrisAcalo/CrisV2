# CrisV2
Versión 2 de portafolio personal/profesional

## Desarrollo local

Ejecuta desde la raíz con Node.js 22 o posterior:

```sh
npm run dev
```

También puedes ejecutar `node scripts/dev.mjs` directamente. El frontend usa Webpack en este modo de desarrollo.

- Portafolio en [localhost:3005](http://localhost:3005) y dashboard en [localhost:3005/admin](http://localhost:3005/admin).
- API en [localhost:4000/api/health](http://localhost:4000/api/health) por defecto. Usa `PORT` en `backend/.env` para elegir otro puerto para la API.
- El comando reutiliza PostgreSQL local o lo inicia con Docker Compose. `Ctrl+C` detiene los servidores de desarrollo y deja PostgreSQL disponible.

La primera vez, ejecuta `npm ci --prefix backend` y `npm ci --prefix frontend`. Configura `backend/.env` y aplica las migraciones a la base local siguiendo la [guía del backend](backend/README.md#iniciar-el-proyecto-localmente-). El arranque diario conserva los datos existentes.

- [Pendientes de seguridad, operación y producto](docs/pendientes.md)
- [Configuración y despliegue del backend](backend/README.md)
