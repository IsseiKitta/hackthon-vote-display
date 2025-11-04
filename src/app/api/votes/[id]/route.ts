import { prisma } from "@/app/lib/prisma";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.SECRET_KEY;
    if (!secret) {
      console.error("SECRET_KEY is not set");
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }

    verifyToken(token, secret) as { userid: number };

    const { id } = await params;
    const voteId = parseInt(id);

    if (isNaN(voteId)) {
      return NextResponse.json(
        { message: "Invalid vote_id" },
        { status: 400 }
      );
    }

    const voteData = await prisma.project.findMany({
      where: { pollId: voteId },
      orderBy: { votes: "desc" },
    });

    return NextResponse.json({ voteData }, { status: 200 });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
