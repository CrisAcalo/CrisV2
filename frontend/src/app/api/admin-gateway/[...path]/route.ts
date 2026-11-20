import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ path: string[] }> };
type Command = 'login' | 'session' | 'logout' | 'admin';
const resources = new Set(['projects', 'experiences', 'educations', 'certificates', 'skills', 'messages']);
const publicResources = new Set(['projects', 'experiences', 'educations', 'certificates', 'skills']);
const syncResources = new Set(['experiences', 'educations', 'certificates']);
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const bearer = /^[A-Za-z0-9_-]{43,128}$/;
const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
const maxBodyBytes = 16 * 1024;
const secure = process.env.NODE_ENV === 'production';
const cookieName = secure ? '__Host-portfolio-session' : 'portfolio-session';
const cookieOptions = { httpOnly: true, secure, sameSite: 'strict' as const, path: '/' };
const noStore = { 'Cache-Control': 'private, no-store' };

function matchCommand(path: string[], method: string): Command | null {
  const [resource, id, action, target] = path;
  if (resource === 'auth' && path.length === 2) {
    if (id === 'login' && method === 'POST') return 'login';
    if (id === 'me' && method === 'GET') return 'session';
    if (id === 'logout' && method === 'POST') return 'logout';
    return null;
  }

  if (resource === 'admin') {
    if (path.length === 2 && id === 'settings' && (method === 'GET' || method === 'PATCH')) return 'admin';
    if (path.length === 4 && id === 'linkedin' && action === 'sync' && syncResources.has(target) && method === 'POST') return 'admin';
    return null;
  }

  if (!resources.has(resource)) return null;
  if (path.length === 1) {
    return method === 'GET' || (method === 'POST' && resource !== 'messages') ? 'admin' : null;
  }
  if (!uuid.test(id ?? '')) return null;
  if (path.length === 2) return ['GET', 'PATCH', 'DELETE'].includes(method) ? 'admin' : null;
  if (path.length === 3 && method === 'PATCH') {
    if (action === 'restore' || action === 'soft-delete' || (resource === 'skills' && action === 'relations')) return 'admin';
  }
  return null;
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ status: 'error', message }, { status, headers: noStore });
}

function upstreamUrl(path: string[], request: NextRequest) {
  const source = process.env.PORTFOLIO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const url = new URL(source);
  if (!isTrustedProtocol(url) || url.username || url.password || url.search || url.hash) {
    throw new Error('Invalid API origin');
  }
  url.pathname = url.pathname.replace(/\/+$/, '') + '/' + path.map(encodeURIComponent).join('/');
  if (request.nextUrl.searchParams.get('deleted') === 'true') url.searchParams.set('deleted', 'true');
  return url;
}

function isTrustedProtocol(url: URL) {
  return url.protocol === 'https:' || (url.protocol === 'http:' && loopback.has(url.hostname));
}

function isTrustedOrigin(request: NextRequest) {
  if (request.headers.get('x-portfolio-request') !== '1') return false;
  try {
    const supplied = request.headers.get('origin');
    if (!supplied) return false;
    const origin = new URL(supplied);
    if (origin.origin !== supplied || !isTrustedProtocol(origin)) return false;

    const configured = process.env.ADMIN_SITE_ORIGIN
      || (secure ? process.env.NEXT_PUBLIC_SITE_URL || 'https://crisacalo.com' : undefined);
    if (configured) {
      const expected = new URL(configured);
      return isTrustedProtocol(expected) && supplied === expected.origin;
    }

    if (supplied === request.nextUrl.origin) return true;
    return loopback.has(origin.hostname) && loopback.has(request.nextUrl.hostname)
      && origin.protocol === request.nextUrl.protocol && origin.port === request.nextUrl.port;
  } catch {
    return false;
  }
}

async function readBody(request: NextRequest): Promise<string | NextResponse | undefined> {
  if (request.method === 'GET' || !request.body) return undefined;
  const type = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let body = '';
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return size ? body + decoder.decode() : undefined;
      if (!value.byteLength) continue;
      if (size === 0 && type !== 'application/json') {
        await reader.cancel();
        return errorResponse(415, 'Se requiere un cuerpo JSON.');
      }
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        return errorResponse(413, 'La solicitud es demasiado grande.');
      }
      body += decoder.decode(value, { stream: true });
    }
  } catch {
    return errorResponse(400, 'No se pudo leer la solicitud.');
  } finally {
    reader.releaseLock();
  }
}

