"use client";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import LoginButton from "./LoginButton";
import Logo from "./ui/Mark";

const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInitialized, authState, ocAuth } = useOCAuth();
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    // Only run when user becomes authenticated
    if (isInitialized && authState.isAuthenticated && !isCreatingUser) {
      createUserAfterLogin();
    }
  }, [isInitialized, authState.isAuthenticated]);

  const createUserAfterLogin = async () => {
    try {
      setIsCreatingUser(true);
      const authData = ocAuth.getAuthState();

      // Check if user already exists
      const checkResponse = await fetch(`/api/users?OCId=${authData.OCId}`);
      const checkData = await checkResponse.json();

      // Only create user if they don't exist yet
      if (!checkData.success || !checkData.user) {
        const createResponse = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            OCId: authData.OCId,
            ethAddress: authData.ethAddress,
            image: "", // You can set a default image if needed
          }),
        });

        const createData = await createResponse.json();
        console.log("User creation result:", createData);
      }
    } catch (err) {
      console.error("Error creating user:", err);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <nav className="absolute top-0 left-0 z-10 flex justify-between items-center px-6 md:px-12 py-4 w-full">
      <div className="flex items-center">
        <Link
          href="/"
          className="text-xl font-bold text-white flex items-center"
        >
          <span className="text-violet-400">EDU</span>CHAIN
          <span className="ml-2 text-violet-400">LABS</span>
        </Link>
      </div>

      <div className="hidden md:flex space-x-8">
        <Link
          href="/"
          className="text-white hover:text-violet-400 transition-colors relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Home
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link
          href="/courses"
          className="text-white hover:text-violet-400 transition-colors relative group"
        >
          Courses
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link
          href="/practice"
          className="text-white hover:text-violet-400 transition-colors relative group"
        >
          Practice Arena
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link
          href="/chatbot"
          className="text-white hover:text-violet-400 transition-colors relative group"
        >
          AI Assistant
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-400 group-hover:w-full transition-all duration-300"></span>
        </Link>
      </div>

      <div>
        {isInitialized && authState.isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="font-semibold px-5 py-2 bg-violet-700 hover:bg-violet-600 rounded-md flex gap-2 justify-start items-center text-white/80 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30"
            >
              Profile
            </Link>
            <button className="px-5 py-2 bg-violet-700 hover:bg-violet-600 rounded-md flex gap-2 justify-start items-center text-white/80 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30">
              <Logo />
              <div>
                <span className="font-semibold">OCID</span> Connected
              </div>
            </button>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
