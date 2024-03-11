import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type DeleteCommandArgs = {
  type: 'delete';
  item: EditorItem;
};

export class Delete implements ICommand {
  constructor(private args: DeleteCommandArgs) { }

  execute(): void {
    this.args.item.delete();
  }

  unExecute(): void {
    this.args.item.restore();
  }
}
