import './HUD.css';
import {createSignal} from 'solid-js';
import {GameInfo} from '../GameInfo';
import {IScore} from '../State';
import {COMBO_CHANGE, COMBO_LEEWAY_UPDATE, ENTER_CRASHED, LEVEL_FINISH, PICKUP_PRESENT, SCORE_CHANGE} from '../eventTypes';
import {calculateTotalScore} from '../util/calculateTotalScore';

export const HUD = () => {
  let comboLeewayCircle: HTMLElement;
  const [presents, setPresents] = createSignal(0);
  const [combo, setCombo] = createSignal('-');
  const [score, setScore] = createSignal(0);

  GameInfo.observer.on(PICKUP_PRESENT, total => setPresents(total));
  GameInfo.observer.on(COMBO_CHANGE, (accumulated, multiplier) => setCombo(accumulated ? (accumulated + 'x' + multiplier) : '-'));
  GameInfo.observer.on(SCORE_CHANGE, (score: IScore) => {
    setScore(calculateTotalScore(score));
    GameInfo.score = score;
  });
  GameInfo.observer.on(COMBO_LEEWAY_UPDATE, (value) => updateCircleLoader(value));
  GameInfo.observer.on(LEVEL_FINISH, (score: IScore) => !score.crashed && updateCircleLoader(0));
  GameInfo.observer.on(ENTER_CRASHED, (score: IScore, id: string) => id === GameInfo.possessedCharacterId && !score.finishedLevel && updateCircleLoader(0));

  function updateCircleLoader(value: number) {
    if (value === 0) setCombo('-');
    comboLeewayCircle.style.backgroundImage = `conic-gradient(white ${value}deg, transparent 0deg)`;
  }

  return (
    <>
      <div class="game-ui-item distance">
        <div class="label">Presents</div>
        <div class="value" id="hud-distance">{presents()} x</div>
      </div>
      <div class="game-ui-item combo">
        <div class="label">Combo</div>
        <div class="value" id="hud-combo">{combo()}</div>
        <div class="game-ui-item combo-leeway-circle" ref={el => comboLeewayCircle = el} />
      </div>
      <div class="game-ui-item score">
        <div class="label">Score</div>
        <div class="value" id="hud-score">{score()}</div>
      </div>
    </>
  );
};
