"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UnauthenticatedPracticeArena from "@/components/UnauthenticatedPA";
import PracticeArena from "@/components/PracticeArena";


const PracticePage = () => {
  return (
    <div>
      <PracticeArena />
    </div>
  );
};

export default PracticePage;
