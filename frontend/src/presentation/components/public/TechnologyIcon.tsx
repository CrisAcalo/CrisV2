import { Code2 } from 'lucide-react';
import {
  siAngular, siBootstrap, siBun, siCoursera, siCplusplus, siCredly, siCss, siCypress,
  siDart, siDeno, siDjango, siDocker, siDotnet, siExpo, siExpress, siFastify,
  siFigma, siFirebase, siFlask, siFlutter, siFramer, siGit, siGithub,
  siGo, siGoogle, siGooglecloud, siGraphql, siHtml5, siJavascript, siJest,
  siKubernetes, siLaravel, siLinuxfoundation, siLivewire, siMariadb, siMeta,
  siMongodb, siMysql, siN8n, siNeon, siNestjs, siNetlify, siNextdotjs, siNodedotjs,
  siNpm, siOpenjdk, siPhp, siPnpm, siPostgresql, siPostman, siPrisma, siPython,
  siRabbitmq, siReact, siRedis, siRender, siRust, siSass, siSpring,
  siSqlite, siSupabase, siTailwindcss, siThreedotjs, siTurborepo,
  siTypescript, siUdemy, siVercel, siVite, siVitest, siVuedotjs, siWebpack, siYarn,
  type SimpleIcon,
} from 'simple-icons';

// This is intentionally a display-only normalization. The database keeps the
// original spelling, while every public technology label uses this same map.
export const normalizeTechnologyName = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, '');

export const technologyCategories = [
  { id: 'frontend', label: 'Interfaz' },
  { id: 'backend', label: 'Servicios y lenguajes' },
  { id: 'data', label: 'Datos' },
  { id: 'delivery', label: 'Entrega e integración' },
  { id: 'other', label: 'Otras competencias' },
] as const;

export type TechnologyCategoryId = (typeof technologyCategories)[number]['id'];

const technologies: Record<TechnologyCategoryId, [SimpleIcon | null, string[]][]> = {
  frontend: [
    [siAngular, ['Angular']],
    [siBootstrap, ['Bootstrap']],
    [siCss, ['CSS', 'CSS3']],
    [siExpo, ['Expo']],
    [siFigma, ['Figma']],
    [siFlutter, ['Flutter']],
    [siFramer, ['Framer Motion', 'Framer', 'Motion']],
    [siHtml5, ['HTML', 'HTML5']],
    [siLivewire, ['Livewire', 'Laravel Livewire']],
    [siNextdotjs, ['Next', 'NextJS']],
    [siReact, ['React', 'ReactJS', 'React Native']],
    [siSass, ['Sass', 'SCSS']],
    [siTailwindcss, ['Tailwind CSS', 'Tailwind']],
    [siThreedotjs, ['Three.js', 'Three']],
    [siVuedotjs, ['Vue', 'VueJS']],
  ],
  backend: [
    [siBun, ['Bun']],
    [siCplusplus, ['C++', 'C plus plus']],
    [siDart, ['Dart']],
    [siDeno, ['Deno']],
    [siDjango, ['Django']],
    [siDotnet, ['C#', 'C Sharp', '.NET', '.NET Core', '.NET Framework']],
    [siExpress, ['Express', 'ExpressJS']],
    [siFastify, ['Fastify']],
    [siFlask, ['Flask']],
    [siGo, ['Go', 'Golang']],
    [siJavascript, ['JavaScript', 'JS']],
    [siLaravel, ['Laravel']],
    [siNestjs, ['NestJS', 'Nest']],
    [siNodedotjs, ['Node', 'NodeJS']],
    [siOpenjdk, ['Java', 'Java SE', 'OpenJDK']],
    [siPhp, ['PHP']],
    [siPython, ['Python', 'Python3']],
    [siRust, ['Rust']],
    [siSpring, ['Spring', 'Spring Boot']],
    [siTypescript, ['TypeScript', 'TS']],
  ],
  data: [
    [siFirebase, ['Firebase']],
    [siMariadb, ['MariaDB']],
    [siMongodb, ['MongoDB', 'Mongo']],
    [siMysql, ['MySQL']],
    [siNeon, ['Neon', 'NeonDB']],
    [siPostgresql, ['PostgreSQL', 'Postgres', 'PSQL']],
    [siPrisma, ['Prisma', 'Prisma ORM']],
    [siRedis, ['Redis']],
    [siSqlite, ['SQLite']],
    [siSupabase, ['Supabase']],
    [null, ['SQL', 'Structured Query Language']],
  ],
  delivery: [
    [siCypress, ['Cypress']],
    [siDocker, ['Docker']],
    [siGit, ['Git']],
    [siGithub, ['GitHub']],
    [siGooglecloud, ['Google Cloud', 'GCP']],
    [siGraphql, ['GraphQL']],
    [siJest, ['Jest']],
    [siKubernetes, ['Kubernetes', 'K8s']],
    [siN8n, ['n8n']],
    [siNetlify, ['Netlify']],
    [siNpm, ['npm']],
    [siPnpm, ['pnpm']],
    [siPostman, ['Postman']],
    [siRabbitmq, ['RabbitMQ']],
    [siRender, ['Render']],
    [siTurborepo, ['Turborepo']],
    [siVercel, ['Vercel']],
    [siVite, ['Vite']],
    [siVitest, ['Vitest']],
    [siWebpack, ['Webpack']],
    [siYarn, ['Yarn']],
    [null, ['SOAP', 'Simple Object Access Protocol']],
  ],
  other: [
    [siCoursera, ['Coursera']],
    [siCredly, ['Credly']],
    [siGoogle, ['Google']],
    [siLinuxfoundation, ['Linux Foundation']],
    [siMeta, ['Meta']],
    [siUdemy, ['Udemy']],
  ],
};

const technologyByName = new Map<string, { icon: SimpleIcon | null; category: TechnologyCategoryId }>();
for (const { id: category } of technologyCategories) {
  for (const [icon, aliases] of technologies[category]) {
    const technology = { icon, category };
    for (const alias of aliases) technologyByName.set(normalizeTechnologyName(alias), technology);
  }
}

export const resolveTechnologyIcon = (name: string): SimpleIcon | null =>
  technologyByName.get(normalizeTechnologyName(name))?.icon ?? null;

export const resolveTechnologyCategory = (name: string): TechnologyCategoryId =>
  technologyByName.get(normalizeTechnologyName(name))?.category ?? 'other';

// Certificate titles contain additional words, so match whole words or phrases.
// Longer phrases win (for example, "Google Cloud" before "Google").
export const resolveTechnologyIconInText = (text: string): SimpleIcon | null => {
  const words = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter(Boolean);

  for (let length = Math.min(words.length, 4); length > 0; length--) {
    for (let start = 0; start <= words.length - length; start++) {
      const icon = resolveTechnologyIcon(words.slice(start, start + length).join(''));
      if (icon) return icon;
    }
  }
  return null;
};

interface TechnologyIconProps {
  name: string;
  context?: string;
  matchWithinText?: boolean;
  size?: number;
  className?: string;
}

export const TechnologyIcon = ({ name, context, matchWithinText = false, size = 20, className }: TechnologyIconProps) => {
  const icon = matchWithinText
    ? resolveTechnologyIconInText(name) ?? (context ? resolveTechnologyIconInText(context) : null)
    : resolveTechnologyIcon(name);

  if (!icon) {
    return <Code2 aria-hidden="true" size={size} strokeWidth={2} className={className} />;
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
};
