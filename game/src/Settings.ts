import {LocalLevelKeys} from './levels';
import {IScore} from './pocketbase/types';
import {DEFAULT_HEIGHT, DEFAULT_WIDTH} from '.';

export type SettingKeys = 'debug' | 'debugZoom' | 'resolution' | 'volumeMusic' | 'volumeSfx' | 'darkmodeEnabled' | 'userScores' | 'userName' | 'anonymous_uid' | 'levelCurrent' | 'selectedCharacter' | 'selectedCharacterSkin' | 'debug_logs' | 'betaFeaturesEnabled';
export type CharacterKeys = 'character_v01' | 'character_v02';
export type CharacterSkinKeys = 'character_v01_neutral' | 'character_v01_santa' | 'character_v02_neutral' | 'character_v02_santa';

export class Settings {
  static set(setting: SettingKeys, value: string) {
    localStorage.setItem('snowboarding_game_' + setting, value);
  }

  static anonymousUID(): string | null{
    return Settings.getRaw('anonymous_uid');
  }

  static resolutionScale(): number {
    return Number(Settings.getRaw('resolution') || 1);
  }

  static widthScaled(): number {
    return DEFAULT_WIDTH * Settings.resolutionScale();
  }

  static heightScaled(): number {
    return DEFAULT_HEIGHT * Settings.resolutionScale();
  }

  static defaultZoom(): number {
    return Number(Settings.getRaw('debugZoom')) || 1;
  }

  static darkmodeEnabled(): boolean {
    return Settings.getRaw('darkmodeEnabled') !== 'false';
  }

  static debug(): boolean {
    return Settings.getRaw('debug') === 'true';
  }

  static volumeMusic(): number {
    const volume = Settings.getRaw('volumeMusic');
    return volume !== null ? Number(volume) : 0;
  }

  static volumeSfx(): number {
    const volume = Settings.getRaw('volumeSfx');
    return volume !== null ? Number(volume) : 60;
  }

  static username(): string | null {
    return Settings.getRaw('userName');
  }

  static currentLevel(): string {
    return Settings.getRaw('levelCurrent') || 'qj2fzvw7dfz9y1s';
  }

  static localScores(): Record<keyof LocalLevelKeys, IScore[]> {
    return JSON.parse(Settings.getRaw('userScores') || '{}');
  }

  static selectedCharacter(): CharacterKeys {
    return Settings.getRaw('selectedCharacter') as CharacterKeys || 'character_v02';
  }

  static selectedCharacterSkin(): CharacterSkinKeys {
    return Settings.getRaw('selectedCharacterSkin') as CharacterSkinKeys || 'character_v02_santa';
  }

  static betaFeaturesEnabled(): boolean {
    return Settings.getRaw('betaFeaturesEnabled') === 'true';
  }

  static debugLogs(): boolean {
    return Settings.getRaw('debug_logs') === 'true';
  }

  private static getRaw(setting: SettingKeys): string | null {
    return localStorage.getItem('snowboarding_game_' + setting);
  }
}
