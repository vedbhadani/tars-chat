import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Realtime Chat",
  description: "Connect and message people instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: "Sign in to TarsChat",
          }
        },
        signUp: {
          start: {
            title: "Create your TarsChat account",
          }
        },
        // Placeholder targeted specifically for the username field
        formFieldInputPlaceholder__username: "Enter your username",
      }}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#7c3aed",
          colorBackground: "#18181b",
          colorText: "#ffffff",
          colorTextSecondary: "rgba(255, 255, 255, 0.65)",
          colorInputBackground: "#27272a",
          colorInputText: "#ffffff",
        },
        elements: {
          card: {
            backgroundColor: "#1c1c1f",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          formFieldInput: {
            backgroundColor: "#27272a !important",
            color: "#ffffff !important",
            borderColor: "rgba(255, 255, 255, 0.1) !important",
          },
          formFieldLabel: {
            color: "#a1a1aa !important",
          },
          headerTitle: {
            color: "#ffffff !important",
          },
          headerSubtitle: {
            color: "#a1a1aa !important",
          },
          socialButtonsIconButton: {
            backgroundColor: "rgba(255, 255, 255, 0.05) !important",
            border: "1px solid rgba(255, 255, 255, 0.1) !important",
            filter: "brightness(0) invert(1) !important", // Fix dark logos on dark bg
          },
          footerActionText: {
            color: "#a1a1aa !important",
          },
          footerActionLink: {
            color: "#7c3aed !important",
            fontWeight: "600 !important",
          },
          modalCloseButton: {
            color: "#ffffff !important",
            opacity: "0.8 !important",
          },
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased`}>
          <ConvexClientProvider>
            <div className="flex min-h-screen flex-col">{children}</div>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
