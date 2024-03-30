import {pb} from '../..';
import {PersistedStore} from '../../PersistedStore';
import {pseudoRandomId} from '../../helpers/pseudoRandomId';
import {ILevelNew} from '../../levels';
import {RubeFile} from './RubeFile';
import {customPropertyDefs, metaWorld} from './RubeFileConstants';
import {sanitizeRubeFile} from './sanitizeRubeFile';

export function generateEmptyRubeFile(): RubeFile {
  return sanitizeRubeFile({
    customPropertyDefs: [...customPropertyDefs],
    metaworld: {
      ...metaWorld,
      metaobject: [],
      metaimage: [],
      metabody: [],
      metajoint: []
    }
  });
}

export function generateNewLevel(): ILevelNew {
  // const loggedInUser = pb.auth.loggedInUser();
  // if (!loggedInUser) throw new Error('No user logged in. This should never happen');

  const localId = 'local_' + pseudoRandomId();
  return {
    localId,
    name: 'New Level_' + pseudoRandomId(),
    thumbnail: '',
    number: -1,
    scene: localId + '.bin',
    user: 'temp',
    localLastUpdated: Date.now(),
  };
}

export function registerNewLevel(rubefile?: RubeFile): [ILevelNew, RubeFile] {
  const loggedInUser = pb.auth.loggedInUser();
  if (!loggedInUser) throw new Error('No user logged in. This should never happen');

  const newLevel = generateNewLevel();
  newLevel.user = loggedInUser.id;

  if (rubefile) rubefile = sanitizeRubeFile(rubefile);
  const emptyRubefile = rubefile || generateEmptyRubeFile();

  PersistedStore.addEditorLocalLevel(newLevel, emptyRubefile);

  return [newLevel, emptyRubefile];
}
