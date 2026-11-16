export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-busy="true">
      <div className="h-4 w-64 animate-pulse rounded bg-lavender" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="aspect-[4/3] animate-pulse rounded-3xl bg-lavender/60" />
        <div className="h-96 animate-pulse rounded-3xl bg-white" />
      </div>
    </div>
  );
}
