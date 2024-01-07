import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import {LeaderBoard as RexLeaderboard} from 'phaser3-rex-plugins/plugins/firebase-components';
import {env} from '../environment';
import {calculateTotalScore} from '../util/calculateTotalScore';
import {pseudoRandomId} from '../util/pseudoRandomId';
import {IScore} from '../components/State';
import { Settings } from '../components/Settings';
import { LevelKeys } from '../levels';

export class LeaderboardService {
  rexLeaderboard: RexLeaderboard; // TODO get rid. It works well but not 100% suited for this games needs (score stored as list of actions instead of plain value)
  auth: firebase.auth.Auth;
  currentLevel: LevelKeys;
  private numAuthAttempts = 0;

  constructor() {
    if (env.FIREBASE_LEADERBOARD_ENABLED) {
      // @ts-ignore workaround to support rex firebase plugin which seems to expect firebase to be loaded via script tag and be globally available
      window.firebase = firebase;
      const firebaseConfig = {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId: env.FIREBASE_APP_ID,
        measurementId: env.FIREBASE_MESSAGING_SENDER_ID,
      };
      const app = firebase.initializeApp(firebaseConfig);
      this.auth = firebase.auth();
      this.auth.onAuthStateChanged(async user => {
        Settings.debug() && console.log('onAuthStateChanged user', user);
        if (user) {
          // Signed in
          if (user.displayName && user.displayName !== Settings.username()) Settings.set('userName', user.displayName);
          this.setLevel(Settings.currentLevel());
        } else {
          // Try to sign in
          Settings.debug() && console.log('try signInAnonymously');
          if (++this.numAuthAttempts >= 3) throw new Error('failed to authenticate multiple times.');
          this.auth.signInAnonymously().catch((error) => console.error('Failed to login anonymous user', error));
        }
      });
    }
  }

  setLevel(level: LevelKeys) {
    this.numAuthAttempts = 0;
    this.currentLevel = level;
    Settings.set('levelCurrent', level);
    // TODO timeFilters don't work well with how I want scores to be stored (list of actions from which total is derived instead of plain numeric total)
    if (this.auth?.currentUser) {
      this.rexLeaderboard = new RexLeaderboard({
        root: `leaderboard_${level}`,
        pageItemCount: 200,
      });
    }
  }

  async submit(score: IScore): Promise<boolean> {
    score.id = pseudoRandomId();
    score.timestamp = Date.now();
    this.saveScoreLocally(score);

    if (env.FIREBASE_LEADERBOARD_ENABLED && this.auth?.currentUser) {
      const highest = await this.rexLeaderboard.getScore(this.auth.currentUser.uid);

      if (!highest || calculateTotalScore(highest as IScore) < calculateTotalScore(score)) {
        await this.rexLeaderboard.post(calculateTotalScore(score), score, score.timestamp);
        return true;
      }
    }

    return false;
  }

  private saveScoreLocally(score: IScore) {
    const localScoresMap: Record<keyof LevelKeys, IScore[]> = Settings.localScores();
    const localScoresLevel = localScoresMap[score.level] || [];
    localScoresLevel.push(score);
    localScoresMap[score.level] = localScoresLevel;
    Settings.set('userScores', JSON.stringify(localScoresMap));
  }
}
