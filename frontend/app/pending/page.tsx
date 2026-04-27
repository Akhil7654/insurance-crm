import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

export default async function PendingPage() {
  const user = await currentUser();

  const approved = user?.publicMetadata?.approved;
  const role = user?.publicMetadata?.role;

  if (approved || role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <a href="/dashboard" className="text-blue-600 underline">
          Go to CRM
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold mb-3">Waiting for admin approval</h1>
      <p className="text-gray-600 mb-6">
        Your account has been created. The owner needs to approve your access before you can enter the CRM.
      </p>

      <SignOutButton>
        <button className="border px-4 py-2 rounded-md">Logout</button>
      </SignOutButton>
    </div>
  );
}