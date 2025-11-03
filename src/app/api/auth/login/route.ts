import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/auth/hash";
import { generateToken } from "@/app/lib/auth/jwt";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          message: "Username and password are required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isValid = await verifyPassword(user.password, password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const payload = {
      userid: user.id,
    };

    // undefinedではないことを示す!マーク
    const secret = process.env.SECRET_KEY!;

    if (!secret) {
      console.error("SECRET_KEY is not set");
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }

    const token = generateToken(payload, secret, {
      expiresIn: "24h",
    });

    const res = NextResponse.json(
      { id: user.id, message: "Login successful" },
      { status: 200 }
    );

    res.headers.append(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      })
    );

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }
}
