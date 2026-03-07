import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TarsChat — Realtime Messaging",
  description: "Connect and message people instantly with TarsChat",
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
        formFieldInputPlaceholder__username: "Enter your username",
      }}
      appearance={{
        variables: {
          colorPrimary: "#d5bdaf",
          colorBackground: "#edede9",
          colorText: "#3d2c2c",
          colorTextSecondary: "#7a6a5e",
          colorInputBackground: "#f5ebe0",
          colorInputText: "#3d2c2c",
          borderRadius: "0.75rem",
        },
        elements: {
          card: {
            backgroundColor: "#edede9",
            border: "1px solid #e3d5ca",
            boxShadow: "0 16px 48px -12px rgba(61, 44, 44, 0.12)",
          },
          formFieldInput: {
            backgroundColor: "#f5ebe0 !important",
            color: "#3d2c2c !important",
            borderColor: "#e3d5ca !important",
          },
          formFieldLabel: {
            color: "#7a6a5e !important",
          },
          headerTitle: {
            color: "#3d2c2c !important",
          },
          headerSubtitle: {
            color: "#7a6a5e !important",
          },
          socialButtonsIconButton: {
            backgroundColor: "#f5ebe0 !important",
            border: "1px solid #e3d5ca !important",
          },
          footerActionText: {
            color: "#7a6a5e !important",
          },
          footerActionLink: {
            color: "#8b6f5e !important",
            fontWeight: "600 !important",
          },
          modalCloseButton: {
            color: "#3d2c2c !important",
            opacity: "0.7 !important",
          },
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          <ConvexClientProvider>
            <div className="flex min-h-screen flex-col">{children}</div>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
