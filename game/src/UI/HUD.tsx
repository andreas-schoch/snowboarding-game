import { createSignal, onMount } from 'solid-js';

export const HUD = () => {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <div class="game-ui-item distance">
        <div class="label">Presents</div>
        <div class="value" id="hud-distance">0x</div>
      </div>
      <div class="game-ui-item combo">
        <div class="label">Combo</div>
        <div class="value" id="hud-combo">-</div>
      </div>
      <div class="game-ui-item score">
        <div class="label">Score</div>
        <div class="value" id="hud-score">0</div>
      </div>

      {/* <div id="unsupported-browser-notice" class="hidden">This game hasn't been optimized for this browser (yet). In case it
        doesn't run well, consider using Chrome or Edge to play it.</div> */}
    </>
  );
};
