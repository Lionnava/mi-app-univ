// components/HorarioForm.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HorarioFormProps {
  seccionId: string;
  onBloqueCreado: () => void;
}

export default function HorarioForm({ seccionId, onBloqueCreado }: HorarioFormProps) {
  const [dia, setDia] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [aula, setAula] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Error: Usuario no autenticado");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('horario').insert({
      id_seccion: seccionId,
      user_id: user.id,
      dia_semana: parseInt(dia),
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      aula: aula,
    });

    if (error) {
      alert("Error al guardar el bloque de horario: " + error.message);
    } else {
      // Limpiar formulario y notificar al padre
      setDia(''); setHoraInicio(''); setHoraFin(''); setAula('');
      onBloqueCreado();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h4 className="font-semibold">Añadir Bloque al Horario</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Día de la Semana</Label>
          <Select onValueChange={setDia} value={dia}>
            <SelectTrigger><SelectValue placeholder="Selecciona un día" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Lunes</SelectItem>
              <SelectItem value="2">Martes</SelectItem>
              <SelectItem value="3">Miércoles</SelectItem>
              <SelectItem value="4">Jueves</SelectItem>
              <SelectItem value="5">Viernes</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="aula">Aula</Label>
            <Input id="aula" value={aula} onChange={(e) => setAula(e.target.value)} placeholder="Ej: LAB1, NP" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hora_inicio">Hora de Inicio</Label>
          <Input id="hora_inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_fin">Hora de Fin</Label>
          <Input id="hora_fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
        </div>
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Añadir al Horario'}</Button>
    </form>
  );
}