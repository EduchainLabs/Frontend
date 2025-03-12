import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OCConnectWrapper from "../components/OCConnectWrapper";

const opts = {
  redirectUri: `${process.env.WEBSITE_URL}/redirect`,
  referralCode: "", // Your partner code
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web3 Labs",
  description: "Powered By EDU Chain",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
      suppressHydrationWarning = {true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OCConnectWrapper opts={opts} sandboxMode={true}>
          {children}
        </OCConnectWrapper>
      </body>
    </html>
  );
}
