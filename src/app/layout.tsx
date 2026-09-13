import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import JsonLd from "@/components/seo/json-ld";
import { sportsClubSchema, webSiteSchema } from "@/lib/structured-data";
import {
  CLUB,
  SEO_METADATA,
  SITE_LOCALE,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_URL,
  seoTarget,
} from "@/lib/seo";

/* Site-wide defaults — every string below is read out of SEO_METADATA, either
   the shared title template or the `brand` target, which is the copy that
   answers "nayadiganta club" / "nayadiganta sporting club". Nothing here is
   written twice. */
const brand = seoTarget("brand");

// Preload critical fonts to improve FCP
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

/* Only the two faces the first screen actually paints are preloaded (Clash
   Display for the hero headline, Inter for body copy). Preloading all four
   Poppins weights put ~50 KB of font requests in front of the first paint on
   a phone, competing with the render-blocking stylesheet — and Poppins only
   appears on cards further down the page. `display: swap` keeps that swap
   invisible, so it is fetched on demand instead. */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: false,
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
  preload: false,
});

// Self-hosted Clash Display — next/font/local auto-preloads the woff2 files
// and eliminates the late-discovery problem from @font-face in CSS.
/* Only the weights the site actually renders are self-hosted: the display
   face is used with font-bold / font-semibold / default, never font-medium, so
   shipping and preloading a 500 cut was pure dead weight on the critical path. */
const clashDisplay = localFont({
  variable: "--font-clash",
  src: [
    { path: "../../public/fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  preload: true,
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: brand.title,
    /* Every child page gets "Page title | Nayadiganta Sporting Club". Pages
       built with buildMetadata ship an absolute title that already carries
       this suffix, so the two never double up. */
    template: SEO_METADATA.titleTemplate,
  },
  description: brand.description,
  keywords: [...brand.keywords],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "sports",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: brand.title,
    description: brand.description,
  },
  twitter: {
    card: "summary_large_image",
    title: brand.title,
    description: brand.description,
  },
  /* Only `apple` is declared. Next.js already emits the <link rel="icon"> for
     app/favicon.ico by itself, so declaring it here as well made the browser
     fetch the same file twice. */
  icons: {
    apple: [{ url: "/logo.png" }],
  },
  manifest: "/manifest.webmanifest",
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: {
    capable: true,
    title: SITE_SHORT_NAME,
    statusBarStyle: "black-translucent",
  },
  other: {
    /* Helps some crawlers/link unfurlers that still read these. */
    "geo.region": "BD",
    "geo.placename": `${CLUB.address}, ${CLUB.city}`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0F" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${jetbrains.variable} ${clashDisplay.variable} h-full antialiased light`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        {/* Preconnect to the API backend for faster auth + data fetches */}
        <link rel="preconnect" href="https://football-club-997m.onrender.com" />
        {/* Site-wide structured data: club identity + website entity. */}
        <JsonLd data={[sportsClubSchema(), webSiteSchema()]} />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
