import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get both anime and manga entries for the user
    const [animeEntries, mangaEntries] = await Promise.all([
      prisma.animeEntry.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.mangaEntry.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      animeEntries,
      mangaEntries,
    });
  } catch (error) {
    console.error("Error fetching user entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
