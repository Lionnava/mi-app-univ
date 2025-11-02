// components/EvaluacionForm.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Form.module.css';

// Ahora el formulario es más flexible y soporta modo edición
export default function EvaluacionForm({ seccionId, onFormSubmit, initialData = null, totalPonderacionActual = 0 }) {
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
        ponderacion: initialData.ponderacion,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const nuevaPonderacion = parseInt(formData.ponderacion);
    const ponderacionAnterior = isEditMode ? initialData.ponderacion : 0;
    const totalSinPonderacionAnterior = totalPonderacionActual - ponderacionAnterior;

    // Validación mejorada para modo edición
    if (totalSinPonderacionAnterior + nuevaPonderacion > 100) {
      setMessage(`Error: El total (${totalSinPonderacionAnterior + nuevaPonderacion}%) excedería el 100%.`);
      setLoading(false);
      return;
    }

    try {
      let error;
      if (isEditMode) {
        ({ error } = await supabase
          .from('evaluaciones')
          .update({ nombre_evaluacion: formData.nombre_evaluacion, ponderacion: nuevaPonderacion })
          .eq('id', initialData.id));
      } else {
        ({ error } = await supabase.from('evaluaciones').insert({
          nombre_evaluacion: formData.nombre_evaluacion,
          ponderacion: nuevaPonderacion,
          id_seccion: seccionId,
        }));
      }

      if (error) throw error;

      setMessage(isEditMode ? '¡Evaluación actualizada!' : '¡Evaluación creada!');
      if (!isEditMode) {
        setFormData({ nombre_evaluacion: '', ponderacion: '' });
      }

      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.formContainer}>
      <h4>{isEditMode ? 'Editar Evaluación' : 'Crear Nueva Evaluación'}</h4>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nombre_evaluacion" className={styles.label}>Nombre de la Evaluación:</label>
          <input id="nombre_evaluacion" name="nombre_evaluacion" value={formData.nombre_evaluacion} onChange={handleChange} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="ponderacion" className={styles.label}>Ponderación (%):</label>
          <input id="ponderacion" name="ponderacion" type="number" min="1" max="100" value={formData.ponderacion} onChange={handleChange} required className={styles.input} placeholder="Ej: 25" />
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Evaluación')}
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </section>
  );
}