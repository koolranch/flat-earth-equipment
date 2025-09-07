export default {
  title: 'Búsqueda de Peligros',
  scenes: {
    bay: 'Bahía de Almacén',
    corner: 'Esquina Ciega',
    ramp: 'Muelle y Rampa'
  },
  hazards: {
    spill: 'Derrame / Fuga',
    pedestrian: 'Zona Peatonal',
    overhead: 'Obstrucción Superior',
    unstable: 'Carga Inestable',
    speed: 'Zona de Velocidad',
    blindCorner: 'Esquina Ciega',
    rampSlope: 'Rampa / Pendiente',
    dockEdge: 'Borde del Muelle'
  }
} as const;
