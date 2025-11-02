// components/Auth.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (type: 'login' | 'signup') => {
    setLoading(true);
    setMessage('');

    const credentials = { email, password };
    let error;

    if (type === 'login') {
      ({ error } = await supabase.auth.signInWithPassword(credentials));
    } else {
      ({ error } = await supabase.auth.signUp(credentials));
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      if (type === 'signup') {
        setMessage('¡Registro exitoso! Revisa tu correo para confirmar la cuenta.');
      }
      // Ya no necesitamos mostrar "Inicio de sesión exitoso". La redirección será automática.
    }
    setLoading(false);
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Gestión Académica UPTMA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="tu.correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex justify-between">
            <Button onClick={() => handleSubmit('login')} disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
            <Button variant="outline" onClick={() => handleSubmit('signup')} disabled={loading}>
              {loading ? 'Cargando...' : 'Registrarse'}
            </Button>
          </div>
          {message && <p className="text-sm text-muted-foreground mt-2">{message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}