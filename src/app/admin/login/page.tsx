import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión — Administración",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Zona Tenis de Mesa</p>
        <h1 className="mt-2 text-lg font-bold text-ink">Panel de administración</h1>
        <p className="mt-1 text-sm text-ink-low">Introduce la contraseña de administrador.</p>

        {error && (
          <p role="alert" className="mt-3 rounded-md border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
            Contraseña incorrecta.
          </p>
        )}

        <form action="/api/admin/login" method="POST" className="mt-5 space-y-3">
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <div>
            <label htmlFor="password" className="spec-label mb-1.5 block">
              Contraseña
            </label>
            <div className="well flex items-center">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                className="well-input rounded-[10px]"
              />
            </div>
          </div>
          <button type="submit" className="ctl ctl-primary w-full rounded-lg px-4 py-2 text-sm">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
