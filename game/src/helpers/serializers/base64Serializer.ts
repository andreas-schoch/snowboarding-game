// function toNoop<T, O>(value: T): O {
//   return value as unknown as O;
// }

import {TrickScore, TrickScoreType} from '../../pocketbaseService/types';
import {TrickScoreProto} from './types';

// function fromNoop<T, O>(value: O): T {
//   return value as unknown as T;
// }

type Base64SerializerOptions<T, O> = {
  default: T;
  from?: (o: O) => T;
  to?: (o: T) => O;
};

export async function Base64Serializer<T, O>(options: Base64SerializerOptions<T, O>) {
  function encode(data: T): string {
    console.time('encode');
    const transformed = options.to ? options.to(data) : data;
    const b64 = btoa(JSON.stringify(transformed));
    // const b64 = Buffer.from(JSON.stringify(data), 'base64');
    // return b64.toString('base64');
    console.timeEnd('encode');
    return b64;
  }

  function decode(base64: string): T {
    console.time('decode');
    try {
      const data = JSON.parse(atob(base64)) as O;
      const transformed = options.from ? options.from(data) : data as unknown as T;
      console.timeEnd('decode');
      return transformed;
    } catch (e) {
      console.timeEnd('decode');
      if (options.default)return options.default;
      else throw e;
    }
  }

  return {encode, decode};
}

//////////////////////////////////////////////////////////////////////////////

// // import {load} from 'protobufjs';
// import {TrickScore, TrickScoreType} from '../../pocketbaseService/types';
// import {TrickScoreProto} from './types';

// export const initBase64Serializer = async () => {

//   function encode(tsl: TrickScore[]): string {
//     console.time('encode');
//     const wrapper = {data: toTSLProto(tsl)};
//     const b64 = btoa(JSON.stringify(wrapper)).split('').reverse().join('');
//     const decoded = decode(b64);
//     console.log('score proto', decoded);
//     console.log('score proto', b64);

//     console.timeEnd('encode');
//     return b64;
//   }

//   function decode(base64: string): TrickScore[] {
//     base64 = base64.split('').reverse().join('');
//     const scoreProto = JSON.parse(atob(base64)) as {data: TrickScoreProto[]};
//     console.log('score proto b64 decoded', scoreProto);
//     return fromTSLProto(scoreProto.data);
//   }

//   return {encode, decode};
// };

//////////////////////////////////////////////////////////7

// export const initProtobuf = async () => {
//   const root = await load('assets/proto/TSL.proto');
//   const TrickScoreLog = root.lookupType('TSL');

//   function encode(score: IScore): string {
//     console.time('encode');
//     const scoreProto = toScoreProto(score);
//     const errMsg = TrickScoreLog.verify(scoreProto);
//     if (errMsg) throw Error(errMsg);
//     const message = TrickScoreLog.create(scoreProto);
//     const encoded = TrickScoreLog.encode(message).finish();
//     const binaryString = String.fromCharCode.apply(null, Array.from(encoded));
//     console.timeEnd('encode');
//     return binaryString;
//   }

//   function decode(binaryString: string): IScore {
//     const binary = new Uint8Array(binaryString.length);
//     for (let i = 0; i < binaryString.length; i++) binary[i] = binaryString.charCodeAt(i);
//     const message = TrickScoreLog.decode(binary);
//     const scoreProto = TrickScoreLog.toObject(message, {defaults: true}) as IScoreProto;
//     return fromScoreProto(scoreProto);
//   }

//   return {encode, decode};
// };

// const toScoreProto = (score: IScore): IScoreProto => ({
//   id: score.id,
//   u: score.user,
//   ts: score.total,
//   td: score.distance,
//   tp: score.coins,
//   tts: score.trickScore,
//   fl: score.finishedLevel ? 1 : 0,
//   c: score.crashed ? 1 : 0,
//   l: score.level,
//   tsl: score.tsl.map(ts => {
//     switch (ts.type) {
//     case TrickScoreType.combo:
//       return {t: ts.type, fr: ts.frame, d: ts.distance, a: ts.accumulator, m: ts.multiplier};
//     case TrickScoreType.flip:
//       return {t: ts.type, fr: ts.frame, d: ts.distance, fl: ts.flips};
//     case TrickScoreType.present:
//       return {t: ts.type, fr: ts.frame, d: ts.distance};
//     default:
//       throw Error('Unknown trick score type');
//     }
//   })
// });

// const fromScoreProto = (score: IScoreProto): IScore => ({
//   id: score.id,
//   user: score.u,
//   total: score.ts,
//   distance: score.td,
//   coins: score.tp,
//   trickScore: score.tts,
//   finishedLevel: score.fl ? true : false,
//   crashed: score.c ? true : false,
//   level: score.l,
//   tsl: fromTSLProto(score.tsl)
//   // tsl: score.tsl.map(tsp => {
//   //   switch (tsp.t) {
//   //   case TrickScoreType.combo:
//   //     return {type: tsp.t, frame: tsp.fr, distance: tsp.d, accumulator: tsp.a, multiplier: tsp.m};
//   //   case TrickScoreType.flip:
//   //     return {type: tsp.t, frame: tsp.fr, distance: tsp.d, flips: tsp.fl};
//   //   case TrickScoreType.present:
//   //     return {type: tsp.t, frame: tsp.fr, distance: tsp.d};
//   //   default:
//   //     throw Error('Unknown trick score type');
//   //   }
//   // })
// });

export const toTSLProto = (tsl: TrickScore[]): TrickScoreProto[] => {
  return tsl.map(ts => {
    switch (ts.type) {
    case TrickScoreType.combo:
      return {t: ts.type, fr: ts.frame, d: ts.distance, a: ts.accumulator, m: ts.multiplier};
    case TrickScoreType.flip:
      return {t: ts.type, fr: ts.frame, d: ts.distance, fl: ts.flips};
    case TrickScoreType.present:
      return {t: ts.type, fr: ts.frame, d: ts.distance};
    default:
      throw Error('Unknown trick score type');
    }
  });
};

export const fromTSLProto = (tsl: TrickScoreProto[]): TrickScore[] => {
  return tsl.map(tsp => {
    switch (tsp.t) {
    case TrickScoreType.combo:
      return {type: tsp.t, frame: tsp.fr, distance: tsp.d, accumulator: tsp.a, multiplier: tsp.m};
    case TrickScoreType.flip:
      return {type: tsp.t, frame: tsp.fr, distance: tsp.d, flips: tsp.fl};
    case TrickScoreType.present:
      return {type: tsp.t, frame: tsp.fr, distance: tsp.d};
    default:
      throw Error('Unknown trick score type');
    }
  });
};
