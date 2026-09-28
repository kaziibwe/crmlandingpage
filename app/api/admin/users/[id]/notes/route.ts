import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/lib/models/Registration";
import { requirePermission } from "@/lib/auth";

/**
 * POST /api/admin/users/[id]/notes — add an administrative note (EDIT_USERS).
 * Body: { body: string }
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("EDIT_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const raw = await req.json().catch(() => null);
    const text = String(raw?.body ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Note text is required." }, { status: 400 });
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: "Note is too long (max 4000 characters)." }, { status: 400 });
    }

    const user = await Registration.findById(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    user.notes.push({
      body: text,
      createdBy: admin.email,
      createdAt: new Date(),
    });
    await user.save();

    return NextResponse.json({ ok: true, notes: user.notes }, { status: 201 });
  } catch (err) {
    console.error("[admin/users/[id]/notes POST]", err);
    return NextResponse.json({ error: "Failed to add note." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id]/notes?noteId=... — remove a note (EDIT_USERS).
 * An admin can only delete their own notes; MANAGE_ADMINS holders can remove any.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = await requirePermission("EDIT_USERS");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const noteId = new URL(req.url).searchParams.get("noteId") ?? "";
    if (!noteId) {
      return NextResponse.json({ error: "noteId is required." }, { status: 400 });
    }

    const user = await Registration.findById(params.id);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const note = user.notes.id(noteId);
    if (!note) return NextResponse.json({ error: "Note not found." }, { status: 404 });

    if (note.createdBy !== admin.email && !admin.permissions.includes("MANAGE_ADMINS")) {
      return NextResponse.json({ error: "You can only delete your own notes." }, { status: 403 });
    }

    user.notes.pull({ _id: noteId });
    await user.save();

    return NextResponse.json({ ok: true, notes: user.notes });
  } catch (err) {
    console.error("[admin/users/[id]/notes DELETE]", err);
    return NextResponse.json({ error: "Failed to delete note." }, { status: 500 });
  }
}
