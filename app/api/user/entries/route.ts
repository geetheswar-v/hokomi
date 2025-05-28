import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const malId = searchParams.get("malId");
    const type = searchParams.get("type") as "anime" | "manga";

    if (!malId || !type || !["anime", "manga"].includes(type)) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const malIdNumber = parseInt(malId);
    if (isNaN(malIdNumber)) {
      return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
    }

    // Get user entry
    const userEntry = type === "anime" 
      ? await prisma.animeEntry.findUnique({
          where: {
            userId_malId: {
              userId: session.user.id,
              malId: malIdNumber,
            },
          },
        })
      : await prisma.mangaEntry.findUnique({
          where: {
            userId_malId: {
              userId: session.user.id,
              malId: malIdNumber,
            },
          },
        });

    // Get favorite status
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_malId_type: {
          userId: session.user.id,
          malId: malIdNumber,
          type: type.toUpperCase() as MediaType,
        },
      },
    });

    return NextResponse.json({
      userEntry,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
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

    const body = await request.json();
    const { 
      malId, 
      type, 
      action, 
      title, 
      imageUrl, 
      status, 
      progress, 
      score,
      totalEpisodes,
      totalChapters,
      totalVolumes 
    } = body;

    if (!malId || !type || !["anime", "manga"].includes(type)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (!action || !["add", "update", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const malIdNumber = parseInt(malId);
    if (isNaN(malIdNumber)) {
      return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
    }

    if (action === "add" || action === "update") {
      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }

      if (type === "anime") {
        const data = {
          title,
          imageUrl,
          status,
          progress: progress || 0,
          totalEpisodes,
          score,
        };

        const result = await prisma.animeEntry.upsert({
          where: {
            userId_malId: {
              userId: session.user.id,
              malId: malIdNumber,
            },
          },
          update: data,
          create: {
            userId: session.user.id,
            malId: malIdNumber,
            ...data,
          },
        });

        return NextResponse.json({ success: true, entry: result });
      } else {
        const data = {
          title,
          imageUrl,
          status,
          chaptersRead: progress || 0,
          totalChapters,
          totalVolumes,
          score,
        };

        const result = await prisma.mangaEntry.upsert({
          where: {
            userId_malId: {
              userId: session.user.id,
              malId: malIdNumber,
            },
          },
          update: data,
          create: {
            userId: session.user.id,
            malId: malIdNumber,
            ...data,
          },
        });

        return NextResponse.json({ success: true, entry: result });
      }
    } else if (action === "remove") {
      if (type === "anime") {
        await prisma.animeEntry.delete({
          where: {
            userId_malId: {
              userId: session.user.id,
              malId: malIdNumber,
            },
          },
        });
      } else {
        await prisma.mangaEntry.delete({
          where: {
            userId_malId: {
              userId: session.user.id,
              malId: malIdNumber,
            },
          },
        });
      }

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error managing user entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
