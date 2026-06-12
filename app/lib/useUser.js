'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// Hook réutilisable : donne l'utilisateur connecté (ou null) et son profil.
// Utilisable dans n'importe quelle page client :
//   const { user, profile, loading } = useUser()
export function useUser() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let actif = true

    async function charger(session) {
      const u = session?.user ?? null
      if (!actif) return
      setUser(u)

      if (u) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()
        if (actif) setProfile(data || null)
      } else {
        setProfile(null)
      }
      if (actif) setLoading(false)
    }

    // Session au chargement
    supabase.auth.getSession().then(({ data }) => charger(data.session))

    // Écoute les changements (connexion, déconnexion, refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      charger(session)
    })

    return () => {
      actif = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { user, profile, loading }
}
