const dnsHostname = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/** @param {string | undefined} value */
function parseProjectImageHosts(value) {
  return [...new Set((value ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host.length <= 253 && dnsHostname.test(host)))];
}

exports.parseProjectImageHosts = parseProjectImageHosts;
