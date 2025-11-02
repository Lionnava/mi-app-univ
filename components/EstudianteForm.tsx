// components/EstudianteForm.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './Form.module.css';

// Ahora el formulario recibe más props para ser más flexible
export default function EstudianteForm({ seccionId, onFormSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Este efecto llena el formulario si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        cedula: initialData.cedula,
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

    try {
      let error;
      if (initialData) {
        // MODO EDICIÓN: Hacemos un 'update'
        ({ error } = await supabase
          .from('estudiantes')
          .update(formData)
          .eq('id', initialData.id));
      } else {
        // MODO CREACIÓN: Hacemos un 'insert'
        ({ error } = await supabase.from('estudiantes').insert({
          ...formData,
          id_seccion: seccionId,
        }));
      }

      if (error) throw error;

      setMessage(initialData ? '¡Estudiante actualizado!' : '¡Estudiante añadido!');
      if (!initialData) {
        setFormData({ nombre: '', apellido: '', cedula: '' });
      }

      if (onFormSubmit) {
        onFormSubmit(); // Avisamos al componente padre para que refresque la lista y cierre el modal
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!initialData;

  return (
    <section className={styles.formContainer}>
      <h4>{isEditMode ? 'Editar Estudiante' : 'Añadir Nuevo Estudiante'}</h4>
      <form onSubmit={handleSubmit}>
        {/* ... (los inputs del formulario son los mismos) ... */}
        <div className={styles.formGroup}>
          <label htmlFor="nombre" className={styles.label}>Nombre:</label>
          <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="apellido" className={styles.label}>Apellido:</label>
          <input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cedula" className={styles.label}>Cédula de Identidad:</label>
          <input id="cedula" name="cedula" value={formData.cedula} onChange={handleChange} required className={styles.input} />
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Añadir Estudiante')}
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </section>
  );
}