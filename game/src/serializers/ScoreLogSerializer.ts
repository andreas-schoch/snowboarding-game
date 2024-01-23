import {deflateSync, inflateSync} from 'fflate';
import {ICoinTrickScore, IComboTrickScore, IFlipTrickScore, TrickScore, TrickScoreType} from '../pocketbase/types';

// 5 times smaller than base64 and about 40-50% smaller than protobuf (without deflate, otherwise still significant but not as much)
// Issue is that everything is hardcoded and specific for TrickScore[] type
// Also probably not super future proof if things need changing
export async function ScoreLogSerializer() {

  const encodeComboScore = ({type, frame, accumulator, multiplier}: IComboTrickScore): ArrayBuffer => {
    // type  frame          accumulator,   multiplier
    // AA    BB BB BB BB    CC CC CC CC    DD DD
    const buffer = new ArrayBuffer(11); // 11 bytes
    const view = new DataView(buffer);
    view.setUint8(0, type); // 1 byte
    view.setUint32(1, frame, true); // 4 bytes
    view.setUint32(5, accumulator, true); // 4 bytes
    view.setUint16(9, multiplier, true); // 2 bytes
    return buffer;
  };

  const encodeFlipScore = ({type, frame, flips}: IFlipTrickScore): ArrayBuffer => {
    // type  frame          flips
    // AA    BB BB BB BB    CC
    const buffer = new ArrayBuffer(6); // 6 bytes
    const view = new DataView(buffer);
    view.setUint8(0, type); // 1 byte
    view.setUint32(1, frame, true); // 4 bytes
    view.setUint8(5, flips); // 1 bytes
    return buffer;
  };

  const encodeCoinScore = ({type, frame}: ICoinTrickScore): ArrayBuffer => {
    // type  frame
    // AA    BB BB BB BB
    const buffer = new ArrayBuffer(5); // 5 bytes
    const view = new DataView(buffer);
    view.setUint8(0, type); // 1 byte
    view.setUint32(1, frame, true); // 4 bytes
    return buffer;
  };

  function encode(data: TrickScore[]): string {
    const buffers: ArrayBuffer[] = [];
    console.time('ScoreLogSerializer.encode');

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

    console.timeEnd('ScoreLogSerializer.encode');
    return binaryString;
  }

  function decode(binaryString: string): TrickScore[] {
    let uint8array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) uint8array[i] = binaryString.charCodeAt(i);

    uint8array = inflateSync(uint8array);

    const trickScores: TrickScore[] = [];
    let offset = 0;
    while (offset < uint8array.byteLength) {
      const type = uint8array[offset];
      const frame = new DataView(uint8array.buffer, offset + 1, 4).getUint32(0, true);
      switch (type) {
      case TrickScoreType.combo: {
        const accumulator = new DataView(uint8array.buffer, offset + 5, 4).getUint32(0, true);
        const multiplier = new DataView(uint8array.buffer, offset + 9, 2).getUint16(0, true);
        const log: IComboTrickScore = {type, frame, accumulator, multiplier};
        trickScores.push(log);
        offset += 11;
        break;
      }
      case TrickScoreType.flip: {
        const flips = new DataView(uint8array.buffer, offset + 5, 1).getUint8(0);
        const log: IFlipTrickScore = {type, frame, flips};
        trickScores.push(log);
        offset += 6;
        break;
      }
      case TrickScoreType.present: {
        const log: ICoinTrickScore = {type, frame};
        trickScores.push(log);
        offset += 5;
        break;
      }
      default:
        throw Error(`Unknown TrickScoreType: ${type}`);
      }
    }

    return trickScores;

  }

  return {encode, decode};
}
