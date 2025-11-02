// components/EvaluacionesLista.tsx
'use client';
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Evaluacion } from "@/types";

interface EvaluacionesListaProps {
  evaluaciones: Evaluacion[];
  onEditarEvaluacion: (evaluacion: Evaluacion) => void;
  onEliminarEvaluacion: (evaluacionId: string) => void;
}

export default function EvaluacionesLista({ evaluaciones, onEditarEvaluacion, onEliminarEvaluacion }: EvaluacionesListaProps) {
  const totalPonderacion = evaluaciones.reduce((sum, item) => sum + item.ponderacion, 0);

  let statusStyle = { color: 'black', fontWeight: 'normal', marginLeft: '10px' };
  let statusMessage = '';
  // ... (lógica de mensajes dinámicos sin cambios) ...

  const handleEliminarClick = (evaluacion: Evaluacion) => {
    if (window.confirm(`¿Seguro que quieres eliminar la evaluación "${evaluacion.nombre_evaluacion}"?`)) {
      onEliminarEvaluacion(evaluacion.id);
    }
  };

  return (
    <section>
      <h4 className="font-semibold mb-2">Plan de Evaluación</h4>
      {evaluaciones.length > 0 ? (
        <>
          <ul className="list-none p-0 space-y-2">
            {evaluaciones.map((evaluacion) => (
              <li key={evaluacion.id} className="flex justify-between items-center p-2 border-b">
                <span>{evaluacion.nombre_evaluacion} <strong>({evaluacion.ponderacion}%)</strong></span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon" onClick={() => onEditarEvaluacion(evaluacion)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleEliminarClick(evaluacion)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold mt-4 pt-4 border-t-2 border-gray-800">
            Total Ponderado: {totalPonderacion}%
            <span style={statusStyle}>{statusMessage}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-center text-muted-foreground">Aún no has creado ninguna evaluación.</p>
      )}
    </section>
  );
}