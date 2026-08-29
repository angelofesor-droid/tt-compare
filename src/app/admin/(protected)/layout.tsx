import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

/**
 * Layout de las rutas protegidas del admin.
 * Verifica la cookie firmada en Node runtime (node:crypto disponible aquí).
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!verifyToken(token)) {
    redirect("/admin/login");
  }

  return (
    <div>
      <header className="panel mb-6 flex items-center justify-between px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Panel de administración</p>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="ctl ctl-ghost rounded-lg px-3 py-1.5 text-xs">
            Cerrar sesión
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
