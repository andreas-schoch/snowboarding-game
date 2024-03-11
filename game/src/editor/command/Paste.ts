import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type PasteCommandArgs = {
  type: 'paste';
  items: EditorItem[];
};

export class Paste implements ICommand {
  constructor(private args: PasteCommandArgs) { }

  execute(): void {
    // TODO
  }

  unExecute(): void {
    // TODO
  }
}
