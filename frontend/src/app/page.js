"use client";
import Link from "next/link";

export default function Page() {
  
  return (
    <div className="flex justify-center items-center gap-4">
      <Link
        className="bg-white rounded-full p-2 px-4 text-black"
        href='/login'
      >
        login
      </Link>
      <Link
        className="bg-white rounded-full p-2 px-4 text-black"
        href='/registration'
      >
        sign in
      </Link>
    </div>
  );
}
