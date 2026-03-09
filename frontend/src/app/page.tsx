import { ThemeToggle } from '../presentation/components/common';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Acalo Portfolio - Frontend
      </h1>
      <p className="text-lg text-slate-500 dark:text-slate-400">
        Construyendo la arquitectura Limpia...
      </p>
    </main>
  );
}
