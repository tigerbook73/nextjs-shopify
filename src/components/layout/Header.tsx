import Link from 'next/link'
import SearchBox from '@/components/search/SearchBox'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-gray-900 hover:text-gray-700">
          Shoptify
        </Link>

        <nav className="hidden gap-6 sm:flex">
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link href="/collections" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Collections
          </Link>
        </nav>

        <SearchBox />
      </div>
    </header>
  )
}
