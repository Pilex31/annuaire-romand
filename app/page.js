'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const FORMES = [
  'Toutes les formes',
  'Société anonyme',
  'Société à responsabilité limitée',
  'Entreprise individuelle',
  'Association',
  'Fondation',
  'Succursale',
]

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
  'Services aux entreprises',
  'Arts, Culture & Loisirs',
  'Autre',
]

const CANTONS = [
  'Tous les cantons',
  'Genève', 'Vaud', 'Valais', 'Fribourg',
  'Neuchâtel', 'Jura', 'Berne',
]

const PAR_PAGE = 30

export default function Home() {
  const [recherche, setRecherche] = useState('')
  const [forme, setForme] = useState('Toutes les formes')
  const [secteur, setSecteur] = useState('Tous les secteurs')
  const [canton, setCanton] = useState('Tous les cantons')
  const [enrichiesOnly, setEnrichiesOnly] = useState(false)
  const [entreprises, setEntreprises] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [recherche, forme, secteur, canton, enrichiesOnly])

  useEffect(() => {
    fetchEntreprises()
  }, [recherche, forme, secteur, canton, enrichiesOnly, page])

  async function fetchEntreprises() {
    setLoading(true)
    const debut = page * PAR_PAGE
    const fin = debut + PAR_PAGE - 1

    let query = supabase
      .from('entreprises')
      .select('id, nom, canton, ville, adresse, npa, forme_juridique, secteur_ia, but_social, numero_ide, enrichie', { count: 'exact' })
      .order('nom')
      .range(debut, fin)

    if (recherche) query = query.ilike('nom', `%${recherche}%`)
    if (forme !== 'Toutes les formes') query = query.eq('forme_juridique', forme)
    if (secteur !== 'Tous les secteurs') query = query.eq('secteur_ia', secteur)
    if (canton !== 'Tous les cantons') query = query.eq('canton', canton)
    if (enrichiesOnly) query = query.eq('enrichie', true)

    const { data, count } = await query
    setEntreprises(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(total / PAR_PAGE)

  function tronquer(texte, max = 120) {
    if (!texte) return ''
    if (texte.length <= max) return texte
    return texte.substring(0, max).trim() + '...'
  }

  function formatAdresse(e) {
    const parts = []
    if (e.adresse) parts.push(e.adresse)
    if (e.npa || e.ville) parts.push(`${e.npa || ''} ${e.ville || ''}`.trim())
    return parts.join(', ')
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
          <select style={styles.select} value={forme} onChange={e => setForme(e.target.value)}>
            {FORMES.map(f => <option key={f}>{f}</option>)}
          </select>
          <select style={styles.select} value={canton} onChange={e => setCanton(e.target.value)}>
            {CANTONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={enrichiesOnly}
            onChange={e => setEnrichiesOnly(e.target.checked)}
          />
          <span>Afficher uniquement les fiches complètes</span>
        </label>

        <p style={styles.resultCount}>
          {total.toLocaleString('fr-CH')} entreprise{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
          {totalPages > 1 && ` · Page ${page + 1}/${totalPages}`}
        </p>
      </section>

      {/* LISTE */}
      <section style={styles.grid}>
        {loading && <p style={styles.loading}>Chargement...</p>}
        {!loading && entreprises.length === 0 && (
          <p style={styles.empty}>Aucune entreprise trouvée pour ces critères.</p>
        )}
        {!loading && entreprises.map(e => (
          <Link
            key={e.id}
            href={`/entreprise/${e.numero_ide}`}
            style={styles.cardLink}
          >
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <h2 style={styles.cardNom}>{e.nom}</h2>
                {e.enrichie && e.adresse ? (
                  <span style={styles.badgeEnrichie}>Fiche complète</span>
                ) : (
                  <span style={styles.badgeEnCours}>Données en cours</span>
                )}
              </div>

              <div style={styles.badgeRow}>
                {e.secteur_ia && (
                  <span style={styles.badgeSecteur}>{e.secteur_ia}</span>
                )}
                {e.forme_juridique && (
                  <span style={styles.badgeForme}>{e.forme_juridique}</span>
                )}
                {e.canton && (
                  <span style={styles.badgeNeutre}>{e.canton}</span>
                )}
              </div>

              {e.but_social && (
                <p style={styles.but}>{tronquer(e.but_social, 140)}</p>
              )}

              <div style={styles.cardBottom}>
                <span style={styles.adresse}>
                  {e.adresse ? `📍 ${formatAdresse(e)}` : ''}
                </span>
                <span style={styles.voirFiche}>Voir la fiche →</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <section style={styles.pagination}>
          <button
            style={{ ...styles.pageBtn, opacity: page === 0 ? 0.4 : 1 }}
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            ← Précédent
          </button>
          <span style={styles.pageInfo}>
            Page {page + 1} sur {totalPages}
          </span>
          <button
            style={{ ...styles.pageBtn, opacity: page >= totalPages - 1 ? 0.4 : 1 }}
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Suivant →
          </button>
        </section>
      )}
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
  checkboxRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginTop: 12, fontSize: 14, color: '#555', cursor: 'pointer',
  },
  resultCount: { color: '#888', fontSize: 14, marginTop: 12 },
  grid: {
    maxWidth: 800, margin: '0 auto', padding: '16px 20px 20px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  cardLink: { textDecoration: 'none', color: 'inherit' },
  card: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #ececec',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  cardTop: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 12, marginBottom: 8,
  },
  cardNom: { fontSize: 16, fontWeight: 700, margin: 0, color: '#1a1a2e', flex: 1 },
  badgeEnrichie: {
    background: '#e1f5ee', color: '#085041', fontSize: 11, fontWeight: 600,
    padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
  },
  badgeEnCours: {
    background: '#f1efe8', color: '#5f5e5a', fontSize: 11, fontWeight: 600,
    padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
  },
  badgeRow: { display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  badgeSecteur: {
    background: '#e1f5ee', color: '#085041', fontSize: 12, fontWeight: 600,
    padding: '3px 10px', borderRadius: 20,
  },
  badgeForme: {
    background: '#eef0ff', color: '#534AB7', fontSize: 12, fontWeight: 500,
    padding: '3px 10px', borderRadius: 20,
  },
  badgeNeutre: {
    background: '#f5f5f7', color: '#555', fontSize: 12,
    padding: '3px 10px', borderRadius: 20,
  },
  but: { fontSize: 14, color: '#555', margin: '0 0 10px', lineHeight: 1.5 },
  cardBottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 8, borderTop: '1px solid #f0f0f0', gap: 12, flexWrap: 'wrap',
  },
  adresse: { fontSize: 13, color: '#888', flex: 1, minWidth: 0 },
  voirFiche: { fontSize: 13, color: '#534AB7', fontWeight: 600, whiteSpace: 'nowrap' },
  loading: { textAlign: 'center', color: '#888', padding: 40 },
  empty: { textAlign: 'center', color: '#aaa', padding: 40 },
  pagination: {
    maxWidth: 800, margin: '0 auto', padding: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  pageBtn: {
    background: '#fff', border: '1px solid #ddd', borderRadius: 8,
    padding: '8px 16px', fontSize: 14, cursor: 'pointer', color: '#1a1a2e',
  },
  pageInfo: { fontSize: 14, color: '#666' },
}
