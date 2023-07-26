# Snowboarding Game

<p align="center">
<img src="./src/assets/img/thumbnails/level_001_santas_backyard.png" alt="Snowboarding Game Leaderboards" width="400" height="auto">
</p>


## How to play?

&nbsp;&nbsp;&nbsp;<kbd>&uarr;</kbd> &nbsp;&nbsp;&nbsp;&nbsp;Jump (hold to jump with full power)<br>
<kbd>&larr;</kbd> <kbd>&rarr;</kbd> &nbsp; Rotate and flip<br>
&nbsp;&nbsp;&nbsp;<kbd>&darr;</kbd> &nbsp;&nbsp;&nbsp; Bend legs

<kbd>SPACE</kbd> or <kbd>ESC</kbd> Open Menu (Also pauses the game)


Collect the "presents" and flip around while in the air to gain points until the end of the level.

Don't let the combo counter run out (see top center of GUI) to increase your score. Crash and you will lose all your pending combo points.

## Technical Details
A box2d based snowboarding game made with Phaser 3 and TypeScript.

Levels are created with [R.U.B.E](https://www.iforce2d.net/rube/) (Really Useful Box2D Editor) which made it easier to create levels and export them as JSON files.

The JSON files are then loaded into the game using a loader that is part of this project 

_Loader might be useful for any project that uses Phaser3 and [lusito/Box2d.ts](https://github.com/lusito/box2d.ts). I want to turn it into a NPM package and create adapters to support various box2d ports_

For the GUI and menus, plain old HTML/CSS is used and rendered on top of the canvas.

Eventually I want to add a level editor to the game so that players can create their own levels and share them with others with the click of a button (checkout 'level-editor' branch for progress on this)


## Run the game locally
```shell
 git clone https://github.com/andreas-schoch/snowboarding-game.git
 cd snowboarding-game
 npm i
 npm run start
```
## Enable your own Leaderboards
<img src="./leaderboards.png" alt="Snowboarding Game Leaderboards" width="400" height="auto"> <img src="./highscore.png" alt="Snowboarding Game Highscore" width="400" height="auto">

When you clone the game, you will only see your own highscores in the leaderboard but with a few steps (~5-10mins of work) you can enable global leaderboards if you want to host this game on your own.

To enable the firebase based leaderboards, you have to create a new project in the [Firebase Console](https://console.firebase.google.com/), create a new Firestore database and add the relevant config to a `.env` file.

```shell	
FIREBASE_LEADERBOARD_ENABLED=true
FIREBASE_API_KEY=<get-from-firebase>
FIREBASE_AUTH_DOMAIN=<get-from-firebase>.firebaseapp.com
FIREBASE_DATABASE_URL=<get-from-firebase>
FIREBASE_PROJECT_ID=<get-from-firebase>
FIREBASE_STORAGE_BUCKET=<get-from-firebase>
FIREBASE_MESSAGING_SENDER_ID=<get-from-firebase>
FIREBASE_APP_ID=<get-from-firebase>
FIREBASE_MEASUREMENT_ID=<get-from-firebase>
```

## License
MIT
