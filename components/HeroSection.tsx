"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const keywords = [
    "Blockchain",
    "Solidity",
    "DeFi",
    "Web3",
    "Smart Contracts",
    "dApps",
  ];
  const [keywordIndex, setKeywordIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setKeywordIndex((prevIndex) => (prevIndex + 1) % keywords.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center">
      <motion.div
        className="inline-block mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-900/30 mb-2 mx-auto animate-pulse">
          <Sparkles className="w-6 h-6 text-violet-400" />
        </div>
      </motion.div>

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-4xl">
        <span>Master Development of</span>
        <br />
        <motion.span
          key={keywordIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 mx-4 inline-block min-w-52"
        >
          {keywords[keywordIndex]}
        </motion.span>
      </h1>

      <motion.p
        className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Learn, Practice, and Build with Real-World Projects
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Link
          href="/practice"
          className="px-8 py-3 bg-violet-700 rounded-md text-white font-medium hover:bg-violet-600 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30"
        >
          Start Coding
        </Link>
        <Link
          href="/courses"
          className="px-8 py-3 bg-transparent border border-violet-500 rounded-md text-white font-medium hover:bg-violet-900/30 transition-all transform hover:scale-105"
        >
          Explore Courses
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
