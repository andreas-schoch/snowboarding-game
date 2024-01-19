import {load} from 'protobufjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ProtobufSerializer<T extends {[k: string]: any}>(schema: string, type: string){
  const root = await load(schema);
  const TrickScoreLog = root.lookupType(type);

  function encode(data: T): string {
    console.log('ProtobufSerializer', schema, type, data);
    console.time('encode');
    const errMsg = TrickScoreLog.verify(data);
    console.log('ProtobufSerializer error', errMsg);
    if (errMsg) throw Error(errMsg);
    const message = TrickScoreLog.create(data);
    const encoded = TrickScoreLog.encode(message).finish();

    let binaryString = '';
    for (let i = 0; i < encoded.length; i++) binaryString += String.fromCharCode(encoded[i]);
    // const binaryString = String.fromCharCode.apply(null, Array.from(encoded));
    console.timeEnd('encode');
    return binaryString;
  }

  function decode(binaryString: string): T {
    console.time('decode');
    const binary = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) binary[i] = binaryString.charCodeAt(i);
    const message = TrickScoreLog.decode(binary);
    const scoreProto = TrickScoreLog.toObject(message, {defaults: true}) as T;
    console.timeEnd('decode');
    return scoreProto;
  }

  return {encode, decode};
}
