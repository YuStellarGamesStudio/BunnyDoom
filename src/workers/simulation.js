import { Game } from '../core/game.js';

let game = null;
let currentRun = null;

self.onmessage = ({ data }) => {
  if (!data || typeof data !== 'object') return;
  const { type, runId } = data;
  try {
    if (type === 'start') {
      game = new Game(data.options);
      currentRun = runId;
    } else if (type === 'hydrate') {
      game = Game.restore(data.state);
      currentRun = runId;
    } else {
      if (!game || currentRun !== runId) return;
      if (type === 'update') game.update(data.dt);
      else if (type === 'hit') game.hit(data.x, data.y);
      else if (type === 'special') game.special();
      else if (type === 'pause') game.pause(data.value);
      else return;
    }
    self.postMessage({ runId, snapshot: game.snapshot(), events: game.drainEvents() });
  } catch (error) {
    self.postMessage({ runId, error: error instanceof Error ? error.message : String(error) });
  }
};
