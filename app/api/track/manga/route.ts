import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { JikanAPI } from "@/lib/jikan";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.mangaEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching manga entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { malId, status } = await request.json();

    if (!malId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch manga data from Jikan API
    const mangaData = await JikanAPI.getManga(malId);

    const entry = await prisma.mangaEntry.upsert({
      where: {
        userId_malId: {
          userId: session.user.id,
          malId: malId,
        },
      },
      update: {
        status: status,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        malId: malId,
        title: mangaData.data.title,
        imageUrl:
          mangaData.data.images.webp.large_image_url ||
          mangaData.data.images.jpg.large_image_url,
        status: status,
        totalChapters: mangaData.data.chapters,
        totalVolumes: mangaData.data.volumes,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating/updating manga entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
