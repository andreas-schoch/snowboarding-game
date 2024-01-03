import { CHARACTER_SKINS, CharacterKeys, CharacterSkinKeys, KEY_SELECTED_CHARACTER, KEY_SELECTED_CHARACTER_SKIN } from "..";

export const getSelectedCharacter = (): CharacterKeys => {
  const characterFromStorage = localStorage.getItem(KEY_SELECTED_CHARACTER) as CharacterKeys | null;
  if (!characterFromStorage || !CHARACTER_SKINS[characterFromStorage]) return CharacterKeys.character_v02;
  return characterFromStorage;
}


export const getSelectedCharacterSkin = (): CharacterSkinKeys => {
  const characterFromStorage = localStorage.getItem(KEY_SELECTED_CHARACTER_SKIN) as CharacterSkinKeys | null;
  if (!characterFromStorage || !CHARACTER_SKINS[characterFromStorage]) return CharacterSkinKeys.character_v02_neutral;
  return characterFromStorage;
}
