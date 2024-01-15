import './HUD.css';
import { createSignal } from 'solid-js';
import { GameInfo } from '../GameInfo';
import { COMBO_CHANGE, ENTER_CRASHED, PICKUP_PRESENT, SCORE_CHANGE } from '../eventTypes';
import { calculateTotalScore } from '../util/calculateTotalScore';
import { IScore } from '../State';

export const HUD = () => {
  const [presents, setPresents] = createSignal(0);
  const [combo, setCombo] = createSignal('-');
  const [score, setScore] = createSignal(0);

  // Temporary probably
  GameInfo.observer.on(PICKUP_PRESENT, total => setPresents(total));
  GameInfo.observer.on(COMBO_CHANGE, (accumulated, multiplier) => setCombo(accumulated ? (accumulated + 'x' + multiplier) : '-'));
  GameInfo.observer.on(SCORE_CHANGE, (score: IScore) => setScore(calculateTotalScore(score)));
  GameInfo.observer.on(ENTER_CRASHED, (score: IScore, id: string) => {
    if (id !== GameInfo.possessedCharacterId) return;
    if (score.finishedLevel) return;
    setCombo('-');
  });

  return (
    <>
      <div class="game-ui-item distance">
        <div class="label">Presents</div>
        <div class="value" id="hud-distance">{presents()} x</div>
      </div>
      <div class="game-ui-item combo">
        <div class="label">Combo</div>
        <div class="value" id="hud-combo">{combo()}</div>
      </div>
      <div class="game-ui-item score">
        <div class="label">Score</div>
        <div class="value" id="hud-score">{score()}</div>
      </div>

      {/* <div id="unsupported-browser-notice" class="hidden">This game hasn't been optimized for this browser (yet). In case it
        doesn't run well, consider using Chrome or Edge to play it.</div> */}
    </>
  );
};
