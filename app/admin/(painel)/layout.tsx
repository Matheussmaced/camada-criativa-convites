import { Suspense } from "react";
import { requireAdmin } from "@/app/lib/supabase/server";
import AdminNav, { NavShell } from "./AdminNav";

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-lavender" />
      <div className="h-64 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<NavShell pathname="" />}>
        <AdminNav />
      </Suspense>
      <div className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
          <Suspense fallback={<Loading />}>
            <Gate>{children}</Gate>
          </Suspense>
        </div>
      </div>
    </>
  );
}
