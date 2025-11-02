// components/ConsolidadoNotas.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Papa from 'papaparse';
import { Button } from './ui/button'; // Usamos el botón de shadcn

// Definimos los tipos para las props que recibe el componente
type Estudiante = { id: string; nombre: string; apellido: string; cedula: string };
type Evaluacion = { id:string; nombre_evaluacion: string; ponderacion: number };
type ConsolidadoNotasProps = {
  estudiantes: Estudiante[];
  evaluaciones: Evaluacion[];
  nombreSeccion: string;
  totalPonderado: number; // <<== AÑADIMOS LA NUEVA PROP AQUÍ
};

export default function ConsolidadoNotas({ estudiantes, evaluaciones, nombreSeccion, totalPonderado }: ConsolidadoNotasProps) {
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotas = async () => {
      if (estudiantes.length === 0) { setLoading(false); return; }
      const estudianteIds = estudiantes.map(e => e.id);
      const { data, error } = await supabase.from('notas').select('*').in('id_estudiante', estudianteIds);
      if (error) { console.error("Error al cargar las notas:", error); } 
      else {
        const notasMap = (data || []).reduce((acc: Record<string, number>, nota) => {
          if (nota.id_estudiante && nota.id_evaluacion) {
            acc[`${nota.id_estudiante}-${nota.id_evaluacion}`] = nota.calificacion;
          }
          return acc;
        }, {});
        setNotas(notasMap);
      }
      setLoading(false);
    };
    fetchNotas();
  }, [estudiantes]);

  const handleSaveNota = async (estudianteId: string, evaluacionId: string, calificacion: string) => { /* ... (sin cambios) ... */ };
  const calcularNotaFinal = (estudianteId: string): string => { /* ... (sin cambios) ... */ };
  const handleExportCSV = () => { /* ... (sin cambios) ... */ };

  // --- VALIDACIÓN DE PONDERACIÓN (AHORA DENTRO DEL COMPONENTE) ---
  if (totalPonderado !== 100) {
    return (
      <section className="p-8 border-2 border-dashed border-red-300 rounded-lg text-center bg-red-50">
        <h2 className="text-xl font-semibold text-red-800">Plan de Evaluación Incompleto</h2>
        <p className="mt-2 text-red-600">
          El total ponderado de las evaluaciones es <strong>{totalPonderado}%</strong>. 
          <br/>
          Debe ser exactamente <strong>100%</strong> para poder registrar y calcular las notas finales.
        </p>
      </section>
    );
  }

  if (estudiantes.length === 0 || evaluaciones.length === 0) {
    return (
        <div className="text-center text-gray-500 py-8">
            <p>Añade estudiantes y evaluaciones para ver el consolidado de notas.</p>
        </div>
    );
  }
  
  if (loading) return <p>Cargando notas...</p>;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Consolidado de Notas</h2>
        <Button onClick={handleExportCSV} variant="outline" className="bg-green-600 hover:bg-green-700 text-white">
          Exportar a Excel (CSV)
        </Button>
      </div>
      <div className="overflow-x-auto">
          {/* ... (La tabla sigue igual, pero puedes usar los componentes de tabla de shadcn) ... */}
      </div>
    </section>
  );
}