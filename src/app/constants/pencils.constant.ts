import { Pencil } from "../interfaces/pencil.interface";

export const brushTypes: Pencil[] = [
  {
    id: 'round',
    name: 'Redondo',
    lineCap: 'round',  // perfecto para líneas suaves y circulares
    lineJoin: 'round',
    icon: 'icons/brush-round.png'
  },
  {
    id: 'square',
    name: 'Cuadrado',
    lineCap: 'square', // líneas con terminación cuadrada
    lineJoin: 'miter', // ángulos afilados
    icon: 'icons/brush-square.png'
  },
  {
    id: 'flat',
    name: 'Plano',
    lineCap: 'butt',   // terminación plana
    lineJoin: 'bevel', // terminación biselada
    icon: 'icons/brush-flat.png'
  },
  {
    id: 'spray',
    name: 'Spray',
    lineCap: 'round',  // redondeado para efecto spray
    lineJoin: 'round',
    icon: 'icons/brush-spray.png'
  },
  {
    id: 'calligraphy',
    name: 'Caligrafía',
    lineCap: 'butt',   // pincel caligráfico suele plano
    lineJoin: 'miter',
    icon: 'icons/brush-calligraphy.png'
  }
];
