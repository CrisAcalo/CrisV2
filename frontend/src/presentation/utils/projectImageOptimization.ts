import { parseProjectImageHosts } from './projectImageHosts.cjs';

const allowedHosts = new Set(parseProjectImageHosts(process.env.NEXT_PUBLIC_PROJECT_IMAGE_HOSTS));

export function canOptimizeProjectImage(source: string) {
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && !url.port && !url.username && !url.password
      && allowedHosts.has(url.hostname);
  } catch {
    return false;
  }
}
