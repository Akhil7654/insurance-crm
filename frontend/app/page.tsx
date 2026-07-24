'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-300 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Insurance CRM
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your clients and policies efficiently
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6">
          {/* 🚗 Vehicle Insurance */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/vehicle')}
            className="group bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8 rounded-2xl shadow-lg text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🚗 Vehicle Insurance</h2>
                <p className="text-blue-100 mt-1">
                  View and manage vehicle clients
                </p>
              </div>
              <span className="text-3xl opacity-80 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </motion.button>

          {/* ❤️ Health Insurance */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/health')}
            className="group bg-gradient-to-r from-emerald-600 to-green-500 text-white p-8 rounded-2xl shadow-lg text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">❤️ Health Insurance</h2>
                <p className="text-green-100 mt-1">
                  Manage health insurance clients
                </p>
              </div>
              <span className="text-3xl opacity-80 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </motion.button>

          {/* 📅 Reminder Dashboard */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/reminders"
              className="block bg-gray-900 text-white p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">📅 Reminder Dashboard</h2>
                  <p className="text-gray-400 mt-1">
                    Track follow-ups and reminders
                  </p>
                </div>
                <span className="text-3xl opacity-80">→</span>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-10">
          © {new Date().getFullYear()} Insurance CRM
        </p>
      </motion.div>
    </div>
  );
}
