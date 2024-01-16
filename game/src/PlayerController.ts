import {Character} from './Character';
import {GameInfo} from './GameInfo';
import {Settings} from './Settings';
import {IScore} from './State';
import {PanelId} from './UI';
import {ENTER_CRASHED, HOW_TO_PLAY_ICON_PRESSED, PAUSE_GAME_ICON_PRESSED, RESUME_GAME, TOGGLE_PAUSE, WIND_SPEED_CHANGE} from './eventTypes';
import {GameScene} from './scenes/GameScene';
import {DEFAULT_WIDTH} from '.';

export class CharacterController {
  character: Character | null = null;

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

  constructor(private scene: GameScene) {

    GameInfo.observer.on(PAUSE_GAME_ICON_PRESSED, () => this.pauseGame());
    GameInfo.observer.on(HOW_TO_PLAY_ICON_PRESSED, () => this.pauseGame('panel-how-to-play'));
    GameInfo.observer.on(RESUME_GAME, () => this.scene.b2Physics.isPaused = false);
    GameInfo.observer.on(ENTER_CRASHED, (score: IScore, id: string) => { if (id === this.character?.id) this.scene.cameras.main.shake(200, 0.03 * (1 / this.resolutionMod)); });

    this.initKeyboardInputs();
  }

  possessCharacter(character: Character) {
    this.character = character;
    GameInfo.possessedCharacterId = character.id;
    const camera = this.scene.cameras.main;
    this.resolutionMod = camera.width / DEFAULT_WIDTH;
    camera.setDeadzone(0, 125);
    camera.setZoom(Settings.defaultZoom() * this.resolutionMod * 1.5);
    camera.scrollX -= camera.width;
    camera.scrollY -= camera.height;

    const image = this.scene.b2Physics.loader.userData.get(this.character.body)?.image;
    if (!image) return;
    camera.startFollow(image, false, 0.5, 0.5);

    // if (DARKMODE_ENABLED) {
    //   const glowingBodies = this.scene.b2Physics.loader.getBodiesByCustomProperty('light', true);
    //   glowingBodies.forEach(body => {
    //     const pos = recordLeak(body.GetPosition());
    //     this.scene.lights.addLight(pos.x * 40, -pos.y * 40, 80, 0xffffff, 0.07);
    //   });
    // }
  }

  update() {
    if (this.scene.b2Physics.isPaused) return;
    if (!this.character) return;

    if (this.jumpKeyDown && this.scene.game.getFrame() - this.jumpKeyDownStartFrame <= this.character.jumpCooldown) this.character.jump();
    if (this.jumpKeyDown) this.character.leanUp();
    if (this.keyArrowLeft.isDown || this.keyA.isDown) this.character.leanBackward();
    if (this.keyArrowRight.isDown || this.keyD.isDown) this.character.leanForward();
    if (this.keyArrowDown.isDown || this.keyS.isDown) this.character.leanCenter(); // needs to be last to override leanForward and leanBackward and speed up rotation  }

    this.setZoomLevel(this.character);
    this.setWindNoise(this.character);
    this.setFollowOffset(this.character);
  }

  private setZoomLevel(character: Character) {
    const currentZoom = this.scene.cameras.main.zoom;
    const speed = character.state.getCurrentSpeed();
    const maxSpeed = 40; // replace with your game's max speed
    const minZoom = 0.5; // zoomed out
    const maxZoom = Settings.defaultZoom(); // zoomed in
    const normalizedSpeed = Math.min(Math.max(speed / maxSpeed, 0), 1);
    const targetZoom = (maxZoom - normalizedSpeed * (maxZoom - minZoom)) * this.resolutionMod;
    const lerpFactor = 0.02;
    const newZoom = currentZoom + lerpFactor * (targetZoom - currentZoom);
    this.scene.cameras.main.setZoom(newZoom);
  }

  private setWindNoise(character: Character) {
    const maxSpeed = 60;
    const currentSpeed = character.head.GetLinearVelocity().Length();
    GameInfo.observer.emit(WIND_SPEED_CHANGE, currentSpeed / maxSpeed);
  }

  private setFollowOffset(character: Character) {
    // slightly move camera towards the look at direction so player sees more of the upcoming terrain
    const velocityX = character.body.GetLinearVelocity().x * 10;
    const lerpFactor = 0.01;
    const {followOffset} = this.scene.cameras.main;
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
      if (!this.character?.board.isInAir() && !this.scene.b2Physics.isPaused) this.jumpKeyDownStartFrame = this.scene.game.getFrame();
    };
    this.keyW.onDown = onJump;
    this.keyArrowUp.onDown = onJump;
    this.keyW.onUp = () => this.jumpKeyDown = false;
    this.keyArrowUp.onUp = () => this.jumpKeyDown = false;
  }

  private pauseGame(activePanel: PanelId = 'panel-pause-menu') {
    if (!this.character) return;
    if (this.character.state.isCrashed || this.character.state.isLevelFinished) return; // can only pause during an active run. After crash or finish, the "Your score" panel is shown.
    this.scene.b2Physics.isPaused = !this.scene.b2Physics.isPaused;
    this.character.state.updateComboLeeway(); // otherwise it continues during pause.
    GameInfo.observer.emit(TOGGLE_PAUSE, this.scene.b2Physics.isPaused, activePanel);
  }
}
