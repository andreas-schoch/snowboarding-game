import {BrowserItem} from '../../UI/EditorUI/Browser';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {EditorItemTracker} from '../items/ItemTracker';
import {ICommand} from './Commander';

export type AddCommandArgs = {
  type: 'add';
  item: BrowserItem;
  x: number;
  y: number;
};

export class Add implements ICommand {
  id: string;
  createdItem: EditorItem | null = null;

  constructor(private args: AddCommandArgs) {
    this.id = pseudoRandomId();
  }

  execute(): void {
    console.debug('Add.execute', this.args);
    this.createdItem = EditorItemTracker.add(this.args.item, this.args.x, this.args.y);
  }

  unExecute(): void {
    console.debug('Add.unExecute', this.args);
    if (!this.createdItem) throw new Error('No item to delete');
    this.createdItem.delete();
  }
}
