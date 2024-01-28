import {deflateSync, inflateSync} from 'fflate';
import {DEBUG_LOGS} from '..';
import {ICoinTrickScore, IComboTrickScore, ICrashTrickScore, IFinishTrickScore, IFlipTrickScore, IStartTrickScore, TrickScore, TrickScoreType} from '../pocketbase/types';

// 5 times smaller than base64 and about 40-50% smaller than protobuf (without deflate, otherwise still significant but not as much)
// Issue is that everything is hardcoded and specific for TrickScore[] type
// Also probably not super future proof if things need changing
export async function ScoreLogSerializer() {

  const encodeCommon = (view: DataView, {type, frame}: Pick<TrickScore, 'type' | 'frame'>) => {
    // type  frame
    // AA    BB BB
    view.setUint8(0, type); // 1 byte
    view.setUint16(1, frame, true); // 2 bytes
  };

  const encodeComboScore = ({type, frame, accumulator, multiplier}: IComboTrickScore): ArrayBuffer => {
    // accumulator,   multiplier
    // CC CC CC CC    DD DD
    const buffer = new ArrayBuffer(9); // 9 bytes
    const view = new DataView(buffer);
    encodeCommon(view, {type, frame});
    view.setUint32(3, accumulator, true); // 4 bytes
    view.setUint16(7, multiplier, true); // 2 bytes
    return buffer;
  };

  const encodeFlipScore = ({type, frame, flips}: IFlipTrickScore): ArrayBuffer => {
    // flips
    // CC
    const buffer = new ArrayBuffer(4); // 4 bytes
    const view = new DataView(buffer);
    encodeCommon(view, {type, frame});
    view.setUint8(3, flips); // 1 bytes
    return buffer;
  };

  const encodeCoinScore = ({type, frame}: ICoinTrickScore): ArrayBuffer => {
    // Only common
    const buffer = new ArrayBuffer(3); // 3 bytes
    const view = new DataView(buffer);
    encodeCommon(view, {type, frame});
    return buffer;
  };

  const encodeStartScore = ({type, frame, timestamp, levelRevision, levelId, userId}: IStartTrickScore): ArrayBuffer => {
    // timestamp      lvlRev   levelId     userId
    // CC CC CC CC    DD DD    15 bytes    15 bytes
    const buffer = new ArrayBuffer(39); // 39 bytes
    const view = new DataView(buffer);
    encodeCommon(view, {type, frame});
    view.setUint32(3, timestamp, true); // 4 bytes
    view.setUint16(7, levelRevision, true); // 2 bytes
    encodeString(view, 9, levelId, 15); // Starting at byte 9, 15 bytes for levelId
    encodeString(view, 24, userId, 15); // Starting at byte 24, 15 bytes for userId
    return buffer;
  };

  const encodeString = (view: DataView, offset: number, str: string, length: number) => {
    for (let i = 0; i < length; i++) {
      const charCode = i < str.length ? str.charCodeAt(i) : 0; // Pad with null character if string is short
      view.setUint8(offset + i, charCode); // Store each character as 1 byte
    }
  };

  const encodeCrashOrFinishScore = ({type, frame, timestamp, distance}: ICrashTrickScore | IFinishTrickScore): ArrayBuffer => {
    // timestamp      distance
    // CC CC CC CC    DD DD
    const buffer = new ArrayBuffer(9); // 9 bytes
    const view = new DataView(buffer);
    encodeCommon(view, {type, frame});
    view.setUint32(3, timestamp, true); // 4 bytes
    view.setUint16(7, distance, true); // 2 bytes
    return buffer;
  };

  function encode(data: TrickScore[]): string {
    const buffers: ArrayBuffer[] = [];
    if (DEBUG_LOGS) console.time('ScoreLogSerializer.encode');

    for (const score of data) {
      switch (score.type) {
      case TrickScoreType.combo:
        buffers.push(encodeComboScore(score));
        break;
      case TrickScoreType.flip:
        buffers.push(encodeFlipScore(score));
        break;
      case TrickScoreType.present:
        buffers.push(encodeCoinScore(score));
        break;
      case TrickScoreType.start:
        buffers.push(encodeStartScore(score));
        break;
      case TrickScoreType.finish:
      case TrickScoreType.crash:
        buffers.push(encodeCrashOrFinishScore(score));
        break;
      default:
        throw Error(`Unknown TrickScoreType: ${score}`);
      }
    }

    let encoded = new Uint8Array(buffers.reduce((acc, cur) => acc + cur.byteLength, 0));
    let offset = 0;
    for (const buffer of buffers) {
      encoded.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    encoded = deflateSync(encoded, {level: 9});

    let binaryString = '';
    for (let i = 0; i < encoded.length; i++) binaryString += String.fromCharCode(encoded[i]);

    if (DEBUG_LOGS) console.timeEnd('ScoreLogSerializer.encode');
    return binaryString;
  }

  const decodeString = (view: DataView, offset: number, length: number): string => {
    let str = '';
    for (let i = 0; i < length; i++) {
      const charCode = view.getUint8(offset + i);
      if (charCode === 0) break; // Stop if null character is found (padding)
      str += String.fromCharCode(charCode);
    }
    return str;
  };

  function decode(binaryString: string): TrickScore[] {
    if (DEBUG_LOGS) console.time('ScoreLogSerializer.decode');
    const length = binaryString.length;
    let uint8array = new Uint8Array(length);
    for (let i = 0; i < length; i++) uint8array[i] = binaryString.charCodeAt(i);
    uint8array = inflateSync(uint8array);
    if (DEBUG_LOGS) console.timeLog('ScoreLogSerializer.decode', 'inflateSync');

    let offset = 0;
    const trickScores: TrickScore[] = [];
    const {byteLength, buffer} = uint8array;

    const view = new DataView(buffer);

    while (offset < byteLength) {
      const type = uint8array[offset];
      const frame = view.getUint16(offset + 1, true);
      switch (type) {
      case TrickScoreType.start: {
        const timestamp = view.getUint32(offset + 3, true);
        const levelRevision = view.getUint16(offset + 7, true) as 1;
        const levelId = decodeString(view, offset + 9, 15);
        const userId = decodeString(view, offset + 24, 15);
        const log: IStartTrickScore = {type, frame, timestamp, levelRevision, levelId, userId};
        trickScores.push(log);
        offset += 39;
        break;
      }
      case TrickScoreType.combo: {
        const accumulator = view.getUint32(offset + 3, true);
        const multiplier = view.getUint16(offset + 7, true);
        const log: IComboTrickScore = {type, frame, accumulator, multiplier};
        trickScores.push(log);
        offset += 9;
        break;
      }
      case TrickScoreType.flip: {
        const flips = view.getUint8(offset + 3);
        const log: IFlipTrickScore = {type, frame, flips};
        trickScores.push(log);
        offset += 4;
        break;
      }
      case TrickScoreType.present: {
        const log: ICoinTrickScore = {type, frame};
        trickScores.push(log);
        offset += 3;
        break;
      }
      case TrickScoreType.finish:
      case TrickScoreType.crash: {
        const timestamp = view.getUint32(offset + 3, true);
        const distance = view.getUint16(offset + 7, true);
        const log: IFinishTrickScore | ICrashTrickScore = {type, frame, timestamp, distance};
        trickScores.push(log);
        offset += 9;
        break;
      }
      default:
        throw Error(`Unknown TrickScoreType: ${type}`);
      }
    }

    if (DEBUG_LOGS) {
      console.timeEnd('ScoreLogSerializer.decode');
      console.log('ScoreLogSerializer.decode', trickScores);
    }

    return trickScores;

  }

  return {encode, decode};
}
