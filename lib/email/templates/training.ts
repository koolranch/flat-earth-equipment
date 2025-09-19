export function learnerWelcomeEmail(opts: { 
  learnerName: string; 
  courseTitle: string; 
  loginUrl: string;
  locale?: 'en' | 'es';
}) {
  const { learnerName, courseTitle, loginUrl, locale = 'en' } = opts;
  
  const content = {
    en: {
      subject: `Welcome to ${courseTitle}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F76511;">Welcome to Flat Earth Safety!</h1>
          <p>Hi ${learnerName},</p>
          <p>Your <strong>${courseTitle}</strong> enrollment is now active. You can start your OSHA-compliant training immediately.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What's included:</h3>
            <ul>
              <li>Interactive training modules with demos</li>
              <li>OSHA 29 CFR 1910.178 compliance coverage</li>
              <li>Micro-quizzes and final exam</li>
              <li>QR-verifiable certificate upon completion</li>
            </ul>
          </div>
          
          <p><a href="${loginUrl}" style="background: #F76511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Training</a></p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Questions? Reply to this email or visit our <a href="https://flatearthequipment.com/contact">contact page</a>.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            Flat Earth Safety<br>
            Modern Forklift Operator Training
          </p>
        </div>
      `
    },
    es: {
      subject: `¡Bienvenido a ${courseTitle}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F76511;">¡Bienvenido a Flat Earth Safety!</h1>
          <p>Hola ${learnerName},</p>
          <p>Su inscripción en <strong>${courseTitle}</strong> ya está activa. Puede comenzar su capacitación que cumple con OSHA inmediatamente.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Qué incluye:</h3>
            <ul>
              <li>Módulos de capacitación interactiva con demostraciones</li>
              <li>Cobertura de cumplimiento OSHA 29 CFR 1910.178</li>
              <li>Micro-cuestionarios y examen final</li>
              <li>Certificado verificable por QR al completar</li>
            </ul>
          </div>
          
          <p><a href="${loginUrl}" style="background: #F76511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Comenzar Capacitación</a></p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            ¿Preguntas? Responda a este correo o visite nuestra <a href="https://flatearthequipment.com/contact">página de contacto</a>.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            Flat Earth Safety<br>
            Capacitación Moderna de Operador de Montacargas
          </p>
        </div>
      `
    }
  };
  
  return content[locale];
}

export function trainerNotificationEmail(opts: {
  trainerEmail: string;
  learnerName: string;
  learnerEmail: string;
  courseTitle: string;
  orgName?: string;
  locale?: 'en' | 'es';
}) {
  const { trainerEmail, learnerName, learnerEmail, courseTitle, orgName, locale = 'en' } = opts;
  
  const content = {
    en: {
      subject: `New enrollment: ${learnerName} in ${courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F76511;">New Training Enrollment</h1>
          <p>A new learner has been enrolled in your training program.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Enrollment Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Learner:</strong> ${learnerName}</li>
              <li><strong>Email:</strong> ${learnerEmail}</li>
              <li><strong>Course:</strong> ${courseTitle}</li>
              ${orgName ? `<li><strong>Organization:</strong> ${orgName}</li>` : ''}
            </ul>
          </div>
          
          <p>The learner can now access their training dashboard and begin the certification process.</p>
          
          <p><a href="https://flatearthequipment.com/trainer" style="background: #F76511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Trainer Dashboard</a></p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Flat Earth Safety - Trainer Notification
          </p>
        </div>
      `
    },
    es: {
      subject: `Nueva inscripción: ${learnerName} en ${courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F76511;">Nueva Inscripción de Capacitación</h1>
          <p>Un nuevo estudiante ha sido inscrito en su programa de capacitación.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalles de Inscripción:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Estudiante:</strong> ${learnerName}</li>
              <li><strong>Correo:</strong> ${learnerEmail}</li>
              <li><strong>Curso:</strong> ${courseTitle}</li>
              ${orgName ? `<li><strong>Organización:</strong> ${orgName}</li>` : ''}
            </ul>
          </div>
          
          <p>El estudiante ahora puede acceder a su panel de capacitación y comenzar el proceso de certificación.</p>
          
          <p><a href="https://flatearthequipment.com/trainer" style="background: #F76511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Panel de Instructor</a></p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Flat Earth Safety - Notificación de Instructor
          </p>
        </div>
      `
    }
  };
  
  return content[locale];
}
