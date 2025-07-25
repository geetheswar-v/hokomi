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
    const userEntry = await prisma.mangaEntry.findUnique({
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
          type: "MANGA",
        },
      },
    });

    return NextResponse.json({
      userEntry,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error fetching manga entry:", error);
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
      chaptersRead,
      totalChapters,
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

      const currentChapters = chaptersRead || 0;
      
      // Validate progress doesn't exceed total if total is set
      if (totalChapters && currentChapters > totalChapters) {
        return NextResponse.json({ 
          error: "Chapters read cannot exceed total chapters" 
        }, { status: 400 });
      }

      // Get current entry to check previous state
      const currentEntry = await prisma.mangaEntry.findUnique({
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
      if (currentEntry?.status === "PLAN_TO_READ" && currentEntry.chaptersRead === 0 && currentChapters > 0) {
        finalStatus = "READING";
      } else if (finalStatus === "READING" && totalChapters && currentChapters === totalChapters) {
        finalStatus = "COMPLETED";
      }

      // Set dates based on status
      let finalStartDate = startDate;
      let finalEndDate = endDate;

      if (finalStatus === "READING" && !currentEntry?.startDate && !startDate) {
        finalStartDate = new Date().toISOString();
      } else if (finalStatus === "COMPLETED" && !endDate) {
        finalEndDate = new Date().toISOString();
      }

      const data = {
        title,
        imageUrl,
        status: finalStatus,
        chaptersRead: currentChapters,
        totalChapters,
        startDate: finalStartDate ? new Date(finalStartDate) : null,
        endDate: finalEndDate ? new Date(finalEndDate) : null,
      };

      const result = await prisma.mangaEntry.upsert({
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
      await prisma.mangaEntry.delete({
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
    console.error("Error managing manga entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
