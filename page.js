'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const SECTEURS = [
  'Tous les secteurs',
  'Immobilier',
  'BTP / Construction',
  'Finance & Assurance',
  'Informatique & Tech',
  'Santé',
  'Commerce & Retail',
  'Restauration & Hôtellerie',
  'Industrie & Manufacture',
  'Transport & Logistique',
  'Éducation & Formation',
  'Juridique & Conseil',
  'Autre',
]

const CANTONS = [
  'Tous les cantons',
  'Genève', 'Vaud', 'Valais', 'Fribourg',
  'Neuchâtel', 'Jura', 'Berne',
]

export default function Home() {
  const [recherche, setRecherche] = useState('')
  const [secteur, setSecteur] = useState('Tous les secteurs')
  const [canton, setCanton] = useState('Tous les cantons')
  const [entreprises, setEntreprises] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchEntreprises()
  }, [recherche, secteur, canton])

  async function fetchEntreprises() {
    setLoading(true)
    let query = supabase
      .from('entreprises')
      .select('*', { count: 'exact' })
      .order('nom')
      .limit(50)

    if (recherche) query = query.ilike('nom', `%${recherche}%`)
    if (secteur !== 'Tous les secteurs') query = query.eq('secteur', secteur)
    if (canton !== 'Tous les cantons') query = query.eq('canton', canton)

    const { data, count } = await query
    setEntreprises(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  return (
    <main style={styles.main}>
      {/* EN-TÊTE */}
      <header style={styles.header}>
        <h1 style={styles.logo}>🇨🇭 Annuaire Romand</h1>
        <p style={styles.tagline}>Le répertoire des entreprises de Suisse romande</p>
      </header>

      {/* BARRE DE RECHERCHE */}
      <section style={styles.searchSection}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="🔍  Rechercher une entreprise..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
        <div style={styles.filters}>
          <select style={styles.select} value={secteur} onChange={e => setSecteur(e.target.value)}>
            {SECTEURS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={styles.select} value={canton} onChange={e => setCanton(e.target.value)}>
            {CANTONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <p style={styles.resultCount}>{total} entreprise{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}</p>
      </section>

      {/* LISTE */}
      <section style={styles.grid}>
        {loading && <p style={styles.loading}>Chargement...</p>}
        {!loading && entreprises.length === 0 && (
          <p style={styles.empty}>Aucune entreprise trouvée pour ces critères.</p>
        )}
        {entreprises.map(e => (
          <div key={e.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardNom}>{e.nom}</h2>
              {e.secteur && <span style={styles.badge}>{e.secteur}</span>}
            </div>
            {e.adresse && <p style={styles.cardInfo}>📍 {e.adresse}{e.npa ? `, ${e.npa}` : ''} {e.ville || ''}</p>}
            {e.canton && <p style={styles.cardInfo}>🏔️ {e.canton}</p>}
            {e.telephone && <p style={styles.cardInfo}>📞 {e.telephone}</p>}
            {e.email && <p style={styles.cardInfo}>✉️ {e.email}</p>}
            {e.site_web && (
              <a href={e.site_web} target="_blank" rel="noreferrer" style={styles.link}>
                🌐 Voir le site web
              </a>
            )}
          </div>
        ))}
      </section>
    </main>
  )
}

const styles = {
  main: { minHeight: '100vh', background: '#f7f8fa', fontFamily: 'system-ui, sans-serif' },
  header: { background: '#1a1a2e', color: '#fff', textAlign: 'center', padding: '40px 20px 32px' },
  logo: { fontSize: 32, fontWeight: 800, margin: 0 },
  tagline: { marginTop: 8, color: '#aab', fontSize: 16 },
  searchSection: { maxWidth: 800, margin: '0 auto', padding: '32px 20px 0' },
  searchInput: {
    width: '100%', padding: '14px 18px', fontSize: 16,
    border: '2px solid #e0e0e0', borderRadius: 10, outline: 'none',
    boxSizing: 'border-box', marginBottom: 12,
  },
  filters: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  select: {
    flex: 1, minWidth: 180, padding: '10px 14px', fontSize: 15,
    border: '2px solid #e0e0e0', borderRadius: 8, background: '#fff',
  },
  resultCount: { color: '#888', fontSize: 14, marginTop: 12 },
  grid: {
    maxWidth: 800, margin: '0 auto', padding: '16px 20px 60px',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  card: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #ececec',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
  cardNom: { fontSize: 18, fontWeight: 700, margin: 0, color: '#1a1a2e' },
  badge: {
    background: '#eef0ff', color: '#534AB7', borderRadius: 20,
    padding: '3px 12px', fontSize: 12, fontWeight: 600,
  },
  cardInfo: { margin: '4px 0', fontSize: 14, color: '#555' },
  link: { color: '#534AB7', fontSize: 14, textDecoration: 'none', fontWeight: 500 },
  loading: { textAlign: 'center', color: '#888', padding: 40 },
  empty: { textAlign: 'center', color: '#aaa', padding: 40 },
}
