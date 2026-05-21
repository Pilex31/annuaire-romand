'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EntrepriseClient({ uid }) {
  const [entreprise, setEntreprise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    fetchEntreprise()
  }, [uid])

  async function fetchEntreprise() {
    setLoading(true)
    setErreur(null)

    const { data, error } = await supabase
      .from('entreprises')
      .select('*')
      .eq('numero_ide', uid)
      .single()

    if (error || !data) {
      setErreur('Entreprise introuvable')
      setEntreprise(null)
    } else {
      setEntreprise(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <main style={styles.main}>
        <p style={styles.loading}>Chargement...</p>
      </main>
    )
  }

  if (erreur || !entreprise) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <Link href="/" style={styles.retour}>← Retour à l'annuaire</Link>
          <p style={styles.erreur}>{erreur || 'Entreprise introuvable'}</p>
        </div>
      </main>
    )
  }

  const e = entreprise
  const uidFormate = e.numero_ide ? formatUID(e.numero_ide) : ''
  const isEnrichie = e.enrichie && e.adresse

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <Link href="/" style={styles.retour}>← Retour à l'annuaire</Link>

        {/* EN-TÊTE */}
        <h1 style={styles.titre}>{e.nom}</h1>

        <div style={styles.badgeRow}>
          {e.forme_juridique && (
            <span style={styles.badgeForme}>{e.forme_juridique}</span>
          )}
          {e.statut === 'ACTIVE' && (
            <span style={styles.badgeStatut}>Active</span>
          )}
          {e.statut && e.statut !== 'ACTIVE' && (
            <span style={styles.badgeStatutInactif}>{e.statut}</span>
          )}
          {uidFormate && (
            <span style={styles.badgeUid}>{uidFormate}</span>
          )}
        </div>

        {!isEnrichie && (
          <div style={styles.infoEnrichissement}>
            ℹ️ Cette fiche est en cours d'enrichissement. Les détails complets seront disponibles prochainement.
          </div>
        )}

        {/* ADRESSE */}
        {e.adresse && (
          <div style={styles.bloc}>
            <p style={styles.blocLabel}>📍 Adresse</p>
            <p style={styles.blocContenu}>
              {e.adresse}<br />
              {e.npa} {e.ville}
            </p>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(e.adresse + ' ' + (e.npa || '') + ' ' + (e.ville || ''))}`}
              target="_blank"
              rel="noreferrer"
              style={styles.lienMap}
            >
              Voir sur Google Maps →
            </a>
          </div>
        )}

        {/* BUT SOCIAL */}
        {e.but_social && (
          <div style={styles.blocLong}>
            <p style={styles.blocLabel}>🎯 But social / Activité</p>
            <p style={styles.blocContenuLong}>{e.but_social}</p>
          </div>
        )}

        {/* MÉTADONNÉES */}
        <div style={styles.metaGrid}>
          {e.canton && (
            <div style={styles.metaCard}>
              <p style={styles.metaLabel}>Canton</p>
              <p style={styles.metaValeur}>{e.canton}</p>
            </div>
          )}
          {e.date_inscription && (
            <div style={styles.metaCard}>
              <p style={styles.metaLabel}>Inscription</p>
              <p style={styles.metaValeur}>{formatDate(e.date_inscription)}</p>
            </div>
          )}
          {e.capital_chf && (
            <div style={styles.metaCard}>
              <p style={styles.metaLabel}>Capital</p>
              <p style={styles.metaValeur}>{Number(e.capital_chf).toLocaleString('fr-CH')} CHF</p>
            </div>
          )}
          {e.ehraid && (
            <div style={styles.metaCard}>
              <p style={styles.metaLabel}>Identifiant EHRA</p>
              <p style={styles.metaValeur}>{e.ehraid}</p>
            </div>
          )}
        </div>

        {/* LIENS OFFICIELS */}
        <div style={styles.lienOfficielsBloc}>
          <p style={styles.blocLabel}>🔗 Sources officielles</p>
          <div style={styles.lienOfficielsRow}>
            {e.numero_ide && (
              <a
                href={`https://www.zefix.admin.ch/fr/search/entity/list?name=${e.numero_ide}&directLink=true`}
                target="_blank"
                rel="noreferrer"
                style={styles.lienOfficiel}
              >
                ↗ Fiche Zefix officielle
              </a>
            )}
            {e.canton === 'Genève' && e.numero_ide && (
              <a
                href={`http://app2.ge.ch/ecohrcinternet/extract?lang=FR&companyOfsUid=${formatUID(e.numero_ide)}`}
                target="_blank"
                rel="noreferrer"
                style={styles.lienOfficiel}
              >
                ↗ Extrait cantonal GE
              </a>
            )}
          </div>
        </div>

        {/* SECTION COORDONNÉES (placeholder pour plus tard) */}
        {(e.telephone || e.email || e.site_web) && (
          <div style={styles.bloc}>
            <p style={styles.blocLabel}>📞 Coordonnées</p>
            {e.telephone && <p style={styles.blocContenu}>📞 {e.telephone}</p>}
            {e.email && <p style={styles.blocContenu}>✉️ <a href={`mailto:${e.email}`} style={styles.lien}>{e.email}</a></p>}
            {e.site_web && (
              <p style={styles.blocContenu}>
                🌐 <a href={e.site_web} target="_blank" rel="noreferrer" style={styles.lien}>{e.site_web}</a>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function formatUID(uid) {
  // CHE418655496 -> CHE-418.655.496
  if (!uid || uid.length < 12) return uid
  const num = uid.replace('CHE', '')
  return `CHE-${num.substring(0, 3)}.${num.substring(3, 6)}.${num.substring(6, 9)}`
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const styles = {
  main: { minHeight: '100vh', background: '#f7f8fa', fontFamily: 'system-ui, sans-serif', padding: '20px' },
  container: { maxWidth: 800, margin: '0 auto' },
  retour: {
    display: 'inline-block', marginBottom: 20, color: '#534AB7',
    textDecoration: 'none', fontSize: 14, fontWeight: 500,
  },
  titre: { fontSize: 28, fontWeight: 800, margin: '0 0 12px', color: '#1a1a2e' },
  badgeRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  badgeForme: {
    background: '#eef0ff', color: '#534AB7', fontSize: 13, fontWeight: 600,
    padding: '5px 12px', borderRadius: 20,
  },
  badgeStatut: {
    background: '#e1f5ee', color: '#085041', fontSize: 13, fontWeight: 600,
    padding: '5px 12px', borderRadius: 20,
  },
  badgeStatutInactif: {
    background: '#faece7', color: '#993c1d', fontSize: 13, fontWeight: 600,
    padding: '5px 12px', borderRadius: 20,
  },
  badgeUid: {
    background: '#f5f5f7', color: '#555', fontSize: 13, fontWeight: 500,
    padding: '5px 12px', borderRadius: 20, fontFamily: 'monospace',
  },
  infoEnrichissement: {
    background: '#fef9e7', color: '#8a6d3b', padding: '10px 14px',
    borderRadius: 8, fontSize: 13, marginBottom: 20, border: '1px solid #fde9c2',
  },
  bloc: {
    background: '#fff', borderRadius: 10, padding: '16px 20px',
    marginBottom: 12, border: '1px solid #ececec',
  },
  blocLong: {
    background: '#fff', borderRadius: 10, padding: '16px 20px',
    marginBottom: 12, border: '1px solid #ececec',
  },
  blocLabel: { fontSize: 12, color: '#888', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  blocContenu: { fontSize: 15, margin: '4px 0', color: '#1a1a2e', lineHeight: 1.5 },
  blocContenuLong: { fontSize: 14, margin: 0, color: '#333', lineHeight: 1.7 },
  lienMap: { display: 'inline-block', marginTop: 8, color: '#534AB7', fontSize: 13, textDecoration: 'none', fontWeight: 500 },
  metaGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 10, marginBottom: 12,
  },
  metaCard: {
    background: '#fff', borderRadius: 10, padding: '12px 16px',
    border: '1px solid #ececec',
  },
  metaLabel: { fontSize: 11, color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  metaValeur: { fontSize: 15, margin: '4px 0 0', color: '#1a1a2e', fontWeight: 500 },
  lienOfficielsBloc: {
    background: '#fff', borderRadius: 10, padding: '16px 20px',
    marginBottom: 12, border: '1px solid #ececec',
  },
  lienOfficielsRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  lienOfficiel: {
    background: '#f5f5f7', color: '#1a1a2e', padding: '8px 14px',
    borderRadius: 6, fontSize: 13, textDecoration: 'none', fontWeight: 500,
    border: '1px solid #e0e0e0',
  },
  lien: { color: '#534AB7', textDecoration: 'none' },
  loading: { textAlign: 'center', color: '#888', padding: 60, fontSize: 16 },
  erreur: { textAlign: 'center', color: '#993c1d', padding: 40, fontSize: 16 },
}
