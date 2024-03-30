import {Add, AddCommandArgs} from './Add';
import {Delete, DeleteCommandArgs} from './Delete';
import {Depth, DepthCommandArgs} from './Depth';
import {Move, MoveCommandArgs} from './Move';
import {Paste, PasteCommandArgs} from './Paste';
import {Rename, RenameCommandArgs} from './Rename';
import {Rotate, RotateCommandArgs} from './Rotate';
import {Select, SelectCommandArgs} from './Select';

export interface ICommand {
  execute(): void;
  unExecute(): void;
  id: string;
}

type CommandArgs = SelectCommandArgs | AddCommandArgs | PasteCommandArgs | DeleteCommandArgs | MoveCommandArgs | RotateCommandArgs | RenameCommandArgs | DepthCommandArgs;

export class Commander {
  private static undoStack: ICommand[] = [];
  private static redoStack: ICommand[] = [];

  static exec(args: CommandArgs) {
    let cmd: ICommand;
    if(args.type === 'select') cmd = new Select(args);
    else if(args.type === 'add') cmd = new Add(args);
    else if(args.type === 'paste') cmd = new Paste(args);
    else if(args.type === 'delete') cmd = new Delete(args);
    else if(args.type === 'move') cmd = new Move(args);
    else if(args.type === 'rotate') cmd = new Rotate(args);
    else if(args.type === 'rename') cmd = new Rename(args);
    else if(args.type === 'depth') cmd = new Depth(args);
    else throw new Error('Invalid command type');

    cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  static undo() {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop()!;
      command.unExecute();
      this.redoStack.push(command);
    }
  }

  static redo() {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop()!;
      command.execute();
      this.undoStack.push(command);
    }
  }

  static lastCommandId() {
    return this.undoStack[this.undoStack.length - 1]?.id;
  }
}
