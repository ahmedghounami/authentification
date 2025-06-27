"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
const styleinput =
  "text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500";
("text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500");
export default function Page() {
  const Router = useRouter();
  const [exist, setExist] = useState(false);

  async function handelsubmit() {
    // console.log('name:', document.querySelector('#name input').value);
    // console.log('password:', document.querySelector('#password input').value);
    const response = await fetch("http://localhost:4000/registration", {
      method: "POST",
      body: JSON.stringify({
        email: document.querySelector("#email input").value,
        password: document.querySelector("#password input").value,
        username: document.querySelector("#username input").value,
        lastname: document.querySelector("#lastname input").value,
        firstname: document.querySelector("#firstname input").value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Response:', data);
      Router.push("/login");
    } else {
      setExist(true);
    }
  }

  return (
    <div className=" h-screen w-screen flex flex-col items-center justify-center min-h-screen bg-gray-800">
      <h1 className="text-4xl font-bold mb-4">registration</h1>
      {exist && (
        <div className="text-red-500 mb-4">
          User already exists. Please try a different email or username.
        </div>
      )}


      <div className="text-gray-500 mb-4">
        Please fill in the details below to create an account.
      </div>
      <form
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
        onSubmit={(e) => {
          handelsubmit();
          e.preventDefault(); // Prevent default form submission
        }}
      >
        <label className="block mb-4" id="firstname">
          <span className="text-gray-700">firstname</span>
          <input
            type="firstname"
            className={styleinput}
            placeholder="Enter your firstname"
            required
          />
        </label>
        <label className="block mb-4" id="lastname">
          <span className="text-gray-700">lastname</span>
          <input
            type="text"
            className={styleinput}
            placeholder="Enter your lastname"
            required
            maxLength={12}
            min={8} // Minimum length of 8 characters
          />
        </label>
        <label className="block mb-4" id="username">
          <span className="text-gray-700">username</span>
          <input
            type="text"
            className={styleinput}
            placeholder="Enter your username"
            required
            maxLength={12}
            min={8} // Minimum length of 8 characters
          />
        </label>
        <label className="block mb-4" id="email">
          <span className="text-gray-700">email</span>
          <input
            type="email"
            className={styleinput}
            placeholder="Enter your email"
            required
          />
        </label>
        <label className="block mb-4" id="password">
          <span className="text-gray-700">password</span>
          <input
            type="text"
            className={styleinput}
            placeholder="Enter your password"
            required
            maxLength={12}
            min={8} // Minimum length of 8 characters
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
