// components/SeccionForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Seccion } from '@/types'; // Importamos el tipo Seccion

// Importamos los componentes de shadcn
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Definimos las props que el componente espera
interface SeccionFormProps {
  onFormSubmit: () => void;
  initialData?: Seccion | null; // CORRECCIÓN: Aceptamos Seccion | null
}

export default function SeccionForm({ onFormSubmit, initialData = null }: SeccionFormProps) {
  const [formData, setFormData] = useState({
    nombre_materia: '',
    codigo_seccion: '',
    trayecto: '',
    trimestre: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_materia: initialData.nombre_materia || '',
        codigo_seccion: initialData.codigo_seccion || '',
        trayecto: String(initialData.trayecto || ''),
        trimestre: String(initialData.trimestre || ''),
      });
    } else {
      setFormData({ nombre_materia: '', codigo_seccion: '', trayecto: '', trimestre: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let error;
      const dataToSubmit = {
          nombre_materia: formData.nombre_materia,
          codigo_seccion: formData.codigo_seccion,
          trayecto: parseInt(formData.trayecto),
          trimestre: parseInt(formData.trimestre),
      };

      if (isEditMode && initialData) {
        ({ error } = await supabase.from('secciones').update(dataToSubmit).eq('id', initialData.id));
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Debes iniciar sesión para crear una sección.");
        ({ error } = await supabase.from('secciones').insert({ ...dataToSubmit, user_id: user.id }));
      }

      if (error) throw error;

      setMessage(isEditMode ? '¡Sección actualizada!' : '¡Sección creada!');
      setTimeout(() => {
        if (onFormSubmit) onFormSubmit();
      }, 1000);

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre_materia">Nombre de la Materia</Label>
          <Input id="nombre_materia" name="nombre_materia" value={formData.nombre_materia} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo_seccion">Código de la Sección</Label>
          <Input id="codigo_seccion" name="codigo_seccion" value={formData.codigo_seccion} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trayecto">Trayecto</Label>
          <Input id="trayecto" name="trayecto" type="number" value={formData.trayecto} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trimestre">Trimestre</Label>
          <Input id="trimestre" name="trimestre" type="number" value={formData.trimestre} onChange={handleChange} required />
        </div>
      </div>
      <div className="flex justify-end items-center gap-4">
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Sección')}
        </Button>
      </div>
    </form>
  );
}