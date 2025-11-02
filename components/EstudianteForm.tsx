// components/EstudianteForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Estudiante } from '@/types'; // Importamos nuestro tipo

// Definimos las props que el componente espera
interface EstudianteFormProps {
  seccionId?: string;
  onFormSubmit: () => void;
  initialData?: Estudiante | null;
}

export default function EstudianteForm({ seccionId, onFormSubmit, initialData = null }: EstudianteFormProps) {
  const [formData, setFormData] = useState({ nombre: '', apellido: '', cedula: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({ nombre: initialData.nombre, apellido: initialData.apellido, cedula: initialData.cedula });
    } else {
      setFormData({ nombre: '', apellido: '', cedula: '' });
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
      if (isEditMode && initialData) {
        ({ error } = await supabase.from('estudiantes').update(formData).eq('id', initialData.id));
      } else {
        if (!seccionId) throw new Error("ID de sección es requerido para crear.");
        ({ error } = await supabase.from('estudiantes').insert({ ...formData, id_seccion: seccionId }));
      }
      if (error) throw error;
      setMessage(isEditMode ? '¡Estudiante actualizado!' : '¡Estudiante añadido!');
      setTimeout(() => onFormSubmit(), 1000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (el JSX del formulario no cambia) ... */}
    </form>
  );
}