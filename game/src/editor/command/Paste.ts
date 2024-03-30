import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type PasteCommandArgs = {
  type: 'paste';
  items: EditorItem[];
};

export class Paste implements ICommand {
  id: string;

  constructor(private args: PasteCommandArgs) {
    this.id = pseudoRandomId();
  }

  execute(): void {
    // TODO
  }

  unExecute(): void {
    // TODO
  }
}
