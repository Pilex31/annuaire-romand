'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../lib/useUser'

export default function ComptePage() {
  const router = useRouter()
  const { user, profile, loading } = useUser()

  // Redirige vers connexion si pas connecté (une fois le chargement fini)
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/connexion')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="loading-dot"></span>
        Chargement de votre espace…
      </div>
    )
  }

  if (!user) return null // évite le flash avant redirection

  return <CompteContenu user={user} profile={profile} />
}

function CompteContenu({ user, profile }) {
  const router = useRouter()

  const abonneActif = profile?.abonnement_statut === 'actif'

  async function deconnecter() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="compte-page">
      {/* Barre du haut */}
      <header className="compte-top">
        <Link className="compte-mark" href="/">
          Hélio<span className="dot-accent">.</span>
        </Link>
        <nav className="compte-nav">
          <Link href="/">Annuaire</Link>
          <button onClick={deconnecter} className="btn-deco">
            Déconnexion
          </button>
        </nav>
      </header>

      <main className="compte-main">
        {/* En-tête */}
        <div className="compte-header">
          <span className="compte-eyebrow">— Mon espace</span>
          <h1 className="compte-title">
            Bonjour, <em>{profile?.prenom || 'cher membre'}</em>.
          </h1>
        </div>

        {/* Bandeau abonnement */}
        <section className={`abo-banner ${abonneActif ? 'actif' : 'inactif'}`}>
          <div>
            <div className="abo-label">Abonnement</div>
            <div className="abo-statut">
              {abonneActif ? (
                <>
                  Actif{' '}
                  {profile?.abonnement_formule &&
                    `· formule ${profile.abonnement_formule}`}
                </>
              ) : (
                'Inactif — vous n\u2019avez pas encore d\u2019abonnement'
              )}
            </div>
          </div>
          {!abonneActif && (
            <button className="abo-cta" disabled title="Disponible bientôt">
              Choisir une formule
            </button>
          )}
        </section>

        {/* Grille de blocs */}
        <div className="compte-grid">
          {/* Profil */}
          <section className="bloc">
            <h2 className="bloc-titre">Mes informations</h2>
            <div className="info-ligne">
              <span>Prénom</span>
              <strong>{profile?.prenom || '—'}</strong>
            </div>
            <div className="info-ligne">
              <span>Nom</span>
              <strong>{profile?.nom || '—'}</strong>
            </div>
            <div className="info-ligne">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="info-ligne">
              <span>Téléphone</span>
              <strong>{profile?.telephone || '—'}</strong>
            </div>
          </section>

          {/* Statistiques fiche (à venir Couche 3) */}
          <section className="bloc">
            <h2 className="bloc-titre">Vues de ma fiche</h2>
            <div className="bloc-vide">
              <div className="bloc-vide-num">—</div>
              <p>
                Bientôt : suivez qui consulte votre fiche entreprise. Disponible une fois votre
                abonnement actif.
              </p>
            </div>
          </section>
        </div>

        {/* Étape 2 : enrichir mon entreprise */}
        <EntrepriseForm user={user} profile={profile} />
      </main>

      <style jsx>{`
        .compte-page {
          min-height: 100vh;
          background: var(--bg);
        }
        .compte-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid var(--line);
        }
        .compte-mark {
          font-family: var(--serif);
          font-weight: 600;
          font-size: 22px;
          letter-spacing: -0.02em;
        }
        .dot-accent {
          color: var(--accent);
          font-style: italic;
        }
        .compte-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .compte-nav :global(a) {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
        }
        .btn-deco {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink-soft);
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-deco:hover {
          border-color: var(--ink);
          color: var(--ink);
        }

        .compte-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 60px 40px 100px;
        }
        .compte-header {
          margin-bottom: 40px;
        }
        .compte-eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--ink-soft);
          margin-bottom: 12px;
          display: block;
        }
        .compte-title {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(36px, 5vw, 56px);
          line-height: 1;
          letter-spacing: -0.025em;
        }
        .compte-title em {
          font-style: italic;
          color: var(--accent);
          font-weight: 400;
        }

        .abo-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 32px;
          border-radius: 8px;
          margin-bottom: 40px;
        }
        .abo-banner.inactif {
          background: var(--bg-warm);
          border: 1px solid var(--line);
        }
        .abo-banner.actif {
          background: var(--ink);
          color: var(--bg);
        }
        .abo-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          opacity: 0.6;
          margin-bottom: 6px;
        }
        .abo-statut {
          font-family: var(--serif);
          font-size: 22px;
          font-style: italic;
        }
        .abo-cta {
          background: var(--accent);
          color: var(--paper);
          border: none;
          padding: 14px 24px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          opacity: 0.5;
        }

        .compte-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .bloc {
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 32px;
        }
        .bloc-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: 22px;
          margin-bottom: 24px;
          letter-spacing: -0.015em;
        }
        .info-ligne {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
          font-size: 14px;
        }
        .info-ligne:last-child {
          border-bottom: none;
        }
        .info-ligne span {
          color: var(--ink-soft);
        }
        .bloc-vide {
          text-align: center;
          padding: 20px 0;
        }
        .bloc-vide-num {
          font-family: var(--serif);
          font-size: 48px;
          color: var(--ink-mute);
          margin-bottom: 12px;
        }
        .bloc-vide p {
          font-size: 13px;
          color: var(--ink-soft);
          line-height: 1.5;
        }

        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: var(--serif);
          font-style: italic;
          font-size: 18px;
          color: var(--ink-soft);
          background: var(--bg);
        }
        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 1.4s ease-in-out infinite;
        }

        @media (max-width: 800px) {
          .compte-top {
            padding: 20px;
          }
          .compte-main {
            padding: 40px 20px 80px;
          }
          .compte-grid {
            grid-template-columns: 1fr;
          }
          .abo-banner {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}

// ─── Étape 2 : formulaire entreprise ───────────────────────
function EntrepriseForm({ user, profile }) {
  const [form, setForm] = useState({
    entreprise_nom: '',
    entreprise_ide: '',
    contact_fonction: '',
    contact_email_direct: '',
    contact_tel_direct: '',
    activite_description: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [ouvert, setOuvert] = useState(false)

  // Pré-remplir si le profil contient déjà des infos
  useEffect(() => {
    if (profile) {
      setForm({
        entreprise_nom: profile.entreprise_nom || '',
        entreprise_ide: profile.entreprise_ide || '',
        contact_fonction: profile.contact_fonction || '',
        contact_email_direct: profile.contact_email_direct || '',
        contact_tel_direct: profile.contact_tel_direct || '',
        activite_description: profile.activite_description || '',
      })
    }
  }, [profile])

  function maj(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }))
  }

  async function enregistrer(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        entreprise_nom: form.entreprise_nom || null,
        entreprise_ide: form.entreprise_ide || null,
        contact_fonction: form.contact_fonction || null,
        contact_email_direct: form.contact_email_direct || null,
        contact_tel_direct: form.contact_tel_direct || null,
        activite_description: form.activite_description || null,
      })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      setMessage('Erreur : ' + error.message)
    } else {
      setMessage('Informations enregistrées ✓')
    }
  }

  return (
    <section className="ent-section">
      <button className="ent-toggle" onClick={() => setOuvert(!ouvert)}>
        <div>
          <span className="ent-eyebrow">— Étape optionnelle</span>
          <h2 className="ent-titre">Ajouter ou enrichir mon entreprise</h2>
          <p className="ent-desc">
            Votre entreprise est déjà dans l&apos;annuaire ? Complétez ses informations. Sinon,
            ajoutez-la et indiquez votre contact direct.
          </p>
        </div>
        <span className={`ent-chevron ${ouvert ? 'open' : ''}`}>▾</span>
      </button>

      {ouvert && (
        <form onSubmit={enregistrer} className="ent-form">
          <div className="ent-row">
            <div className="field">
              <label>Nom de l&apos;entreprise</label>
              <input
                type="text"
                value={form.entreprise_nom}
                onChange={(e) => maj('entreprise_nom', e.target.value)}
                placeholder="Café du Centre Sàrl"
              />
            </div>
            <div className="field">
              <label>Numéro IDE (si connu)</label>
              <input
                type="text"
                value={form.entreprise_ide}
                onChange={(e) => maj('entreprise_ide', e.target.value)}
                placeholder="CHE-123.456.789"
              />
            </div>
          </div>

          <div className="ent-row">
            <div className="field">
              <label>Votre fonction</label>
              <input
                type="text"
                value={form.contact_fonction}
                onChange={(e) => maj('contact_fonction', e.target.value)}
                placeholder="Directrice, Responsable ventes…"
              />
            </div>
            <div className="field">
              <label>Email de contact direct</label>
              <input
                type="email"
                value={form.contact_email_direct}
                onChange={(e) => maj('contact_email_direct', e.target.value)}
                placeholder="contact@entreprise.ch"
              />
            </div>
          </div>

          <div className="field">
            <label>Téléphone de contact direct</label>
            <input
              type="tel"
              value={form.contact_tel_direct}
              onChange={(e) => maj('contact_tel_direct', e.target.value)}
              placeholder="+41 21 123 45 67"
            />
          </div>

          <div className="field">
            <label>Décrivez votre activité</label>
            <textarea
              rows={4}
              value={form.activite_description}
              onChange={(e) => maj('activite_description', e.target.value)}
              placeholder="Produits, services, spécialités, zone d'activité…"
            />
          </div>

          {message && (
            <div className={`ent-message ${message.startsWith('Erreur') ? 'err' : 'ok'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="ent-submit" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      )}

      <style jsx>{`
        .ent-section {
          margin-top: 24px;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 8px;
          overflow: hidden;
        }
        .ent-toggle {
          width: 100%;
          background: transparent;
          border: none;
          padding: 32px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          cursor: pointer;
          text-align: left;
        }
        .ent-eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent);
          margin-bottom: 10px;
          display: block;
        }
        .ent-titre {
          font-family: var(--serif);
          font-weight: 500;
          font-size: 24px;
          letter-spacing: -0.015em;
          margin-bottom: 10px;
        }
        .ent-desc {
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.5;
          max-width: 560px;
        }
        .ent-chevron {
          font-size: 20px;
          color: var(--ink-soft);
          transition: transform 0.3s;
          flex-shrink: 0;
        }
        .ent-chevron.open {
          transform: rotate(180deg);
        }

        .ent-form {
          padding: 0 32px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ent-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ink-soft);
          font-weight: 500;
        }
        .field input,
        .field textarea {
          border: 1px solid var(--line);
          background: var(--bg);
          padding: 12px 14px;
          border-radius: 4px;
          font-family: var(--sans);
          font-size: 15px;
          color: var(--ink);
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }
        .field input:focus,
        .field textarea:focus {
          border-color: var(--accent);
        }

        .ent-message {
          padding: 12px 16px;
          font-size: 14px;
          border-radius: 4px;
        }
        .ent-message.ok {
          background: rgba(212, 80, 42, 0.08);
          color: var(--accent-dark);
        }
        .ent-message.err {
          background: rgba(180, 30, 30, 0.08);
          color: #b41e1e;
        }

        .ent-submit {
          align-self: flex-start;
          background: var(--ink);
          color: var(--bg);
          border: none;
          padding: 14px 28px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ent-submit:hover:not(:disabled) {
          background: var(--accent);
        }
        .ent-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {
          .ent-toggle {
            padding: 24px;
          }
          .ent-form {
            padding: 0 24px 24px;
          }
          .ent-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
