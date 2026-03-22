import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  title: "FundRise - Community Crowdfunding",
  description: "Raise funds and support causes that matter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <Script id="strip-bis" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var nodes = document.querySelectorAll('[bis_skin_checked]');
                for (var i = 0; i < nodes.length; i++) {
                  nodes[i].removeAttribute('bis_skin_checked');
                }
                var observer = new MutationObserver(function (mutations) {
                  for (var m = 0; m < mutations.length; m++) {
                    var added = mutations[m].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                      var node = added[j];
                      if (node && node.nodeType === 1) {
                        if (node.hasAttribute('bis_skin_checked')) {
                          node.removeAttribute('bis_skin_checked');
                        }
                        var inner = node.querySelectorAll
                          ? node.querySelectorAll('[bis_skin_checked]')
                          : [];
                        for (var k = 0; k < inner.length; k++) {
                          inner[k].removeAttribute('bis_skin_checked');
                        }
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: false,
                  childList: true,
                  subtree: true,
                });
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans"
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
