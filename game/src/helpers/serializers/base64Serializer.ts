import {TrickScore, TrickScoreType} from '../../pocketbaseService/types';
import {TrickScoreProto} from './types';

type Base64SerializerOptions<T, O> = {
  default: T;
  from?: (o: O) => T;
  to?: (o: T) => O;
};

export async function Base64Serializer<T, O>(options: Base64SerializerOptions<T, O>) {
  function encode(data: T): string {
    console.time('Base64Serializer.encode');
    const transformed = options.to ? options.to(data) : data;
    const b64 = btoa(JSON.stringify(transformed));
    // const b64 = Buffer.from(JSON.stringify(data), 'base64');
    // return b64.toString('base64');
    console.timeEnd('Base64Serializer.encode');
    return b64;
  }

  function decode(base64: string): T {
    console.time('Base64Serializer.decode');
    try {
      const data = JSON.parse(atob(base64)) as O;
      const transformed = options.from ? options.from(data) : data as unknown as T;
      console.timeEnd('decode');
      return transformed;
    } catch (e) {
      console.timeEnd('Base64Serializer.decode');
      if (options.default)return options.default;
      else throw e;
    }
  }

  return {encode, decode};
}

export const toTSLProto = (tsl: TrickScore[]): TrickScoreProto[] => {
  return tsl.map(ts => {
    switch (ts.type) {
    case TrickScoreType.combo:
      return {t: ts.type, fr: ts.frame, a: ts.accumulator, m: ts.multiplier};
    case TrickScoreType.flip:
      return {t: ts.type, fr: ts.frame, fl: ts.flips};
    case TrickScoreType.present:
      return {t: ts.type, fr: ts.frame};
    default:
      throw Error('Unknown trick score type');
    }
  });
};

export const fromTSLProto = (tsl: TrickScoreProto[]): TrickScore[] => {
  return tsl.map(tsp => {
    switch (tsp.t) {
    case TrickScoreType.combo:
      return {type: tsp.t, frame: tsp.fr, accumulator: tsp.a, multiplier: tsp.m};
    case TrickScoreType.flip:
      return {type: tsp.t, frame: tsp.fr, flips: tsp.fl};
    case TrickScoreType.present:
      return {type: tsp.t, frame: tsp.fr};
    default:
      throw Error('Unknown trick score type');
    }
  });
};
