// app/secciones/[seccionId]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Tipos
import type { Seccion, Estudiante, Evaluacion } from '@/types';

// Componentes
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Modal from '@/components/Modal';
import EstudianteForm from '@/components/EstudianteForm';
import EstudiantesLista from '@/components/EstudiantesLista';
import EvaluacionForm from '@/components/EvaluacionForm';
import EvaluacionesLista from '@/components/EvaluacionesLista';
import ConsolidadoNotas from '@/components/ConsolidadoNotas';
import HorarioForm from '@/components/HorarioForm'; // <<== Importamos el nuevo formulario

// Definimos un tipo para los bloques de horario
type BloqueHorario = {
    id: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    aula: string;
};

export default function SeccionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const seccionId = params.seccionId as string;

  const [seccion, setSeccion] = useState<Seccion | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [horario, setHorario] = useState<BloqueHorario[]>([]); // <<== Nuevo estado para el horario
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Estudiante | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluacion | null>(null);

  // --- Funciones de Carga de Datos ---
  const fetchEstudiantes = useCallback(async () => { /* ... */ }, [seccionId]);
  const fetchEvaluaciones = useCallback(async () => { /* ... */ }, [seccionId]);
  const fetchHorario = useCallback(async () => {
    if (!seccionId) return;
    const { data, error } = await supabase.from('horario').select('*').eq('id_seccion', seccionId).order('dia_semana').order('hora_inicio');
    if (error) console.error("Error cargando horario:", error);
    else setHorario(data || []);
  }, [seccionId]);

  // --- Handlers ---
  const handleEliminarEstudiante = async (estudianteId: string) => { /* ... */ };
  const handleEstudianteFormSubmit = () => { /* ... */ };
  const handleEliminarEvaluacion = async (evaluacionId: string) => { /* ... */ };
  const handleEvaluacionFormSubmit = () => { /* ... */ };

  useEffect(() => {
    if (!seccionId) return;
    const checkUserAndFetchAllData = async () => {
      try {
        // ... (lógica de checkUser y fetchSeccion)
        if (seccionData) {
          setSeccion(seccionData);
          // Añadimos fetchHorario a la carga inicial
          await Promise.all([ fetchEstudiantes(), fetchEvaluaciones(), fetchHorario() ]);
        }
      } catch (error) { /* ... */ } 
      finally { setLoading(false); }
    };
    checkUserAndFetchAllData();
  }, [seccionId, router, fetchEstudiantes, fetchEvaluaciones, fetchHorario]); // <<== Añadimos fetchHorario

  // ... (resto de la lógica y condicionales de carga)

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div>
      <nav className="mb-4">
        <Button variant="outline" asChild><Link href="/dashboard">← Volver al Panel</Link></Button>
      </nav>
      {/* ... (Header sin cambios) ... */}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* ... (Card de Estudiantes sin cambios) ... */}
        {/* ... (Card de Plan de Evaluación sin cambios) ... */}
      </div>

      <div className="mt-8">
        <ConsolidadoNotas /* ... */ />
      </div>

      {/* --- NUEVA CARD PARA EL HORARIO --- */}
      <div className="mt-8">
        <Card>
            <CardHeader><CardTitle>Horario de la Sección</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <HorarioForm seccionId={seccion.id} onBloqueCreado={fetchHorario} />
                <div>
                    <h4 className="font-semibold mb-2">Bloques Asignados</h4>
                    {horario.length > 0 ? (
                        <div className="border rounded-md">
                            {horario.map(bloque => (
                                <div key={bloque.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                    <span>
                                        <strong>{diasSemana[bloque.dia_semana - 1]}</strong> de {bloque.hora_inicio} a {bloque.hora_fin}
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">Aula: {bloque.aula}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">No hay bloques de horario asignados a esta sección.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* ... (Modales sin cambios) ... */}
    </div>
  );
}