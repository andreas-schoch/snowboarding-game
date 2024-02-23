import './HUD.css';
import {Component, createSignal} from 'solid-js';
import {GameInfo} from '../../GameInfo';
import {COMBO_CHANGE, COMBO_LEEWAY_UPDATE, ENTER_CRASHED, LEVEL_FINISH, PAUSE_GAME, SCORE_CHANGE, TIME_CHANGE} from '../../eventTypes';
import {formatTime} from '../../helpers/formatTime';
import {IScore} from '../../pocketbase/types';
import {PanelId} from './GameUI';

export const enum ComboState {
  Change,
  Success,
  Fail
}

export const HUD: Component<{panel: PanelId, setPanel: (id: PanelId) => void}> = props => {
  let comboWrapperRef: HTMLElement;
  let comboLeewayRef: HTMLElement;
  let comboTextRef: HTMLElement;
  let comboMoveTextRef: HTMLElement;

  let scoreTextRef: HTMLElement;

  const [comboEnd, setComboEnd] = createSignal<{accumulated: number, multiplier: number, success: boolean}>({accumulated: 0, multiplier: 0, success: false});
  const [combo, setCombo] = createSignal('');
  const [score, setScore] = createSignal(0);
  const [time, setTime] = createSignal('0:00:00');

  const comboTotal = () => comboEnd().accumulated * comboEnd().multiplier;

  GameInfo.observer.on(TIME_CHANGE, (time: number) => setTime(formatTime(time)));
  GameInfo.observer.on(COMBO_LEEWAY_UPDATE, (value: number) => updateCircleLoader(value));
  GameInfo.observer.on(COMBO_CHANGE, (accumulated: number, multiplier: number, state: ComboState) => animateCombo(accumulated, multiplier, state));
  GameInfo.observer.on(SCORE_CHANGE, (score: IScore) => animateScoreChange(score));
  GameInfo.observer.on(LEVEL_FINISH, (score: IScore) => !score.crashed && updateCircleLoader(0));
  GameInfo.observer.on(ENTER_CRASHED, (score: IScore, id: string) => id === GameInfo.possessedCharacterId && !score.finishedLevel && updateCircleLoader(0));

  const pauseAndSetPanel = (panel: PanelId) => {
    GameInfo.observer.emit(PAUSE_GAME, true, panel);
    props.setPanel(panel);
  };

  function updateCircleLoader(value: number) {
    if (value === 0) setCombo('');
    if (comboLeewayRef) comboLeewayRef.style.backgroundImage = `conic-gradient(red ${value}deg, transparent 0deg)`;
  }

  function animateCombo(accumulated: number, multiplier: number, state: ComboState) {
    if (state === ComboState.Success) animateComboSuccess(accumulated, multiplier);
    else if (state === ComboState.Fail) animateComboFail(accumulated, multiplier);
    else if (state === ComboState.Change) animateComboChange(accumulated, multiplier);
  }

  function animateComboSuccess(accumulated: number, multiplier: number) {
    if (accumulated === 0) return;
    setComboEnd({accumulated, multiplier, success: true});
    const {x, y} = comboTextRef.getBoundingClientRect();
    comboMoveTextRef.style.transition = 'none';
    comboMoveTextRef.style.left = x + 'px';
    comboMoveTextRef.style.top = y + 'px';
    comboMoveTextRef.style.opacity = '1';
    setCombo('');
    comboWrapperRef.style.visibility = 'hidden';
    setTimeout(() => {
      const {x, y} = scoreTextRef.getBoundingClientRect();
      comboMoveTextRef.style.transition = 'all 1s linear'; // Adjust duration as needed
      comboMoveTextRef.style.left = x + 'px';
      comboMoveTextRef.style.top = y + 'px';
      comboMoveTextRef.style.opacity = '0';
    }, 0);
  }

  function animateComboFail(accumulated: number, multiplier: number) {
    if (accumulated === 0) return;
    setComboEnd({accumulated, multiplier, success: false});
    const {x, y} = comboTextRef.getBoundingClientRect();
    comboMoveTextRef.style.transition = 'none';
    comboMoveTextRef.style.left = x + 'px';
    comboMoveTextRef.style.top = y + 'px';
    comboMoveTextRef.style.opacity = '1';
    setCombo('');
    comboWrapperRef.style.visibility = 'hidden';
    setTimeout(() => {
      comboMoveTextRef.style.transition = 'all 1250ms linear'; // Adjust duration as needed
      comboMoveTextRef.style.top = (y + 500) + 'px';
      comboMoveTextRef.style.opacity = '0';
    }, 0);
  }

  function animateComboChange(accumulated: number, multiplier: number) {
    comboWrapperRef.style.visibility = 'visible';
    setCombo(accumulated + 'x' + multiplier);
  }

  function animateScoreChange(score: IScore) {
    setScore(score.pointsTotal);
    const name = 'score-change';
    scoreTextRef.style.scale = '1';
    scoreTextRef.style.color = '';
    scoreTextRef.classList.remove(name);
    scoreTextRef.onanimationend = null;

    const {animationName, animationPlayState} = getComputedStyle(scoreTextRef);
    const animationRunning = animationName !== 'none' && animationPlayState === 'running';

    if (!animationRunning) {
      scoreTextRef.style.color = '#36de36';
      scoreTextRef.classList.add(name);

      scoreTextRef.onanimationend = () => {
        scoreTextRef.classList.remove(name);
        scoreTextRef.style.color = '';
      };
    }
  }

  return <>
    <div classList={{hidden: props.panel !== 'none'}}>

      <div class="absolute left-1/2 top-2 -translate-x-1/2 text-center">
        <div>{time()}</div>
      </div>

      <div class="invisible absolute left-1/2 top-20 -translate-x-1/2 text-center" ref={el => comboWrapperRef = el}>
        <div class="flex">
          <div ref={el => comboLeewayRef = el} class="m-1 mr-4 size-5 rounded-full border-2 border-white bg-white"/>
          <div ref={el => comboTextRef = el} class="text-xl">{combo()}</div>
        </div>
      </div>

      <span ref={el => comboMoveTextRef = el} class="relative opacity-0">{comboTotal()}</span>

      <div class="absolute right-4 top-4 text-right text-2xl" ref={el => scoreTextRef = el}>
        <div>{score()}</div>
      </div>

      <i onClick={() => pauseAndSetPanel('panel-how-to-play')} class="material-icons absolute bottom-2 left-2 cursor-pointer text-3xl text-[color:var(--grey-600)]">help_outline</i>
      <i onClick={() => pauseAndSetPanel('panel-pause-menu')} class="material-icons absolute bottom-2 right-2 cursor-pointer text-3xl text-[color:var(--grey-600)]">pause_circle_outline</i>
    </div>
  </>;
};
