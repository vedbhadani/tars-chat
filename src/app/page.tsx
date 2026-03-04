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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-primary/5">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
            💬
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Realtime Chat
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect and message people instantly
          </p>
        </div>

        {/* Auth buttons */}
        <div className="flex flex-col gap-3">
          <SignInButton mode="modal">
            <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="w-full rounded-xl border border-border bg-secondary py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Create Account
            </button>
          </SignUpButton>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          By continuing you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
