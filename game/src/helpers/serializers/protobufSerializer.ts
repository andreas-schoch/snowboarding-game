import {load} from 'protobufjs';

type ProtobufSerializerOptions<T, O> = {
  schema: string;
  type: string;
  default?: T;
  from?: (o: O) => T;
  to?: (o: T) => O;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ProtobufSerializer<T extends {[k: string]: any}, O extends {[k: string]: any}>(options: ProtobufSerializerOptions<T, O>){
  const root = await load(options.schema);
  const TrickScoreLog = root.lookupType(options.type);

  function encode(data: T): string {
    console.time('ProtobufSerializer.encode');
    const transformed = options.to ? options.to(data) : data;
    const errMsg = TrickScoreLog.verify(transformed);
    if (errMsg) console.log('ProtobufSerializer error', errMsg);
    if (errMsg) throw Error(errMsg);
    const message = TrickScoreLog.create(transformed);
    const encoded = TrickScoreLog.encode(message).finish();

    let binaryString = '';
    for (let i = 0; i < encoded.length; i++) binaryString += String.fromCharCode(encoded[i]);
    // const binaryString = String.fromCharCode.apply(null, Array.from(encoded));
    console.timeEnd('ProtobufSerializer.encode');
    return binaryString;
  }

  function decode(binaryString: string): T {
    const binary = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) binary[i] = binaryString.charCodeAt(i);
    const message = TrickScoreLog.decode(binary);
    const data = TrickScoreLog.toObject(message, {defaults: true}) as O;
    const transformed = options.from ? options.from(data) : data as unknown as T;
    return transformed;
  }

  return {encode, decode};
}
