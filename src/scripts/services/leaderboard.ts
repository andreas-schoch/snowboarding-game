// TODO v0.6.0
//  Responsible to communicate with server and submit scores
//  Since the game is simulated on the client, the server will do some basic sanity checking to make it a little bit harder to
//  submit cheated runs. Will probably track the start/end time of each run and submit score changes periodically every ~5-10seconds.
//  (Also number of flips, landed combos, collected coins, distance etc) This data will be stored together with the total score.
//  By comparing this meta with other similarly ranked scores, we can find anomalies
//  (e.g num flips went from 5 to 50 in 5 seconds, num coins collected is much higher, score doesn't match the meta data)
//  When a fake score is detected, instead of removing it, keep showing it to the cheating user and filter it out for everybody else.

// Login procedure should be somewhat similar to playfabs LoginWithCustomId()
export class LeaderboardService {
  private readonly SERVER_URL: string = '';
  // uuid created by server and saved locally.
  // When user visits site again with the same device their username and scores will be remembered.
  private readonly USER_ID: string;
  // Not sure if truly needed for first MVP but was thinking of sending a JWT token after login with USER_ID
  // Most likely won't be part of v0.6.0.
  private sessionToken: string;

  constructor() {
    this.USER_ID = localStorage.getItem('userId') || '';
  }

  openWebsocket() {
    // Open websocket and register listeners

  }

  loginAnonymous() {
    // s

  }

  setDisplayName(displayName: string) {

  }

  startRun() {
    // Here server is informed that this player has started a run

  }

  endRun() {
    // Here the score gets submitted to the server. Probably via websocket message
    this.submitFinalScore();
  }

  submitIntermediateScore() {

  }

  private submitFinalScore() {

  }

  private registerSocketListeners() {

  }
}
