'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function JournalPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionUser, setSessionUser] = useState(null)
  const [themeActif, setThemeActif] = useState(null)
  const [menuOuvert, setMenuOuvert] = useState(false)

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
        <button
          className={`jp-burger ${menuOuvert ? 'open' : ''}`}
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`jp-nav ${menuOuvert ? 'open' : ''}`}>
          <Link href="/#annuaire" onClick={() => setMenuOuvert(false)}>Annuaire</Link>
          <Link href="/journal" className="actif" onClick={() => setMenuOuvert(false)}>Le Journal</Link>
          <Link href="/tarifs" onClick={() => setMenuOuvert(false)}>Tarifs</Link>
          <Link href={sessionUser ? '/compte' : '/connexion'} className="jp-account" onClick={() => setMenuOuvert(false)}>
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
          <div className="liste">
            {articlesFiltres.map((a) => (
              <Link key={a.slug} href={`/journal/${a.slug}`} className="ligne">
                <div className="ligne-corps">
                  <div className="ligne-meta">
                    {a.theme && <span className="ligne-theme">{a.theme}</span>}
                    <span className="ligne-date">{formatDate(a.publie_le)}</span>
                    <span className="ligne-sep">·</span>
                    <span>{a.temps_lecture} min</span>
                    {a.sponsor_nom && <span className="ligne-sponsor">Partenaire</span>}
                  </div>
                  <h2 className="ligne-titre">{a.titre}</h2>
                  <p className="ligne-chapo">{a.chapo}</p>
                </div>
                <span className="ligne-fleche">→</span>
              </Link>
            ))}
          </div>
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
        .jp-burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 200;
        }
        .jp-burger span {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--ink);
          transition: transform 0.3s ease, opacity 0.2s ease;
        }
        .jp-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .jp-burger.open span:nth-child(2) { opacity: 0; }
        .jp-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

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

        /* Liste classique : tous les articles au même niveau */
        .liste {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--line);
        }
        .ligne {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 36px 8px;
          border-bottom: 1px solid var(--line);
          transition: background 0.2s ease, padding 0.2s ease;
        }
        .ligne:hover {
          background: var(--paper);
          padding-left: 20px;
          padding-right: 20px;
        }
        .ligne-corps {
          flex: 1;
          min-width: 0;
        }
        .ligne-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: var(--ink-mute);
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .ligne-theme {
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
        .ligne-sep {
          opacity: 0.5;
        }
        .ligne-sponsor {
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-mute);
          border: 1px solid var(--line);
          padding: 3px 8px;
          border-radius: 100px;
          font-size: 10px;
        }
        .ligne-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(22px, 2.6vw, 30px);
          line-height: 1.15;
          letter-spacing: -0.015em;
          margin-bottom: 10px;
        }
        .ligne-chapo {
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink-soft);
          max-width: 760px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ligne-fleche {
          flex-shrink: 0;
          font-size: 24px;
          color: var(--ink-mute);
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .ligne:hover .ligne-fleche {
          color: var(--accent);
          transform: translateX(6px);
        }

        @media (max-width: 800px) {
          .jp-top {
            padding: 20px;
          }
          .jp-burger { display: flex; }
          .jp-nav {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: min(80vw, 320px);
            flex-direction: column;
            gap: 0;
            align-items: stretch;
            background: var(--ink);
            padding: 100px 32px 40px;
            transform: translateX(100%);
            transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
            box-shadow: -20px 0 60px rgba(0, 0, 0, 0.3);
            z-index: 150;
          }
          .jp-nav.open { transform: translateX(0); }
          .jp-nav :global(a) {
            font-size: 18px;
            color: var(--bg);
            padding: 18px 0;
            border-bottom: 1px solid rgba(242, 237, 229, 0.12);
          }
          .jp-nav :global(a.actif) { color: var(--accent); }
          .jp-nav :global(.jp-account) {
            border: none;
            border-radius: 0;
            padding: 18px 0;
            color: var(--accent);
            font-weight: 600;
          }
          .jp-main {
            padding: 48px 20px 80px;
          }
          .ligne {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 28px 8px;
          }
          .ligne:hover {
            padding-left: 8px;
            padding-right: 8px;
          }
          .ligne-fleche {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
