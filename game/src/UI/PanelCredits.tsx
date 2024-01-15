import './PanelCredits.css';

export const PanelCredits = () => (
  <>
    <div class="panel hidden" id="panel-credits">
      <div class="panel-title">Credits</div>

      <div class="credits-scrollable scrollbar">
        <span class="row credits-title"><span class="col col-12 flex-center">Developed by</span></span>
        <span class="row">
          <span class="col col-6 credits-name">Andreas Schoch</span>
          <a class="col col-3 credits-link" rel="noopener" href="https://github.com/andreas-schoch"
            target="_blank">Github</a>
          <a class="col col-3 credits-link" rel="noopener" href="https://www.linkedin.com/in/andreas-schoch/"
            target="_blank">Linkedin</a>
        </span>

        <span class="row credits-title"><span class="col col-12 flex-center">Music by</span></span>
        <span class="row">
          <span class="col col-6 credits-name">Kevin MacLeod</span>
          <a class="col col-3 credits-link" rel="noopener" href="https://incompetech.com/music/royalty-free/music.html"
            target="_blank">Source</a>
          <a class="col col-3 credits-link" rel="noopener" href="https://incompetech.com" target="_blank">Website</a>
        </span>

        <span class="row credits-title"><span class="col col-12 flex-center">Soundeffects by</span></span>
        <span class="row">
          <span class="col col-6 credits-name">independent.nu</span>
          <a class="col col-3 credits-link" rel="noopener"
            href="https://opengameart.org/content/8-wet-squish-slurp-impacts" target="_blank">Source</a>
          <span class="col col-3"></span>
        </span>
        <span class="row">
          <span class="col col-6 credits-name">Blender Foundation</span>
          <a class="col col-3 credits-link" rel="noopener" href="https://opengameart.org/content/applause"
            target="_blank">Source</a>
          <span class="col col-3"></span>
        </span>

        <span class="row credits-title"><span class="col col-12 flex-center">Texture Assets by</span></span>
        <span class="row">
          <span class="col col-6">Tokegameart</span>
          <a class="col col-3 credits-link" rel="noopener" href="https://tokegameart.net/item/santa-claus/"
            target="_blank">Source</a>
          <a class="col col-3 credits-link" rel="noopener" href="https://tokegameart.net" target="_blank">Website</a>
        </span>

        <span class="row">
          <span class="col col-6">Lukas Mrazik</span>
          <a class="col col-3 credits-link" rel="noopener" href="https://opengameart.org/content/space-background-7"
            target="_blank">Source</a>
          <span class="col col-3"></span>
        </span>

        <span class="row">
          <span class="col col-6">pzUH</span>
          <a class="col col-3 credits-link" rel="noopener"
            href="https://opengameart.org/content/winter-platformer-game-tileset" target="_blank">Source</a>
          <span class="col col-3"></span>
        </span>

        <span class="row">
          <span class="col col-6">Svgsilh</span>
          <span class="col col-3"></span>
          <a class="col col-3 credits-link" rel="noopener" href="https://svgsilh.com" target="_blank">Website</a>
        </span>
        <span class="row">
          <span class="col col-6">Nicolae (Xelu) Berbece</span>
          <a class="col col-3 credits-link" rel="noopener"
            href="https://opengameart.org/content/free-keyboard-and-controllers-prompts-pack" target="_blank">Source</a>
          <span class="col col-3"></span>
        </span>

        <span class="row">
          <span class="col col-6">Andreas Schoch</span>
          <span class="col col-3"></span>
          <span class="col col-3"></span>
        </span>

        <span class="row credits-title"><span class="col col-12 flex-center">Special Thanks to</span></span>
        <span class="row" style="margin-top: 2rem">
          <span class="col col-6">Chris Campbell</span>
          <span class="col col-3"></span>
          <a class="col col-3 credits-link" rel="noopener" href="https://www.iforce2d.net/rube/"
            target="_blank">Website</a>
        </span>
        <span class="row"><span class="col col-12" style="color: var(--grey-600)">For the awesome R.U.B.E Editor which
          made it so much easier to create box2d levels.</span></span>


        <span class="row credits-title"><span class="col col-12 flex-center">About the game</span></span>
        <span class="row">
          <span class="col col-12">
            <span>The game is released under the open-source GPL-3.0 license (initially MIT): </span>
            <a class="credits-link" rel="noopener" href="https://github.com/andreas-schoch/snowboarding-game"
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
      {/* <!-- BACK--> */}
      <div class="row last">
        <div class="col col-12 flex-center">
          <button class="btn btn-secondary" id="btn-goto-pause-menu">
            <i class="material-icons">chevron_left</i>
            <span>Back to menu</span>
          </button>
        </div>
      </div>
    </div>
  </>
);
