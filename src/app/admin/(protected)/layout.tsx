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
      <header className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold">Panel de administración</p>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-red-300 hover:text-red-600"
          >
            Cerrar sesión
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
