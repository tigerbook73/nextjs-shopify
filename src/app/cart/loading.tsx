export default function CartLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="h-20 w-20 animate-pulse rounded-md bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </main>
  );
}
