import {ResizeProps} from './UI/EditorUI/Pane';
import {setRecentLevels} from './UI/EditorUI/globalSignals';
import {ILevel, ILevelNew, LocalLevelKeys} from './levels';
import {RubeFile} from './physics/RUBE/RubeFile';
import {sanitizeRubeFile} from './physics/RUBE/sanitizeRubeFile';
import {IScore} from './pocketbase/types';
import {DEFAULT_HEIGHT, DEFAULT_WIDTH, rubeFileSerializer} from '.';

export type SettingKeys = 'debug' | 'debugZoom' | 'resolution' | 'volumeMusic' | 'volumeSfx' | 'darkmodeEnabled' | 'userScores' | 'userName' | 'anonymous_uid' | 'levelCurrent' | 'selectedCharacter' | 'selectedCharacterSkin' | 'debug_logs' | 'betaFeaturesEnabled' | 'editorOpen' | 'editorRecentLevels' | 'fps' | 'local_levels' | 'local_level_scenes' | 'editor_show_grid' | 'editor_show_fixture' | 'editor_grid_info_map';
export type CharacterKeys = 'character_v01' | 'character_v02';
export type CharacterSkinKeys = 'character_v01_neutral' | 'character_v01_santa' | 'character_v02_neutral' | 'character_v02_santa';

export class PersistedStore {

  static editorPaneGridInfo(title: string): ResizeProps | null {
    const gridInfoMap: Record<string, ResizeProps> = JSON.parse(PersistedStore.getRaw('editor_grid_info_map') || '{}');
    return gridInfoMap[title] || null;
  }

  static setEditorPaneGridInfo(title: string, gridInfo: ResizeProps) {
    const gridInfoMap: Record<string, ResizeProps> = JSON.parse(PersistedStore.getRaw('editor_grid_info_map') || '{}');
    gridInfoMap[title] = gridInfo;
    PersistedStore.set('editor_grid_info_map', JSON.stringify(gridInfoMap));
  }

  static set(setting: SettingKeys, value: string) {
    localStorage.setItem('snowboarding_game_' + setting, value);
  }

  static anonymousUID(): string | null {
    return PersistedStore.getRaw('anonymous_uid');
  }

  static resolutionScale(): number {
    return Number(PersistedStore.getRaw('resolution') || 1);
  }

  static widthScaled(): number {
    return DEFAULT_WIDTH * PersistedStore.resolutionScale();
  }

  static heightScaled(): number {
    return DEFAULT_HEIGHT * PersistedStore.resolutionScale();
  }

  static defaultZoom(): number {
    return Number(PersistedStore.getRaw('debugZoom')) || 1;
  }

  static editorOpen(): boolean {
    return PersistedStore.getRaw('editorOpen') === 'true';
  }

  static editorRecentLevels(): (ILevel | ILevelNew)[] {
    const str = PersistedStore.getRaw('editorRecentLevels');
    if (!str) return [];
    try {
      const recent: ILevel[] = JSON.parse(str);
      return recent;
    } catch (e) {
      console.error('Error parsing recent levels:', e);
      PersistedStore.set('editorRecentLevels', '');
      return [];
    }
  }

  static addEditorRecentLevel(level: ILevel | ILevelNew, rubefile: RubeFile) {
    if (level.localId === undefined) throw new Error('Level must have localId set. This should never happen');
    let recent = PersistedStore.editorRecentLevels();
    const existingIndex = recent.findIndex(r => r.localId === level.localId);
    if (existingIndex !== -1) recent.splice(existingIndex, 1); // Remove existing
    recent.unshift(level); // Add to front
    PersistedStore.addEditorRubefile(level, rubefile);
    recent = recent.slice(0, 10); // Limit to 10
    PersistedStore.set('editorRecentLevels', JSON.stringify(recent));
    setRecentLevels(recent);
  }

  static addEditorLocalLevel(level: ILevelNew, rubefile: RubeFile) {
    const localLevels: Record<string, ILevelNew> = JSON.parse(PersistedStore.getRaw('local_levels') || '{}');
    localLevels[level.localId] = level;
    PersistedStore.set('local_levels', JSON.stringify(localLevels));
    PersistedStore.addEditorRubefile(level, rubefile);
  }

  static addEditorRubefile(level: ILevel | ILevelNew, rubefile: RubeFile) {
    const localRubeFiles: Record<string, string> = JSON.parse(PersistedStore.getRaw('local_level_scenes') || '{}');
    localRubeFiles[level.localId] = rubeFileSerializer.encode(rubefile);
    PersistedStore.set('local_level_scenes', JSON.stringify(localRubeFiles));
  }

  static getEditorRubefile(level: ILevelNew): RubeFile | null {
    const localRubeFiles: Record<string, string> = JSON.parse(PersistedStore.getRaw('local_level_scenes') || '{}');
    const bin = localRubeFiles[level.localId];
    console.debug('Getting rubefile for level', level);
    if (!bin) return null;
    let scene = rubeFileSerializer.decode(bin);
    scene = sanitizeRubeFile(scene);
    return scene;
  }

  static editorShowGrid(): boolean {
    return PersistedStore.getRaw('editor_show_grid') === 'true';
  }

  static editorShowFixture(): boolean {
    return PersistedStore.getRaw('editor_show_fixture') === 'true';
  }

  static getEditorLocalLevel(level: ILevelNew): ILevelNew | null {
    const localLevels: Record<string, ILevelNew> = JSON.parse(PersistedStore.getRaw('local_levels') || '{}');
    return localLevels[level.localId] || null;
  }

  static darkmodeEnabled(): boolean {
    return PersistedStore.getRaw('darkmodeEnabled') !== 'false';
  }

  static debug(): boolean {
    return PersistedStore.getRaw('debug') === 'true';
  }

  static fps(): boolean {
    return PersistedStore.getRaw('fps') === 'true';
  }

  static volumeMusic(): number {
    const volume = PersistedStore.getRaw('volumeMusic');
    return volume !== null ? Number(volume) : 0;
  }

  static volumeSfx(): number {
    const volume = PersistedStore.getRaw('volumeSfx');
    return volume !== null ? Number(volume) : 60;
  }

  static username(): string | null {
    return PersistedStore.getRaw('userName');
  }

  static currentLevel(): string {
    return PersistedStore.getRaw('levelCurrent') || 'qj2fzvw7dfz9y1s';
  }

  static localScores(): Record<keyof LocalLevelKeys, IScore[]> {
    return JSON.parse(PersistedStore.getRaw('userScores') || '{}');
  }

  static selectedCharacter(): CharacterKeys {
    return PersistedStore.getRaw('selectedCharacter') as CharacterKeys || 'character_v02';
  }

  static selectedCharacterSkin(): CharacterSkinKeys {
    return PersistedStore.getRaw('selectedCharacterSkin') as CharacterSkinKeys || 'character_v02_santa';
  }

  static betaFeaturesEnabled(): boolean {
    return PersistedStore.getRaw('betaFeaturesEnabled') === 'true';
  }

  static debugLogs(): boolean {
    return PersistedStore.getRaw('debug_logs') === 'true';
  }

  private static getRaw(setting: SettingKeys): string | null {
    return localStorage.getItem('snowboarding_game_' + setting);
  }
}
