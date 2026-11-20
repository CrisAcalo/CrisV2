const dnsHostname = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function parseProjectImageHosts(value: string | undefined) {
  return [...new Set((value ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host.length <= 253 && dnsHostname.test(host)))];
}

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
