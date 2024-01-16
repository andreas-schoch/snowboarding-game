# How To Create Levels

For now the primary tool for creating levels is [R.U.B.E](https://www.iforce2d.net/rube/) (aka "Really Useful Box2D Editor"). It is a paid 3rd party physics editor that allows you to create Box2D objects and export them to a JSON file. 

The RUBE editor can be downloaded for free with limited functionality to test things out. To be able to export the levels however, you will need to purchase a license though.

You can make yourself familiar with the controls by following these [videos](https://www.youtube.com/watch?v=2gb63dUzA-E&list=PLzidsatoEzejt4smjfpeOd-XDjtE6PFr9) by the creator himself.

## Getting Started

It's probably easiest to open one of the .RUBE files within this repo to see how a level is made up. You can find them in the `game/assets/levels` folder.
If you run the game locally you can just export the modified version under `game/assets/levels/exports` to see the changes in the game.

The player character will always start from around coordinates (0, 0) and the level should be designed around that.

You can use any of the textures that are part of `game/assets/img/environment.tps` for the levels. TPS files can be opened with [TexturePacker](https://www.codeandweb.com/texturepacker) but isn't necessary. You just need to know the texture and texture atlas name to use it in RUBE (see existing levels for examples).

To create a new level you'd just copy the RUBE file, modify it to your needs, export it under a new filename within `levels/exports` and modify the sourcecode to make it appear in the level selector. (In the future this will all be streamlined with a custom level editor allowing levels to be uploaded to a server so that you can create levels directly in the browser and share them with others)

## Beware

I am working on my own level editor for this game and there will be no guarantees that it will be fully compatible with the RUBE [file format](https://www.iforce2d.net/rube/json-structure).

This means that any levels created with RUBE might not work with the final version of the game. I will try to make it as compatible as possible, but I just can't make any promises yet.

Since I don't plan to make my level editor as feature rich as RUBE, there will probably still be the need for RUBE to create Player Characters and any complex objects.
So chances are that the level editor will stay quite faithful to the RUBE file format.

The bigger risk is probably that I may drastically change the custom properties and textures used and cause breaking changes at any time during development. Since there is no community around the game yet, I may make those changes without any warning.
