import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stats = await prisma.stats.findUnique({
      where: { id: "global" },
    });

    const activeSecrets = await prisma.secret.count({
      where: { burned: false },
    });

    return NextResponse.json({
      created: stats?.created ?? 0,
      viewed: stats?.viewed ?? 0,
      expired: stats?.expired ?? 0,
      active: activeSecrets,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
