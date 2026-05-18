export const metadata = {
  title: 'Annuaire Romand — Entreprises de Suisse romande',
  description: 'Trouvez toutes les entreprises de Suisse romande par secteur et par canton.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
