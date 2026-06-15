'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function JournalPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionUser, setSessionUser] = useState(null)
  const [themeActif, setThemeActif] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSessionUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function charger() {
      setLoading(true)
      const { data } = await supabase
        .from('articles')
        .select('slug, titre, chapo, theme, temps_lecture, sponsor_nom, publie_le')
        .eq('publie', true)
        .order('publie_le', { ascending: false })
      setArticles(data || [])
      setLoading(false)
    }
    charger()
  }, [])

  // Liste des thèmes présents (pour les filtres)
  const themes = [...new Set(articles.map((a) => a.theme).filter(Boolean))]
  const articlesFiltres = themeActif
    ? articles.filter((a) => a.theme === themeActif)
    : articles

  const [aLaUne, ...autres] = articlesFiltres

  function formatDate(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-CH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="journal-page">
      {/* Top bar */}
      <header className="jp-top">
        <Link className="jp-mark" href="/">
          Hélio<span className="dot-accent">.</span>
        </Link>
        <nav className="jp-nav">
          <Link href="/#annuaire">Annuaire</Link>
          <Link href="/journal" className="actif">Le Journal</Link>
          <Link href="/tarifs">Tarifs</Link>
          <Link href={sessionUser ? '/compte' : '/connexion'} className="jp-account">
            {sessionUser ? 'Mon compte' : 'Se connecter'}
          </Link>
        </nav>
      </header>

      <main className="jp-main">
        {/* En-tête éditorial */}
        <div className="jp-header">
          <span className="jp-eyebrow">— Le Journal</span>
          <h1 className="jp-title">
            Comprendre le <em>B2B romand</em>.
          </h1>
          <p className="jp-sub">
            Analyses, conseils et décryptages pour les entreprises de Suisse romande. Par l&apos;équipe
            Hélio.
          </p>
        </div>

        {/* Filtres par thème */}
        {themes.length > 0 && (
          <div className="jp-themes">
            <button
              className={`theme-chip ${themeActif === null ? 'actif' : ''}`}
              onClick={() => setThemeActif(null)}
            >
              Tous les sujets
            </button>
            {themes.map((t) => (
              <button
                key={t}
                className={`theme-chip ${themeActif === t ? 'actif' : ''}`}
                onClick={() => setThemeActif(themeActif === t ? null : t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="jp-loading">Chargement…</p>
        ) : articlesFiltres.length === 0 ? (
          <p className="jp-empty">Aucun article pour le moment. Revenez bientôt.</p>
        ) : (
          <>
            {/* Article à la une */}
            {aLaUne && (
              <Link href={`/journal/${aLaUne.slug}`} className="une">
                <div className="une-meta">
                  {aLaUne.theme && <span className="une-theme">{aLaUne.theme}</span>}
                  {aLaUne.sponsor_nom && (
                    <span className="une-sponsor">En partenariat avec {aLaUne.sponsor_nom}</span>
                  )}
                </div>
                <h2 className="une-titre">{aLaUne.titre}</h2>
                <p className="une-chapo">{aLaUne.chapo}</p>
                <div className="une-bas">
                  <span>{formatDate(aLaUne.publie_le)}</span>
                  <span>·</span>
                  <span>{aLaUne.temps_lecture} min de lecture</span>
                  <span className="une-fleche">→</span>
                </div>
              </Link>
            )}

            {/* Les autres en grille */}
            {autres.length > 0 && (
              <div className="grille">
                {autres.map((a) => (
                  <Link key={a.slug} href={`/journal/${a.slug}`} className="art-card">
                    <div className="art-meta">
                      {a.theme && <span className="art-theme">{a.theme}</span>}
                      {a.sponsor_nom && <span className="art-sponsor">Partenaire</span>}
                    </div>
                    <h3 className="art-titre">{a.titre}</h3>
                    <p className="art-chapo">{a.chapo}</p>
                    <div className="art-bas">
                      <span>{formatDate(a.publie_le)}</span>
                      <span>·</span>
                      <span>{a.temps_lecture} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        .journal-page {
          min-height: 100vh;
          background: var(--bg);
        }
        .jp-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid var(--line);
          flex-wrap: wrap;
          gap: 16px;
        }
        .jp-mark {
          font-family: var(--serif);
          font-weight: 600;
          font-size: 22px;
          letter-spacing: -0.02em;
        }
        .dot-accent {
          color: var(--accent);
          font-style: italic;
        }
        .jp-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .jp-nav :global(a) {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          transition: color 0.2s;
        }
        .jp-nav :global(a):hover {
          color: var(--ink);
        }
        .jp-nav :global(a.actif) {
          color: var(--accent);
        }
        .jp-nav :global(.jp-account) {
          border: 1px solid var(--ink);
          color: var(--ink);
          padding: 8px 18px;
          border-radius: 100px;
        }
        .jp-nav :global(.jp-account):hover {
          background: var(--ink);
          color: var(--bg);
        }

        .jp-main {
          max-width: 1080px;
          margin: 0 auto;
          padding: 72px 40px 100px;
        }
        .jp-header {
          margin-bottom: 48px;
          max-width: 680px;
        }
        .jp-eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--ink-soft);
          margin-bottom: 16px;
          display: block;
        }
        .jp-title {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(42px, 6vw, 72px);
          line-height: 1;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .jp-title em {
          font-style: italic;
          color: var(--accent);
          font-weight: 400;
        }
        .jp-sub {
          font-size: 17px;
          color: var(--ink-soft);
          line-height: 1.6;
        }

        .jp-themes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 48px;
        }
        .theme-chip {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink-soft);
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .theme-chip:hover {
          border-color: var(--ink);
          color: var(--ink);
        }
        .theme-chip.actif {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }

        .jp-loading,
        .jp-empty {
          font-family: var(--serif);
          font-style: italic;
          font-size: 18px;
          color: var(--ink-soft);
          padding: 40px 0;
        }

        /* Article à la une */
        .une {
          display: block;
          background: var(--ink);
          color: var(--bg);
          border-radius: 16px;
          padding: 56px;
          margin-bottom: 48px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .une:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
        }
        .une-meta {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
        }
        .une-theme {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          font-weight: 600;
        }
        .une-sponsor {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(242, 237, 229, 0.6);
          border: 1px solid rgba(242, 237, 229, 0.25);
          padding: 4px 10px;
          border-radius: 100px;
        }
        .une-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.08;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          max-width: 760px;
        }
        .une-chapo {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(242, 237, 229, 0.75);
          max-width: 640px;
          margin-bottom: 32px;
        }
        .une-bas {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: rgba(242, 237, 229, 0.6);
        }
        .une-fleche {
          margin-left: auto;
          font-size: 24px;
          color: var(--accent);
        }

        /* Grille des autres articles */
        .grille {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .art-card {
          display: flex;
          flex-direction: column;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 36px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .art-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
          border-color: var(--ink);
        }
        .art-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }
        .art-theme {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          font-weight: 600;
        }
        .art-sponsor {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-mute);
          border: 1px solid var(--line);
          padding: 3px 8px;
          border-radius: 100px;
        }
        .art-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: 24px;
          line-height: 1.15;
          letter-spacing: -0.015em;
          margin-bottom: 14px;
        }
        .art-chapo {
          font-size: 14px;
          line-height: 1.55;
          color: var(--ink-soft);
          margin-bottom: 24px;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .art-bas {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--ink-mute);
        }

        @media (max-width: 800px) {
          .jp-top {
            padding: 20px;
          }
          .jp-nav {
            gap: 16px;
            width: 100%;
            flex-wrap: wrap;
          }
          .jp-main {
            padding: 48px 20px 80px;
          }
          .une {
            padding: 36px 28px;
          }
          .grille {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
