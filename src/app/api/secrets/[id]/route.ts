import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function HEAD(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const secret = await prisma.secret.findUnique({
      where: { id },
      select: { passphraseHash: true, burned: true, expiresAt: true },
    });

    if (!secret || secret.burned) {
      return new NextResponse(null, { status: 404 });
    }

    if (secret.expiresAt && secret.expiresAt < new Date()) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "x-passphrase-required": secret.passphraseHash ? "true" : "false",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret || secret.burned) {
      return NextResponse.json(
        { error: "Secret not found or has been burned" },
        { status: 404 }
      );
    }

    if (secret.expiresAt && secret.expiresAt < new Date()) {
      await prisma.secret.delete({ where: { id } });
      return NextResponse.json(
        { error: "Secret has expired" },
        { status: 404 }
      );
    }

    if (secret.currentViews >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } });
      return NextResponse.json(
        { error: "Secret has reached its view limit" },
        { status: 404 }
      );
    }

    if (secret.passphraseHash) {
      const providedHash = request.headers.get("x-passphrase-hash");
      if (!providedHash || providedHash !== secret.passphraseHash) {
        return NextResponse.json(
          { error: "Invalid passphrase" },
          { status: 403 }
        );
      }
    }

    const newViewCount = secret.currentViews + 1;

    if (newViewCount >= secret.maxViews) {
      await prisma.secret.delete({ where: { id } });
    } else {
      await prisma.secret.update({
        where: { id },
        data: { currentViews: newViewCount },
      });
    }

    await prisma.stats.upsert({
      where: { id: "global" },
      update: { viewed: { increment: 1 } },
      create: { id: "global", viewed: 1 },
    });

    return NextResponse.json({
      encryptedData: secret.encryptedData,
      iv: secret.iv,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve secret" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const secret = await prisma.secret.findUnique({ where: { id } });

    if (!secret) {
      return NextResponse.json(
        { error: "Secret not found" },
        { status: 404 }
      );
    }

    await prisma.secret.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to burn secret" },
      { status: 500 }
    );
  }
}
