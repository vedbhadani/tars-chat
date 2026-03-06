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
    <div className="relative flex min-h-screen items-center justify-center bg-[#07070a] px-4 overflow-hidden">
      {/* ── Premium Mesh Background ── */}
      <div className="mesh-bg opacity-30" />
      <div className="mesh-overlay" />

      {/* ── Subtle Vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      <div className="animate-fade-in-up relative w-full max-w-[380px] rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] group">
        <div className="relative">
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-3xl shadow-lg ring-1 ring-white/10">
              💬
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight text-white line-height-none">
                TarsChat
              </h1>
              <p className="text-sm font-medium text-zinc-400">
                Connect and collaborate <span className="text-violet-400">seamlessly</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
              <button className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 active:scale-[0.98] shadow-md shadow-violet-600/10">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
              <button className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]">
                Create Account
              </button>
            </SignUpButton>
          </div>

          {/* Footer Branding */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Powered by TarsChat Systems
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
