import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type DeleteCommandArgs = {
  type: 'delete';
  item: EditorItem;
};

export class Delete implements ICommand {
  id: string;

  constructor(private args: DeleteCommandArgs) {
    this.id = pseudoRandomId();
  }

  execute(): void {
    this.args.item.delete();
  }

  unExecute(): void {
    this.args.item.restore();
  }
}
