import { NextResponse } from "next/server";

export function GET() {
  const keys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
  ];

  const status = Object.fromEntries(
    keys.map((k) => [k, Boolean(process.env[k])])
  );

  return NextResponse.json({
    cwd: process.cwd(),
    loaded: status,
  });
}


