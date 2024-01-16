import {IScore} from './character/State';
import {LevelKeys} from './levels';
import {DEFAULT_HEIGHT, DEFAULT_WIDTH} from '.';

export type SettingKeys = 'debug' | 'debugZoom' | 'resolution' | 'volumeMusic' | 'volumeSfx' | 'darkmodeEnabled' | 'userScores' | 'userName' | 'levelCurrent' | 'selectedCharacter' | 'selectedCharacterSkin';
export type CharacterKeys = 'character_v01' | 'character_v02';
export type CharacterSkinKeys = 'character_v01_neutral' | 'character_v01_santa' | 'character_v02_neutral' | 'character_v02_santa';

export class Settings {
  static set(setting: SettingKeys, value: string) {
    localStorage.setItem('snowboarding_game_' + setting, value);
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
    return Number(Settings.getRaw('volumeMusic')) || 60;
  }

  static volumeSfx(): number {
    return Number(Settings.getRaw('volumeSfx')) || 60;
  }

  static username(): string | null {
    return Settings.getRaw('userName');
  }

  static currentLevel(): LevelKeys {
    return Settings.getRaw('levelCurrent') as LevelKeys || 'level_001';
  }

  static localScores(): Record<keyof LevelKeys, IScore[]> {
    return JSON.parse(Settings.getRaw('userScores') || '{}');
  }

  static selectedCharacter(): CharacterKeys {
    return Settings.getRaw('selectedCharacter') as CharacterKeys || 'character_v02';
  }

  static selectedCharacterSkin(): CharacterSkinKeys {
    return Settings.getRaw('selectedCharacterSkin') as CharacterSkinKeys || 'character_v02_santa';
  }

  private static getRaw(setting: SettingKeys): string | null {
    return localStorage.getItem('snowboarding_game_' + setting);
  }
}
