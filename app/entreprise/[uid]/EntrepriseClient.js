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
  const [similaires, setSimilaires] = useState([])
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
      setLoading(false)
      return
    }

    setEntreprise(data)

    // Récupérer 3 entreprises du même secteur (différentes)
    if (data.secteur_ia) {
      const { data: sim } = await supabase
        .from('entreprises')
        .select('id, nom, ville, canton, secteur_ia, numero_ide')
        .eq('secteur_ia', data.secteur_ia)
        .neq('numero_ide', uid)
        .limit(3)
      setSimilaires(sim || [])
    }

    setLoading(false)
  }

  // ─── Helpers d'affichage ───
  function formatUID(uid) {
    if (!uid) return ''
    const c = uid.replace(/\D/g, '')
    if (c.length !== 9) return uid
    return `CHE-${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`
  }

  function formatDate(d) {
    if (!d) return '—'
    const date = new Date(d)
    if (isNaN(date)) return d
    return date.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatCapital(c) {
    if (!c) return null
    const n = Number(c)
    if (isNaN(n)) return null
    if (n >= 1000) return { num: Math.round(n / 1000), unit: 'k' }
    return { num: n, unit: '' }
  }

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="state-screen">
          <p>Chargement…</p>
        </div>
        <style jsx>{globalStyles}</style>
      </>
    )
  }

  if (erreur || !entreprise) {
    return (
      <>
        <TopBar />
        <div className="state-screen">
          <Link href="/" className="retour-simple">← Retour à l&apos;annuaire</Link>
          <p className="erreur">{erreur || 'Entreprise introuvable'}</p>
        </div>
        <style jsx>{globalStyles}</style>
      </>
    )
  }

  const e = entreprise
  const uidF = formatUID(e.numero_ide)
  const capital = formatCapital(e.capital_chf)
  const adresseComplete = [e.adresse, e.npa && e.ville ? `${e.npa} ${e.ville}` : (e.ville || '')]
    .filter(Boolean).join(', ')
  const lienMaps = adresseComplete
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresseComplete)}`
    : null

  return (
    <>
      <TopBar />

      {/* BREADCRUMB */}
      <div className="breadcrumb-bar">
        <Link href="/" className="retour">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour à l&apos;annuaire
        </Link>
        <div className="breadcrumb-meta">
          {e.enrichie ? 'Fiche enrichie' : 'Fiche de base'}
          <span className="dot"></span>
          UID&nbsp;{uidF}
        </div>
      </div>

      {/* HERO FICHE */}
      <section className="fiche-hero">
        <div className="fiche-num">
          {e.secteur_ia ? `${e.secteur_ia} · ` : ''}
          {e.canton || '—'}
          {uidF ? ` · ${uidF}` : ''}
        </div>
        <h1 className="fiche-nom">
          {e.nom}
          {e.forme_juridique && (
            <span className="legal"> {abregeForme(e.forme_juridique)}</span>
          )}
        </h1>
        <div className="fiche-tags">
          {e.enrichie && <span className="tag accent">Fiche enrichie</span>}
          {e.forme_juridique && <span className="tag outline">{e.forme_juridique}</span>}
          {e.canton && <span className="tag outline">{e.canton}</span>}
          {e.ville && <span className="tag outline">{e.ville}</span>}
          {e.secteur_ia && <span className="tag active">{e.secteur_ia}</span>}
        </div>
      </section>

      {/* BODY 2 COLONNES */}
      <div className="fiche-body">
        {/* COLONNE GAUCHE */}
        <div className="col-main">
          {/* À propos */}
          {e.but_social && (
            <>
              <div className="section-label">À propos</div>
              <p className="about-text">{e.but_social}</p>
            </>
          )}

          {/* Localisation */}
          {(e.adresse || e.ville) && (
            <div className="address-block">
              <div className="section-label">Localisation</div>
              <div className="address-line">
                {e.adresse && <>{e.adresse},<br /></>}
                {e.npa} <em>{e.ville}</em>
              </div>
              <div className="address-actions">
                {lienMaps && (
                  <a href={lienMaps} target="_blank" rel="noreferrer" className="btn-mini accent">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Ouvrir dans Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Coordonnées */}
          {(e.telephone || e.email || e.site_web) && (
            <div className="contact-grid">
              <div className="section-label">Coordonnées</div>
              {e.telephone && (
                <div className="contact-row">
                  <div className="contact-label">Téléphone</div>
                  <div className="contact-value">
                    <a href={`tel:${e.telephone.replace(/\s/g, '')}`}>{e.telephone}</a>
                  </div>
                </div>
              )}
              {e.email && (
                <div className="contact-row">
                  <div className="contact-label">Email</div>
                  <div className="contact-value">
                    <a href={`mailto:${e.email}`}>{e.email}</a>
                  </div>
                </div>
              )}
              {e.site_web && (
                <div className="contact-row">
                  <div className="contact-label">Site web</div>
                  <div className="contact-value">
                    <a href={e.site_web} target="_blank" rel="noreferrer">
                      {e.site_web.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COLONNE DROITE */}
        <aside className="col-side">
          <div className="side-card">
            <div className="side-card-title">Fiche entreprise</div>

            {capital && (
              <div className="side-row">
                <span className="label">Capital</span>
                <span className="value big">
                  {capital.num}
                  <span className="accent">{capital.unit}</span>
                  <span className="unit">&nbsp;CHF</span>
                </span>
              </div>
            )}

            {e.date_inscription && (
              <div className="side-row">
                <span className="label">Inscription</span>
                <span className="value">{formatDate(e.date_inscription)}</span>
              </div>
            )}

            {e.forme_juridique && (
              <div className="side-row">
                <span className="label">Forme</span>
                <span className="value small">{e.forme_juridique}</span>
              </div>
            )}

            {e.ehraid && (
              <div className="side-row">
                <span className="label">EHRA-ID</span>
                <span className="value small italic">№&nbsp;{e.ehraid}</span>
              </div>
            )}

            {uidF && (
              <div className="side-row">
                <span className="label">UID</span>
                <span className="value tiny">{uidF}</span>
              </div>
            )}
          </div>

          {/* Sources officielles */}
          <div className="sources-card">
            <h4>Sources officielles</h4>
            {e.numero_ide && (
              <a
                className="source-link"
                href={`https://www.zefix.ch/fr/search/entity/list?name=${encodeURIComponent(e.numero_ide)}`}
                target="_blank"
                rel="noreferrer"
              >
                <span><em>Zefix</em> — Registre du commerce</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            )}
            {e.ehraid && (
              <a
                className="source-link"
                href={`https://ww2.eda.admin.ch/eda/fr/home.html`}
                target="_blank"
                rel="noreferrer"
              >
                <span><em>EHRA</em> — Fiche officielle</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-eyebrow">— C&apos;est votre entreprise&nbsp;?</div>
          <h2 className="cta-title">Reprenez la main sur <em>votre fiche</em>.</h2>
          <p className="cta-desc">
            Personnalisez votre description, ajoutez votre logo, vos photos et vos services.
            39,95&nbsp;CHF&nbsp;/&nbsp;an. Mise en avant dans les résultats de recherche.
          </p>
          <button className="btn-light">
            Référencer cette entreprise
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* SIMILAIRES */}
      {similaires.length > 0 && (
        <section className="similar-section">
          <div className="similar-head">
            <h2 className="similar-title">À découvrir <em>aussi</em>.</h2>
            <p className="similar-meta">
              Autres entreprises du secteur {e.secteur_ia} en Suisse romande.
            </p>
          </div>
          <div className="similar-cards">
            {similaires.map((s) => (
              <Link key={s.id} href={`/entreprise/${s.numero_ide}`} className="similar-card">
                <div className="similar-name">{s.nom}</div>
                <div className="similar-loc">
                  {s.ville || '—'} · {s.canton || '—'}
                </div>
                <div className="similar-sector">{s.secteur_ia}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <Footer />

      <style jsx global>{globalStyles}</style>
    </>
  )
}

// ─── Abréviation forme juridique pour le hero ───
function abregeForme(forme) {
  const map = {
    'Société anonyme': 'SA',
    'Société à responsabilité limitée': 'Sàrl',
    'Entreprise individuelle': '',
    'Association': '',
    'Fondation': '',
    'Succursale': '',
  }
  return map[forme] ?? ''
}

// ─── Top bar partagée ───
function TopBar() {
  return (
    <div className="topbar">
      <Link className="mark" href="/">
        Hélio<span style={{ color: 'var(--accent)' }}>.</span>
      </Link>
      <nav>
        <Link href="/">Annuaire</Link>
        <Link href="/">Secteurs</Link>
        <a href="#">Tarifs</a>
        <a href="#">Référencer</a>
      </nav>
    </div>
  )
}

// ─── Footer partagé ───
function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-pitch">
          <em>Hélio</em>, c&apos;est l&apos;annuaire B2B pensé pour les entreprises romandes qui
          veulent travailler avec d&apos;autres entreprises romandes.
        </div>
        <div className="footer-col">
          <h4>Annuaire</h4>
          <Link href="/">Toutes les entreprises</Link>
          <Link href="/">Par secteur</Link>
          <Link href="/">Par canton</Link>
        </div>
        <div className="footer-col">
          <h4>Hélio</h4>
          <a href="#">Tarifs</a>
          <a href="#">Référencer</a>
          <a href="#">À propos</a>
        </div>
      </div>

      <h2 className="footer-mark">
        Hél<span className="sun"></span>o<span className="accent">.</span>
      </h2>

      <div className="footer-base">
        <span>© 2026 Hélio</span>
        <span>Genève · Suisse romande</span>
        <span>CGU · Mentions légales</span>
      </div>
    </footer>
  )
}

// ─── Tous les styles, partagés via style jsx global ───
const globalStyles = `
  .topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 24px 40px;
    display: flex; align-items: center; justify-content: space-between;
    mix-blend-mode: difference; color: white;
  }
  .mark {
    font-family: var(--serif); font-weight: 600;
    font-size: 22px; letter-spacing: -0.02em;
  }
  .topbar nav { display: flex; gap: 32px; }
  .topbar nav a {
    font-size: 13px; font-weight: 500;
    letter-spacing: 0.04em; text-transform: uppercase;
    position: relative;
  }
  .topbar nav a::after {
    content: ''; position: absolute; bottom: -4px; left: 0;
    width: 0; height: 1px; background: currentColor;
    transition: width 0.3s ease;
  }
  .topbar nav a:hover::after { width: 100%; }

  .state-screen {
    min-height: 100vh;
    padding: 200px 40px 80px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: var(--serif);
    font-style: italic;
    font-size: 24px;
    color: var(--ink-soft);
    gap: 32px;
  }
  .retour-simple {
    font-family: var(--sans);
    font-size: 13px; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--ink);
    font-style: normal;
  }
  .erreur { color: var(--accent); }

  .breadcrumb-bar {
    padding: 120px 40px 0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .retour {
    font-size: 13px; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--ink-soft);
    display: inline-flex; align-items: center; gap: 10px;
    transition: color 0.2s, gap 0.2s;
  }
  .retour:hover { color: var(--accent); gap: 14px; }
  .breadcrumb-meta {
    font-family: var(--serif); font-style: italic;
    font-size: 14px; color: var(--ink-soft);
  }
  .breadcrumb-meta .dot {
    display: inline-block; width: 4px; height: 4px;
    background: var(--accent); border-radius: 50%;
    margin: 0 10px; vertical-align: 4px;
  }

  .fiche-hero { padding: 60px 40px 80px; }
  .fiche-num {
    font-family: var(--serif); font-style: italic; font-weight: 400;
    font-size: 18px; color: var(--ink-soft);
    margin-bottom: 24px;
  }
  .fiche-nom {
    font-family: var(--serif); font-weight: 500;
    font-size: clamp(48px, 9vw, 140px);
    line-height: 0.95; letter-spacing: -0.04em;
    margin-bottom: 40px; max-width: 1400px;
  }
  .fiche-nom .legal {
    font-style: italic; font-weight: 400; color: var(--accent);
  }
  .fiche-tags {
    display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 56px;
  }
  .tag {
    font-size: 12px; font-weight: 500;
    letter-spacing: 0.04em; text-transform: uppercase;
    padding: 8px 14px; border: 1px solid var(--ink);
    border-radius: 100px;
  }
  .tag.active { background: var(--ink); color: var(--bg); }
  .tag.accent { background: var(--accent); color: var(--paper); border-color: var(--accent); }
  .tag.outline { color: var(--ink-soft); border-color: var(--line); }

  .fiche-body {
    display: grid; grid-template-columns: 2fr 1fr;
    gap: 80px; padding: 0 40px; align-items: start;
  }
  .col-main { min-width: 0; }

  .section-label {
    font-family: var(--sans);
    font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.16em; color: var(--accent);
    margin-bottom: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-label::before {
    content: ''; width: 24px; height: 1px; background: var(--accent);
  }

  .about-text {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(20px, 2.2vw, 28px);
    line-height: 1.4; letter-spacing: -0.01em;
    color: var(--ink);
    margin-bottom: 80px; padding-bottom: 80px;
    border-bottom: 1px solid var(--line);
  }
  .about-text::first-letter {
    font-style: italic; color: var(--accent); font-weight: 500;
  }

  .address-block { margin-bottom: 80px; padding-bottom: 80px; border-bottom: 1px solid var(--line); }
  .address-line {
    font-family: var(--serif); font-weight: 500;
    font-size: clamp(28px, 3.5vw, 48px);
    line-height: 1.15; letter-spacing: -0.02em;
    margin-bottom: 24px;
  }
  .address-line em { font-style: italic; color: var(--accent); font-weight: 400; }
  .address-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  .btn-mini {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--sans);
    font-size: 13px; font-weight: 500;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--ink); background: transparent;
    border: 1px solid var(--ink);
    padding: 12px 20px; border-radius: 100px;
    transition: all 0.2s;
  }
  .btn-mini:hover { background: var(--ink); color: var(--bg); }
  .btn-mini.accent { background: var(--accent); color: var(--paper); border-color: var(--accent); }
  .btn-mini.accent:hover { background: var(--accent-dark); border-color: var(--accent-dark); }
  .btn-mini svg { width: 14px; height: 14px; }

  .contact-grid { margin-bottom: 80px; }
  .contact-row {
    display: grid; grid-template-columns: 200px 1fr;
    gap: 40px; padding: 28px 0;
    border-bottom: 1px solid var(--line);
    align-items: baseline;
  }
  .contact-row:first-of-type { border-top: 1px solid var(--line); }
  .contact-label {
    font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--ink-soft);
  }
  .contact-value {
    font-family: var(--serif);
    font-size: clamp(20px, 2vw, 26px);
    font-weight: 400; color: var(--ink);
  }
  .contact-value a {
    border-bottom: 1px solid currentColor;
    transition: color 0.2s, border-color 0.2s;
  }
  .contact-value a:hover { color: var(--accent); }

  .col-side { min-width: 0; position: sticky; top: 80px; }

  .side-card {
    background: var(--bg-dark); color: var(--bg);
    padding: 40px 32px; margin-bottom: 16px;
  }
  .side-card-title {
    font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.16em; color: var(--accent);
    margin-bottom: 32px;
  }
  .side-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 18px 0;
    border-bottom: 1px solid rgba(242, 237, 229, 0.12);
    gap: 16px;
  }
  .side-row:last-child { border-bottom: none; }
  .side-row .label {
    font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.08em; color: rgba(242, 237, 229, 0.55);
  }
  .side-row .value {
    font-family: var(--serif); font-size: 18px; font-weight: 500;
    text-align: right;
  }
  .side-row .value.big { font-size: 28px; letter-spacing: -0.015em; }
  .side-row .value.small { font-size: 14px; }
  .side-row .value.tiny { font-size: 13px; color: rgba(242, 237, 229, 0.7); }
  .side-row .value.italic { font-style: italic; color: rgba(242, 237, 229, 0.7); }
  .side-row .value .accent { color: var(--accent); font-style: italic; font-weight: 400; }
  .side-row .value .unit {
    font-size: 14px; font-style: italic; font-weight: 400;
    color: rgba(242, 237, 229, 0.55);
  }

  .sources-card {
    background: var(--paper); border: 1px solid var(--line);
    padding: 32px;
  }
  .sources-card h4 {
    font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.16em; color: var(--ink-soft);
    margin-bottom: 24px; font-weight: 500;
  }
  .source-link {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0; border-bottom: 1px solid var(--line);
    font-family: var(--serif); font-size: 16px;
    transition: padding 0.2s, color 0.2s;
  }
  .source-link:last-child { border-bottom: none; }
  .source-link:hover { padding-left: 4px; color: var(--accent); }
  .source-link em { font-style: italic; }
  .source-link svg { width: 14px; height: 14px; flex-shrink: 0; }

  .cta-section {
    margin-top: 100px;
    background: var(--accent); color: var(--paper);
    padding: 100px 40px;
    position: relative; overflow: hidden;
  }
  .cta-section::before {
    content: '✦'; position: absolute;
    top: -100px; right: -50px;
    font-size: 500px;
    color: rgba(250, 246, 238, 0.06);
    line-height: 1; pointer-events: none;
  }
  .cta-inner { max-width: 900px; position: relative; z-index: 1; }
  .cta-eyebrow {
    font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.16em; margin-bottom: 24px; opacity: 0.8;
  }
  .cta-title {
    font-family: var(--serif); font-weight: 500;
    font-size: clamp(40px, 5.5vw, 80px);
    line-height: 1; letter-spacing: -0.03em;
    margin-bottom: 32px;
  }
  .cta-title em { font-style: italic; }
  .cta-desc {
    font-size: 18px; line-height: 1.6;
    max-width: 600px; margin-bottom: 48px; opacity: 0.9;
  }
  .btn-light {
    display: inline-flex; align-items: center; gap: 14px;
    font-size: 14px; font-weight: 500;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--ink); background: var(--paper);
    border: none; padding: 20px 32px;
    border-radius: 100px; transition: all 0.2s;
  }
  .btn-light:hover { background: var(--bg-dark); color: var(--paper); }
  .btn-light svg { width: 16px; height: 16px; transition: transform 0.3s; }
  .btn-light:hover svg { transform: translateX(4px); }

  .similar-section { padding: 100px 40px; }
  .similar-head {
    margin-bottom: 60px; padding-bottom: 32px;
    border-bottom: 1px solid var(--ink);
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 40px; align-items: end;
  }
  .similar-title {
    font-family: var(--serif); font-weight: 500;
    font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1; letter-spacing: -0.025em;
  }
  .similar-title em { font-style: italic; color: var(--accent); font-weight: 400; }
  .similar-meta {
    font-size: 14px; color: var(--ink-soft);
    justify-self: end; max-width: 320px; text-align: right;
  }
  .similar-cards {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1px; background: var(--line);
    border: 1px solid var(--line);
  }
  .similar-card {
    background: var(--bg);
    padding: 28px 24px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative; overflow: hidden;
    min-height: 240px;
    display: flex; flex-direction: column;
    color: inherit;
  }
  .similar-card::before {
    content: ''; position: absolute; inset: 0;
    background: var(--ink);
    transform: translateY(101%);
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .similar-card > * { position: relative; z-index: 1; }
  .similar-card:hover::before { transform: translateY(0); }
  .similar-card:hover { color: var(--bg); }
  .similar-card:hover .similar-loc { color: rgba(242, 237, 229, 0.6); }
  .similar-card:hover .similar-sector { border-color: rgba(242, 237, 229, 0.3); }

  .similar-name {
    font-family: var(--serif); font-weight: 500;
    font-size: 22px; line-height: 1.15;
    margin-bottom: 8px; letter-spacing: -0.015em;
  }
  .similar-loc {
    font-size: 13px; color: var(--ink-soft);
    margin-bottom: auto; transition: color 0.3s;
  }
  .similar-sector {
    font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.08em;
    padding-top: 16px; margin-top: 24px;
    border-top: 1px solid var(--line);
    transition: border-color 0.3s;
  }

  footer {
    background: var(--ink); color: var(--bg);
    padding: 80px 40px 0; overflow: hidden;
  }
  .footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1fr;
    gap: 60px; margin-bottom: 80px;
  }
  .footer-pitch {
    font-family: var(--serif); font-weight: 400;
    font-size: clamp(22px, 2.4vw, 30px);
    line-height: 1.25; letter-spacing: -0.015em;
    max-width: 480px;
  }
  .footer-pitch em { font-style: italic; color: var(--accent); }
  .footer-col h4 {
    font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(242, 237, 229, 0.5);
    margin-bottom: 16px; font-weight: 500;
  }
  .footer-col a {
    display: block; font-size: 14px;
    padding: 4px 0; color: var(--bg);
    opacity: 0.85;
    transition: opacity 0.2s, transform 0.2s;
  }
  .footer-col a:hover { opacity: 1; transform: translateX(4px); }
  .footer-mark {
    font-family: var(--serif); font-weight: 500;
    font-size: clamp(140px, 28vw, 440px);
    line-height: 0.8; letter-spacing: -0.055em;
    color: var(--bg);
    margin: 0 -10px -40px;
    user-select: none;
  }
  .footer-mark .sun {
    display: inline-block; width: 0.22em; height: 0.22em;
    border-radius: 50%; background: var(--accent);
    vertical-align: 0.85em; margin: 0 0.02em;
  }
  .footer-mark .accent { color: var(--accent); font-style: italic; font-weight: 400; }
  .footer-base {
    border-top: 1px solid rgba(242, 237, 229, 0.15);
    padding: 28px 0;
    display: flex; justify-content: space-between;
    font-size: 12px; color: rgba(242, 237, 229, 0.5);
    letter-spacing: 0.04em;
  }

  @media (max-width: 900px) {
    .topbar { padding: 16px 20px; }
    .topbar nav { gap: 16px; }
    .topbar nav a { font-size: 11px; }
    .breadcrumb-bar { padding: 90px 20px 0; flex-direction: column; align-items: flex-start; gap: 16px; }
    .fiche-hero { padding: 40px 20px 60px; }
    .fiche-body { grid-template-columns: 1fr; gap: 60px; padding: 0 20px; }
    .col-side { position: static; }
    .contact-row { grid-template-columns: 1fr; gap: 8px; }
    .cta-section { padding: 60px 20px; margin-top: 60px; }
    .similar-section { padding: 60px 20px; }
    .similar-head { grid-template-columns: 1fr; }
    .similar-meta { justify-self: start; text-align: left; }
    .similar-cards { grid-template-columns: 1fr; }
    footer { padding: 60px 20px 0; }
    .footer-grid { grid-template-columns: 1fr; gap: 40px; }
  }
`
