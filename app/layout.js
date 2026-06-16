import './globals.css'
import { Fraunces, Inter } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Hélio — L\'annuaire B2B de Suisse romande',
  description:
    'Trouvez vos prochains partenaires, prestataires et fournisseurs parmi les 40 386 entreprises romandes vérifiées et classées par secteur.',
}

// Configuration de l'affichage mobile (zoom, largeur d'écran)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
