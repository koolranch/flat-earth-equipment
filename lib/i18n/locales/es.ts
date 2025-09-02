export const es = {
  common: {
    app_title: 'Flat Earth Safety', resume: 'Reanudar', start: 'Comenzar', next: 'Siguiente', back: 'Atrás', submit: 'Enviar', save: 'Guardar', cancel: 'Cancelar', copy_link: 'Copiar enlace', open_pdf: 'Abrir PDF', view_qr: 'QR', locked: 'Bloqueado', unlocked: 'Desbloqueado', pass: 'Aprobado', fail: 'Reprobado', try_again: 'Inténtalo de nuevo', loading: 'Cargando…'
  },
  training: {
    hub_title: 'Tu capacitación', modules_complete_to_unlock_exam: 'Completa todos los módulos para desbloquear el examen.', final_exam: 'Examen final', pass_to_generate_cert: 'Aprueba para generar tu certificado', progress_label: 'Progreso', module: 'Módulo', demo: 'Demostración', quiz: 'Cuestionario', minutes: 'min', resume_training: 'Reanudar capacitación', continue: 'Continuar', start_module: 'Iniciar módulo'
  },
  exam: {
    title: 'Examen final', results_title: 'Examen final — Resultados', passed_title: 'Aprobado', failed_title: 'Inténtalo de nuevo', review_incorrect: 'Revisar respuestas incorrectas', score_label: 'Puntaje', retake_exam: 'Repetir examen', view_records: 'Ver registros'
  },
  records: {
    title: 'Registros y certificados', verification: 'Verificación', exam_col: 'Examen', attempts: 'intentos', certificate_downloaded: 'Certificado descargado', no_records: 'Aún no hay registros'
  },
  verify: {
    page_title: 'Verificación de certificado', learner: 'Alumno', issued: 'Emitido', expires: 'Vence', practical: 'Práctico', verification_code: 'Código de verificación', certificate_not_found: 'Certificado no encontrado.'
  },
  eval: {
    title: 'Evaluación práctica', competencies: 'Competencias (OSHA 1910.178(l))', result: 'Resultado', pass_label: 'Aprobado', needs_refresher: 'Reforzamiento necesario', undecided: 'Sin decidir', evaluator_name: 'Nombre del evaluador', evaluator_title: 'Cargo del evaluador', site: 'Sitio/ubicación', date: 'Fecha', notes: 'Notas', evaluator_signature: 'Firma del evaluador', trainee_signature: 'Firma del alumno', save_evaluation: 'Guardar evaluación', save_signature: 'Guardar firma', print: 'Imprimir',
    competencies_labels: {
      preop: 'Inspección previa a la operación', controls: 'Controles e instrumentos', travel: 'Desplazamiento seguro', loadHandling: 'Manipulación y apilado de cargas', pedestrians: 'Seguridad de peatones', ramps: 'Rampas e inclinaciones', stability: 'Triángulo de estabilidad', refuel: 'Repostar/Carga', shutdown: 'Estacionado y apagado'
    }
  },
  trainer: {
    tools_title: 'Herramientas del instructor', roster: 'Lista', invites: 'Invitaciones', export_csv: 'Exportar CSV', status_counts: 'Conteos'
  },
  games: {
    stability_title: 'Triángulo de estabilidad', stability_score: 'Puntaje de estabilidad', holding_pass: 'Manteniendo APROBADO… {s}s', reset: 'Restablecer', mark_complete: 'Marcar como completo',
    load_weight: 'Peso de la carga (lb)', load_center: 'Centro de carga (in)', mast_tilt: 'Inclinación del mástil (°)', speed: 'Velocidad (mph)',
    hint_weight: 'Mantén por debajo de la capacidad nominal', hint_lc: 'Más cerca del mástil es más estable', hint_tilt: 'Demasiada inclinación reduce estabilidad', hint_speed: 'Menor velocidad cerca de riesgos'
  },
  errors: { unauthorized: 'Inicia sesión para continuar.', forbidden: 'Acceso denegado.', not_found: 'No encontrado.' }
} as const;
