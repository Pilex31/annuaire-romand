'use client'

import { createClient } from '@supabase/supabase-js'

// Client Supabase unique, partagé par toutes les pages côté navigateur.
// Il gère automatiquement la session (rester connecté) via le localStorage.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
