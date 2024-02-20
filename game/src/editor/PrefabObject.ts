import {LoadedScene} from '../physics/RUBE/EntityTypes';

export class Prefab {
  id: string;
  scene: LoadedScene;

  constructor(public x: number, public y: number) {
  }
}

/*
----------------
PLANNED PREFABS:
----------------
- coin single
- coin group (a strip of 2*3, 3*3, etc and the heart)
- rock obstacle
- spike obstacle
- circular saw obstacle
- cane (once static and once dynamic)
- spring
- wooden box
- trampoline mechanism (a plank that rotates when pressure is applied, hurling you in the air)
- 
- background images can be prefabs too

------------------
Things to consider
------------------
- Should prefab classes contain custom logic or use custom Properties to determine their behavior?
  E.g. a coin prefab could be identified via the "phaserSensorType" custom property or we can add method to the class
  itself which determines what happens when collected. So it's pure data vs. data + logic. If we go with the former
  the prefabs can easily be stored in the backend as a collection record.
- Very far into the future I was considering to create my own visual scripting language for the game (like UE4/5 blueprints)
  This would basically make the game moddable but I am unsure about the scope and feasibility of this. This will happen as a standalone
  PoC first anyway where the visual nodes get transpiled into probably javascript code. For the game I am not sure if I want to allow
  it to be transpiled into javascript or If I am making some kind of frankenstein-ish interpreter for it to limit the possibility of arbitrary
  code execution on unsuspecting players that download a level due to me overlooking something...
*/
