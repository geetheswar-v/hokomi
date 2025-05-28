import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { malId, type, action, title, imageUrl } = body;

    if (!malId || !type || !["anime", "manga"].includes(type)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (!action || !["add", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const malIdNumber = parseInt(malId);
    if (isNaN(malIdNumber)) {
      return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
    }

    const mediaType = type.toUpperCase() as MediaType;

    if (action === "add") {
      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }

      const favorite = await prisma.favorite.upsert({
        where: {
          userId_malId_type: {
            userId: session.user.id,
            malId: malIdNumber,
            type: mediaType,
          },
        },
        update: {
          title,
          imageUrl,
        },
        create: {
          userId: session.user.id,
          malId: malIdNumber,
          type: mediaType,
          title,
          imageUrl,
        },
      });

      return NextResponse.json({ success: true, favorite });
    } else if (action === "remove") {
      await prisma.favorite.delete({
        where: {
          userId_malId_type: {
            userId: session.user.id,
            malId: malIdNumber,
            type: mediaType,
          },
        },
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error managing favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
