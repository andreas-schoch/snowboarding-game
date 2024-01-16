# How To Create Characters

## Creating Characters
The process itself is not unlike creating levels with the RUBE editor (see [How To Create Levels](how-to-create-levels.md)).

The main difference is that creating a character is much more fiddly as is requires a lot of tweaking of joints, masses and forces to get it to feel right.

At this point any custom character will have to follow the same general structure of joints and bodies as the existing characters. But you can make them behave quite differently by tweaking the values of the joints and bodies.

Try modifying one of the existing characters in the `game/assets/levels/character_XX.rube` folder to see how they are made up.

If you run the game locally you can just export them under `game/assets/levels/exports` with the same filename to make them available to the game.

## Creating Character Skins
Character skins don't affect gameplay and are purely cosmetic. They are made up of individual png files for body parts that are then combined into a single texture atlas.

In darkmode they are tinted black so you will only see the outline of the character.

I am using [TexturePacker](https://www.codeandweb.com/texturepacker) to pack the png files into a texture atlas.

To create new skins I'd recommend just copying an existing skin under `game/assets/img/character_XX` and modifying it to your needs.

As long as you keep the same filenames and png sizes, you can modify it as you wish.

To make it available to the game, just include in `CharacterSkinKeys`.
