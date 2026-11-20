# Pendientes de CrisV2

Esta lista distingue los controles implementados en el repositorio de las verificaciones y decisiones pendientes en los servicios de producción.

## Seguridad implementada

| Área | Control |
| --- | --- |
| Dependencias y CI | Lockfiles actualizados para resolver los avisos del auditor de npm. El workflow `security.yml` audita ambos proyectos, prueba la API con PostgreSQL aislado y verifica el flujo de sesión del gateway en un build de producción. |
| Sesión | El dashboard usa un gateway Next.js del mismo origen. Guarda la sesión en una cookie `HttpOnly` y `SameSite=Strict`, con `Secure` en producción. PostgreSQL guarda la huella del token opaco, registra el vencimiento y permite revocarlo al cerrar sesión o cambiar la cuenta. |
| Login | Límite por IP y cuenta, segundo factor TOTP opcional por administrador, y errores que omiten credenciales. Los JWT anteriores dejan de autenticar. |
| Peticiones privadas | El gateway permite las operaciones del dashboard y verifica origen y cabecera propia para escrituras. Las respuestas privadas llevan `no-store`. El formulario público usa un cliente aparte. |
| Visibilidad | Experiencia y Educación excluyen las tecnologías ocultas o eliminadas en sus respuestas públicas. Las escrituras del dashboard invalidan los datos públicos y las rutas afectadas de Next.js. |
| Exposición de la API | CORS con orígenes explícitos, documentación de la API restringida en producción, cabeceras defensivas y registros estructurados de accesos y escrituras administrativas. |
| Integraciones | Los avisos de contacto tienen un presupuesto diario persistido; el mensaje se guarda aunque no salga el aviso. Una respuesta válida vacía de LinkedIn conserva los registros importados. |

## Antes de publicar

1. **Rotar credenciales expuestas.** Revocar los valores que todavía estén vigentes de una prueba anterior, en particular la contraseña de aplicación de Gmail y el token de RapidAPI. Si se reutilizaron contraseñas de base de datos o de administrador en otro ambiente, rotarlas allí también. Guardar las nuevas credenciales en los paneles de los servicios o en archivos locales ignorados.
2. **Preparar Neon.** Verificar la rama y el historial, probar la restauración del respaldo y [aplicar las migraciones según la guía](../backend/README.md#despliegue-render--neon--netlify). Usar roles separados para migraciones y ejecución si resulta viable en el proyecto Neon. Probar primero en una rama aislada.
3. **Coordinar Render y Netlify.** Configurar `NEXT_PUBLIC_API_URL` con la API pública de Render. `PORTFOLIO_API_URL` puede indicar la misma dirección en el servidor de Netlify. Configurar `ALLOWED_ORIGINS` para los dominios reales del formulario. El dashboard usa `NEXT_PUBLIC_SITE_URL` como origen para las escrituras. Si se administra desde un alias o desde una vista previa, configurar `ADMIN_SITE_ORIGIN` con el origen HTTPS exacto de ese despliegue. Publicar el backend después de las migraciones y el frontend después del backend en la misma ventana: se pedirá iniciar sesión de nuevo.
4. **Comprobar la sesión en el dominio público.** Probar inicio y cierre de sesión, refresco del dashboard y acceso a rutas protegidas después del cierre. Verificar que la cookie tenga `Secure`, `HttpOnly`, `SameSite=Strict` y `Path=/`. El gateway descarta las cabeceras de IP que envía el navegador. Render puede contabilizar el límite de inicios de sesión por IP sobre la IP de salida de Netlify. El límite por cuenta sigue siendo aplicable. Verificar `TRUST_PROXY_HOPS` con la ruta real de tráfico antes de modificarlo.
5. **Activar MFA.** En Render, configurar `ADMIN_MFA_SECRETS` como mapa JSON privado de correo a secreto TOTP en Base32. Registrar cada secreto directamente en la aplicación de autenticación. Con `ADMIN_MFA_REQUIRED=false`, probar un acceso con el código de cada cuenta administrativa configurada. Después activar `ADMIN_MFA_REQUIRED=true`. Mantener acceso al panel de Render para recuperar una cuenta si se pierde su autenticador.
6. **Probar publicación y contacto.** Ocultar una tecnología y despublicar un proyecto desde el dashboard. Verificar la portada, la ficha y los endpoints públicos en una ventana privada. Enviar un único contacto de prueba con un destinatario controlado y comprobar el mensaje en la bandeja y el aviso en Resend. Confirmar que las rutas privadas llevan `no-store` y que la documentación de API queda fuera del despliegue público.

## Próximas mejoras

| Prioridad | Área | Qué falta |
| --- | --- | --- |
| Alta | Seguridad operativa | Centralizar los registros con una retención definida. Configurar alertas para errores de login, saturación de cupos y fallos de revalidación. Probar restauraciones de Neon de forma periódica. |
| Alta | LinkedIn | Mostrar la vista previa a partir de una sola consulta al proveedor. Reconciliar por ID externo para conservar las ediciones y la papelera. Validar el contrato y las cuotas en una rama de prueba. |
| Media | Privacidad y bandeja | Definir retención para mensajes y papelera. Consultar los totales y resúmenes con paginación; cargar el cuerpo solo al abrir cada mensaje. Añadir filtro de no leídos. |
| Media | Contacto | Añadir tiempo límite del cliente y una clave de idempotencia persistida para que reintentar tras una interrupción mantenga un solo mensaje y aviso. |
| Media | Cabeceras y despliegue | Reforzar la política de scripts CSP tras medir la compatibilidad con Next.js, el tema y la caché. Verificar las cabeceras efectivas en Netlify y las pruebas de navegador dentro de CI. |
| Media | Portafolio | Mostrar «Leer caso de estudio» si hay contenido editorial, recomendar otro proyecto al final de cada ficha y generar un sitemap de URLs publicadas. |
| Baja | Rendimiento | Medir el coste de los efectos en un móvil real. Si hay caídas de fluidez, reducir el trabajo por movimiento del puntero y pausar el fondo cuando no esté visible, conservando su aspecto. |
