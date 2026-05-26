import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Phase7ErrorTestPage() {
  if (process.env.PLAYWRIGHT_PHASE7 !== "1") {
    notFound();
  }

  throw new Error("Phase 7 error boundary test");
}
