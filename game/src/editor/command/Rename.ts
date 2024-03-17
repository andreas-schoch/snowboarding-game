import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type RenameCommandArgs = {
  type: 'rename';
  item: EditorItem;
  prevName: string;
  newName: string;
};

export class Rename implements ICommand {
  constructor(private args: RenameCommandArgs) { }

  execute(): void {
    console.debug('Rename.execute', this.args);
    this.args.item.setName(this.args.newName);
  }

  unExecute(): void {
    console.debug('Rename.unExecute', this.args);
    this.args.item.setName(this.args.prevName);
  }
}
