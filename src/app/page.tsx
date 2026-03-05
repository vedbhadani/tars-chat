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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Decorative blurred orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-3xl shadow-lg glow-primary">
            💬
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Realtime Chat
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect and message people instantly
            </p>
          </div>
        </div>

        {/* Auth buttons */}
        <div className="flex flex-col gap-3">
          <SignInButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
            <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]">
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat">
            <button className="w-full rounded-xl border border-border bg-secondary/60 py-3 text-sm font-semibold text-secondary-foreground transition-all duration-200 hover:bg-secondary/80 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]">
              Create Account
            </button>
          </SignUpButton>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/50">
          By continuing you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
