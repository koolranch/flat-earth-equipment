export default {
  title: 'Guía para instructores',
  intro: 'Asigne asientos, evalúe prácticas y exporte registros.',
  sections: [
    { 
      h: 'Asignar asientos', 
      p: 'Vaya a Herramientas del instructor → Asignar asientos. Pegue correos o cargue CSV. Usuarios existentes se inscriben; nuevos quedan invitados.', 
      tips: ['CSV con columna email', 'Puede asignar a varios cursos'] 
    },
    { 
      h: 'Lista y progreso', 
      p: 'Filtre por curso, busque por nombre/correo y exporte CSV para registros.', 
      tips: ['Los códigos y PDFs aparecen tras aprobar'] 
    },
    { 
      h: 'Evaluación práctica', 
      p: 'Abra Lista → Evaluar. Complete nombre/cargo, sitio, fecha y firme. Marque aprobación práctica para actualizar el certificado.', 
      tips: ['Las firmas se guardan con hora e ID de usuario'] 
    },
    { 
      h: 'Verificar certificados', 
      p: 'Cualquiera puede visitar /verify/{code} para validar un certificado.', 
      tips: ['Códigos únicos con QR en el PDF'] 
    }
  ]
}
