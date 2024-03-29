import { limiter } from "@/lib/limiter";
import { prepare } from "@/lib/prepare";
import { DEFAULT_VALUES } from "@/lib/values";
import { create } from "domain";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

const ratelimit = limiter();

export async function PATCH(req: NextRequest) {
  const session = await getSession();

  const body = await req.json();

  const { allowed } = await ratelimit.check(30, "UPDATE_SNIPPET");

  if (!session || !session.user.id) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
      },
      {
        status: 403,
      }
    );
  }

  if (!allowed) {
    return NextResponse.json(
      {
        code: "TOO_MANY_REQUESTS",
      },
      {
        status: 429,
      }
    );
  }

  try {
    const updateSnippet = await prisma.snippet.update({
      where: {
        id: body.id,
        userId: session.user.id,
      },
      data: prepare(body),
    });

    return NextResponse.json(updateSnippet, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  const body = await req.json();

  const { allowed } = await ratelimit.check(30, "UPDATE_SNIPPET");

  if (!session || !session.user.id) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
      },
      {
        status: 403,
      }
    );
  }

  if (!allowed) {
    return NextResponse.json(
      {
        code: "TOO_MANY_REQUESTS",
      },
      {
        status: 429,
      }
    );
  }

  if (body.snippetCount >= 1) {
    return NextResponse.json(
      {
        code: "LIMIT_REACHED",
      },
      {
        status: 403,
      }
    );
  }
  try {
    const createdSnippet = await prisma.snippet.create({
      data: {
        userId: session.user.id,
        customColors: DEFAULT_VALUES.customColors,
        views: {
          create: {
            count: 0,
          },
        },
      },
      include: {
        views: true,
      },
    });
    return NextResponse.json(createdSnippet, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR ",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  const session = await getSession();

  if (!session || !sessionStorage.user.id) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 403 });
  }

  if (!id) {
    return NextResponse.json(
      {
        code: "SNIPPET_NOT_FOUND",
      },
      {
        status: 404,
      }
    );
  }
  try {
    const deletedSnippet = await prisma.snippet.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });
    return NextResponse.json(deletedSnippet, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR ",
      },
      {
        status: 500,
      }
    );
  }
}
