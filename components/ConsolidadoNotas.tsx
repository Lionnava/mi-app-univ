// components/ConsolidadoNotas.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Estudiante, Evaluacion } from '@/types';

// Definimos las props
interface ConsolidadoNotasProps {
  estudiantes: Estudiante[];
  evaluaciones: Evaluacion[];
  nombreSeccion: string;
  totalPonderado: number;
};

export default function ConsolidadoNotas({ estudiantes, evaluaciones, nombreSeccion, totalPonderado }: ConsolidadoNotasProps) {
  // ... (el resto de la lógica no cambia, pero asegúrate de que esté completa)
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // ... (useEffect y otras funciones)

  if (totalPonderado !== 100) { /* ... (código de advertencia) */ }
  // ... (resto del return)
}