import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
const inter = Inter({ subsets: ["latin"] });
config.autoAddCss = false;

export const metadata = {
  title: "Latex AG Tool",
  description: "Công cụ hỗ trợ Latex",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main
          style={{
            height: "100dvh",
            minHeight: "100%",
            position: "relative",
            overflowY: "hidden",
          }}
        >
          <Header />
          {children}
          <Analytics />
        </main>
      </body>
    </html>
  );
}