function clearCookie(response: NextResponse) {
  response.cookies.set(cookieName, '', { ...cookieOptions, maxAge: 0 });
  return response;
}

function userFrom(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const { id, email, role } = value as Record<string, unknown>;
  if (typeof id !== 'string' || typeof email !== 'string' || (role !== 'ADMIN' && role !== 'BASIC')) return null;
  return { id, email, role };
}

async function reply(upstream: Response, command: Command) {
  if (command === 'logout' && (upstream.ok || upstream.status === 401)) {
    return clearCookie(new NextResponse(null, { status: 204, headers: noStore }));
  }
  if (command !== 'login' && upstream.status === 401) {
    return clearCookie(errorResponse(401, 'La sesión expiró.'));
  }
  if (upstream.status === 204) return new NextResponse(null, { status: 204, headers: noStore });
  if (!upstream.headers.get('content-type')?.includes('application/json')) {
    return errorResponse(502, 'El servidor no respondió correctamente.');
  }

  if ((command === 'login' || command === 'session') && upstream.ok) {
    const { data } = await upstream.json();
    if (command === 'session') {
      const user = userFrom(data);
      return user
        ? NextResponse.json({ status: 'success', data: user }, { headers: noStore })
        : errorResponse(502, 'Respuesta de sesión inválida.');
    }

    const user = userFrom(data?.user);
    const token = data?.token;
    const expiresAt = typeof data?.expiresAt === 'string' ? new Date(data.expiresAt) : null;
    if (!user || typeof token !== 'string' || !bearer.test(token) || !expiresAt || !(expiresAt.getTime() > Date.now())) {
      return errorResponse(502, 'Respuesta de sesión inválida.');
    }
    if (user.role !== 'ADMIN') {
      try {
        await fetch(new URL('./logout', upstream.url), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          redirect: 'error',
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        });
      } catch {
        // The credential stays on the server and expires even if revocation could not be confirmed.
      }
      return errorResponse(403, 'Esta sección requiere una cuenta de administrador.');
    }
    const response = NextResponse.json({ status: 'success', data: user }, { headers: noStore });
    response.cookies.set(cookieName, token, { ...cookieOptions, expires: expiresAt });
    return response;
  }

  const headers = new Headers(noStore);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  const retryAfter = upstream.headers.get('retry-after');
  if (retryAfter) headers.set('Retry-After', retryAfter);
  return new NextResponse(upstream.body, { status: upstream.status, headers });
}

async function proxy(request: NextRequest, { params }: Context) {
  const { path } = await params;
  const command = matchCommand(path, request.method);
  if (!command) return errorResponse(404, 'Acción no disponible.');

  const isWrite = request.method !== 'GET';
  if (isWrite && !isTrustedOrigin(request)) {
    return errorResponse(403, 'Origen de solicitud no autorizado.');
  }
  const token = request.cookies.get(cookieName)?.value;
  if (command !== 'login' && (!token || !bearer.test(token))) {
    return command === 'logout'
      ? clearCookie(new NextResponse(null, { status: 204, headers: noStore }))
      : clearCookie(errorResponse(401, 'Inicia sesión para continuar.'));
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) return body;
  const headers = new Headers({ Accept: 'application/json' });
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (command !== 'login' && token) headers.set('Authorization', `Bearer ${token}`);

  try {
    const upstream = await fetch(upstreamUrl(path, request), {
      method: request.method,
      headers,
      body,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(60_000),
    });
    const response = await reply(upstream, command);
    if (response.ok && isWrite && (publicResources.has(path[0]) || path[1] === 'linkedin')) {
      try {
        revalidateTag('portfolio-public', { expire: 0 });
        revalidatePath('/');
        revalidatePath('/proyectos/[id]', 'page');
      } catch {
        console.warn('[portfolio] Public cache invalidation failed');
      }
    }
    return response;
  } catch {
    return errorResponse(503, 'El servicio administrativo no está disponible. Intenta de nuevo.');
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
