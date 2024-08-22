import "./globals.css";
import { Public_Sans } from "next/font/google";
import localFont from "next/font/local";

// Font files can be colocated inside of `pages`
const myFont = localFont({ src: "./GalanoGrotesqueBlack.otf" });

import { Navbar } from "@/components/Navbar";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>EmbedEval</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="Evaluate the performance of different text embedding models. See source code and deploy your own at https://github.com/AmoebaLabsAI/EmbedEval!"
        />
        <meta property="og:title" content="EmbedEval" />
        <meta
          property="og:description"
          content="Evaluate the performance of different text embedding models. See source code and deploy your own at https://github.com/AmoebaLabsAI/EmbedEval!"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EmbedEval" />
        <meta
          name="twitter:description"
          content="Evaluate the performance of different text embedding models. See source code and deploy your own at https://github.com/AmoebaLabsAI/EmbedEval!"
        />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={myFont.className}>
        <div className="flex flex-col p-4 h-[100vh] bg-[#25252d]">
          <Navbar></Navbar>
          {children}
        </div>
      </body>
    </html>
  );
}
