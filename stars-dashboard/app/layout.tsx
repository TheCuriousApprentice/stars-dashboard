import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "S.T.A.R.S Dashboard",
  description: "A scaffold dashboard for Security, Tests, Accessibility, Reliability, and Scalability gates."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <header className="app-header">
          <Link className="brand" href="/" aria-label="S.T.A.R.S dashboard home">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span>
              <strong>S.T.A.R.S</strong>
              <small>quality gates</small>
            </span>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
