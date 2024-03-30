import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {EditorImage} from '../items/EditorImage';
import {ICommand} from './Commander';

export type DepthCommandArgs = {
  type: 'depth';
  item: EditorImage;
  prevDepth: number;
  newDepth: number;
};

export class Depth implements ICommand {
  id: string;

  constructor(private args: DepthCommandArgs) {
    this.id = pseudoRandomId();
  }

  execute(): void {
    console.debug('Depth.execute', this.args);
    this.args.item.setDepth(this.args.newDepth);
  }

  unExecute(): void {
    console.debug('Depth.unExecute', this.args);
    this.args.item.setDepth(this.args.prevDepth);
  }
}
