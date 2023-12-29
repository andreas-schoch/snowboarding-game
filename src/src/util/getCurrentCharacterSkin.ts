import { CHARACTERS, CharacterKeys as CharacterSkins, KEY_SELECTED_CHARACTER } from '../index';

export const getSelectedCharacterSkin = (): CharacterSkins => {
  const characterFromStorage = localStorage.getItem(KEY_SELECTED_CHARACTER);
  if (!characterFromStorage || !CHARACTERS[characterFromStorage]) return CharacterSkins.character_santa;
  return characterFromStorage as CharacterSkins;
}
