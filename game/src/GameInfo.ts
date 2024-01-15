import { IScore } from "./State";

export class GameInfo {
    static observer: Phaser.Events.EventEmitter;
    static possessedCharacterId: string;
    static score: IScore;
    static crashed = false;
}
