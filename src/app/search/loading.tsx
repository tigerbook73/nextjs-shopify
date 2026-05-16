import SearchResultsSkeleton from '@/components/search/SearchResultsSkeleton'

export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search</h1>
      <div className="mb-8 h-9 w-full max-w-sm animate-pulse rounded-md bg-gray-200 sm:hidden" />
      <SearchResultsSkeleton />
    </main>
  )
}
