import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { connect } from 'node:net';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const backend = fileURLToPath(new URL('../backend/', import.meta.url));
const frontend = fileURLToPath(new URL('../frontend/', import.meta.url));
const host = '127.0.0.1';
const frontPort = 3005;
const siteUrl = `http://localhost:${frontPort}`;
const windows = process.platform === 'win32';
const children = new Set();
const shutdown = new AbortController();

function start(name, command, args, cwd, env = process.env) {
  const child = spawn(command, args, { cwd, env, stdio: 'inherit', detached: !windows });
  children.add(child);
  const done = new Promise((resolve) => {
    child.once('error', (error) => resolve({ error }));
    child.once('exit', (code) => resolve({ code }));
  }).then((result) => {
    children.delete(child);
    return result;
  });

  return { name, done };
}

async function stop(code) {
  if (shutdown.signal.aborted) return;
  shutdown.abort();
  process.exitCode = code;

  await Promise.all([...children].map(async (child) => {
    if (!child.pid) return;
    if (windows) {
      const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      const ended = await new Promise((resolve) => {
        killer.once('exit', (code) => resolve(code === 0));
        killer.once('error', () => resolve(false));
      });
      if (!ended) child.kill();
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    }
  }));
}

function portOpen(hostname, port) {
  return new Promise((resolve) => {
    const socket = connect({ host: hostname, port, timeout: 750 });
    const finish = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function startPostgres() {
  console.log('[dev] Iniciando PostgreSQL con Docker Compose…');
  const desktopDocker = process.env.LOCALAPPDATA && join(
    process.env.LOCALAPPDATA, 'Programs', 'DockerDesktop', 'resources', 'bin', 'docker.exe',
  );
  const args = ['compose', 'up', '-d', '--wait', '--wait-timeout', '60', 'postgres'];
  let result = await start('PostgreSQL', 'docker', args, backend).done;
  if (!shutdown.signal.aborted && result.error?.code === 'ENOENT'
      && windows && desktopDocker && existsSync(desktopDocker)) {
    result = await start('PostgreSQL', desktopDocker, args, backend).done;
  }
  if (result.error || result.code !== 0) {
    throw new Error('No se pudo iniciar PostgreSQL. Comprueba que Docker Desktop o Docker Compose estén disponibles.');
  }
}

async function waitForHealth(apiUrl) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline && !shutdown.signal.aborted) {
    const response = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(1000) }).catch(() => null);
    if (response?.ok) return;
    await delay(300);
  }
  if (!shutdown.signal.aborted) throw new Error(`La API no respondió en ${apiUrl}/health. Revisa los mensajes del backend.`);
}

async function main() {
  const nodemon = join(backend, 'node_modules', 'nodemon', 'bin', 'nodemon.js');
  const next = join(frontend, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (!existsSync(nodemon) || !existsSync(next)) {
    throw new Error('Instala las dependencias con npm ci --prefix backend y npm ci --prefix frontend.');
  }

  const envPath = join(backend, '.env');
  const localEnv = existsSync(envPath) ? parseEnv(readFileSync(envPath, 'utf8')) : {};
  const databaseUrl = process.env.DATABASE_URL ?? localEnv.DATABASE_URL;
  const database = URL.canParse(databaseUrl) ? new URL(databaseUrl) : null;
  const dbHost = database?.hostname.replace(/^\[|\]$/g, '');
  if (!database || !['postgresql:', 'postgres:'].includes(database.protocol)
      || !['localhost', host, '::1'].includes(dbHost) || database.searchParams.has('host')) {
    throw new Error('Configura DATABASE_URL para PostgreSQL local en backend/.env.');
  }

  const apiPort = Number(process.env.PORT ?? localEnv.PORT ?? 4000);
  if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535 || apiPort === frontPort) {
    throw new Error('Usa un PORT válido para el backend y reserva el 3005 para el frontend.');
  }

  const appPorts = [frontPort, apiPort];
  const usedPorts = await Promise.all(appPorts.map((port) => portOpen(host, port)));
  const occupied = appPorts.filter((_, index) => usedPorts[index]);
  if (occupied.length) throw new Error(`Puerto local ocupado: ${occupied.join(', ')}.`);

  const dbPort = Number(database.port || 5432);
  const dbRunning = await portOpen(dbHost, dbPort);
  if (shutdown.signal.aborted) return;
  if (!dbRunning) {
    if (dbPort !== 5432 || dbHost === '::1') {
      throw new Error('El PostgreSQL configurado en DATABASE_URL no está escuchando.');
    }
    await startPostgres();
  }
  if (shutdown.signal.aborted) return;

  const apiUrl = `http://${host}:${apiPort}/api`;
  const devEnv = { ...process.env, NODE_ENV: 'development' };
  const apiEnv = { ...devEnv, DATABASE_URL: databaseUrl, PORT: String(apiPort), CRISV2_DEV_HOST: host };
  const origins = process.env.ALLOWED_ORIGINS ?? localEnv.ALLOWED_ORIGINS;
  if (origins) apiEnv.ALLOWED_ORIGINS = `${origins},${siteUrl},http://${host}:${frontPort}`;

  function watchExit({ name, done }) {
    return done.then(({ code, error }) => {
      if (shutdown.signal.aborted) return;
      throw new Error(`${name} se detuvo (${error?.code ?? code ?? 'señal'}).`);
    });
  }

  const api = start('Backend', process.execPath, [
    '--require', 'ts-node/register', nodemon, '--watch', 'src', '--exec', 'node', 'src/index.ts',
  ], backend, apiEnv);
  const apiExit = watchExit(api);
  await Promise.race([apiExit, waitForHealth(apiUrl)]);
  if (shutdown.signal.aborted) return;

  console.log(`[dev] Frontend: ${siteUrl} | API: ${apiUrl}`);
  const web = start('Frontend', process.execPath, [
    next, 'dev', '--webpack', '--hostname', host, '--port', String(frontPort),
  ], frontend, {
    ...devEnv,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_API_URL: apiUrl,
    PORTFOLIO_API_URL: apiUrl,
    ADMIN_SITE_ORIGIN: '',
  });
  await Promise.race([apiExit, watchExit(web)]);
}

process.on('SIGINT', () => void stop(0));
process.on('SIGTERM', () => void stop(0));

try {
  await main();
} catch (error) {
  if (!shutdown.signal.aborted) {
    console.error(`[dev] ${error.message}`);
    await stop(1);
  }
}
