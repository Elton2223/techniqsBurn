import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CLEANUP_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.secret.deleteMany({
      where: {
        OR: [
          { burned: true },
          { expiresAt: { lt: new Date() } },
        ],
      },
    });

    if (result.count > 0) {
      await prisma.stats.upsert({
        where: { id: "global" },
        update: { expired: { increment: result.count } },
        create: { id: "global", expired: result.count },
      });
    }

    return NextResponse.json({
      deleted: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
