import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
          colorPrimary: "#B5784A",
          colorBackground: "#FFFFFF",
          colorText: "#1A1208",
          colorTextSecondary: "#7A6A56",
          colorInputBackground: "#FAF7F2",
          colorInputText: "#1A1208",
          borderRadius: "0.75rem",
        },
        elements: {
          card: {
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #E8E0D4",
            borderRadius: "20px",
            boxShadow: "0 2px 4px rgba(26,18,8,0.04), 0 12px 32px rgba(26,18,8,0.10)",
          },
          formFieldInput: {
            backgroundColor: "#FAF7F2 !important",
            color: "#1A1208 !important",
            borderColor: "#E8E0D4 !important",
          },
          formFieldLabel: {
            color: "#7A6A56 !important",
          },
          headerTitle: {
            color: "#1A1208 !important",
          },
          headerSubtitle: {
            color: "#7A6A56 !important",
          },
          socialButtonsIconButton: {
            backgroundColor: "#FFFFFF !important",
            border: "1.5px solid #E8E0D4 !important",
          },
          footerActionText: {
            color: "#7A6A56 !important",
          },
          footer: {
            backgroundColor: "#F5EDE3",
            borderTop: "1.5px solid #E8E0D4",
          },
          footerAction: {
            backgroundColor: "#F5EDE3",
          },
          footerActionLink: {
            color: "#B5784A !important",
            fontWeight: "600 !important",
          },
          modalCloseButton: {
            color: "#1A1208 !important",
            opacity: "0.7 !important",
          },
        },
      }}
    >
      <html lang="en">
        <body className={`${jakarta.variable} font-sans antialiased`}>
          <ConvexClientProvider>
            <div className="flex min-h-screen flex-col">{children}</div>
            <Toaster position="top-right" />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
