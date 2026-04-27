"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const approved = user?.publicMetadata?.approved === true;
  const role = user?.publicMetadata?.role;

  useEffect(() => {
    if (!isLoaded) return;

    if (approved || role === "admin") {
      router.push("/");
    }
  }, [isLoaded, approved, role, router]);

  async function checkAgain() {
    await user?.reload();

    if (
      user?.publicMetadata?.approved === true ||
      user?.publicMetadata?.role === "admin"
    ) {
      router.push("/");
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking approval...
      </div>
    );
  }

  if (approved || role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to CRM...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold mb-3">Waiting for admin approval</h1>

      <p className="text-gray-600 mb-6 max-w-md">
        Your account has been created. The owner needs to approve your access
        before you can enter the CRM.
      </p>

      <button
        onClick={checkAgain}
        className="bg-black text-white px-4 py-2 rounded-md mb-4"
      >
        I have been approved, check again
      </button>

      <SignOutButton>
        <button className="border px-4 py-2 rounded-md">
          Logout
        </button>
      </SignOutButton>
    </div>
  );
}