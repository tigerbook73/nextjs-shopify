import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/lib/shopify/types";

export default function CollectionCard({ collection }: { collection: Collection }) {
  const { handle, title, description, image } = collection;

  return (
    <Link href={`/collections/${handle}`} className="group block">
      <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? title}
            width={800}
            height={450}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-base font-semibold text-gray-900 group-hover:underline">{title}</h3>
        {description && <p className="line-clamp-2 text-sm text-gray-600">{description}</p>}
      </div>
    </Link>
  );
}
