import {KEY_LEVEL_CURRENT, LevelKeys, LEVELS} from '../index';

export const getCurrentLevel = (): LevelKeys => {
  const levelFromStorage = localStorage.getItem(KEY_LEVEL_CURRENT) as LevelKeys;
  if (!levelFromStorage || !LEVELS.includes(levelFromStorage)) return LevelKeys.level_001;
  return levelFromStorage;
}
