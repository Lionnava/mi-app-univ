// components/EstudiantesLista.tsx
'use client';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import type { Estudiante } from "@/types";

interface EstudiantesListaProps {
  estudiantes: Estudiante[];
  onEliminarEstudiante: (estudianteId: string) => void;
  onEditarEstudiante: (estudiante: Estudiante) => void;
}

export default function EstudiantesLista({ estudiantes, onEliminarEstudiante, onEditarEstudiante }: EstudiantesListaProps) {
  const handleEliminarClick = (estudiante: Estudiante) => {
    if (window.confirm(`¿Seguro que quieres eliminar a ${estudiante.nombre} ${estudiante.apellido}?`)) {
      onEliminarEstudiante(estudiante.id);
    }
  };

  if (estudiantes.length === 0) {
    return <p className="text-sm text-center text-muted-foreground">Aún no hay estudiantes en esta sección.</p>;
  }

  return (
    <section>
      <h4 className="font-semibold mb-2">Estudiantes Inscritos</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estudiantes.map((estudiante) => (
            <TableRow key={estudiante.id}>
              <TableCell>{estudiante.nombre}</TableCell>
              <TableCell>{estudiante.apellido}</TableCell>
              <TableCell>{estudiante.cedula}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button variant="secondary" size="icon" onClick={() => onEditarEstudiante(estudiante)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleEliminarClick(estudiante)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}