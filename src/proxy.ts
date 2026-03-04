import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Protected routes — everything under /chat and /conversation requires auth.
 * The home page (/) is public so the login screen can be shown.
 */
const isProtectedRoute = createRouteMatcher([
    "/chat(.*)",
    "/conversation(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
