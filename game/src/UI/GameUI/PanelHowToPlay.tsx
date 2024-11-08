import {Component, ParentComponent} from 'solid-js';
import ArrowDownKeyLight from '../../../assets/img/controls/Arrow_Down_Key_Light.png';
import ArrowLeftKeyLight from '../../../assets/img/controls/Arrow_Left_Key_Light.png';
import ArrowRightKeyLight from '../../../assets/img/controls/Arrow_Right_Key_Light.png';
import ArrowUpKeyLight from '../../../assets/img/controls/Arrow_Up_Key_Light.png';
import EscKeyLight from '../../../assets/img/controls/Esc_Key_Light.png';
import SpaceKeyLight from '../../../assets/img/controls/Space_Key_Light.png';
import ComboCounter from '../../../assets/img/controls/combo_counter.png';
import {BackToMenuBtn} from './BackBtn';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelHowToPlay: Component<{setPanel: (id: PanelId) => void}> = props => (
  <BasePanel id='panel-how-to-play' title='How To Play' class="!w-[600px] !pr-2 !text-sm !text-stone-500" >

    <div class='scrollbar max-h-[500px] px-0 py-4'>

      <HowToPlayTitle>Keyboard Controls</HowToPlayTitle>
      <span class="row mb-0">
        <span class="col col-4 flex-center">
          <img class="size-14" src={ArrowUpKeyLight} alt="keyboard arrow up key" />
        </span>
        <span class="col col-8 flex items-center">Jump (press longer for higher jump)</span>
      </span>
      <span class="row mb-0">
        <span class="col col-4 flex-center">
          <img class="size-14" src={ArrowLeftKeyLight} alt="keyboard arrow left key" />
          <img class="size-14" src={ArrowRightKeyLight} alt="keyboard arrow right key" />
        </span>
        <span class="col col-8 flex items-center">Balance and perform tricks (frontflip, backflip)</span>
      </span>
      <span class="row mb-0">
        <span class="col col-4 flex-center">
          <img class="size-14" src={ArrowDownKeyLight} alt="keyboard arrow down key" />
        </span>
        <span class="col col-8 flex items-center">Center yourself</span>
      </span>
      <span class="row mb-0">
        <span class="col col-4 flex-center">
          <img class="size-14" src={SpaceKeyLight} alt="keyboard space key" />
          <img class="size-14" src={EscKeyLight} alt="keyboard escape key" />
        </span>
        <span class="col col-8 flex items-center">toggle pause</span>
      </span>
      <HowToPlayTitle>Touch Controls</HowToPlayTitle>
      <span class="row mb-0"><span class="col col-12">(work-in-progress)</span></span>

      <HowToPlayTitle>Combo System</HowToPlayTitle>
      <span class="col col-4 flex-center">
        <img class="mb-8 h-auto w-[100px] rounded-[5px]" src={ComboCounter} alt="Combo counter UI" />
      </span>
      <span class="row mb-0"><span class="col col-12">After each trick (backflip, frontflip) you have a few
      seconds to perform the next one to gain extra points.
      The combo counter will eventually run out if you stay on the ground for too long. If you crash, the combo
      points are lost.
      The points are only applied once the counter runs out or you reach the finish line.

      Keeping the combo counter up is the key to high scores!
      </span></span>
    </div>
    <BackToMenuBtn setPanel={props.setPanel} />
  </BasePanel>
);

const HowToPlayTitle: ParentComponent = props => (
  <span class="row !my-8 text-lg text-neutral-100"><span class="col col-12">{props.children}</span></span>
);
