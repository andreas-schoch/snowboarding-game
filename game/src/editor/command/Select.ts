import {setSelected} from '../../UI/EditorUI/globalSignals';
import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type SelectCommandArgs = {
  type: 'select';
  newSelected: EditorItem | null;
  prevSelected: EditorItem | null;
};

export class Select implements ICommand {

  constructor(private args: SelectCommandArgs) { }

  execute(): void {
    setSelected(this.args.newSelected);
  }

  unExecute(): void {
    setSelected(this.args.prevSelected);
  }
}
