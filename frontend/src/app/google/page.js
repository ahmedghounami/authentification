"use client";

import { useEffect } from "react";

export default function GoogleLoginPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      console.log("✅ Token stored:", token);
      window.location.href = "http://localhost:3000";
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Login with Google</h1>
      <a
        href="http://localhost:4000/login/google/callback"
        className="bg-blue-600 text-white mt-4 px-6 py-2 rounded hover:bg-blue-700"
      >
        Sign in with Google
      </a>
    </div>
  );
}