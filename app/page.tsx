// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Auth from '@/components/Auth';
import type { Session } from '@supabase/supabase-js'; // 1. IMPORTAMOS EL TIPO 'Session'

export default function HomePage() {
  // 2. ESPECIFICAMOS LOS TIPOS PARA EL ESTADO
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); // Ahora TypeScript sabe que esto es válido
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session); // Y que esto también es válido
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Verificando sesión...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Auth />
    </div>
  );
}