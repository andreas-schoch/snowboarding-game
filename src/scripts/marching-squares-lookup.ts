export interface IMarchingSquaresConfig {
  densityMax: number;
  densityThreshold: number;
  squareSize: number;
}


/** Represents a single "Marching Square */
export interface ISquareDensityData {
  /** topLeft corner Density */
  tl: number;
  /** topRight corner Density */
  tr: number;
  /** bottomRight corner Density */
  br: number;
  /** bottomLeft corner Density */
  bl: number;

  // TODO not sure whether I want to pass threshold and maxDensity here for every square. Might be convenient sometimes but often redundant
  /** Min Density corners need to have to be considered solid */
  threshold: number;
  /** Max allowed Density any corner can have */
  maxDensity: number;
}


export interface ISquareGeomData {
  // polygons: Phaser.Geom.Polygon[];
  polygons: [number, number][][];
  isoLines: Phaser.Geom.Line[];
  shapeIndex: number;
}


/** Used to create ISquareGeomData. Only to be used internally */
interface ISquareGeomDataRaw {
  /** A Square can consist of 0-2 polygons. The inner arrays represent scaled flat points needed to create a polygon */
  p: [number, number][][];
  // p: number[][];
  /**
   * For each polygon (inner array) indicate the starting point to draw the iso line.
   * 0-2 lines of a Square's polygons can border air. Make sure both outer arrays match in length
   * */
  l: number[][];
}


const DEFAULT_CONFIG: IMarchingSquaresConfig = {
  densityMax: 128,
  densityThreshold: 64,
  squareSize: 32,
};


// TODO make this into a Phaser plugin together with the SculptComponent. Maybe make it possible to easily hookup the renderQueue
export class MarchingSquaresLookup {
  // TODO this is kind of like an intentional memory leak as there are millions of possible variations.
  //  Measure whether this is really worth it and how large it becomes after 30 mins of constantly generating random terrain
  private polygonCache: Map<string, ISquareGeomData> = new Map();
  private readonly polygonLookupFactory: ((c: ISquareDensityData) => ISquareGeomDataRaw)[];
  private readonly config: IMarchingSquaresConfig;

