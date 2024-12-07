import type { Metadata } from "next";
import SessionProviderWrapper from "@/app/components/SessionProviderWrapper";
import "./globals.css";
import ReduxProvider from "@/redux/provider";


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <ReduxProvider>{children}</ReduxProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
