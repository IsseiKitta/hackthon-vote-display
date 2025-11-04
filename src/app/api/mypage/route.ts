import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // parseでJavaScriptオブジェクトに変換
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

    const decoded = verifyToken(token, secret) as { userid: number };

    const polls = await prisma.poll.findMany({
      where: { createdBy: decoded.userid },
    });

    return NextResponse.json({ polls }, { status: 200 });
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
