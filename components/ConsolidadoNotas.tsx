// components/ConsolidadoNotas.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// --- AQUÍ ESTÁ LA CORRECCIÓN CLAVE ---
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    if(totalPonderado === 100) {
        fetchNotas();
    } else {
        setLoading(false);
    }
  }, [estudiantes, totalPonderado]);

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

  const handleExportCSV = () => {
    const headers = ['Cedula', 'Apellido', 'Nombre', ...evaluaciones.map(ev => `${ev.nombre_evaluacion} (${ev.ponderacion}%)`), 'Nota Final'];
    const data = estudiantes.map(estudiante => {
      const row: Record<string, any> = { 'Cedula': estudiante.cedula, 'Apellido': estudiante.apellido, 'Nombre': estudiante.nombre };
      evaluaciones.forEach(ev => {
        const nota = notas[`${estudiante.id}-${ev.id}`] || 0;
        row[`${ev.nombre_evaluacion} (${ev.ponderacion}%)`] = nota;
      });
      row['Nota Final'] = calcularNotaFinal(estudiante.id);
      return row;
    });
    const csv = Papa.unparse({ fields: headers, data: data });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `notas_${nombreSeccion.replace(/\s+/g, '_')}_${fecha}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (totalPonderado !== 100 && evaluaciones.length > 0) {
    return (
      <Card className="p-8 border-2 border-dashed border-destructive bg-destructive/10 text-center">
        <CardHeader>
            <CardTitle className="text-xl font-semibold text-destructive-foreground">Plan de Evaluación Incompleto</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="mt-2 text-destructive-foreground/80">
            El total ponderado es <strong>{totalPonderado}%</strong>. 
            <br/>
            Debe ser exactamente <strong>100%</strong> para poder registrar y calcular las notas finales.
            </p>
        </CardContent>
      </Card>
    );
  }

  if (estudiantes.length === 0 || evaluaciones.length === 0) {
    return (
        <Card className="text-center text-muted-foreground p-8">
            <p>Añade estudiantes y define un plan de evaluación del 100% para ver el consolidado.</p>
        </Card>
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
                    <TableHead className="text-right font-bold">Nota Final</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {estudiantes.map(estudiante => (
                    <TableRow key={estudiante.id}>
                        <TableCell className="font-medium">{estudiante.apellido}, {estudiante.nombre}</TableCell>
                        {evaluaciones.map(evaluacion => (
                        <TableCell key={evaluacion.id}>
                            <Input
                            type="number" min="0" max="20" step="0.1"
                            className="w-24 mx-auto text-center"
                            defaultValue={notas[`${estudiante.id}-${evaluacion.id}`] || ''}
                            onBlur={(e) => handleSaveNota(estudiante.id, evaluacion.id, e.target.value)}
                            />
                        </TableCell>
                        ))}
                        <TableCell className="text-right font-bold text-lg">
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