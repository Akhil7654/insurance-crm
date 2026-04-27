"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* TOP/LEFT LANDING SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-black to-gray-800 text-white px-6 py-10 sm:px-10 lg:px-14 lg:py-16 flex flex-col justify-center"
        >
          <div className="max-w-xl mx-auto lg:mx-0">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-4">
              Insurance CRM
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              Manage Insurance Like a Pro
            </h1>

            <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed">
              Track clients, renewals, policies and conversions — all in one
              place. Built for insurance professionals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
              <p>✔ Client Management</p>
              <p>✔ Renewal Tracking</p>
              <p>✔ Notes & Reminders</p>
              <p>✔ Documents & Policies</p>
            </div>
          </div>
        </motion.section>

        {/* SIGNUP SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10"
        >
          <div className="w-full max-w-[420px]">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-xl rounded-2xl",
                },
              }}
            />
          </div>
        </motion.section>
      </div>
    </main>
  );
}