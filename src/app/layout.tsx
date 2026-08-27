import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABB College Collaboration Hub",
  description: "Next-Generation Engineering Competitions, Innovation Challenges, and Industry Collaborations hosted by ABB",
  keywords: ["ABB", "Automation", "Hackathon", "Engineering", "Robotics", "Collaboration", "Smart Grid"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <main className="relative flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
