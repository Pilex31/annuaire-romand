'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [motdepasse, setMotdepasse] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  async function connecter(e) {
    e.preventDefault()
    setErreur('')

    if (!email || !motdepasse) {
      setErreur('Merci de renseigner email et mot de passe.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motdepasse,
    })

    setLoading(false)

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErreur(
          'Votre email n\u2019est pas encore confirmé. Vérifiez votre boîte de réception (et les spams).'
        )
      } else if (error.message.includes('Invalid login credentials')) {
        setErreur('Email ou mot de passe incorrect.')
      } else {
        setErreur(error.message)
      }
      return
    }

    // Connecté → vers l'espace compte
    router.push('/compte')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <Link className="auth-mark" href="/">
          Hélio<span className="dot-accent">.</span>
        </Link>
        <p className="auth-side-pitch">
          Bon retour parmi <em>les entreprises romandes</em>.
        </p>
        <div className="auth-side-base">© 2026 Hélio · Suisse romande</div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <span className="auth-eyebrow">— Connexion</span>
          <h1 className="auth-title">
            Bon <em>retour</em>.
          </h1>
          <p className="auth-sub">Connectez-vous pour accéder à votre espace et à l&apos;annuaire.</p>

          <form onSubmit={connecter} className="auth-form">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@entreprise.ch"
              />
            </div>

            <div className="field">
              <label>Mot de passe</label>
              <input
                type="password"
                value={motdepasse}
                onChange={(e) => setMotdepasse(e.target.value)}
                placeholder="Votre mot de passe"
              />
            </div>

            {erreur && <div className="auth-error">{erreur}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ? <Link href="/inscription">Créer un compte</Link>
          </p>
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