  constructor(config: IMarchingSquaresConfig = DEFAULT_CONFIG) {
    this.config = config;

    const l = this.ilerp;
    const s = config.squareSize;
    // this.polygonLookupFactory = [
    //   e => ({p: [], l: []}),
    //   e => ({p: [[0, l(e.tl, e.bl), l(e.bl, e.br), s, 0, s]], l: [[0]]}),
    //   e => ({p: [[l(e.bl, e.br), s, s, l(e.tr, e.br), s, s]], l: [[0]]}),
    //   e => ({p: [[0, l(e.tl, e.bl), s, l(e.tr, e.br), s, s, 0, s]], l: [[0]]}),
    //
    //   e => ({p: [[s, l(e.tr, e.br), l(e.tl, e.tr), 0, s, 0]], l: [[0]]}),
    //   e => ({p: [[0, l(e.tl, e.bl), l(e.bl, e.br), s, 0, s], [s, l(e.tr, e.br), l(e.tl, e.tr), 0, s, 0]], l: [[0], [0]]}),
    //   // e => ({p: [[0, l(e.tl, e.bl), 0, 0, l(e.tl, e.tr), 0], [s, l(e.tr, e.br), s, s, l(e.bl, e.br), s]], l: [[0], [0]]}),
    //
    //   e => ({p: [[l(e.bl, e.br), s, l(e.tl, e.tr), 0, s, 0, s, s]], l: [[0]]}),
    //   e => ({p: [[l(e.tl, e.tr), 0, 0, l(e.tl, e.bl), 0, s, s, s, s, 0]], l: [[0]]}),
    //
    //   e => ({p: [[l(e.tl, e.tr), 0, 0, l(e.tl, e.bl), 0, 0]], l: [[0]]}),
    //   e => ({p: [[l(e.tl, e.tr), 0, l(e.bl, e.br), s, 0, s, 0, 0]], l: [[0]]}),
    //   e => ({p: [[0, 0, l(e.tl, e.tr), 0, s, l(e.tr, e.br), s, s, l(e.bl, e.br), s, 0, l(e.tl, e.bl)]], l: [[1, 2]]}),
    //   // e => ({p: [[0, s, 0, l(e.tl, e.bl), l(e.tl, e.tr), 0, s, 0, s, l(e.tr, e.br), l(e.bl, e.br), s]], l: [[1, 2]]}),
    //
    //   e => ({p: [[0, 0, l(e.tl, e.tr), 0, s, l(e.tr, e.br), s, s, 0, s]], l: [[2]]}),
    //
    //   e => ({p: [[0, 0, s, 0, s, l(e.tr, e.br), 0, l(e.tl, e.bl)]], l: [[2]]}),
    //   e => ({p: [[0, 0, s, 0, s, l(e.tr, e.br), l(e.bl, e.br), s, 0, s]], l: [[1]]}),
    //   e => ({p: [[0, 0, s, 0, s, s, l(e.bl, e.br), s, 0, l(e.tl, e.bl)]], l: [[3]]}),
    //   e => ({p: [[0, 0, s, 0, s, s, 0, s]], l: [[]]}),
    //   // Extra paths for the 2 ambiguous cases
    //   // e => ({p: [[0, l(e.tl, e.bl), 0, 0, l(e.tl, e.tr), 0], [s, l(e.tr, e.br), s, s, l(e.bl, e.br), s]], l: [[0], [0]]}),
    //   // e => ({p: [[0, s, 0, l(e.tl, e.bl), l(e.tl, e.tr), 0, s, 0, s, l(e.tr, e.br), l(e.bl, e.br), s]], l: [[1, 2]]}),
    // ];

    // TODO at least one of the iso-lines has the wrong start index defined. Verify each one
    this.polygonLookupFactory = [
      e => ({p: [], l: []}),
      e => ({p: [[[0, l(e.tl, e.bl)], [l(e.bl, e.br), s], [0, s]]], l: [[0]]}),
      e => ({p: [[[l(e.bl, e.br), s], [s, l(e.tr, e.br)], [s, s]]], l: [[0]]}),
      e => ({p: [[[0, l(e.tl, e.bl)], [s, l(e.tr, e.br)], [s, s], [0, s]]], l: [[0]]}),

      e => ({p: [[[s, l(e.tr, e.br)], [l(e.tl, e.tr), 0], [s, 0]]], l: [[0]]}),
      e => ({p: [[[0, l(e.tl, e.bl)], [l(e.bl, e.br), s], [0, s]], [[s, l(e.tr, e.br)], [l(e.tl, e.tr), 0], [s, 0]]], l: [[0], [0]]}),
      e => ({p: [[[l(e.bl, e.br), s], [l(e.tl, e.tr), 0], [s, 0], [s, s]]], l: [[0]]}),
      e => ({p: [[[l(e.tl, e.tr), 0], [0, l(e.tl, e.bl)], [0, s], [s, s], [s, 0]]], l: [[0]]}),

      e => ({p: [[[l(e.tl, e.tr), 0], [0, l(e.tl, e.bl)], [0, 0]]], l: [[0]]}),
      e => ({p: [[[l(e.tl, e.tr), 0], [l(e.bl, e.br), s], [0, s], [0, 0]]], l: [[0]]}),
      e => ({p: [[[0, 0], [l(e.tl, e.tr), 0], [s, l(e.tr, e.br)], [s, s], [l(e.bl, e.br), s], [0, l(e.tl, e.bl)]]], l: [[1, 4]]}),
      e => ({p: [[[0, 0], [l(e.tl, e.tr), 0], [s, l(e.tr, e.br)], [s, s], [0, s]]], l: [[1]]}),

      e => ({p: [[[0, 0], [s, 0], [s, l(e.tr, e.br)], [0, l(e.tl, e.bl)]]], l: [[2]]}),
      e => ({p: [[[0, 0], [s, 0], [s, l(e.tr, e.br)], [l(e.bl, e.br), s], [0, s]]], l: [[2]]}),
      e => ({p: [[[0, 0], [s, 0], [s, s], [l(e.bl, e.br), s], [0, l(e.tl, e.bl)]]], l: [[3]]}),
      e => ({p: [[[0, 0], [s, 0], [s, s], [0, s]]], l: [[]]}),
      // Extra paths for the 2 ambiguous cases TODO select according to edge densities
      // e => ({p: [[0, l(e.tl, e.bl), 0, 0, l(e.tl, e.tr), 0], [s, l(e.tr, e.br), s, s, l(e.bl, e.br), s]], l: [[0], [0]]}),
      // e => ({p: [[0, s, 0, l(e.tl, e.bl), l(e.tl, e.tr), 0, s, 0, s, l(e.tr, e.br), l(e.bl, e.br), s]], l: [[1, 2]]}),
    ];
  }

