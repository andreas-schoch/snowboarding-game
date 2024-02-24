import {Component, ParentComponent} from 'solid-js';
import {BasePanel} from './BasePanel';
import {PanelId} from './GameUI';

export const PanelCredits: Component<{setPanel: (id: PanelId) => void}> = props => (
  <BasePanel id='panel-credits' title='Credits' backBtn={true} setPanel={props.setPanel} class="!w-[600px] !leading-normal !text-stone-500" >

    <div class='scrollbar max-h-[400px] px-0 py-4 text-xs'>

      <CreditsTitle>Developed by</CreditsTitle>
      <CreditsEntry name='Andreas Schoch' source='https://github.com/andreas-schoch/snowboarding-game' website='https://www.linkedin.com/in/andreas-schoch/' />

      <CreditsTitle>Music by</CreditsTitle>
      <CreditsEntry name='Kevin MacLeod' source='https://incompetech.com/music/royalty-free/music.html' website='https://incompetech.com' />

      <CreditsTitle>Soundeffects by</CreditsTitle>
      <CreditsEntry name='independent.nu' source='https://opengameart.org/content/8-wet-squish-slurp-impacts' />
      <CreditsEntry name='Blender Foundation' source='https://opengameart.org/content/applause' />

      <CreditsTitle>Texture Assets by</CreditsTitle>
      <CreditsEntry name='Tokegameart' source='https://tokegameart.net/item/santa-claus/' website='https://tokegameart.net' />
      <CreditsEntry name='Lukas Mrazik' source='https://opengameart.org/content/space-background-7' />
      <CreditsEntry name='pzUH' source='https://opengameart.org/content/winter-platformer-game-tileset' />
      <CreditsEntry name='Svgsilh' website='https://svgsilh.com' />
      <CreditsEntry name='Nicolae (Xelu) Berbece' source='https://opengameart.org/content/free-keyboard-and-controllers-prompts-pack' />
      <CreditsEntry name='Andreas Schoch' />

      <CreditsTitle>Special Thanks to</CreditsTitle>
      <CreditsEntry name='Chris Campbell' website='https://www.iforce2d.net/rube/' />
      <span class="row"><span class="col col-12" style={{color:'var(--grey-600)'}}>For the awesome R.U.B.E Editor which
      made it so much easier to create box2d levels.</span></span>

      <CreditsTitle>About the game</CreditsTitle>
      <span class="row">
        <span class="col col-12">
          <span>The game is released under the open-source GPL-3.0 license (initially MIT): </span>
          <a class="" rel="noopener" href="https://github.com/andreas-schoch/snowboarding-game"
            target="_blank">Source code</a>.
        </span>
      </span>
      <span class="row"><span class="col col-12">It is inspired by Alto's Adventure, iStunt and old flash based browser
      games.</span></span>
      <span class="row"><span class="col col-12">I have the ambition to extend it further by adding a level editor and
      some form of multiplayer. Currently thinking of making it somewhat Trackmania like where you can compete in ~5
      minute rounds in realtime with others. For that I may need a fully deterministic physics engine
      though.</span></span>
      <span class="row"><span class="col col-12">On top of that I want to create a relaxed game with the same vibe
      "Zen-mode" in Alto's Adventure with an endless level and relaxing music.</span></span>
      <span class="row"><span class="col col-12">If you are interested to contribute feel free to contact <a
        href="mailto: andreas_schoch@outlook.com">Andreas Schoch</a>.</span></span>
    </div>
  </BasePanel>
);

const CreditsTitle: ParentComponent = props => (
  <span class="row font-[bolder] text-base text-neutral-100"><span class="col col-12 flex-center">{props.children}</span></span>
);

const CreditsEntry: Component<{name: string, source?: string, website?: string}> = props => (
  <span class="row">
    <span class="col col-6">{props.name}</span>
    {props.source ? <a class="col col-3 text-[10px]" rel="noopener" href={props.source} target="_blank">Source</a> : <span class="col col-3" />}
    {props.website ? <a class="col col-3 text-[10px]" rel="noopener" href={props.website} target="_blank">Website</a> : <span class="col col-3" />}
  </span>
);
