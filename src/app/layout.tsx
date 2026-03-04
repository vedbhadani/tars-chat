import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TARS Chat",
  description:
    "A real-time chat application powered by Next.js, Clerk, and Convex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* 
          TODO: Wrap with Clerk <ClerkProvider> and Convex <ConvexProvider>
          once environment variables are configured.
        */}
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
