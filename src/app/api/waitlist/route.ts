import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // TODO: persist the email to your database or mailing list provider.
    console.log("New waitlist signup:", email);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}