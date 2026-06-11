import type { Metadata } from "next"
import { Inter, Courier_Prime, IBM_Plex_Sans } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
})

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pixel",
})

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
})

export const metadata: Metadata = {
  title: "ClientFlow",
  description: "A clean client portal for agencies to manage clients, projects, files, feedback, and approvals.",
  icons: {
    icon: [
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg?v=3",
  },
  openGraph: {
    title: "ClientFlow",
    description: "A clean client portal for agencies to manage clients, projects, files, feedback, and approvals.",
    images: [
      {
        url: "/CLIENTFLOW.svg",
        width: 1500,
        height: 1500,
        alt: "ClientFlow",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${courierPrime.variable} ${ibmPlexSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}