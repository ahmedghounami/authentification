"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

export default function GoogleLoginPage() {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-800">
        <h1 className="text-4xl font-bold mb-4 text-white">Google Login</h1>
       
        <a
          href="http://localhost:4000/login/google"
          className="bg-white text-black rounded-full p-2 px-4 hover:bg-gray-200 transition-colors duration-300"
        >
          Login with Google
        </a>
      </div>
    );
  }