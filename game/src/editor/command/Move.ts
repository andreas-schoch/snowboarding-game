import {EditorItem} from '../../physics/RUBE/RubeMetaLoader';
import {ICommand} from './Commander';

export type MoveCommandArgs = {
  type: 'move';
  item: EditorItem;
  prevX: number;
  prevY: number;
  newX: number;
  newY: number;
};

export class Move implements ICommand {
  constructor(private args: MoveCommandArgs) { }

  execute(): void {
    console.debug('Move.execute', this.args);
    this.args.item.setPosition({x: this.args.newX, y: this.args.newY}); // TODO make setPosition work with separate x and y not object
  }

  unExecute(): void {
    console.debug('Move.unExecute', this.args);
    this.args.item.setPosition({x: this.args.prevX, y: this.args.prevY});
  }
}
