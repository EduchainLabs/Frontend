"use client";

import { useOCAuth } from "@opencampus/ocid-connect-js";
import Logo from "./ui/Mark";

export default function LoginButton() {
  const { ocAuth } = useOCAuth();

  const handleLogin = async () => {
    try {
      await ocAuth.signInWithRedirect({ state: "opencampus" });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return <button className = "w-full px-5 py-2 bg-violet-700 hover:bg-violet-600 rounded-md flex gap-2 justify-center items-center text-white transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30" onClick={handleLogin}><Logo /> <div>Connect <span className="font-semibold">OCID</span></div></button>;
}
