"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT SIDE - LANDING CONTENT */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="flex-1 bg-black text-white flex flex-col justify-center px-10 py-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Manage Insurance <br /> Like a Pro
        </h1>

        <p className="text-gray-300 mb-8 max-w-md">
          Track clients, renewals, policies and conversions — all in one place.
          Built for insurance professionals.
        </p>

        <div className="space-y-3 text-gray-400">
          <p>✔ Client & Lead Management</p>
          <p>✔ Renewal Tracking</p>
          <p>✔ Notes & Reminders</p>
          <p>✔ Documents & Policies</p>
        </div>
      </motion.div>

      {/* RIGHT SIDE - SIGNUP CARD */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex-1 flex items-center justify-center bg-gray-50 p-6"
      >
        <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md">
          <SignUp />
        </div>
      </motion.div>

    </div>
  );
}