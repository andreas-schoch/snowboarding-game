import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type RotateCommandArgs = {
  type: 'rotate';
  item: EditorItem;
  prevAngle: number;
  newAngle: number;
};

export class Rotate implements ICommand {
  constructor(private args: RotateCommandArgs) {}

  execute(): void {
    this.args.item.setAngle(this.args.newAngle);
  }

  unExecute(): void {
    this.args.item.setAngle(this.args.prevAngle);
  }
}
