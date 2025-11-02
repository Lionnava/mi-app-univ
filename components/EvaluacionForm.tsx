// components/EvaluacionForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Evaluacion } from '@/types'; // Importamos nuestro tipo

// Definimos las props que el componente espera
interface EvaluacionFormProps {
  seccionId?: string;
  onFormSubmit: () => void;
  initialData?: Evaluacion | null; // CORRECCIÓN: Aceptamos Evaluacion | null
  totalPonderacionActual?: number;
}

export default function EvaluacionForm({ seccionId, onFormSubmit, initialData = null, totalPonderacionActual = 0 }: EvaluacionFormProps) {
  const [formData, setFormData] = useState({
    nombre_evaluacion: '',
    ponderacion: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_evaluacion: initialData.nombre_evaluacion,
        ponderacion: String(initialData.ponderacion), // Aseguramos que sea string para el input
      });
    } else {
      setFormData({ nombre_evaluacion: '', ponderacion: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const nuevaPonderacion = parseInt(formData.ponderacion);
    if (isNaN(nuevaPonderacion)) {
        setMessage('La ponderación debe ser un número.');
        setLoading(false);
        return;
    }

    const ponderacionAnterior = isEditMode && initialData ? initialData.ponderacion : 0;
    const totalSinPonderacionAnterior = totalPonderacionActual - ponderacionAnterior;

    if (totalSinPonderacionAnterior + nuevaPonderacion > 100) {
      setMessage(`Error: El total (${totalSinPonderacionAnterior + nuevaPonderacion}%) excedería el 100%.`);
      setLoading(false);
      return;
    }

    try {
      let error;
      const dataToSubmit = {
          nombre_evaluacion: formData.nombre_evaluacion,
          ponderacion: nuevaPonderacion
      };

      if (isEditMode && initialData) {
        ({ error } = await supabase.from('evaluaciones').update(dataToSubmit).eq('id', initialData.id));
      } else {
        if (!seccionId) throw new Error("ID de sección es requerido para crear.");
        ({ error } = await supabase.from('evaluaciones').insert({ ...dataToSubmit, id_seccion: seccionId }));
      }

      if (error) throw error;

      setMessage(isEditMode ? '¡Evaluación actualizada!' : '¡Evaluación creada!');
      setTimeout(() => onFormSubmit(), 1000);

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre_evaluacion">Nombre de la Evaluación</Label>
        <Input id="nombre_evaluacion" name="nombre_evaluacion" value={formData.nombre_evaluacion} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ponderacion">Ponderación (%)</Label>
        <Input id="ponderacion" name="ponderacion" type="number" min="1" max="100" value={formData.ponderacion} onChange={handleChange} required placeholder="Ej: 25" />
      </div>
      <div className="flex justify-end items-center gap-4">
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Evaluación')}
        </Button>
      </div>
    </form>
  );
}