  getSquareGeomData(densityData: ISquareDensityData): ISquareGeomData {
    const shapeIndex = this.getShapeIndex(densityData);
    if (shapeIndex === 0) return ({polygons: [], isoLines: [], shapeIndex: 0});

    const hash: string = this.getHashKey(densityData, shapeIndex);
    const cachedData: ISquareGeomData | undefined = this.polygonCache.get(hash);
    if (cachedData) return cachedData;

    const dataRaw = this.polygonLookupFactory[shapeIndex](densityData);
    const data = this.createGeomData(dataRaw, shapeIndex);
    this.polygonCache.set(hash, data);
    return data;
  }

  private createGeomData(dataRaw: ISquareGeomDataRaw, shapeIndex: number): ISquareGeomData {
    const polygons: Phaser.Geom.Polygon[] = [];
    // const polygons: Phaser.Geom.Polygon[] = [];
    const isoLines: Phaser.Geom.Line[] = [];

    // Iterate over outer array which represents a single polygon
    for (let i = 0; i < dataRaw.p.length; i++) {
      // Create a single polygon
      // const points: [number, number][] = dataRaw.p[i];
      const points = dataRaw.p[i];
      // polygons.push(new Phaser.Geom.Polygon(points));
      // Create iso lines for that single polygon
      for (const isoStart of dataRaw.l[i]) {
        isoLines.push(new Phaser.Geom.Line(points[isoStart][0], points[isoStart][1], points[isoStart + 1][0], points[isoStart + 1][1]));
      }
    }

    return {polygons: dataRaw.p, isoLines, shapeIndex};
  }

  private getHashKey(data: ISquareDensityData, index?: number): string {
    index = index || this.getShapeIndex(data);
    if (index === 15) return 'full-square';
    const {tl, tr, br, bl} = MarchingSquaresLookup.floorDensityValues(data);
    return `${tl}-${tr}-${br}-${bl}`;
  }

  private getShapeIndex(data: ISquareDensityData): number {
    const {tl, tr, br, bl} = data;
    const threshold = this.config.densityThreshold;

    const val1 = tl >= threshold ? 8 : 0;
    const val2 = tr >= threshold ? 4 : 0;
    const val3 = br >= threshold ? 2 : 0;
    const val4 = bl >= threshold ? 1 : 0;
    return val1 + val2 + val3 + val4;
  }

  /** Inverse lerp */
  private ilerp = (eA: number, eB: number): number => {
    return ((this.config.densityThreshold - eA) / (eB - eA)) * this.config.squareSize;
  };

  private static floorDensityValues(data: ISquareDensityData): ISquareDensityData {
    data.tl = Math.floor(data.tl);
    data.tr = Math.floor(data.tr);
    data.br = Math.floor(data.br);
    data.bl = Math.floor(data.bl);
    return data;
  }
}
