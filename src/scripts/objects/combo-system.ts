import * as Ph from 'phaser';
import {WickedSnowman} from './wicked-snowman';

// TODO this component is currently more like a pseudo state machine.
//  It should only concert itself with keeping track of score and combo related stuff
//  Maybe turn it into a generalPurpose event emitter that other components can listen and react to
export class ComboComponent extends Phaser.Events.EventEmitter {
  comboBoost: number = 0;
  maxComboBoost: number = 20;

  private snowman: WickedSnowman;
  private body: Ph.GameObjects.Image;
  private state: 'in-air' | 'grounded' | 'crashed';

  private angleStartAir: number = 0;
  private anglePreviousUpdate: number = 0;

  private totalRotation: number = 0; // total rotation while in air without touching the ground
  private currentFlipRotation: number = 0; // set to 0 after each flip

  private pendingFrontFlips: number = 0;
  private pendingBackFlips: number = 0;

  private landedFrontflips = 0;
  private landedBackflips = 0;

  private text: Phaser.GameObjects.Text;
  private textTimeoutHandle: NodeJS.Timeout;

  constructor(snowman: WickedSnowman) {
    super();
    this.snowman = snowman;
    this.body = snowman.body.GetUserData() as Ph.GameObjects.Image;
    this.state = snowman.isInAir() ? 'in-air' : 'grounded';

    const screenCenterX = this.snowman.scene.cameras.main.worldView.x + this.snowman.scene.cameras.main.width / 2;
    const screenCenterY = this.snowman.scene.cameras.main.worldView.y + this.snowman.scene.cameras.main.height / 2;
    this.text = snowman.scene.add.text(screenCenterX - 350, screenCenterY - 50, 'Wicked!').setOrigin(0.5, 1).setScrollFactor(0, 0).setVisible(false);

    this.on('enter-in-air', () => {
      this.state = 'in-air';
      this.angleStartAir = Ph.Math.Angle.Normalize(this.body.rotation);
      console.log('----- enter-in-air');

    });

    this.on('enter-grounded', () => {
        this.state = 'grounded';
        console.log('------ enter-grounded', this.totalRotation.toFixed(1));
        this.landedFrontflips += this.pendingFrontFlips;
        this.landedBackflips += this.pendingBackFlips;

        if (this.pendingBackFlips + this.pendingFrontFlips >= 1) {
          // TODO position above snowman then enable scroll after 500ms for it to go out of view
          // TODO increase combo boost and slowly decrease it in the update
          this.textTimeoutHandle && clearTimeout(this.textTimeoutHandle);
          const cornyRemarks = ['Wicked!', 'Awesome!', 'Sick!', 'Gnarly!'];
          this.text.setVisible(true).setText(cornyRemarks[Math.round(Math.random() * 3)]);
          this.textTimeoutHandle = setTimeout(() => this.text.setVisible(false), 800);
        }

        console.log('total front', this.landedFrontflips, ' - total back', this.landedBackflips);
        this.totalRotation = 0;
        this.currentFlipRotation = 0;
        this.pendingBackFlips = 0;
        this.pendingFrontFlips = 0;
      },
    );

    this.on('enter-crashed', () => {
      this.state = 'crashed';
      this.textTimeoutHandle && clearTimeout(this.textTimeoutHandle);
      this.text.setVisible(true).setText('Ouch!'); // TODO create array of corny remarks to show randomly on crash
      this.textTimeoutHandle = setTimeout(() => this.text.setVisible(false), 1500);

      this.snowman.scene.cameras.main.shake(200, 0.01); // TODO where is the shake?
      this.snowman.b2Physics.enterBulletTime(-1, 0.4);
      console.log('------ enter crashed');
    });

  }

  update() {
    const isInAir = this.snowman.isInAir();
    if (this.state !== 'crashed' && this.snowman.isCrashed) this.emit('enter-crashed');
    if (this.state === 'grounded' && isInAir && !this.snowman.isCrashed) this.emit('enter-in-air');
    else if (this.state === 'in-air' && !isInAir && !this.snowman.isCrashed) this.emit('enter-grounded');

    if (this.state === 'in-air') {
      const currentAngle = Ph.Math.Angle.Normalize(this.body.rotation);

      const diff = this.calculateDifferenceBetweenAngles(this.anglePreviousUpdate, currentAngle);
      this.totalRotation += diff;
      this.currentFlipRotation += diff;
      this.anglePreviousUpdate = currentAngle;

      if (this.currentFlipRotation >= Math.PI * (this.pendingFrontFlips === 0 ? 1.25 : 2)) {
        this.pendingFrontFlips++;
        this.currentFlipRotation = 0;
      } else if (this.currentFlipRotation <= Math.PI * -(this.pendingBackFlips === 0 ? 1.25 : 2)) {
        this.pendingBackFlips++;
        this.currentFlipRotation = 0;
      }
    }

  }

  // based on: https://www.construct.net/en/forum/construct-2/how-do-i-18/count-rotations-46674
  // http://blog.lexique-du-net.com/index.php?post/Calculate-the-real-difference-between-two-angles-keeping-the-sign
  private calculateDifferenceBetweenAngles(firstAngle: number, secondAngle: number) {
    let difference = secondAngle - firstAngle;
    if (difference < -Math.PI) difference += Math.PI * 2;
    else if (difference > Math.PI) difference -= Math.PI * 2;
    return difference;
  }

}
