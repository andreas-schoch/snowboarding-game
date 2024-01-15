import './UnsupportedBrowserNotice.css';
import { Show } from "solid-js";
import { game } from "..";

export const UnsupportedBrowserNotice = () => {
  const browser = game.device.browser;
  const isSupported = (browser.chrome || browser.edge || browser.opera || browser.firefox);

  return (
    <Show when={!isSupported}>
      <div id="unsupported-browser-notice">
        This game hasn't been optimized for this browser (yet). In case it doesn't run well, consider using Chrome or Edge to play it.
      </div>
    </Show>
  );
};
