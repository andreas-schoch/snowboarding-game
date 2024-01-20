import {deflateSync, inflateSync, strToU8, strFromU8} from 'fflate';
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
    const binary = strToU8(b64);
    const encoded = deflateSync(binary, {level: 9});
    let binaryString = '';
    for (let i = 0; i < encoded.length; i++) binaryString += String.fromCharCode(encoded[i]);
    console.timeEnd('Base64Serializer.encode');
    return binaryString;
  }

  function decode(base64: string): T {
    let binary = new Uint8Array(base64.length);
    for (let i = 0; i < base64.length; i++) binary[i] = base64.charCodeAt(i);
    binary = inflateSync(binary);
    const b64 = strFromU8(binary);
    const data = JSON.parse(atob(b64)) as O;
    const transformed = options.from ? options.from(data) : data as unknown as T;
    return transformed;
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

export const toWrapperTSLProto = (data: {wrapper: TrickScore[]}): {wrapper: TrickScoreProto[]} => {
  return {wrapper: toTSLProto(data.wrapper)};
};

export const fromWrapperTSLProto = (tslp: {wrapper: TrickScoreProto[]}): {wrapper: TrickScore[]} => {
  return {wrapper: fromTSLProto(tslp.wrapper)};
};
