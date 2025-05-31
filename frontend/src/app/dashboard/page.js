"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const token = Cookies.get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:4000/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        // Token invalid? Clear cookie and redirect to login
        Cookies.remove("token");
        router.push("/login");
      }
    }

    fetchData();
  }, [router]);

  
  if (!dashboardData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-800">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <pre className="text-white">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
        <button
          className="bg-white rounded-full p-2 px-4 text-black mt-4"
          onClick={() => {
            Cookies.remove("token");
            router.push("/login");
          }}
        >
          Log out
        </button>
      </div>
    );
}
