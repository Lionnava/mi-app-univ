// components/ConsolidadoNotas.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Estudiante, Evaluacion } from '@/types';

interface ConsolidadoNotasProps {
  estudiantes: Estudiante[];
  evaluaciones: Evaluacion[];
  nombreSeccion: string;
  totalPonderado: number;
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

  const handleSaveNota = async (estudianteId: string, evaluacionId: string, calificacion: string) => {
    const notaNum = parseFloat(calificacion);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) return;
    const { error } = await supabase.from('notas').upsert({
      id_estudiante: estudianteId,
      id_evaluacion: evaluacionId,
      calificacion: notaNum,
    }, { onConflict: 'id_estudiante, id_evaluacion' });
    if (error) {
        console.error("Error guardando nota:", error);
    } else {
        setNotas(prev => ({ ...prev, [`${estudianteId}-${evaluacionId}`]: notaNum }));
    }
  };

  const calcularNotaFinal = (estudianteId: string): string => {
    let notaFinal = 0;
    evaluaciones.forEach(evaluacion => {
      const nota = notas[`${estudianteId}-${evaluacion.id}`] || 0;
      const ponderacion = evaluacion.ponderacion / 100;
      notaFinal += nota * ponderacion;
    });
    return notaFinal.toFixed(2);
  };

  const handleExportCSV = () => { /* ... (código sin cambios) ... */ };

  if (totalPonderado !== 100) {
    return (
      <Card className="p-8 border-2 border-dashed border-destructive bg-destructive/10 text-center">
        <h2 className="text-xl font-semibold text-destructive-foreground">Plan de Evaluación Incompleto</h2>
        <p className="mt-2 text-destructive-foreground/80">
          El total ponderado es <strong>{totalPonderado}%</strong>. Debe ser <strong>100%</strong> para registrar notas.
        </p>
      </Card>
    );
  }

  if (estudiantes.length === 0 || evaluaciones.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <p>Añade estudiantes y evaluaciones para ver el consolidado de notas.</p>
        </div>
    );
  }
  
  if (loading) return <p>Cargando notas...</p>;

  return (
    <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Consolidado de Notas</CardTitle>
            <Button onClick={handleExportCSV} variant="outline" className="bg-green-600 hover:bg-green-700 text-white">
            Exportar a Excel (CSV)
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Estudiante</TableHead>
                    {evaluaciones.map(ev => (
                        <TableHead key={ev.id} className="text-center">{ev.nombre_evaluacion} ({ev.ponderacion}%)</TableHead>
                    ))}
                    <TableHead className="text-center">Nota Final</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {estudiantes.map(estudiante => (
                    <TableRow key={estudiante.id}>
                        <TableCell className="font-medium">{estudiante.apellido}, {estudiante.nombre}</TableCell>
                        {evaluaciones.map(evaluacion => (
                        <TableCell key={evaluacion.id} className="text-center">
                            <Input
                            type="number" min="0" max="20" step="0.1"
                            className="w-20 mx-auto"
                            defaultValue={notas[`${estudiante.id}-${evaluacion.id}`] || ''}
                            onBlur={(e) => handleSaveNota(estudiante.id, evaluacion.id, e.target.value)}
                            />
                        </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-lg">
                        {calcularNotaFinal(estudiante.id)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}