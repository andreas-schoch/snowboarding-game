# Snowboarding Game

<p align="center">
<img src="./docs/img/intro.png" alt="screenshot of game" width="400" height="auto">
</p>


## How to play?

&nbsp;&nbsp;&nbsp;<kbd>&uarr;</kbd> &nbsp;&nbsp;&nbsp;&nbsp;Jump (hold to jump with full power)<br>
<kbd>&larr;</kbd> <kbd>&rarr;</kbd> &nbsp; Rotate and flip<br>
&nbsp;&nbsp;&nbsp;<kbd>&darr;</kbd> &nbsp;&nbsp;&nbsp; Bend legs (spin faster while in air)

<kbd>SPACE</kbd> or <kbd>ESC</kbd> Open Menu (Also pauses the game)


Collect the "presents" and flip around while in the air to gain points until the end of the level.

Don't let the combo counter run out (see top center of GUI) to increase your score. Crash and you will lose all your pending combo points.

## Technical Details
A box2d based snowboarding game made with Phaser 3 and TypeScript.

Levels are created with [R.U.B.E](https://www.iforce2d.net/rube/) (Really Useful Box2D Editor) which made it easier to create levels and export them as JSON files.

The JSON files are then loaded into the game using a loader that is part of this project 

_Loader might be useful for any project that uses Phaser3 and [Birch-san/box2d-wasm](https://github.com/Birch-san/box2d-wasm). I want to turn it into a NPM package and create adapters to support various box2d ports_

For the GUI and menus, plain old HTML/CSS is used and rendered on top of the canvas. This will likely change as it is a bit of a pain to maintain.

At this point I'm not too concerned with super clean architechture and code quality. You will see some messy code and unstructured commits that I clean up as things take shape.

Eventually I want to add a level editor to the game and build infrastructure to allow players to share their levels with each other, rate them and so on. Each level would have their own leaderboard.

I would really like for the physics to be fully deterministic so I can store input data (for replays and ghosts) along with the scores. That probably won't be possible using box2d cross all platforms, so will experiment switching to the Rapier physics engine (possibly switching from TS to Rust altogether in the process).

## Run the game locally
```shell
 git clone https://github.com/andreas-schoch/snowboarding-game.git
 cd snowboarding-game
 npm i
 npm run start
```
[How to create levels](./docs/how-to-create-levels.md)

[How to create Characters](./docs/how-to-create-characters.md)


## Enable your own Leaderboards
<img src="./docs/img/leaderboards.png" alt="Snowboarding Game Leaderboards" width="400" height="auto"> <img src="./docs/img/highscore.png" alt="Snowboarding Game Highscore" width="400" height="auto">

When you clone the game, you will only see your own highscores in the leaderboard but with a few steps (~5-10mins of work) you can enable global leaderboards if you want to host this game on your own.

To enable the firebase based leaderboards, you have to create a new project in the [Firebase Console](https://console.firebase.google.com/), create a new Firestore database and add the relevant config to a `.env` file at the root of this repository.

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

For the firestore database set the following access rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null && request.resource.data.userID == request.auth.uid;
      allow update: if request.auth.uid == resource.data.userID && resource.data.userID == request.resource.data.userID;
      allow delete: if false;
    }
  }
}

```
(Note: Will probably switch to a SQL based DB instead of firestore if I decide to make a 'multiplayer lobby mode' in the future)


## Deploy via Github Pages
Create a fork of this repo, clone it, verify it works locally, setup leaderboards (if desired) and then run the following commands:
```shell
npm run pages-predeploy
npm run pages-deploy
```

**Note**: If you want gh pages to use a custom domain, add a CNAME file within /dist folder before running `pages-deploy` command (Requires you to properly setup DNS records for your domain).

If no custom domain is specified, it will be available via `https://<your-github-username>.github.io/<your-repo-name>/`


## License
GPL-3.0 License

(Note: Project may contain assets that are licensed differently in which cases the license is indicated within the assets folder)
