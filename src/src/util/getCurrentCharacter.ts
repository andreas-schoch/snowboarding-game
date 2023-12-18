import { CHARACTERS, CharacterKeys, KEY_SELECTED_CHARACTER } from '../index';

export const getSelectedCharacter = (): CharacterKeys => {
  const characterFromStorage = localStorage.getItem(KEY_SELECTED_CHARACTER);
  if (!characterFromStorage || !CHARACTERS[characterFromStorage]) return CharacterKeys.character_santa;
  return characterFromStorage as CharacterKeys;
}
