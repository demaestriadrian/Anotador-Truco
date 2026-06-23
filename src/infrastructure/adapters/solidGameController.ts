// Adaptador que conecta el core (framework-agnóstico) con SolidJS.
//
// Esto es lo que hace que "la UI responda al core": el ÚNICO origen de verdad del
// marcador es el `GameEngine` (dominio puro). El store de Solid es solo un ESPEJO
// reactivo de su estado: cada vez que el engine emite un snapshot, lo reconciliamos
// dentro del store y la UI reacciona de forma granular. La UI nunca muta el estado
// directamente; solo despacha comandos a través de las acciones que se exportan acá.
import { createStore, reconcile } from 'solid-js/store';

import { GameEngine } from '@/core/application/GameEngine';
import type { GameSnapshot } from '@/core/ports/types';
import type { TeamId, Limit } from '@/core/domain/constants';

// Instancia única (singleton de módulo): un solo engine para toda la app.
// Es la autoridad del marcador; todo lo demás es presentación.
const engine = new GameEngine();

// Store de Solid inicializado con el snapshot actual del engine.
// `state` es el espejo reactivo; `setState` solo lo usa este módulo para sincronizar.
const [state, setState] = createStore<GameSnapshot>(engine.getState());

// Suscribe el store al engine: ante cada cambio, `reconcile` calcula el diff mínimo
// contra el store actual para que Solid actualice únicamente lo que cambió (reactividad
// granular), en lugar de reemplazar el árbol entero.
engine.subscribe((s) => setState(reconcile(s)));

// Estado reactivo de SOLO LECTURA: la UI lee de acá, nunca lo muta.
export const gameState = state;

// Acciones: el ÚNICO canal por el que la UI modifica el marcador. Cada una traduce
// una intención de la UI en un comando serializable que se despacha al engine.
export const sumarPunto = (id: TeamId) =>
  engine.dispatch({ type: 'ADD_POINTS', teamId: id, amount: 1 });

export const restarPunto = (id: TeamId) =>
  engine.dispatch({ type: 'REMOVE_POINTS', teamId: id, amount: 1 });

export const cambiarNombre = (id: TeamId, name: string) =>
  engine.dispatch({ type: 'SET_TEAM_NAME', teamId: id, name });

export const cambiarLimite = (limit: Limit) =>
  engine.dispatch({ type: 'SET_LIMIT', limit });

export const reiniciar = () => engine.dispatch({ type: 'RESET' });
