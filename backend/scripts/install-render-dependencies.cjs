const { spawnSync } = require('node:child_process');

if (process.env.RENDER === 'true') {
    const install = spawnSync(process.execPath, [process.env.npm_execpath, 'ci', '--include=dev'], { stdio: 'inherit' });
    if (install.error) throw install.error;
    process.exitCode = install.status ?? 1;
}
