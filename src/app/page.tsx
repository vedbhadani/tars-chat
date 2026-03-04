import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
            T
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            TARS Chat
          </h1>
        </div>

        {/* Tagline */}
        <p className="max-w-md text-lg text-muted-foreground">
          Real-time messaging powered by Next.js, Clerk authentication, and
          Convex backend.
        </p>

        {/* CTA */}
        <Link
          href="/chat"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open Chat →
        </Link>

        {/* Placeholder auth hint */}
        <p className="text-sm text-muted-foreground/60">
          {/* TODO: Replace with Clerk <SignInButton> */}
          Sign in to get started
        </p>
      </div>
    </div>
  );
}
