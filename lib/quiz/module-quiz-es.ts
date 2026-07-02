/**
 * Spanish (es) translations for the forklift module-quiz items served by
 * GET /api/quiz/module/[slug]?lang=es.
 *
 * Keyed by the production `quiz_items.id` (locale='en') UUID so the ES
 * response reuses the SAME rows — same ids, same order, same choice count,
 * same correct_index — with only the display text swapped. The quiz_items
 * table itself is never modified.
 *
 * Tone: formal usted, "montacargas"/"horquillas" terminology, matching the
 * mobile app's constants/trainingContentEs.ts.
 * Shipped without native review, 2026-07-02, per user waiver.
 */

export type QuizItemEsTranslation = {
  question: string;
  /** Must match the English choices array length and order. */
  choices: string[];
  explain?: string;
};

export const MODULE_QUIZ_ES: Record<string, QuizItemEsTranslation> = {
  /* ── pre-operation-inspection ─────────────────────────────── */

  // EN: "What is the first step in pre-operation safety?"
  '2222b503-007c-46a1-b648-186a39cafc3f': {
    question: '¿Cuál es el primer paso en la seguridad pre-operacional?',
    choices: [
      'Arrancar el motor',
      'Ponerse el EPP',
      'Revisar el combustible',
      'Sonar la bocina',
    ],
    explain: 'El equipo de protección personal debe ponerse antes de cualquier otro paso.',
  },
  // EN: "Seat belt use policy should be…"
  '1ce78c91-a0d6-4617-a484-a5cb7b662ccc': {
    question: 'La política de uso del cinturón de seguridad debe ser…',
    choices: [
      'Opcional por debajo de 5 mph',
      'Obligatorio siempre que esté sentado',
      'Solo en exteriores',
      'Solo al transportar una carga',
    ],
    explain: 'El cinturón de seguridad reduce el riesgo de ser expulsado en un volcamiento.',
  },
  // EN: "Which is an acceptable horn test?"
  '578a2d87-b774-4875-8d32-7a57d8a139e8': {
    question: '¿Cuál es una prueba de bocina aceptable?',
    choices: [
      'Un pitido rápido cerca de peatones',
      'Probarla en un área segura y verificar el nivel de sonido',
      'No se necesita probar la bocina',
      'Probarla solo en el muelle',
    ],
    explain: 'Pruebe los dispositivos de advertencia audibles durante la inspección.',
  },
  // EN: "Before starting the truck, forks should be…"
  '60863e0f-1356-487f-bac7-f0096ec31bf8': {
    question: 'Antes de arrancar el montacargas, las horquillas deben estar…',
    choices: [
      'Elevadas 12 pulgadas',
      'Bajadas al piso',
      'Inclinadas hacia adelante',
      'Apoyadas sobre una tarima',
    ],
    explain: 'Baje las horquillas para reducir el riesgo de golpear a alguien.',
  },
  // EN: "Which PPE item is typically required before operating a forklift?"
  'f48274f3-1366-4f57-921d-a10816d403dc': {
    question: '¿Qué artículo de EPP se requiere normalmente antes de operar un montacargas?',
    choices: [
      'Chaleco de alta visibilidad',
      'Botas con punta de acero',
      'Casco',
      'Todas las anteriores',
    ],
    explain: 'El empleador define el EPP, pero el chaleco, el calzado de seguridad y el casco son comunes.',
  },
  // EN: "During pre-op, a missing or unreadable nameplate means…"
  '418e7952-f988-4a7c-8af1-3641296d6cb5': {
    question: 'Durante la pre-operación, una placa de datos faltante o ilegible significa…',
    choices: [
      'Operar si conoce la capacidad',
      'Operar a media velocidad',
      'Etiquetar fuera de servicio y reportar',
      'Usar solo en interiores',
    ],
    explain: 'La capacidad y los aditamentos deben ser legibles; etiquete fuera de servicio y reporte.',
  },
  // EN: "Battery connector shows heat damage. You should…"
  '66009162-4e39-47bc-b4bd-dcc1368f29f0': {
    question: 'El conector de la batería muestra daño por calor. Usted debe…',
    choices: [
      'Golpearlo con una herramienta',
      'Operar con cuidado',
      'Etiquetar fuera de servicio y enviar a mantenimiento',
      'Envolverlo con cinta',
    ],
    explain: 'Los defectos eléctricos deben corregirse antes de usar el equipo.',
  },
  // EN: "Hydraulic hose with visible cracks or leaks means…"
  '7ba4d96c-d6d4-4491-8d2c-9b0aa5c0a954': {
    question: 'Una manguera hidráulica con grietas o fugas visibles significa…',
    choices: [
      'Limpiarla y revisarla en una semana',
      'Está bien si el sistema de elevación funciona',
      'Retirar el montacargas de servicio y reportar',
      'Apretar la tapa y continuar',
    ],
    explain: 'Las fugas y los defectos requieren retirar el equipo de servicio.',
  },
  // EN: "Best order to set up before travel:"
  'b1a3ff34-05e4-4ca4-a2ca-1178d829bcce': {
    question: 'Mejor orden de preparación antes de desplazarse:',
    choices: [
      'Inclinar el mástil hacia adelante → elevar las horquillas → soltar el freno',
      'Bajar las horquillas → neutral → poner el freno → probar la bocina',
      'Poner el freno → bajar las horquillas → neutral → revisar el área',
      'Neutral → dirección recta → poner el freno → bajar las horquillas',
    ],
    explain: 'Establezca una condición segura antes de moverse.',
  },

  /* ── eight-point-inspection ───────────────────────────────── */

  // EN: "Fluid under the truck suggests…"
  '1ce8a196-3c94-4768-80fe-c1871755195f': {
    question: 'Líquido debajo del montacargas sugiere…',
    choices: [
      'Condensación normal',
      'Fuga hidráulica o de combustible — etiquete fuera de servicio',
      'Una bebida derramada',
      'Ignorarlo si es pequeño',
    ],
    explain: 'Las fugas deben corregirse antes de operar.',
  },
  // EN: "The data plate lists…"
  'a9a9f4cf-50e4-4d47-a626-8b34fe2aa42b': {
    question: 'La placa de datos indica…',
    choices: [
      'La velocidad máxima',
      'La capacidad a un centro de carga específico',
      'El fabricante de las llantas',
      'El proveedor de combustible',
    ],
    explain: 'La capacidad aplica a un centro de carga establecido.',
  },
  // EN: "Which component is NOT part of the 8-point inspection?"
  'cc2a4fd5-305c-4281-97dd-6513cc7226a1': {
    question: '¿Qué componente NO forma parte de la inspección de 8 puntos?',
    choices: ['Llantas', 'Horquillas', 'Radio', 'Mástil'],
    explain: 'El radio no forma parte de la inspección de seguridad estándar de 8 puntos.',
  },
  // EN: "Lights and horn are…"
  'fb6ad241-2b98-4108-97ef-5745f8d3a807': {
    question: 'Las luces y la bocina son…',
    choices: [
      'Opcionales en interiores',
      'Obligatorias y deben funcionar',
      'Solo para el turno nocturno',
      'Solo para el instructor',
    ],
    explain: 'Las advertencias audibles y visuales deben funcionar.',
  },
  // EN: "Seat switch/parking brake interlocks…"
  '363234c4-02d7-4361-9613-8b4b0313a17b': {
    question: 'Los bloqueos de seguridad del interruptor de asiento y del freno de estacionamiento…',
    choices: [
      'Pueden anularse si se tiene cuidado',
      'Deben funcionar según su diseño',
      'Solo se necesitan en exteriores',
      'El instructor puede desactivarlos',
    ],
    explain: 'Nunca anule los bloqueos de seguridad.',
  },
  // EN: "Which tire condition requires removing the truck from service?"
  '752410af-0346-40a8-b02b-487222ebb6d8': {
    question: '¿Qué condición de llanta requiere retirar el montacargas de servicio?',
    choices: [
      'Desgaste uniforme de la banda de rodadura',
      'Objeto incrustado con pérdida de aire',
      'Polvo en el costado',
      'Corte cosmético menor',
    ],
    explain: 'Las fugas de aire o la estructura expuesta requieren servicio.',
  },
  // EN: "Hydraulic lift test during pre-op should…"
  '91741c4c-06a4-4eee-a218-3b6da0b7eef3': {
    question: 'La prueba de elevación hidráulica durante la pre-operación debe…',
    choices: [
      'Elevar a la altura máxima rápidamente',
      'Elevar lentamente y sostener sin descenso',
      'Omitirse para ahorrar tiempo',
      'Probarse solo con carga',
    ],
    explain: 'Verifique la elevación, la inclinación y el sostenimiento.',
  },
  // EN: "Chains with what condition must be replaced?"
  'd85d1533-6c28-47d5-bb22-b040cfe5f1ce': {
    question: '¿Las cadenas con qué condición deben reemplazarse?',
    choices: [
      'Aceite ligero',
      'Tensión uniforme',
      'Elongación o estiramiento',
      'Eslabones limpios',
    ],
    explain: 'El estiramiento, la elongación o los eslabones rotos son inseguros.',
  },
  // EN: "Forks should be removed from service when the heel thickness is…"
  'b53bff18-f418-4058-97ce-65b1b72c82ab': {
    question: 'Las horquillas deben retirarse de servicio cuando el espesor del talón esté…',
    choices: [
      'Desgastado un 10%',
      'Desgastado un 5%',
      'Con cualquier falta de pintura',
      'Con óxido superficial',
    ],
    explain: 'Un desgaste del 10% es el criterio común de retiro (consulte al fabricante).',
  },

  /* ── stability-and-load-handling ──────────────────────────── */

  // EN: "Traveling with a raised load affects…"
  '87bfc4a2-de3b-4556-87b1-5bba60e6bd10': {
    question: 'Desplazarse con la carga elevada afecta…',
    choices: [
      'Nada',
      'La estabilidad y la visibilidad',
      'Solo la vida de la batería',
      'El volumen de la bocina',
    ],
    explain: 'Mantenga la carga baja para conservar la estabilidad y la visibilidad.',
  },
  // EN: "Which reduces risk of forward tip?"
  '96c347cc-b1f4-4c5b-ac54-8c5cc8977af1': {
    question: '¿Qué reduce el riesgo de volcamiento hacia adelante?',
    choices: [
      'Inclinar el mástil hacia adelante al desplazarse',
      'Mantener la carga baja y ligeramente inclinada hacia atrás',
      'Conducir más rápido',
      'Girar en pendientes',
    ],
    explain: 'Una carga baja con ligera inclinación hacia atrás mejora la estabilidad.',
  },
  // EN: "As load center increases, allowable capacity…"
  'bd180da4-0aac-4a05-bbca-c71d5fa484a0': {
    question: 'Al aumentar el centro de carga, la capacidad permitida…',
    choices: ['Aumenta', 'Disminuye', 'Se mantiene igual', 'Se duplica'],
    explain: 'Cuanto más adelante esté la carga, menos peso se permite.',
  },
  // EN: "Best practice when approaching a rack with a load:"
  '5a1b1712-ee0f-493c-a5d8-5783a6a8cc01': {
    question: 'Mejor práctica al acercarse a un rack con carga:',
    choices: [
      'Acelerar para pasar',
      'Cuadrarse, detenerse y elevar solo cuando esté cerca',
      'Elevar temprano mientras se mueve',
      'Girar mientras eleva',
    ],
    explain: 'Deténgase, cuádrese y luego eleve para colocar la carga con control.',
  },
  // EN: "On a ramp with a load, travel…"
  '5afb91ca-e931-4b95-8cb3-a815aff7acff': {
    question: 'En una rampa con carga, desplácese…',
    choices: [
      'Con la carga cuesta arriba',
      'Con la carga cuesta abajo',
      'De lado',
      'En neutral, dejándose rodar',
    ],
    explain: 'Con carga: la carga cuesta arriba; sin carga: las horquillas cuesta abajo.',
  },
  // EN: "Turning quickly with an elevated load can…"
  '771c17ee-c3fe-4e06-b93a-1a61e8a62689': {
    question: 'Girar rápidamente con la carga elevada puede…',
    choices: [
      'Mejorar la productividad',
      'Reducir el desgaste de las llantas',
      'Causar un volcamiento',
      'Enfriar el sistema hidráulico',
    ],
    explain: 'Un centro de gravedad alto más fuerza lateral significa riesgo.',
  },
  // EN: "The stability triangle is formed by…"
  '8c9efff5-dd68-4cce-afa4-8b325fabf58f': {
    question: 'El triángulo de estabilidad está formado por…',
    choices: [
      'Solo el eje trasero',
      'El eje delantero y el punto medio del eje de dirección',
      'El mástil y las horquillas',
      'Solo el contrapeso',
    ],
    explain: 'Mantenga el centro de gravedad combinado dentro de este triángulo.',
  },
  // EN: "When using an attachment (e.g., clamp), capacity…"
  '8e5fcfe7-ec58-4536-9f33-ee667e08774b': {
    question: 'Al usar un aditamento (p. ej., una pinza), la capacidad…',
    choices: [
      'Aumenta',
      'No cambia',
      'Puede disminuir — consulte la placa',
      'Solo cambia en exteriores',
    ],
    explain: 'Los aditamentos reducen la capacidad; la placa debe reflejarlo.',
  },
  // EN: "The stability triangle is formed by which points?"
  'e0a5e0f7-47f6-44ba-9d21-49b10cee413f': {
    question: '¿Qué puntos forman el triángulo de estabilidad?',
    choices: [
      'Las ruedas delanteras y el eje trasero',
      'El eje delantero y las ruedas de dirección',
      'El mástil y el contrapeso',
      'La carga y las horquillas',
    ],
    explain: 'El triángulo de estabilidad se forma entre el eje delantero y el punto central del eje de dirección.',
  },

  /* ── safe-operation-and-hazards ───────────────────────────── */

  // EN: "Safe turning speed in tight aisles is…"
  '03b85db8-428b-4367-9486-0021a4b3fe50': {
    question: 'La velocidad segura de giro en pasillos estrechos es…',
    choices: [
      'La que se sienta bien',
      'Paso de caminata',
      'Velocidad máxima',
      'Según el ritmo de la música',
    ],
    explain: 'Mantenga la velocidad baja en áreas estrechas.',
  },
  // EN: "When a pedestrian makes eye contact and waves you on…"
  '20093f30-11c7-458a-8181-3af715dcaab6': {
    question: 'Cuando un peatón hace contacto visual y le cede el paso…',
    choices: [
      'Acelere de inmediato',
      'Avance con precaución y confirme que el camino esté libre',
      'Ignórelo',
      'Suene la bocina continuamente',
    ],
    explain: 'Confirme que el camino siga libre antes de moverse.',
  },
  // EN: "When approaching a pedestrian, you should:"
  '4f271aaa-f5e5-46c1-9f47-1c083b380a3d': {
    question: 'Al acercarse a un peatón, usted debe:',
    choices: [
      'Acelerar para pasar rápido',
      'Sonar la bocina continuamente',
      'Reducir la velocidad y ceder el paso',
      'Mantener la velocidad actual',
    ],
    explain: 'Siempre reduzca la velocidad y ceda el paso a los peatones por seguridad.',
  },
  // EN: "Right-of-way near marked walkways belongs to…"
  '5a7d7518-643b-45c1-ae01-e90494e8979e': {
    question: 'La prioridad de paso cerca de los pasillos peatonales marcados es de…',
    choices: [
      'Los montacargas',
      'Los peatones',
      'Los supervisores',
      'Quien vaya más rápido',
    ],
    explain: 'Los peatones primero.',
  },
  // EN: "At blind corners, you should…"
  '6535a9a9-f1df-4b69-a4c3-81737fe32092': {
    question: 'En las esquinas ciegas, usted debe…',
    choices: [
      'Acelerar',
      'Sonar la bocina y reducir la velocidad',
      'Girar amplio',
      'Mirar el teléfono',
    ],
    explain: 'Advierta con la bocina y reduzca la velocidad.',
  },
  // EN: "Carrying an unstable, poorly wrapped load…"
  '2c6a95ac-63c2-48d6-a57a-58e6ea6ebcfa': {
    question: 'Transportar una carga inestable o mal envuelta…',
    choices: [
      'Está bien a baja velocidad',
      'Requiere reacomodarla o asegurarla antes de desplazarse',
      'Ayuda a la visibilidad',
      'Seca el plástico de embalaje',
    ],
    explain: 'Estabilice las cargas antes de moverse.',
  },
  // EN: "If your view is blocked by the load, travel…"
  '7d3b91c6-4dd1-41c0-acbb-94cc6ad5aa8a': {
    question: 'Si la carga bloquea su vista, desplácese…',
    choices: [
      'Hacia adelante de todos modos',
      'En reversa si es seguro, con un guía si es necesario',
      'Elevando la carga para ver',
      'Solo con la baliza encendida',
    ],
    explain: 'Desplácese en la dirección con mejor visibilidad.',
  },
  // EN: "Approaching a dock edge, you should…"
  'be2e50c8-3105-4972-9277-1efee111bddb': {
    question: 'Al acercarse al borde de un muelle, usted debe…',
    choices: [
      'Confiar en la memoria',
      'Detenerse en la barrera o línea y verificar el borde',
      'Sonar la bocina y continuar',
      'Elevar las horquillas',
    ],
    explain: 'Prevenga caídas — verifique el borde y la placa de muelle.',
  },
  // EN: "Battery charging area requires…"
  'ecb08178-4fc4-4fed-b4bb-3cad29b1d337': {
    question: 'El área de carga de baterías requiere…',
    choices: [
      'Ninguna ventilación',
      'Ningún lavaojos',
      'Sin llamas ni chispas, y con ventilación',
      'Comer ahí el almuerzo',
    ],
    explain: 'Elimine las fuentes de ignición; provea ventilación y EPP.',
  },

  /* ── shutdown-and-parking ─────────────────────────────────── */

  // EN: "What is the last step in the shutdown sequence?"
  '4f6896d2-da25-436c-be85-dc2801a5aabe': {
    question: '¿Cuál es el último paso en la secuencia de apagado?',
    choices: [
      'Apagar la llave',
      'Poner el freno',
      'Colocar la calza de rueda',
      'Bajar las horquillas',
    ],
    explain: 'La calza de rueda es el paso final para asegurar el montacargas.',
  },
  // EN: "Parking in front of fire equipment is…"
  '64e1acd9-4f28-45ba-9114-ac0a063e646e': {
    question: 'Estacionar frente a equipos contra incendios está…',
    choices: [
      'Permitido si es rápido',
      'Nunca permitido',
      'Bien después del horario laboral',
      'Permitido solo para el instructor',
    ],
    explain: 'No bloquee los equipos de emergencia.',
  },
  // EN: "Before leaving the seat, forks should be…"
  '0ea0017b-1a0f-4c57-b5c4-741671dc5261': {
    question: 'Antes de dejar el asiento, las horquillas deben estar…',
    choices: [
      'Ligeramente elevadas',
      'Bajadas y planas sobre el piso',
      'A la altura del parachoques',
      'Sobre una tarima',
    ],
    explain: 'Baje las horquillas planas al piso antes de descender.',
  },
  // EN: "After shutdown you notice a small hydraulic leak. You should…"
  '0f2b3312-666d-4e2f-be5e-5bf135a1eafb': {
    question: 'Después del apagado nota una pequeña fuga hidráulica. Usted debe…',
    choices: [
      'Ignorarla',
      'Etiquetar fuera de servicio y reportar',
      'Agregar agua',
      'Limpiarla y continuar',
    ],
    explain: 'Retire el equipo de servicio hasta que sea reparado.',
  },
  // EN: "Correct parking sequence includes…"
  '8c2a3d1c-c8f7-48ec-a4ff-d693a754d688': {
    question: 'La secuencia correcta de estacionamiento incluye…',
    choices: [
      'Apagar la llave y luego poner el freno',
      'Neutral → dirección recta → poner el freno → bajar las horquillas → apagar la llave',
      'Elevar las horquillas como señal',
      'Dejarlo encendido brevemente',
    ],
    explain: 'Siga un orden seguro y consistente.',
  },
  // EN: "Electric truck at end of shift…"
  'c228ad42-9f9c-4789-a4fb-60c1c559bcac': {
    question: 'Un montacargas eléctrico al final del turno…',
    choices: [
      'Se estaciona y se deja sin más',
      'Se conecta al cargador cuando se requiera',
      'Se deja con la llave puesta',
      'Se inclina el mástil hacia adelante',
    ],
    explain: 'Cargue según la política del sitio; retire la llave.',
  },
  // EN: "Fork tips pointing out into an aisle when parked…"
  'e0c8b25a-30c0-497b-8070-20db91bf7d0f': {
    question: 'Las puntas de las horquillas sobresaliendo hacia un pasillo al estacionar…',
    choices: [
      'Son inofensivas',
      'Crean un riesgo de golpe',
      'Ayudan a la visibilidad',
      'Ahorran tiempo',
    ],
    explain: 'Las horquillas que sobresalen hacia las rutas de tránsito son peligrosas.',
  },
  // EN: "Key control policy means…"
  'e7ca3f42-f4cf-4e88-b3ce-daba57705456': {
    question: 'La política de control de llaves significa…',
    choices: [
      'Dejar las llaves puestas por conveniencia',
      'Retirar la llave cuando el equipo esté desatendido',
      'Compartir las llaves con visitantes',
      'Pegar la llave al tablero con cinta',
    ],
    explain: 'Prevenga el uso no autorizado.',
  },
  // EN: "On an incline, after parking you should…"
  '94cd6930-6562-46ad-831c-9206ef32464b': {
    question: 'En una pendiente, después de estacionar usted debe…',
    choices: [
      'Omitir las calzas',
      'Calzar una rueda según se requiera',
      'Dejar las horquillas elevadas',
      'Girar las ruedas bruscamente',
    ],
    explain: 'Prevenga que el equipo ruede usando calzas en las pendientes.',
  },
};

type TranslatableQuizItem = {
  id: string;
  question: string;
  choices: unknown;
  explain: string | null;
};

/**
 * Overlays Spanish text onto English quiz_items rows. Ids, order, item count,
 * and correct_index are untouched, so grading is identical to English.
 * Items without a translation (or with a choices-length mismatch, e.g. an
 * edited row) pass through in English rather than risking a misaligned
 * correct answer.
 */
export function applyEsTranslations<T extends TranslatableQuizItem>(items: T[]): T[] {
  return items.map((item) => {
    const t = MODULE_QUIZ_ES[item.id];
    if (!t) return item;
    if (!Array.isArray(item.choices) || item.choices.length !== t.choices.length) return item;
    return {
      ...item,
      locale: 'es',
      question: t.question,
      choices: t.choices,
      explain: t.explain ?? item.explain,
    };
  });
}
