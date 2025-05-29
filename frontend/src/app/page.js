"use client";

import Link from "next/link";

const styleinput =
  "text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500";
("text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500");
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
