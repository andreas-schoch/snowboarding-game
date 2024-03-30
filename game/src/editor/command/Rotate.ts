import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type RotateCommandArgs = {
  type: 'rotate';
  item: EditorItem;
  prevAngle: number;
  newAngle: number;
};

export class Rotate implements ICommand {
  id: string;

  constructor(private args: RotateCommandArgs) {
    this.id = pseudoRandomId();
  }

  execute(): void {
    this.args.item.setAngle(this.args.newAngle);
  }

  unExecute(): void {
    this.args.item.setAngle(this.args.prevAngle);
  }
}
