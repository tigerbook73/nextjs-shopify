import { getCollectionByHandle } from "@/lib/shopify/client";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  currentHandle: string;
  collectionHandle: string;
}

export default async function RelatedProducts({ currentHandle, collectionHandle }: Props) {
  const collection = await getCollectionByHandle(collectionHandle, 5);
  const related = collection?.products.nodes.filter((p) => p.handle !== currentHandle).slice(0, 4);

  if (!related || related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">You may also like</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
