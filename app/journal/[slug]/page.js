'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function ArticlePage() {
  const params = useParams()
  const slug = params?.slug

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [introuvable, setIntrouvable] = useState(false)
  const [sessionUser, setSessionUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    if (!slug) return
    async function charger() {
      setLoading(true)
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('publie', true)
        .single()
      if (data) {
        setArticle(data)
      } else {
        setIntrouvable(true)
      }
      setLoading(false)
    }
    charger()
  }, [slug])

  function formatDate(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-CH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="article-page">
      {/* Top bar */}
      <header className="ap-top">
        <Link className="ap-mark" href="/">
          Hélio<span className="dot-accent">.</span>
        </Link>
        <nav className="ap-nav">
          <Link href="/#annuaire">Annuaire</Link>
          <Link href="/journal" className="actif">Le Journal</Link>
          <Link href="/tarifs">Tarifs</Link>
          <Link href={sessionUser ? '/compte' : '/connexion'} className="ap-account">
            {sessionUser ? 'Mon compte' : 'Se connecter'}
          </Link>
        </nav>
      </header>

      <main className="ap-main">
        {loading ? (
          <p className="ap-loading">Chargement…</p>
        ) : introuvable ? (
          <div className="ap-404">
            <h1>Article introuvable.</h1>
            <p>Cet article n&apos;existe pas ou n&apos;est plus disponible.</p>
            <Link href="/journal" className="ap-retour">
              ← Retour au Journal
            </Link>
          </div>
        ) : (
          article && (
            <article className="ap-article">
              <Link href="/journal" className="ap-fil">
                ← Le Journal
              </Link>

              <div className="ap-meta">
                {article.theme && <span className="ap-theme">{article.theme}</span>}
                <span className="ap-date">{formatDate(article.publie_le)}</span>
                <span>·</span>
                <span>{article.temps_lecture} min de lecture</span>
              </div>

              <h1 className="ap-titre">{article.titre}</h1>

              {article.chapo && <p className="ap-chapo">{article.chapo}</p>}

              {article.sponsor_nom && (
                <div className="ap-sponsor">
                  En partenariat avec <strong>{article.sponsor_nom}</strong>
                  {article.sponsor_url && (
                    <a href={article.sponsor_url} target="_blank" rel="noopener noreferrer">
                      Découvrir →
                    </a>
                  )}
                </div>
              )}

              <div className="ap-corps">
                <RenduContenu texte={article.contenu} />
              </div>

              {/* CTA fin d'article */}
              <div className="ap-cta">
                <h2>Accédez à l&apos;annuaire complet</h2>
                <p>40 386 entreprises romandes vérifiées, classées par secteur.</p>
                <Link href={sessionUser ? '/compte' : '/inscription'} className="ap-cta-btn">
                  {sessionUser ? 'Mon compte' : 'Créer mon compte'}
                </Link>
              </div>
            </article>
          )
        )}
      </main>

      <style jsx>{`
        .article-page {
          min-height: 100vh;
          background: var(--bg);
        }
        .ap-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid var(--line);
          flex-wrap: wrap;
          gap: 16px;
        }
        .ap-mark {
          font-family: var(--serif);
          font-weight: 600;
          font-size: 22px;
          letter-spacing: -0.02em;
        }
        .dot-accent {
          color: var(--accent);
          font-style: italic;
        }
        .ap-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .ap-nav :global(a) {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          transition: color 0.2s;
        }
        .ap-nav :global(a):hover {
          color: var(--ink);
        }
        .ap-nav :global(a.actif) {
          color: var(--accent);
        }
        .ap-nav :global(.ap-account) {
          border: 1px solid var(--ink);
          color: var(--ink);
          padding: 8px 18px;
          border-radius: 100px;
        }
        .ap-nav :global(.ap-account):hover {
          background: var(--ink);
          color: var(--bg);
        }

        .ap-main {
          max-width: 720px;
          margin: 0 auto;
          padding: 56px 40px 100px;
        }
        .ap-loading {
          font-family: var(--serif);
          font-style: italic;
          font-size: 18px;
          color: var(--ink-soft);
        }
        .ap-404 {
          text-align: center;
          padding: 80px 0;
        }
        .ap-404 h1 {
          font-family: var(--serif);
          font-size: 36px;
          margin-bottom: 16px;
        }
        .ap-404 p {
          color: var(--ink-soft);
          margin-bottom: 32px;
        }
        .ap-retour {
          color: var(--accent);
          font-weight: 500;
        }

        .ap-fil {
          display: inline-block;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-soft);
          margin-bottom: 40px;
          transition: color 0.2s;
        }
        .ap-fil:hover {
          color: var(--accent);
        }

        .ap-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: var(--ink-mute);
          margin-bottom: 24px;
        }
        .ap-theme {
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
        .ap-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          margin-bottom: 28px;
        }
        .ap-chapo {
          font-family: var(--serif);
          font-style: italic;
          font-size: 22px;
          line-height: 1.5;
          color: var(--ink-soft);
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--line);
        }
        .ap-sponsor {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          background: var(--bg-warm);
          border-radius: 8px;
          padding: 14px 20px;
          font-size: 14px;
          color: var(--ink-soft);
          margin-bottom: 40px;
        }
        .ap-sponsor :global(a) {
          color: var(--accent);
          font-weight: 600;
          margin-left: auto;
        }

        .ap-corps {
          font-size: 18px;
          line-height: 1.75;
          color: var(--ink);
        }

        .ap-cta {
          margin-top: 64px;
          background: var(--ink);
          color: var(--bg);
          border-radius: 12px;
          padding: 48px 40px;
          text-align: center;
        }
        .ap-cta h2 {
          font-family: var(--serif);
          font-weight: 500;
          font-size: 28px;
          margin-bottom: 12px;
        }
        .ap-cta p {
          color: rgba(242, 237, 229, 0.7);
          margin-bottom: 28px;
        }
        .ap-cta-btn {
          display: inline-block;
          background: var(--accent);
          color: var(--paper);
          padding: 15px 32px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .ap-cta-btn:hover {
          background: var(--accent-dark);
        }

        @media (max-width: 800px) {
          .ap-top {
            padding: 20px;
          }
          .ap-nav {
            gap: 16px;
            width: 100%;
            flex-wrap: wrap;
          }
          .ap-main {
            padding: 40px 20px 80px;
          }
        }
      `}</style>
    </div>
  )
}

// ─── Mini-rendu Markdown léger (titres ## et paragraphes) ───
function RenduContenu({ texte }) {
  if (!texte) return null

  // On découpe par lignes et on transforme :
  //   ## Titre  -> sous-titre
  //   ligne vide -> séparateur de paragraphe
  //   reste -> paragraphe
  const blocs = texte.split('\n').filter((l) => l.trim() !== '')

  return (
    <>
      {blocs.map((ligne, i) => {
        const l = ligne.trim()
        if (l.startsWith('## ')) {
          return <h2 key={i}>{l.slice(3)}</h2>
        }
        if (l.startsWith('# ')) {
          return <h2 key={i}>{l.slice(2)}</h2>
        }
        return <p key={i}>{l}</p>
      })}

      <style jsx>{`
        h2 {
          font-family: var(--serif);
          font-weight: 500;
          font-size: 26px;
          letter-spacing: -0.015em;
          margin: 40px 0 16px;
          line-height: 1.2;
        }
        p {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  )
}
