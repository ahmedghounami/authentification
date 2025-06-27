"use client";
const revalidate = 1; // Revalidate every second
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Page() {
  const router = useRouter();

  const styleinput =
    "text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500";

  async function handelsubmit(e) {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await fetch("http://localhost:4000/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      Cookies.set("token", data.token, {
        expires: 1,
        secure: true,
        sameSite: "lax",
      });

      router.push("/dashboard");
    } else {
      console.log("Login failed");
      const errorData = await response.json();
      alert(`Login failed: ${errorData.error || "Unknown error"}`);
      e.target.reset(); // Reset the form fields
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-800">
      <h1 className="text-4xl font-bold mb-4">Login</h1>
      <form
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
        onSubmit={handelsubmit}
      >
        <label className="block mb-4" htmlFor="email">
          <span className="text-gray-700">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            className={styleinput}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </label>
        <label className="block mb-4" htmlFor="password">
          <span className="text-gray-700">Password</span>
          <input
            id="password"
            name="password"
            type="password"
            className={styleinput}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            onFocus={(e) => e.target.type = "password"}
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Login
        </button>
      </form>
    </div>
  );
}
