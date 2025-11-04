import { prisma } from "@/app/lib/prisma";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth/jwt";
import jwt from "jsonwebtoken";

type Project = {
  teamName: string;
  projectName: string;
  description?: string;
  vote: number;
};

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { title, projects } = body;

    if (!title || !projects || !Array.isArray(projects)) {
      return NextResponse.json(
        { message: "Title and projects are required" },
        { status: 400 }
      );
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

    // 1つのPollと複数のProjectを同時に作成
    const newPoll = await prisma.poll.create({
      data: {
        title,
        createdBy: decoded.userid,
        projects: {
          create: projects.map((project: Project) => ({
            teamName: project.teamName,
            projectName: project.projectName,
            description: project.description || null,
            votes: project.vote,
          })),
        },
      },
    });

    return NextResponse.json(
      { message: "Vote created successfully", voteId: newPoll.id },
      { status: 201 }
    );
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
