'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function TarifsPage() {
  const [sessionUser, setSessionUser] = useState(null)
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

  // Où mène le bouton principal : compte si connecté, inscription sinon
  const lienCta = sessionUser ? '/compte' : '/inscription'

  return (
    <div className="tarifs-page">
      {/* Top bar */}
      <header className="tp-top">
        <Link className="tp-mark" href="/">
          Hélio<span className="dot-accent">.</span>
        </Link>
        <button
          className={`tp-burger ${menuOuvert ? 'open' : ''}`}
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`tp-nav ${menuOuvert ? 'open' : ''}`}>
          <Link href="/#annuaire" onClick={() => setMenuOuvert(false)}>Annuaire</Link>
          <Link href="/journal" onClick={() => setMenuOuvert(false)}>Le Journal</Link>
          <Link href="/tarifs" className="actif" onClick={() => setMenuOuvert(false)}>Tarifs</Link>
          <Link href={sessionUser ? '/compte' : '/connexion'} className="tp-account" onClick={() => setMenuOuvert(false)}>
            {sessionUser ? 'Mon compte' : 'Se connecter'}
          </Link>
        </nav>
      </header>

      <main className="tp-main">
        {/* En-tête */}
        <div className="tp-header">
          <span className="tp-eyebrow">— Abonnement</span>
          <h1 className="tp-title">
            Un accès complet à <em>la Suisse romande</em> qui travaille.
          </h1>
          <p className="tp-sub">
            40 386 entreprises vérifiées, classées par secteur et mises à jour chaque jour. Une seule
            formule, deux rythmes de paiement. Sans engagement.
          </p>
        </div>

        {/* Les deux cartes de prix */}
        <div className="tp-cards">
          {/* Mensuel */}
          <div className="price-card">
            <div className="pc-haut">
              <span className="pc-nom">Mensuel</span>
              <span className="pc-flex">Flexible</span>
            </div>
            <div className="pc-prix">
              <span className="pc-montant">39,95</span>
              <span className="pc-unite">CHF / mois</span>
            </div>
            <p className="pc-desc">Sans engagement. Résiliable à tout moment, en un clic.</p>
            <Link href={lienCta} className="pc-btn">
              Commencer
            </Link>
          </div>

          {/* Annuel (mis en avant) */}
          <div className="price-card featured">
            <div className="pc-badge">2 mois offerts</div>
            <div className="pc-haut">
              <span className="pc-nom">Annuel</span>
              <span className="pc-flex">Le plus avantageux</span>
            </div>
            <div className="pc-prix">
              <span className="pc-montant">395,95</span>
              <span className="pc-unite">CHF / an</span>
            </div>
            <p className="pc-desc">
              Payé en une fois, renouvelable. Soit environ 33 CHF / mois — vous économisez près de
              80 CHF par an.
            </p>
            <Link href={lienCta} className="pc-btn featured-btn">
              Choisir l&apos;annuel
            </Link>
          </div>
        </div>

        <p className="tp-tva">Prix hors TVA (8,1%). Facturation suisse avec QR-facture.</p>

        {/* Ce qui est inclus */}
        <section className="tp-inclus">
          <h2 className="tp-inclus-titre">Tout est inclus.</h2>
          <div className="tp-inclus-grid">
            {[
              ['Recherche illimitée', 'Accédez à l\u2019intégralité des 40 386 fiches, sans restriction.'],
              ['Filtres avancés', 'Triez par secteur, canton, forme juridique en quelques clics.'],
              ['Fiches détaillées', 'Coordonnées, activité, forme juridique, données vérifiées.'],
              ['Mises à jour quotidiennes', 'Les nouvelles entreprises et changements intégrés chaque jour.'],
              ['Votre fiche entreprise', 'Ajoutez ou enrichissez votre propre fiche dans l\u2019annuaire.'],
              ['Statistiques de vues', 'Voyez qui consulte votre fiche et mesurez votre visibilité.'],
            ].map(([titre, desc]) => (
              <div className="inclus-item" key={titre}>
                <div className="inclus-check">✓</div>
                <div>
                  <h3>{titre}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hook final */}
        <section className="tp-hook">
          <h2 className="hook-titre">
            Vos prochains clients sont <em>déjà dans l&apos;annuaire</em>.
          </h2>
          <p className="hook-sub">
            Créez votre compte gratuitement en deux minutes. Vous ne payez qu&apos;au moment de vous
            abonner.
          </p>
          <Link href={lienCta} className="hook-btn">
            {sessionUser ? 'Accéder à mon compte' : 'Créer mon compte'}
          </Link>
        </section>
      </main>

      <style jsx>{`
        .tarifs-page {
          min-height: 100vh;
          background: var(--bg);
        }
        .tp-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid var(--line);
          flex-wrap: wrap;
          gap: 16px;
        }
        .tp-mark {
          font-family: var(--serif);
          font-weight: 600;
          font-size: 22px;
          letter-spacing: -0.02em;
        }
        .dot-accent {
          color: var(--accent);
          font-style: italic;
        }
        .tp-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .tp-nav :global(a) {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          transition: color 0.2s;
        }
        .tp-nav :global(a):hover {
          color: var(--ink);
        }
        .tp-nav :global(a.actif) {
          color: var(--accent);
        }
        .tp-nav :global(.tp-account) {
          border: 1px solid var(--ink);
          color: var(--ink);
          padding: 8px 18px;
          border-radius: 100px;
        }
        .tp-nav :global(.tp-account):hover {
          background: var(--ink);
          color: var(--bg);
        }
        .tp-burger {
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
        .tp-burger span {
          display: block;
          width: 100%;
          height: 2px;
          background: var(--ink);
          transition: transform 0.3s ease, opacity 0.2s ease;
        }
        .tp-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .tp-burger.open span:nth-child(2) { opacity: 0; }
        .tp-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .tp-main {
          max-width: 1080px;
          margin: 0 auto;
          padding: 80px 40px 100px;
        }
        .tp-header {
          max-width: 760px;
          margin: 0 auto 64px;
          text-align: center;
        }
        .tp-eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--ink-soft);
          margin-bottom: 16px;
          display: block;
        }
        .tp-title {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(40px, 5.5vw, 68px);
          line-height: 1.02;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        .tp-title em {
          font-style: italic;
          color: var(--accent);
          font-weight: 400;
        }
        .tp-sub {
          font-size: 17px;
          color: var(--ink-soft);
          line-height: 1.6;
          max-width: 580px;
          margin: 0 auto;
        }

        .tp-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 820px;
          margin: 0 auto;
        }
        .price-card {
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 40px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .price-card.featured {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }
        .pc-badge {
          position: absolute;
          top: -13px;
          left: 40px;
          background: var(--accent);
          color: var(--paper);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 6px 14px;
          border-radius: 100px;
        }
        .pc-haut {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .pc-nom {
          font-family: var(--serif);
          font-size: 24px;
          font-weight: 500;
        }
        .pc-flex {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.6;
        }
        .pc-prix {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 20px;
        }
        .pc-montant {
          font-family: var(--serif);
          font-size: 56px;
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .pc-unite {
          font-size: 15px;
          opacity: 0.6;
        }
        .pc-desc {
          font-size: 14px;
          line-height: 1.55;
          opacity: 0.8;
          margin-bottom: 32px;
          flex-grow: 1;
        }
        .pc-btn {
          text-align: center;
          padding: 15px 24px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid currentColor;
          transition: all 0.2s;
        }
        .price-card:not(.featured) .pc-btn:hover {
          background: var(--ink);
          color: var(--bg);
        }
        .featured-btn {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--paper);
        }
        .featured-btn:hover {
          background: var(--accent-dark);
          border-color: var(--accent-dark);
        }

        .tp-tva {
          text-align: center;
          font-size: 13px;
          color: var(--ink-mute);
          margin-top: 24px;
        }

        .tp-inclus {
          margin-top: 100px;
        }
        .tp-inclus-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(30px, 4vw, 44px);
          letter-spacing: -0.02em;
          text-align: center;
          margin-bottom: 48px;
        }
        .tp-inclus-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .inclus-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .inclus-check {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .inclus-item h3 {
          font-family: var(--serif);
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .inclus-item p {
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.5;
        }

        .tp-hook {
          margin-top: 100px;
          background: var(--bg-warm);
          border-radius: 16px;
          padding: 72px 48px;
          text-align: center;
        }
        .hook-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(32px, 4.5vw, 52px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          margin-bottom: 20px;
        }
        .hook-titre em {
          font-style: italic;
          color: var(--accent);
          font-weight: 400;
        }
        .hook-sub {
          font-size: 16px;
          color: var(--ink-soft);
          line-height: 1.6;
          max-width: 480px;
          margin: 0 auto 36px;
        }
        .hook-btn {
          display: inline-block;
          background: var(--ink);
          color: var(--bg);
          padding: 18px 40px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .hook-btn:hover {
          background: var(--accent);
        }

        @media (max-width: 800px) {
          .tp-top {
            padding: 20px;
          }
          .tp-burger { display: flex; }
          .tp-nav {
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
          .tp-nav.open { transform: translateX(0); }
          .tp-nav :global(a) {
            font-size: 18px;
            color: var(--bg);
            padding: 18px 0;
            border-bottom: 1px solid rgba(242, 237, 229, 0.12);
          }
          .tp-nav :global(a.actif) { color: var(--accent); }
          .tp-nav :global(.tp-account) {
            border: none;
            border-radius: 0;
            padding: 18px 0;
            color: var(--accent);
            font-weight: 600;
          }
          .tp-main {
            padding: 48px 20px 80px;
          }
          .tp-cards {
            grid-template-columns: 1fr;
          }
          .tp-inclus-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .tp-hook {
            padding: 48px 24px;
          }
        }
      `}</style>
    </div>
  )
}
