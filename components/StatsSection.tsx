"use client";
import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ number, label }: { number: string; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {number}
      </motion.span>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="px-6 py-10">
      <motion.div
        className="max-w-4xl mx-auto bg-gray-900/70 backdrop-blur rounded-2xl p-8 flex justify-around flex-wrap gap-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <StatCard number="50+" label="Coding Challenges" />
        <StatCard number="10,000+" label="Active Developers" />
        <StatCard number="95%" label="Success Rate" />
      </motion.div>
    </section>
  );
};

export default StatsSection;
