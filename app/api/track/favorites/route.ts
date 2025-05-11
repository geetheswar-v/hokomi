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

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
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

    const { malId, type } = await request.json();

    if (!malId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_malId_type: {
          userId: session.user.id,
          malId: malId,
          type: type,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          userId_malId_type: {
            userId: session.user.id,
            malId: malId,
            type: type,
          },
        },
      });
      return NextResponse.json({ success: true, action: "removed" });
    } else {
      // Add to favorites
      let title = "";
      let imageUrl = "";

      try {
        if (type === "ANIME") {
          const data = await JikanAPI.getAnime(malId);
          title = data.data.title;
          imageUrl =
            data.data.images.webp.large_image_url ||
            data.data.images.jpg.large_image_url;
        } else if (type === "MANGA") {
          const data = await JikanAPI.getManga(malId);
          title = data.data.title;
          imageUrl =
            data.data.images.webp.large_image_url ||
            data.data.images.jpg.large_image_url;
        }
      } catch (error) {
        console.error("Error fetching media data:", error);
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId: session.user.id,
          malId: malId,
          type: type,
          title: title,
          imageUrl: imageUrl,
        },
      });

      return NextResponse.json({ success: true, action: "added", favorite });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
