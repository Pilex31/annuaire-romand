'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function InscriptionPage() {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    motdepasse: '',
  })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  function maj(champ, valeur) {
    setForm((f) => ({ ...f, [champ]: valeur }))
  }

  async function inscrire(e) {
    e.preventDefault()
    setErreur('')

    // Validations simples
    if (!form.prenom || !form.nom || !form.telephone || !form.email || !form.motdepasse) {
      setErreur('Merci de remplir tous les champs.')
      return
    }
    if (form.motdepasse.length < 8) {
      setErreur('Le mot de passe doit faire au moins 8 caractères.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.motdepasse,
      options: {
        // Ces données sont récupérées par le trigger SQL pour remplir le profil
        data: {
          prenom: form.prenom,
          nom: form.nom,
          telephone: form.telephone,
        },
        // Où l'utilisateur atterrit après avoir cliqué le lien de confirmation
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/compte`
            : undefined,
      },
    })

    setLoading(false)

    if (error) {
      if (error.message.includes('already registered')) {
        setErreur('Un compte existe déjà avec cet email. Connectez-vous plutôt.')
      } else {
        setErreur(error.message)
      }
      return
    }

    setSucces(true)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <Link className="auth-mark" href="/">
          Hélio<span className="dot-accent">.</span>
        </Link>
        <p className="auth-side-pitch">
          Rejoignez l&apos;annuaire B2B qui relie <em>les entreprises romandes</em>.
        </p>
        <div className="auth-side-base">© 2026 Hélio · Suisse romande</div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          {succes ? (
            <div className="auth-success">
              <div className="success-icon">✓</div>
              <h1 className="auth-title">Vérifiez vos emails.</h1>
              <p className="auth-sub">
                Un lien de confirmation vient d&apos;être envoyé à <strong>{form.email}</strong>.
                Cliquez dessus pour activer votre compte, puis connectez-vous.
              </p>
              <Link href="/connexion" className="auth-btn">
                Aller à la connexion
              </Link>
            </div>
          ) : (
            <>
              <span className="auth-eyebrow">— Inscription</span>
              <h1 className="auth-title">
                Créez votre <em>compte</em>.
              </h1>
              <p className="auth-sub">
                Quelques informations, et vous y êtes. Vous pourrez ajouter votre entreprise juste
                après.
              </p>

              <form onSubmit={inscrire} className="auth-form">
                <div className="form-row">
                  <div className="field">
                    <label>Prénom</label>
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={(e) => maj('prenom', e.target.value)}
                      placeholder="Marie"
                    />
                  </div>
                  <div className="field">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => maj('nom', e.target.value)}
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => maj('telephone', e.target.value)}
                    placeholder="+41 79 123 45 67"
                  />
                </div>

                <div className="field">
                  <label>Email professionnel</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => maj('email', e.target.value)}
                    placeholder="marie@entreprise.ch"
                  />
                </div>

                <div className="field">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    value={form.motdepasse}
                    onChange={(e) => maj('motdepasse', e.target.value)}
                    placeholder="Au moins 8 caractères"
                  />
                </div>

                {erreur && <div className="auth-error">{erreur}</div>}

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Création…' : 'Créer mon compte'}
                </button>
              </form>

              <p className="auth-switch">
                Déjà un compte ? <Link href="/connexion">Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-wrap {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1.3fr;
        }
        .auth-side {
          background: var(--ink);
          color: var(--bg);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .auth-mark {
          font-family: var(--serif);
          font-weight: 600;
          font-size: 28px;
          letter-spacing: -0.02em;
        }
        .dot-accent {
          color: var(--accent);
          font-style: italic;
        }
        .auth-side-pitch {
          font-family: var(--serif);
          font-size: clamp(28px, 3vw, 44px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          max-width: 420px;
        }
        .auth-side-pitch em {
          font-style: italic;
          color: var(--accent);
        }
        .auth-side-base {
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(242, 237, 229, 0.5);
        }

        .auth-main {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background: var(--bg);
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
        }
        .auth-eyebrow {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--ink-soft);
          margin-bottom: 12px;
          display: block;
        }
        .auth-title {
          font-family: var(--serif);
          font-weight: 500;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.02;
          letter-spacing: -0.025em;
          margin-bottom: 16px;
        }
        .auth-title em {
          font-style: italic;
          color: var(--accent);
          font-weight: 400;
        }
        .auth-sub {
          font-size: 15px;
          color: var(--ink-soft);
          line-height: 1.55;
          margin-bottom: 36px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-row {
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
        .field input {
          border: none;
          border-bottom: 1px solid var(--line);
          background: transparent;
          padding: 10px 0;
          font-family: var(--sans);
          font-size: 16px;
          color: var(--ink);
          outline: none;
          transition: border-color 0.2s;
        }
        .field input:focus {
          border-color: var(--accent);
        }
        .field input::placeholder {
          color: var(--ink-mute);
        }

        .auth-error {
          background: rgba(212, 80, 42, 0.08);
          border-left: 2px solid var(--accent);
          color: var(--accent-dark);
          padding: 12px 16px;
          font-size: 14px;
          border-radius: 2px;
        }

        .auth-btn {
          margin-top: 8px;
          background: var(--ink);
          color: var(--bg);
          border: none;
          padding: 16px 24px;
          border-radius: 100px;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          text-align: center;
        }
        .auth-btn:hover:not(:disabled) {
          background: var(--accent);
        }
        .auth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-switch {
          margin-top: 28px;
          font-size: 14px;
          color: var(--ink-soft);
          text-align: center;
        }
        .auth-switch :global(a) {
          color: var(--accent);
          font-weight: 500;
        }

        .auth-success {
          text-align: center;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--paper);
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
        }

        @media (max-width: 800px) {
          .auth-wrap {
            grid-template-columns: 1fr;
          }
          .auth-side {
            padding: 32px;
            min-height: 200px;
          }
          .auth-side-pitch {
            font-size: 24px;
          }
          .auth-main {
            padding: 32px;
          }
        }
      `}</style>
    </div>
  )
}
