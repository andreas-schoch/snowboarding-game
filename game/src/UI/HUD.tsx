import './HUD.css';
import {Component, Show, createSignal} from 'solid-js';
import {GameInfo} from '../GameInfo';
import {COMBO_CHANGE, COMBO_LEEWAY_UPDATE, ENTER_CRASHED, LEVEL_FINISH, PAUSE_GAME, SCORE_CHANGE, TIME_CHANGE} from '../eventTypes';
import {formatTime} from '../helpers/formatTime';
import {IScore} from '../pocketbase/types';
import {PanelId} from '.';

export const HUD: Component<{setPanel: (id: PanelId) => void}> = props => {
  let comboLeewayCircle: HTMLElement;
  let scoreRef: HTMLElement;
  const [combo, setCombo] = createSignal('');
  const [score, setScore] = createSignal(0);
  const [time, setTime] = createSignal('0:00:00');

  GameInfo.observer.on(TIME_CHANGE, (time: number) => setTime(formatTime(time)));
  GameInfo.observer.on(COMBO_CHANGE, (accumulated, multiplier) => setCombo(accumulated ? (multiplier + 'x' + accumulated) : ''));
  GameInfo.observer.on(SCORE_CHANGE, (score: IScore) => {
    setScore(score.pointsTotal);
    animateScore();
  });
  GameInfo.observer.on(COMBO_LEEWAY_UPDATE, (value) => updateCircleLoader(value));
  GameInfo.observer.on(LEVEL_FINISH, (score: IScore) => !score.crashed && updateCircleLoader(0));
  GameInfo.observer.on(ENTER_CRASHED, (score: IScore, id: string) => id === GameInfo.possessedCharacterId && !score.finishedLevel && updateCircleLoader(0));

  const pauseAndSetPanel = (panel: PanelId) => {
    GameInfo.observer.emit(PAUSE_GAME, true, panel);
    props.setPanel(panel);
  };

  function updateCircleLoader(value: number) {
    if (value === 0) setCombo('');
    comboLeewayCircle.style.backgroundImage = `conic-gradient(red ${value}deg, transparent 0deg)`;
  }

  function animateScore() {
    const name = 'score-change';
    scoreRef.style.scale = '1';
    scoreRef.style.color = '';
    scoreRef.classList.remove(name);
    scoreRef.onanimationend = null;

    const style = getComputedStyle(scoreRef);
    const animationRunning = style.animationName !== 'none' && style.animationPlayState === 'running';

    if (!animationRunning) {
      scoreRef.style.color = '#36de36';
      scoreRef.classList.add(name);

      scoreRef.onanimationend = () => {
        scoreRef.classList.remove(name);
        scoreRef.style.color = '';
      };
    }
  }

  return <>
    {/* <div class="absolute top-2 left-2">
        <div class="mb-1 text-sm text-[var(--grey-600)]">Presents</div>
        <div id="hud-distance">{presents()} x</div>s
      </div> */}

    <div class="absolute top-2 left-1/2 transform -translate-x-1/2 text-center">
      <div>{time()}</div>
    </div>

    <Show when={combo() !== ''}>
      <div class="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
        <div class="flex">
          <div ref={el => comboLeewayCircle = el} class="w-5 h-5 rounded-full m-1 mr-4 bg-white border-white border-2"/>
          <div class="text-xl">{combo()}</div>
        </div>
      </div>
    </Show>

    <div class="absolute top-4 right-4 text-right" ref={el => scoreRef = el}>
      <div>{score()}</div>
    </div>

    <i onClick={() => pauseAndSetPanel('panel-how-to-play')} class="material-icons text-[color:var(--grey-600)] absolute left-2 bottom-2 text-3xl cursor-pointer">help_outline</i>
    <i onClick={() => pauseAndSetPanel('panel-pause-menu')} class="material-icons text-[color:var(--grey-600)] absolute right-[var(--game-ui-padding)] bottom-2 text-3xl cursor-pointer">pause_circle_outline</i>
  </>;
};
