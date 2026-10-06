import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const admin = await requirePermission("VIEW_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const items = [
    {
      id: "document-number-extractor",
      name: "Document Number Extractor",
      description:
        "Upload a text-based document and extract, validate, clean and download comma-separated phone numbers entirely in the user's browser. Nothing is uploaded or stored.",
      path: "/eternitycrmadmin/tools/document-number-extractor",
    },
  ];

  return NextResponse.json({ items });
}
