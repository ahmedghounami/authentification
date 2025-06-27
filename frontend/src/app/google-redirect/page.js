"use client";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function GoogleRedirect() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      Cookies.set("token", token, {
        expires: 1,
        secure: false, // Use true in production
        sameSite: "lax",
      });

      router.push("/dashboard");
    }
    else
      router.push("/");
  }, [router]);

  return <div className="text-white">Logging in...</div>;
}
