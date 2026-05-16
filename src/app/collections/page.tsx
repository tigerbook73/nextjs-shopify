import type { Metadata } from "next";
import { getCollections } from "@/lib/shopify/client";
import CollectionCard from "@/components/collection/CollectionCard";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse all product collections.",
};

export default async function CollectionsPage() {
  const collections = await getCollections(20);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Collections</h1>
      {collections.length === 0 ? (
        <p className="text-gray-500">No collections found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </main>
  );
}
