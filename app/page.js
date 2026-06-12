'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const SECTEURS = [
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

const CANTONS = ['Genève', 'Vaud', 'Valais', 'Fribourg', 'Neuchâtel', 'Jura', 'Berne']

const PAR_PAGE = 30

export default function Home() {
  const [recherche, setRecherche] = useState('')
  const [secteur, setSecteur] = useState(null) // null = tous
  const [canton, setCanton] = useState(null)
  const [entreprises, setEntreprises] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [filtresOuverts, setFiltresOuverts] = useState(false)

  useEffect(() => {
    setPage(0)
  }, [recherche, secteur, canton])

  useEffect(() => {
    fetchEntreprises()
  }, [recherche, secteur, canton, page])

  async function fetchEntreprises() {
    setLoading(true)
    const debut = page * PAR_PAGE
    const fin = debut + PAR_PAGE - 1

    let query = supabase
      .from('entreprises')
      .select(
        'id, nom, canton, ville, adresse, npa, forme_juridique, secteur_ia, but_social, numero_ide, enrichie',
        { count: 'exact' }
      )
      .order('nom')
      .range(debut, fin)

    if (recherche) query = query.ilike('nom', `%${recherche}%`)
    if (secteur) query = query.eq('secteur_ia', secteur)
    if (canton) query = query.eq('canton', canton)

    const { data, count } = await query
    setEntreprises(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(total / PAR_PAGE)

  function tronquer(texte, max = 160) {
    if (!texte) return ''
    return texte.length > max ? texte.slice(0, max).trim() + '…' : texte
  }

  function uidFormate(uid) {
    if (!uid) return ''
    // CHE123456789 -> CHE-123.456.789
    const c = uid.replace(/\D/g, '')
    if (c.length !== 9) return uid
    return `CHE-${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`
  }

  return (
    <>
      {/* ─── TOP BAR ─── */}
      <div className="topbar">
        <Link className="mark" href="/">
          Hélio<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <nav>
          <a href="#annuaire">Annuaire</a>
          <a href="#secteurs">Secteurs</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#referencer">Référencer</a>
        </nav>
      </div>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-top">
          <div className="hero-meta">
            <span className="dot"></span>
            Édition 2026 · Annuaire B2B Suisse romande
          </div>
          <p className="hero-tag-right">
            {total > 0 ? total.toLocaleString('fr-CH') : '40 386'} entreprises romandes vérifiées,
            classées et mises à jour quotidiennement.
          </p>
        </div>

        <h1 className="wordmark">
          Hél<span className="sun"></span>o
          <span className="accent">.</span>
        </h1>

        <div className="hero-bottom">
          <p className="hero-claim">
            L&apos;annuaire B2B qui relie <em>les entreprises romandes</em> aux partenaires
            qu&apos;elles n&apos;auraient jamais trouvés autrement.
          </p>
          <div className="hero-cta">
            <a href="#annuaire" className="btn-arrow">
              Explorer l&apos;annuaire
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE CANTONS ─── */}
      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 2 }).flatMap((_, copy) =>
            CANTONS.map((c, i) => (
              <span key={`${copy}-${i}`}>
                {c}<span className="star">&nbsp;✦&nbsp;</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ─── ANNUAIRE : RECHERCHE + FILTRES + RÉSULTATS ─── */}
      <section className="annuaire-section" id="annuaire">
        <div className="section-header">
          <div>
            <span className="section-num">— 01 / Annuaire</span>
            <h2 className="section-title-big">
              {recherche || secteur || canton ? (
                <>Résultats <em>filtrés</em>.</>
              ) : (
                <>Trouvez la bonne <em>entreprise</em>.</>
              )}
            </h2>
          </div>
          <p className="section-desc">
            {total.toLocaleString('fr-CH')} entreprise{total > 1 ? 's' : ''} trouvée
            {total > 1 ? 's' : ''}
            {totalPages > 1 && ` · Page ${page + 1} sur ${totalPages}`}
          </p>
        </div>

        {/* Barre de recherche + bouton filtres */}
        <div className="search-bar">
          <div className="search-input-wrap">
            <input
              className="search-input"
              type="text"
              placeholder="ex. fiduciaire, lausanne, restauration…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <button className="search-submit" aria-label="Rechercher">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <button
            className={`filters-toggle ${filtresOuverts ? 'active' : ''}`}
            onClick={() => setFiltresOuverts(!filtresOuverts)}
          >
            Filtres
            {(secteur || canton) && <span className="filters-dot"></span>}
            <svg
              className="filters-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Panneau filtres (accordéon) */}
        <div className={`filters-panel ${filtresOuverts ? 'open' : ''}`}>
          <div className="filters-panel-inner">
            {/* Filtres secteurs */}
            <div className="filter-grid">
              <button
                className={`filter-tag ${secteur === null ? 'active' : ''}`}
                onClick={() => setSecteur(null)}
              >
                Tous les secteurs
              </button>
              {SECTEURS.map((s) => (
                <button
                  key={s}
                  className={`filter-tag ${secteur === s ? 'active' : ''}`}
                  onClick={() => setSecteur(secteur === s ? null : s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Filtres cantons */}
            <div className="canton-row">
              <span className="canton-label">Cantons</span>
              <button
                className={`canton-chip ${canton === null ? 'active' : ''}`}
                onClick={() => setCanton(null)}
              >
                Tous
              </button>
              {CANTONS.map((c) => (
                <button
                  key={c}
                  className={`canton-chip ${canton === c ? 'active' : ''}`}
                  onClick={() => setCanton(canton === c ? null : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Résultats */}
        {loading && page === 0 ? (
          <p className="loading">Chargement…</p>
        ) : entreprises.length === 0 ? (
          <p className="empty">Aucune entreprise ne correspond à votre recherche.</p>
        ) : (
          <div className="cards">
            {entreprises.map((e, i) => (
              <Link key={e.id} href={`/entreprise/${e.numero_ide}`} className="card">
                <div className="card-head">
                  <span className="card-num">
                    {String(page * PAR_PAGE + i + 1).padStart(2, '0')}
                  </span>
                  <span className="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </span>
                </div>
                <h3 className="card-name">{e.nom}</h3>
                <div className="card-loc">
                  {e.ville || '—'} · {e.canton || '—'}
                </div>
                <p className="card-desc">
                  {e.but_social
                    ? tronquer(e.but_social)
                    : `${e.forme_juridique || 'Entreprise'} basée en Suisse romande, inscrite au registre du commerce.`}
                </p>
                <div className="card-sector">{e.secteur_ia || e.forme_juridique || 'Non classé'}</div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              ← Précédent
            </button>
            <span className="page-info">
              <em>{page + 1}</em> / {totalPages}
            </span>
            <button
              className="page-btn"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Suivant →
            </button>
          </div>
        )}
      </section>

      {/* ─── STATS ÉDITORIAL ─── */}
      <section className="stats-editorial">
        <div className="stat-block">
          <div className="stat-num">
            40<span className="accent">k</span>
          </div>
          <div className="stat-label">Entreprises romandes référencées</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">14</div>
          <div className="stat-label">Secteurs d&apos;activité classés</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">7</div>
          <div className="stat-label">Cantons de Suisse romande</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">
            <span className="accent">↑</span>100
          </div>
          <div className="stat-label">Fiches enrichies par jour</div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="footer-grid">
          <div className="footer-pitch">
            <em>Hélio</em>, c&apos;est l&apos;annuaire B2B pensé pour les entreprises romandes qui
            veulent travailler avec d&apos;autres entreprises romandes.
          </div>
          <div className="footer-col">
            <h4>Annuaire</h4>
            <a href="#annuaire">Toutes les entreprises</a>
            <a href="#annuaire">Par secteur</a>
            <a href="#annuaire">Par canton</a>
          </div>
          <div className="footer-col">
            <h4>Hélio</h4>
            <a href="#tarifs">Tarifs</a>
            <a href="#referencer">Référencer</a>
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

      {/* ─── STYLES DE LA PAGE ─── */}
      <style jsx>{`
        .topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 24px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          mix-blend-mode: difference;
          color: white;
        }
        .mark {
          font-family: var(--serif);
          font-weight: 600;
          font-size: 22px;
          letter-spacing: -0.02em;
        }
        nav { display: flex; gap: 32px; }
        nav a {
          font-size: 13px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase;
          position: relative;
        }
        nav a::after {
          content: ''; position: absolute; bottom: -4px; left: 0;
          width: 0; height: 1px; background: currentColor;
          transition: width 0.3s ease;
        }
        nav a:hover::after { width: 100%; }

        .hero {
          min-height: 100vh;
          padding: 140px 40px 80px;
          display: flex; flex-direction: column;
          justify-content: space-between;
        }
        .hero-top {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: end;
        }
        .hero-meta {
          font-size: 13px; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--ink-soft);
        }
        .hero-meta .dot {
          display: inline-block; width: 6px; height: 6px;
          background: var(--accent); border-radius: 50%;
          margin-right: 8px; vertical-align: middle;
          animation: pulse 2s ease-in-out infinite;
        }
        .hero-tag-right {
          font-size: 13px; color: var(--ink-soft);
          text-align: right; max-width: 320px;
          justify-self: end; line-height: 1.5;
        }

        .wordmark {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(120px, 26vw, 380px);
          line-height: 0.85;
          letter-spacing: -0.055em;
          color: var(--ink);
          margin: 60px 0 40px;
          user-select: none;
        }
        .wordmark .accent { color: var(--accent); font-style: italic; font-weight: 400; }
        .wordmark .sun {
          display: inline-block;
          width: 0.22em; height: 0.22em;
          border-radius: 50%; background: var(--accent);
          vertical-align: 0.85em; margin: 0 0.02em;
          animation: rotate 12s linear infinite;
          transition: box-shadow 0.4s;
        }
        .wordmark:hover .sun {
          box-shadow: 0 0 60px 6px rgba(212, 80, 42, 0.4);
        }

        .hero-bottom {
          display: grid; grid-template-columns: 2fr 1fr;
          gap: 60px; align-items: end;
        }
        .hero-claim {
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(24px, 2.8vw, 36px);
          line-height: 1.15; letter-spacing: -0.02em;
          max-width: 640px;
        }
        .hero-claim em { font-style: italic; color: var(--accent); }
        .hero-cta { justify-self: end; }
        .btn-arrow {
          display: inline-flex; align-items: center; gap: 14px;
          font-size: 14px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase;
          color: var(--ink); background: transparent;
          border: 1px solid var(--ink);
          padding: 18px 28px; border-radius: 100px;
          cursor: pointer; transition: all 0.3s;
        }
        .btn-arrow svg { width: 16px; height: 16px; transition: transform 0.3s; }
        .btn-arrow:hover { background: var(--ink); color: var(--bg); }
        .btn-arrow:hover svg { transform: translateX(4px); }

        .marquee {
          background: var(--accent);
          color: var(--paper);
          padding: 28px 0;
          overflow: hidden;
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          white-space: nowrap;
        }
        .marquee-track {
          display: inline-block;
          animation: scroll 30s linear infinite;
          font-family: var(--serif);
          font-size: 32px;
          font-style: italic;
        }
        .marquee-track .star {
          color: var(--paper);
          font-style: normal;
          transform: scale(0.6);
          display: inline-block;
        }

        .annuaire-section {
          padding: 120px 40px 80px;
        }

        .search-bar {
          display: flex;
          gap: 16px;
          align-items: stretch;
          margin-bottom: 16px;
        }
        .search-input-wrap {
          flex: 1;
          position: relative;
          border-bottom: 1px solid var(--ink);
          padding: 16px 60px 16px 0;
        }
        .search-input {
          width: 100%; border: none; background: transparent; outline: none;
          font-family: var(--serif);
          font-size: clamp(20px, 2.2vw, 28px);
          font-weight: 400; color: var(--ink); font-style: italic;
        }
        .search-input::placeholder { color: var(--ink-mute); font-style: italic; }
        .search-submit {
          position: absolute; right: 0; top: 50%;
          transform: translateY(-50%);
          width: 48px; height: 48px;
          border-radius: 50%; background: var(--ink); color: var(--bg);
          border: none; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .search-submit svg { width: 20px; height: 20px; }
        .search-submit:hover { background: var(--accent); }

        .filters-toggle {
          display: flex; align-items: center; gap: 10px;
          background: transparent;
          border: 1px solid var(--ink);
          color: var(--ink);
          padding: 0 24px;
          font-size: 13px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase;
          border-radius: 100px;
          white-space: nowrap;
          transition: all 0.2s;
          position: relative;
        }
        .filters-toggle:hover { background: var(--ink); color: var(--bg); }
        .filters-toggle.active { background: var(--ink); color: var(--bg); }
        .filters-toggle .filters-chevron {
          width: 14px; height: 14px;
          transition: transform 0.3s;
        }
        .filters-toggle.active .filters-chevron { transform: rotate(180deg); }
        .filters-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
        }

        .filters-panel {
          display: grid;
          grid-template-rows: 0fr;
          overflow: hidden;
          transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .filters-panel.open {
          grid-template-rows: 1fr;
        }
        .filters-panel-inner {
          min-height: 0;
          overflow: hidden;
          padding-top: 24px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
          margin-bottom: 24px;
        }
        .filter-tag {
          font-family: var(--sans);
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink-soft);
          padding: 12px 16px;
          font-size: 13px; font-weight: 500;
          border-radius: 4px;
          transition: all 0.2s;
          text-align: left;
        }
        .filter-tag:hover { border-color: var(--ink); color: var(--ink); }
        .filter-tag.active {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }

        .canton-row {
          display: flex; flex-wrap: wrap; gap: 8px;
          align-items: center;
          padding-top: 24px;
          padding-bottom: 40px;
          border-top: 1px solid var(--line);
        }
        .canton-label {
          font-size: 12px; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--ink-mute);
          margin-right: 12px;
        }
        .canton-chip {
          background: transparent; border: 1px solid var(--line);
          color: var(--ink-soft); padding: 6px 14px;
          font-size: 12px; font-weight: 500;
          border-radius: 100px;
          transition: all 0.2s;
        }
        .canton-chip:hover { border-color: var(--ink); color: var(--ink); }
        .canton-chip.active {
          background: var(--accent); color: var(--paper);
          border-color: var(--accent);
        }

        .stats-editorial {
          padding: 80px 40px;
          background: var(--bg-dark); color: var(--bg);
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 60px;
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
        }
        .stat-block {
          border-left: 1px solid rgba(242, 237, 229, 0.2);
          padding-left: 20px;
        }
        .stat-block:first-child { border-left: none; padding-left: 0; }
        .stat-num {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(48px, 6vw, 90px);
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin-bottom: 16px;
        }
        .stat-num .accent { color: var(--accent); font-style: italic; font-weight: 400; }
        .stat-label {
          font-size: 12px; text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(242, 237, 229, 0.6);
          max-width: 200px;
        }

        .section-header {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: end;
          margin-bottom: 60px;
          border-bottom: 1px solid var(--ink);
          padding-bottom: 32px;
        }
        .section-num {
          font-family: var(--serif);
          font-style: italic;
          font-size: 16px; color: var(--ink-soft);
          margin-bottom: 16px;
          display: block;
        }
        .section-title-big {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1; letter-spacing: -0.025em;
        }
        .section-title-big em { font-style: italic; color: var(--accent); font-weight: 400; }
        .section-desc {
          font-size: 16px; color: var(--ink-soft);
          max-width: 380px;
          justify-self: end;
        }

        .loading, .empty {
          text-align: center; padding: 80px 0;
          font-family: var(--serif);
          font-size: 20px; font-style: italic;
          color: var(--ink-soft);
        }

        .cards {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--line);
          border: 1px solid var(--line);
        }
        .card {
          background: var(--bg); padding: 32px 28px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          min-height: 320px;
          color: inherit;
        }
        .card:hover {
          background: var(--bg-warm);
        }
        .card::before {
          content: ''; position: absolute; inset: 0;
          background: var(--ink);
          transform: translateY(101%);
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 0;
        }
        .card > * { position: relative; z-index: 1; }
        .card:hover::before { transform: translateY(0); }
        .card:hover { color: var(--bg); }
        .card:hover .card-num { color: var(--accent); }
        .card:hover .card-sector {
          border-color: rgba(242, 237, 229, 0.3);
          color: var(--bg);
        }
        .card:hover .card-loc { color: rgba(242, 237, 229, 0.6); }
        .card:hover .card-desc { color: rgba(242, 237, 229, 0.7); }
        .card:hover .card-arrow svg { color: var(--accent); }
        .card:hover .card-arrow { transform: translate(4px, -4px); }

        .card-head {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 32px;
        }
        .card-num {
          font-family: var(--serif);
          font-style: italic;
          font-size: 14px; color: var(--ink-soft);
          transition: color 0.3s;
        }
        .card-arrow {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .card-arrow svg { width: 100%; height: 100%; transition: color 0.3s; }
        .card-name {
          font-family: var(--serif);
          font-weight: 500; font-size: 22px;
          line-height: 1.15; letter-spacing: -0.015em;
          margin-bottom: 12px;
        }
        .card-loc {
          font-size: 13px; color: var(--ink-soft);
          margin-bottom: 24px;
          transition: color 0.3s;
        }
        .card-desc {
          font-size: 14px; line-height: 1.55;
          color: var(--ink-soft);
          margin-bottom: 24px; flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s;
        }
        .card-sector {
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ink);
          padding-top: 16px;
          border-top: 1px solid var(--line);
          transition: all 0.3s;
        }

        .pagination {
          display: flex; justify-content: center; align-items: center;
          gap: 32px; margin-top: 60px;
        }
        .page-btn {
          background: transparent; border: 1px solid var(--ink);
          color: var(--ink);
          padding: 14px 24px; border-radius: 100px;
          font-size: 13px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.04em;
          transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) { background: var(--ink); color: var(--bg); }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .page-info {
          font-family: var(--serif);
          font-size: 18px;
          color: var(--ink-soft);
        }
        .page-info em { font-style: italic; color: var(--accent); font-weight: 500; }

        footer {
          background: var(--ink); color: var(--bg);
          padding: 80px 40px 0;
          overflow: hidden;
        }
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          gap: 60px; margin-bottom: 80px;
        }
        .footer-pitch {
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(24px, 2.5vw, 32px);
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
          padding: 4px 0;
          color: var(--bg); opacity: 0.85;
          transition: opacity 0.2s, transform 0.2s;
        }
        .footer-col a:hover { opacity: 1; transform: translateX(4px); }

        .footer-mark {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(160px, 30vw, 480px);
          line-height: 0.8;
          letter-spacing: -0.055em;
          color: var(--bg);
          margin: 0 -10px -40px;
          user-select: none;
        }
        .footer-mark .sun {
          display: inline-block;
          width: 0.22em; height: 0.22em;
          border-radius: 50%; background: var(--accent);
          vertical-align: 0.85em;
          margin: 0 0.02em;
        }
        .footer-mark .accent {
          color: var(--accent);
          font-style: italic;
          font-weight: 400;
        }
        .footer-base {
          border-top: 1px solid rgba(242, 237, 229, 0.15);
          padding: 28px 0;
          display: flex; justify-content: space-between;
          font-size: 12px;
          color: rgba(242, 237, 229, 0.5);
          letter-spacing: 0.04em;
        }

        @media (max-width: 900px) {
          .topbar { padding: 16px 20px; }
          nav { gap: 16px; }
          nav a { font-size: 11px; }
          .hero { padding: 100px 20px 40px; }
          .hero-top { grid-template-columns: 1fr; }
          .hero-tag-right { justify-self: start; text-align: left; max-width: 100%; }
          .hero-bottom { grid-template-columns: 1fr; }
          .hero-cta { justify-self: start; }
          .search-section { grid-template-columns: 1fr; padding: 60px 20px; gap: 40px; }
          .stats-editorial { grid-template-columns: repeat(2, 1fr); gap: 30px; padding: 60px 20px; }
          .stat-block:nth-child(3) { border-left: none; padding-left: 0; }
          .annuaire-section { padding: 60px 20px; }
          .section-header { grid-template-columns: 1fr; }
          .search-bar { flex-direction: column; }
          .filters-toggle { justify-content: center; padding: 14px; }
          .section-desc { justify-self: start; }
          .cards { grid-template-columns: 1fr; }
          footer { padding: 60px 20px 0; }
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .marquee-track { font-size: 22px; }
        }
      `}</style>
    </>
  )
}
