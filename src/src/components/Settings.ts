import { CHARACTER_SKINS, CharacterKeys, CharacterSkinKeys, DEFAULT_HEIGHT, DEFAULT_WIDTH, LEVELS, LevelKeys } from "..";
import { IScore } from "./State";

type SettingKeys = 'debug' | 'debugZoom' | 'resolution' | 'volumeMusic' | 'volumeSfx' | 'darkmodeEnabled' | 'userScores' | 'userName' | 'levelCurrent' | 'selectedCharacter' | 'selectedCharacterSkin';;

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
    const levelFromStorage = Settings.getRaw('levelCurrent') as LevelKeys | null;
    if (!levelFromStorage || !LEVELS.includes(levelFromStorage)) return LevelKeys.level_001;
    return levelFromStorage;
  }

  static localScores(): Record<keyof LevelKeys, IScore[]> {
    return JSON.parse(Settings.getRaw('userScores') || '{}');
  }

  static selectedCharacter(): CharacterKeys {
    const characterFromStorage = Settings.getRaw('selectedCharacter') as CharacterKeys | null;
    if (!characterFromStorage || !CHARACTER_SKINS[characterFromStorage]) return CharacterKeys.character_v02;
    return characterFromStorage;
  }

  static selectedCharacterSkin(): CharacterSkinKeys {
    const characterFromStorage = Settings.getRaw('selectedCharacterSkin') as CharacterSkinKeys | null;
    if (!characterFromStorage || !CHARACTER_SKINS[characterFromStorage]) return CharacterSkinKeys.character_v02_santa;
    return characterFromStorage;
  }

  private static getRaw(setting: SettingKeys): string | null {
    return localStorage.getItem('snowboarding_game_' + setting);
  }
}
