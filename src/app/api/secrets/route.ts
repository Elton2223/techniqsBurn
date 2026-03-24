import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_SECRET_LENGTH, EXPIRY_OPTIONS, CUSTOM_EXPIRY_LIMITS, VIEW_OPTIONS } from "@/lib/constants";

function isValidExpiryMs(ms: number): boolean {
  const presetValues = EXPIRY_OPTIONS.map((o) => o.value).filter((v) => v > 0);
  if (presetValues.includes(ms as typeof presetValues[number])) return true;
  return ms >= CUSTOM_EXPIRY_LIMITS.minMs && ms <= CUSTOM_EXPIRY_LIMITS.maxMs;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptedData, iv, expiresIn, maxViews, passphraseHash } = body;

    if (!encryptedData || typeof encryptedData !== "string") {
      return NextResponse.json(
        { error: "encryptedData is required" },
        { status: 400 }
      );
    }

    if (!iv || typeof iv !== "string") {
      return NextResponse.json(
        { error: "iv is required" },
        { status: 400 }
      );
    }

    if (encryptedData.length > MAX_SECRET_LENGTH * 2) {
      return NextResponse.json(
        { error: "Secret is too large" },
        { status: 400 }
      );
    }

    if (expiresIn && !isValidExpiryMs(expiresIn)) {
      return NextResponse.json(
        { error: "Invalid expiry value" },
        { status: 400 }
      );
    }

    const validViews = VIEW_OPTIONS.map((o) => o.value);
    const viewCount = maxViews && validViews.includes(maxViews) ? maxViews : 1;

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const secret = await prisma.secret.create({
      data: {
        encryptedData,
        iv,
        passphraseHash: passphraseHash || null,
        maxViews: viewCount,
        expiresAt,
      },
    });

    await prisma.stats.upsert({
      where: { id: "global" },
      update: { created: { increment: 1 } },
      create: { id: "global", created: 1 },
    });

    return NextResponse.json({ id: secret.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create secret", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `Failed to create secret: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            : "Failed to create secret",
      },
      { status: 500 }
    );
  }
}
