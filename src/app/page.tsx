import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();

  // Logged-in users go straight to chat
  if (userId) {
    redirect("/chat");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f5ebe0] px-4 overflow-hidden">
      {/* ── Warm Mesh Background ── */}
      <div className="mesh-bg opacity-40" />
      <div className="mesh-overlay" />

      {/* ── Subtle Warm Vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(213,189,175,0.15)_100%)]" />

      {/* ── Decorative Shapes ── */}
      <div className="pointer-events-none absolute top-20 left-20 h-64 w-64 rounded-full bg-[#d5bdaf]/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-20 right-20 h-80 w-80 rounded-full bg-[#e3d5ca]/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#d6ccc2]/15 blur-3xl" />

      <div className="animate-fade-in-up relative w-full max-w-[400px] rounded-3xl border border-[#e3d5ca] bg-[#edede9]/80 backdrop-blur-xl p-10 shadow-[0_24px_64px_-16px_rgba(61,44,44,0.12)]">
        <div className="relative">
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center gap-5 text-center">
            <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d5bdaf] to-[#c4a898] text-4xl shadow-lg shadow-[#d5bdaf]/20 ring-1 ring-[#d5bdaf]/20">
              💬
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#3d2c2c]">
                TarsChat
              </h1>
              <p className="text-sm font-medium text-[#7a6a5e]">
                Connect and collaborate <span className="text-[#8b6f5e] font-semibold">seamlessly</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
              <button className="w-full rounded-xl bg-gradient-to-r from-[#d5bdaf] to-[#c4a898] py-3.5 text-sm font-semibold text-[#3d2c2c] transition-all hover:shadow-lg hover:shadow-[#d5bdaf]/25 hover:-translate-y-0.5 active:scale-[0.98]">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
              <button className="w-full rounded-xl border border-[#d5bdaf]/60 bg-[#f5ebe0]/60 py-3.5 text-sm font-semibold text-[#3d2c2c] transition-all hover:bg-[#e3d5ca]/40 hover:-translate-y-0.5 active:scale-[0.98]">
                Create Account
              </button>
            </SignUpButton>
          </div>

          {/* Footer Branding */}
          <div className="mt-8 pt-6 border-t border-[#e3d5ca] flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a6a5e]/60">
              Powered by TarsChat Systems
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
