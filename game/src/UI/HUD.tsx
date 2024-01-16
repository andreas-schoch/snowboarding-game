import {Component, createSignal} from 'solid-js';
import {GameInfo} from '../GameInfo';
import {IScore} from '../character/State';
import {COMBO_CHANGE, COMBO_LEEWAY_UPDATE, ENTER_CRASHED, LEVEL_FINISH, PAUSE_GAME, PICKUP_PRESENT, SCORE_CHANGE} from '../eventTypes';
import {calculateTotalScore} from '../helpers/calculateTotalScore';
import {PanelId} from '.';

export const HUD: Component<{setPanel: (id: PanelId) => void}> = props => {
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

  const pauseAndSetPanel = (panel: PanelId) => {
    GameInfo.observer.emit(PAUSE_GAME, true, panel);
    props.setPanel(panel);
  };

  function updateCircleLoader(value: number) {
    if (value === 0) setCombo('-');
    comboLeewayCircle.style.backgroundImage = `conic-gradient(white ${value}deg, transparent 0deg)`;
  }

  return (
    <>
      <div class="absolute top-[var(--game-ui-padding)] left-[var(--game-ui-padding)]">
        <div class="mb-1 text-sm text-[var(--grey-600)]">Presents</div>
        <div id="hud-distance">{presents()} x</div>
      </div>
      <div class="absolute top-[var(--game-ui-padding)] left-1/2 transform -translate-x-1/2 text-center">
        <div class="mb-1 text-sm text-[var(--grey-600)]">Combo</div>
        <div id="hud-combo">{combo()}</div>
        <div ref={el => comboLeewayCircle = el} class="absolute top-[calc(var(--game-ui-padding) + 1rem)] left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-[conic-gradient(white_0deg,_transparent_0deg)]"/>
      </div>
      <div class="absolute top-[var(--game-ui-padding)] right-[var(--game-ui-padding)] text-right">
        <div class="mb-1 text-sm text-[var(--grey-600)]">Score</div>
        <div id="hud-score">{score()}</div>
      </div>

      <i onClick={() => pauseAndSetPanel('panel-how-to-play')} class="material-icons text-[color:var(--grey-600)] absolute left-[var(--game-ui-padding)] bottom-[var(--game-ui-padding)] text-3xl cursor-pointer">help_outline</i>
      <i onClick={() => pauseAndSetPanel('panel-pause-menu')} class="material-icons text-[color:var(--grey-600)] absolute right-[var(--game-ui-padding)] bottom-[var(--game-ui-padding)] text-3xl cursor-pointer">pause_circle_outline</i>
    </>
  );
};
