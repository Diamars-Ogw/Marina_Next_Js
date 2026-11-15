import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }).parse(await req.json());

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const supplied = Buffer.from(body.password);
    const expected = Buffer.from(adminPassword || "");
    const passwordMatches =
      !!adminPassword &&
      supplied.length === expected.length &&
      timingSafeEqual(supplied, expected);

    if (
      !adminEmail ||
      body.email.toLowerCase() !== adminEmail.toLowerCase() ||
      !passwordMatches
    ) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const token = await createSession(body.email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set("marina-admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
