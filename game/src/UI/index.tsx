import { render } from 'solid-js/web';
import { HUD } from './HUD';
import { UnsupportedBrowserNotice } from './UnsupportedBrowserNotice';
import { PanelPauseMenu } from './PanelPauseMenu';
import { PanelSelectLevel } from './PanelSelectLevel';
import { PanelLeaderboards } from './PanelLeaderboards';
import { PanelHowToPlay } from './PanelHowToPlay';
import { PanelSettings } from './PanelSettings';
import { PanelCredits } from './PanelCredits';
import { PanelYourScore } from './PanelYourScore';

const SolidUI = () => (
  <div id="game-ui" style="display: none;">
    <HUD />
    <UnsupportedBrowserNotice />
    <PanelPauseMenu />
    <PanelSelectLevel />
    <PanelLeaderboards />
    <PanelHowToPlay />
    <PanelSettings />
    <PanelCredits />
    <PanelYourScore />
  </div>
);

export const initSolidUI = (rootId: string) => {
  const root = document.getElementById(rootId);
  if (!root) throw new Error('Root ui element not found');
  root.innerHTML = '';
  render(() => <SolidUI />, root);
  return root;
};
