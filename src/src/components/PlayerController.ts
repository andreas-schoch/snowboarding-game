import GameScene from '../scenes/GameScene';
import { Physics } from './Physics';
import { Character } from './Character';
import { PanelIds } from '../scenes/GameUIScene';
import { DEFAULT_WIDTH, DEFAULT_ZOOM } from '..';

export class CharacterController {
  character: Character;
  readonly scene: GameScene;
  readonly b2Physics: Physics;

  private resolutionMod: number;

  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyArrowUp: Phaser.Input.Keyboard.Key;
  private keyArrowLeft: Phaser.Input.Keyboard.Key;
  private keyArrowDown: Phaser.Input.Keyboard.Key;
  private keyArrowRight: Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;
  private jumpKeyDownStartFrame: number = 0;
  private jumpKeyDown: boolean;

  windNoise: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  snowboardSlide: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.b2Physics = scene.b2Physics;
    this.scene.observer.on('pause_game_icon_pressed', () => this.pauseGame());
    this.scene.observer.on('how_to_play_icon_pressed', () => this.pauseGame(PanelIds.PANEL_HOW_TO_PLAY));
    this.scene.observer.on('resume_game', () => this.b2Physics.isPaused = false);
    this.scene.observer.on('enter_crashed', () => this.scene.cameras.main.shake(200, 0.03 * (1 / this.resolutionMod)));
    this.scene.observer.on('surface_impact', (impulse: number, type: string, tailOrNose: boolean, center: boolean, body: boolean) => {
      // TODO improve. Needs sound for other surface types (e.g. ice, snow, rock, etc.)
      const maxImpulse = 12;
      const target = center ? 0 : 1200;
      const lerpFactor = 0.7;
      const currentDetune = this.snowboardSlide.detune;
      const newDetune = currentDetune + lerpFactor * (target - currentDetune);
      this.snowboardSlide.setDetune(newDetune);
      const percentage = Math.min(impulse / maxImpulse, 1);
      const volume = Math.max(Math.min(percentage, 1), 0.2);
      this.snowboardSlide.setVolume(volume);
    });

    this.scene.observer.on('enter_in_air', () => {
      this.scene.add.tween({
        targets: this.snowboardSlide,
        volume: 0.03,
        ease: 'Linear',
        duration: 250,
        onComplete: () => this.snowboardSlide.setDetune(0)
      });
    });

    this.initKeyboardInputs();
  }

  possessCharacter(character: Character) {
    this.character = character;

    const camera = this.scene.cameras.main;
    this.resolutionMod = camera.width / DEFAULT_WIDTH;
    camera.setDeadzone(0, 125);
    camera.setBackgroundColor(0x3470c6);
    camera.setZoom(DEFAULT_ZOOM * this.resolutionMod * 1.5);
    camera.scrollX -= camera.width;
    camera.scrollY -= camera.height;

    const userdata = this.b2Physics.loader.bodyUserDataMap.get(this.character.body);
    if (userdata?.image) camera.startFollow(userdata.image, false, 0.5, 0.5);

    if (this.windNoise) this.windNoise.destroy();
    if (this.snowboardSlide) this.snowboardSlide.destroy();
    this.snowboardSlide = this.scene.sound.add('snowboard_slide_04', { loop: true, volume: 1, rate: 1, delay: 0, detune: 1000 });
    this.snowboardSlide.play();
    this.windNoise = this.scene.sound.add('wind', { loop: true, volume: 1, rate: 1, delay: 0, detune: 0 });
    this.windNoise.play();
  }

  reset() {
    this.snowboardSlide.destroy();
    this.windNoise.destroy();
    this.character.state.reset();
  }

  update() {
    if (this.b2Physics.isPaused) return;

    this.character.update(); // must come before inputs
    if (this.jumpKeyDown && this.scene.game.getFrame() - this.jumpKeyDownStartFrame <= this.character.jumpCooldown) this.character.jump();
    if (this.jumpKeyDown) this.character.leanUp();
    if (this.keyArrowLeft.isDown || this.keyA.isDown) this.character.leanBackward();
    if (this.keyArrowRight.isDown || this.keyD.isDown) this.character.leanForward();
    if (this.keyArrowDown.isDown || this.keyS.isDown) this.character.leanCenter(); // needs to be last to override leanForward and leanBackward and speed up rotation  }

    this.setZoomLevel();
    this.setWindNoise();
    this.setFollowOffset();
  }

  private setZoomLevel() {
    const currentZoom = this.scene.cameras.main.zoom;
    const speed = this.character.state.getCurrentSpeed();
    const maxSpeed = 40; // replace with your game's max speed
    const minZoom = 0.5; // zoomed out
    const maxZoom = DEFAULT_ZOOM; // zoomed in
    const normalizedSpeed = Math.min(Math.max(speed / maxSpeed, 0), 1);
    const targetZoom = (maxZoom - normalizedSpeed * (maxZoom - minZoom)) * this.resolutionMod;
    const lerpFactor = 0.02;
    const newZoom = currentZoom + lerpFactor * (targetZoom - currentZoom);
    this.scene.cameras.main.setZoom(newZoom);
  }

  private setWindNoise() {
    const maxSpeed = 60;
    const headSpeed = this.character.head.GetLinearVelocity().Length(); // TODO refactor properly
    this.windNoise.setVolume(Math.min(Math.max((headSpeed / maxSpeed) * 0.3, 0.02), 0.5));
    this.windNoise.setRate(Math.min(Math.max((headSpeed / maxSpeed) * 1.5, 0.5), 1.5));
  }

  private setFollowOffset() {
    // slightly move camera towards the look at direction so player sees more of the upcoming terrain
    const velocityX = this.character.body.GetLinearVelocity().x * 10;
    const lerpFactor = 0.01;
    const { followOffset } = this.scene.cameras.main;
    this.scene.cameras.main.setFollowOffset(followOffset.x + lerpFactor * (-velocityX - followOffset.x), 0);
  }

  private initKeyboardInputs() {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input not available. No touch input supported yet.');
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyArrowUp = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyArrowLeft = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyArrowRight = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyArrowDown = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    this.keySpace.onDown = () => this.pauseGame();
    const onJump = () => {
      this.jumpKeyDown = true;
      if (!this.character.board.isInAir() && !this.b2Physics.isPaused) this.jumpKeyDownStartFrame = this.scene.game.getFrame();
    };
    this.keyW.onDown = onJump;
    this.keyArrowUp.onDown = onJump;
    this.keyW.onUp = () => this.jumpKeyDown = false;
    this.keyArrowUp.onUp = () => this.jumpKeyDown = false;
  }

  private pauseGame(activePanel: PanelIds = PanelIds.PANEL_PAUSE_MENU) {
    if (this.character.state.isCrashed || this.character.state.isLevelFinished) return; // can only pause during an active run. After crash or finish, the "Your score" panel is shown.
    this.b2Physics.isPaused = !this.b2Physics.isPaused;
    this.character.state.updateComboLeeway(); // otherwise it continues during pause.
    this.scene.observer.emit('toggle_pause', this.b2Physics.isPaused, activePanel);
  }
}
