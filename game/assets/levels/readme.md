# Levels

This folder contains the base levels the game "ships" with and that will be available even when offline once cached (well...once I fix the offline mode that is).


## What is "RUBE"?
RUBE stands for Really Useful Box2D Editor. It is a physics editor that I used to create levels with. Now I am in the process of creating my own level editor. My custom editor will be higher level and more game specific. I will still rely on RUBE for more complex things like the player character or creation of prefabs.

RUBE stores scenes as `.rube` files (It's just JSON but with a different file extension).

## What is the difference between the `.rube` and `.json` files?
The `.rube` files are the source files from wich the `.json` files are generated from. There are 2 main differences between the two:
- fixtures aren't triangulated in `.rube` files. So 1 MetaFixture may turn into multiple RubeFixtures
- Objects get inlined in the export. So MetaObject information won't be available in the export

You cannot reconstruct the original `.rube` file from the `.json` file so:
- For the editor we use the `.rube` file to edit the levels
- For the game we use the `.json` file to load the levels into the game

To compare the two formats in further detail search for the typescript interfaces under `RubeFile.d.ts` and `RubeFileExport.d.ts` in this repository.

## What are the files in the prefab folder?
- Prefabs are the equivalent to "objects" in RUBE.
- They are really just a regular `.rube` file that is meant to be loaded into other `.rube` files.
- They can contain any number of physics bodies, fixtures, joints, images and even other prefabs.
- Any repetitive things that you want to use in multiple levels should probably be made into a prefab.

## What are the files in this export folder?
It contains both JSON and protobuf encoded versions of the level export:
- The `.json` files are the same format you get when exporting a `.rube` file as JSON from RUBE. https://www.iforce2d.net/rube/json-structure.
- The `.bin` files are protobuf encoded and deflated binary versions of the same data to reduce the file size over the network.

For now the game fetches the levels as `.bin` from the backend, converts it back to json then loads all the physics bodies, fixtures, joints etc. into the game world.
