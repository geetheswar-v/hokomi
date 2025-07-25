import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const malId = searchParams.get("malId");

    if (!malId) {
      return NextResponse.json({ error: "Missing malId parameter" }, { status: 400 });
    }

    const malIdNumber = parseInt(malId);
    if (isNaN(malIdNumber)) {
      return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
    }

    // Get user entry
    const userEntry = await prisma.animeEntry.findUnique({
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
          type: "ANIME",
        },
      },
    });

    return NextResponse.json({
      userEntry,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error fetching anime entry:", error);
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

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { 
      malId, 
      action, 
      title, 
      imageUrl, 
      status, 
      episodesWatched,
      totalEpisodes,
      startDate,
      endDate
    } = body;

    if (!malId) {
      return NextResponse.json({ error: "Missing malId parameter" }, { status: 400 });
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

      const currentEpisodes = episodesWatched || 0;
      
      // Validate progress doesn't exceed total if total is set
      if (totalEpisodes && currentEpisodes > totalEpisodes) {
        return NextResponse.json({ 
          error: "Episodes watched cannot exceed total episodes" 
        }, { status: 400 });
      }

      // Get current entry to check previous state
      const currentEntry = await prisma.animeEntry.findUnique({
        where: {
          userId_malId: {
            userId: user.id,
            malId: malIdNumber,
          },
        },
      });

      // Determine the correct status based on triggers
      let finalStatus = status;
      
      // Status triggers
      if (currentEntry?.status === "PLAN_TO_WATCH" && currentEntry.episodesWatched === 0 && currentEpisodes > 0) {
        finalStatus = "WATCHING";
      } else if (finalStatus === "WATCHING" && totalEpisodes && currentEpisodes === totalEpisodes) {
        finalStatus = "COMPLETED";
      }

      // Set dates based on status
      let finalStartDate = startDate;
      let finalEndDate = endDate;

      if (finalStatus === "WATCHING" && !currentEntry?.startDate && !startDate) {
        finalStartDate = new Date().toISOString();
      } else if (finalStatus === "COMPLETED" && !endDate) {
        finalEndDate = new Date().toISOString();
      }

      const data = {
        title,
        imageUrl,
        status: finalStatus,
        episodesWatched: currentEpisodes,
        totalEpisodes,
        startDate: finalStartDate ? new Date(finalStartDate) : null,
        endDate: finalEndDate ? new Date(finalEndDate) : null,
      };

      const result = await prisma.animeEntry.upsert({
        where: {
          userId_malId: {
            userId: user.id,
            malId: malIdNumber,
          },
        },
        update: data,
        create: {
          userId: user.id,
          malId: malIdNumber,
          ...data,
        },
      });

      return NextResponse.json({ success: true, entry: result });
    } else if (action === "remove") {
      await prisma.animeEntry.delete({
        where: {
          userId_malId: {
            userId: user.id,
            malId: malIdNumber,
          },
        },
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error managing anime entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
