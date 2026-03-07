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
    <div className="relative flex min-h-screen items-center justify-center bg-[#F2EDE4] px-4 overflow-hidden">
      {/* ── Warm Mesh Background ── */}
      <div className="mesh-bg opacity-40" />
      <div className="mesh-overlay" />

      {/* ── Subtle Warm Vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(181,120,74,0.08)_100%)]" />

      {/* ── Decorative Shapes ── */}
      <div className="pointer-events-none absolute top-20 left-20 h-64 w-64 rounded-full bg-[#B5784A]/10 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-20 right-20 h-80 w-80 rounded-full bg-[#E8E0D4]/40 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#F2EDE4]/30 blur-3xl" />

      <div className="animate-fade-in-up relative w-full max-w-[400px] rounded-[20px] border-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] backdrop-blur-xl p-10 shadow-[0_2px_4px_rgba(26,18,8,0.04),0_12px_32px_rgba(26,18,8,0.10)]">
        <div className="relative">
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center gap-5 text-center">
            <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-[#B5784A] text-4xl shadow-lg shadow-[#B5784A]/20 ring-1 ring-[#B5784A]/20">
              💬
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#1A1208]">
                TarsChat
              </h1>
              <p className="text-sm font-medium text-[#7A6A56]">
                Connect and collaborate <span className="text-[#B5784A] font-semibold">seamlessly</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <SignInButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
              <button className="w-full rounded-[10px] bg-[#B5784A] py-3.5 text-sm font-semibold text-[#FFFFFF] transition-all hover:bg-[#8F5A32] hover:shadow-lg hover:shadow-[#B5784A]/25 hover:-translate-y-0.5 active:scale-[0.98]">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
              <button className="w-full rounded-[10px] border-[1.5px] border-[#E8E0D4] bg-transparent py-3.5 text-sm font-semibold text-[#1A1208] transition-all hover:bg-[#F5EDE3] hover:border-[#B5784A] hover:-translate-y-0.5 active:scale-[0.98]">
                Create Account
              </button>
            </SignUpButton>
          </div>

          {/* Footer Branding */}
          <div className="mt-8 pt-6 border-t border-[#E8E0D4] flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B0A090]">
              Powered by TarsChat Systems
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
