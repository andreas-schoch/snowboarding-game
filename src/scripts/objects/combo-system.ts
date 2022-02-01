import * as Ph from 'phaser';
import {WickedSnowman} from './wicked-snowman';


// TODO this component is currently more like a pseudo state machine.
//  It should only concert itself with keeping track of score and combo related stuff
//  Maybe turn it into a generalPurpose event emitter that other components can listen and react to
export class ComboComponent extends Phaser.Events.EventEmitter {
  private snowman: WickedSnowman;
  private body: Ph.GameObjects.Image;
  private state: 'in-air' | 'grounded' | 'crashed';

  private angleStartAir: number = 0;
  private anglePreviousUpdate: number = 0;

  private totalRotation: number = 0; // total rotation while in air without touching the ground
  private currentFlipRotation: number = 0; // set to 0 after each flip

  private totalFrontflips = 0;
  private totalBackflips = 0;

  constructor(snowman: WickedSnowman) {
    super();
    this.snowman = snowman;
    this.body = snowman.body.GetUserData() as Ph.GameObjects.Image;
    this.state = snowman.isInAir() ? 'in-air' : 'grounded';

    this.on('enter-in-air', () => {
      this.state = 'in-air';
      this.angleStartAir = Ph.Math.Angle.Normalize(this.body.rotation);
      console.log('----- enter-in-air');

    });

    this.on('enter-grounded', () => {
      this.state = 'grounded';
      // this.snowman.scene.cameras.main.shake(100, 0.0025);

      console.log('------ enter-grounded', this.totalRotation.toFixed(1));
      this.totalRotation = 0;
      this.currentFlipRotation = 0;
    });

    this.on('enter-crashed', () => {
      this.state = 'crashed';
      this.snowman.b2Physics.enterBulletTime(-1, 0.4);
      this.snowman.scene.cameras.main.shake(200, 0.01);
      // this.snowman.scene.cameras.main.flash(200, 50, 50, 50);
      console.log('------ enter crashed');
    });

  }

  update() {
    const isInAir = this.snowman.isInAir();
    if (this.state !== 'crashed' && this.snowman.isCrashed) this.emit('enter-crashed');
    if (this.state === 'grounded' && isInAir) this.emit('enter-in-air');
    else if (this.state === 'in-air' && !isInAir) this.emit('enter-grounded');

    if (this.state === 'in-air') {
      const currentAngle = Ph.Math.Angle.Normalize(this.body.rotation);

      const diff = this.calculateDifferenceBetweenAngles(this.anglePreviousUpdate, currentAngle);
      this.totalRotation += diff;
      this.currentFlipRotation += diff;
      this.anglePreviousUpdate = currentAngle;

      if (this.currentFlipRotation >= Math.PI * 1.25) {
        this.totalFrontflips++;
        this.currentFlipRotation = 0;
      } else if (this.currentFlipRotation <= Math.PI * -1.25) {
        this.totalBackflips++;
        this.currentFlipRotation = 0;
      }
    }

    console.log('front', this.totalFrontflips, ' - back', this.totalBackflips);
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
