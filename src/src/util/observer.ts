import * as Ph from 'phaser';

// TODO rethink approach
// To be used in any class that needs to communicate with any other class
export class Observer {
  static instance: Phaser.Events.EventEmitter;

  static init() {
    // Ensure that listeners from previous runs are cleared. Otherwise, for a single emit it may call the listener multiple times depending on amount of game-over/replays
    if (Observer.instance) Observer.instance.destroy();
    Observer.instance = new Ph.Events.EventEmitter();
  }
}
