import * as Ph from 'phaser';
import * as Pl from 'planck-js';
import SimplexNoise from 'simplex-noise';
import {ISquareDensityData, MarchingSquaresLookup} from '../marching-squares-lookup';


export interface ITerrainDestructibleConfig {
  squareSize: number;
  numSquaresX: number;
  numSquaresY: number;

  tileDensityMax: number;
  tileDensityThreshold: number;
}


export interface IRenderQueueItem {
  x: number;
  y: number;
  numSquaresX: number;
  numSquaresY: number;
  materialIndex: number;
}


const defaultConfig: ITerrainDestructibleConfig = {
  squareSize: 32,
  numSquaresX: 32,
  numSquaresY: 32,
  tileDensityMax: 128,
  tileDensityThreshold: 64,
};


export class TerrainDestructible {
  renderQueue: IRenderQueueItem[] = [];
  private scene: Ph.Scene;
  private config: ITerrainDestructibleConfig;

  private readonly terrain: number[][] = [];
  private readonly terrainGraphics: Ph.GameObjects.Graphics;
  private readonly marchingSquares: MarchingSquaresLookup;
  private readonly noise: SimplexNoise = new SimplexNoise(7777);

  private readonly terrainFixtures: Pl.Body;
  private readonly world: Pl.World;
  private readonly worldScale: number;

  constructor(scene: Ph.Scene, world: Pl.World, worldScale: number, config: ITerrainDestructibleConfig = defaultConfig) {
    this.scene = scene;
    this.config = config;

    this.world = world;
    this.worldScale = worldScale;

    this.marchingSquares = new MarchingSquaresLookup({
      squareSize: config.squareSize,
      densityThreshold: config.tileDensityThreshold,
      densityMax: config.tileDensityMax,
    });

    this.terrainGraphics = this.scene.add.graphics();

    this.terrain = [];
    this.generateVertices((x, y) => {
      const n1 = (this.noise.noise2D(x / 8, y / 8) * this.config.tileDensityMax) * 0.3;
      const n2 = (this.noise.noise2D(x / 16, y / 16) * this.config.tileDensityMax) * 0.5;
      const n3 = (this.noise.noise2D(x / 36, y / 36) * this.config.tileDensityMax) * 1.25;
      const n = (n1 + n2 + n3) / 3;
      const bias = ((y) / this.config.numSquaresY);
      return Math.max(Math.round(n + (this.config.tileDensityMax * bias)), 0);
    });
    this.renderQueue.push({x: 0, y: 0, numSquaresX: this.config.numSquaresX, numSquaresY: this.config.numSquaresY, materialIndex: 0});

    this.terrainFixtures = this.world.createBody();
  }

  update() {
    if (!this.renderQueue.length) return;
    const graphics = this.terrainGraphics;
    console.time('updateTerrain');
    graphics.clear();
    this.renderQueue.forEach((bounds) => {
      graphics.translateCanvas(0, 0);
      for (let y = bounds.y; y < (bounds.y + bounds.numSquaresY); y++) {
        for (let x = bounds.x; x < bounds.x + bounds.numSquaresX; x++) {
          if (!this.isWithinBounds(x, y)) continue;
          this.renderSquareAt(x, y, graphics);
        }
      }
    });

    this.renderQueue.length = 0;
    console.timeEnd('updateTerrain');
  }

  private renderSquareAt(x: number, y: number, graphics: Ph.GameObjects.Graphics, override?: ISquareDensityData): void {
    const densityData = override || this.getTileEdges(x, y);
    if (!densityData) return;
    const posX = x * this.config.squareSize;
    const posY = y * this.config.squareSize;
    const {polygons, isoLines, shapeIndex} = this.marchingSquares.getSquareGeomData(densityData);

    graphics.fillStyle(0xF5DEB3);
    graphics.translateCanvas(posX, posY);
    for (const points of polygons) {
      // graphics.generateTexture('terrainCache', this.config.squareSize, this.config.squareSize); // TODO can maybe improve performance together with next line
      // graphics.fillPath('terrainCache) // TODO this could work just like Path2D. Try it out. also try to bake textures from graphics obj and cache only those
      graphics.fillPoints(points.map(([x, y]) => ({x, y})), true);
    }

    graphics.lineStyle(5, 0x000000, 1);
    // isoLines.forEach(l => graphics.lineBetween(l.x1, l.y1, l.x2, l.y2));
    graphics.translateCanvas(-posX, -posY);

    const posXScaled = posX / this.worldScale;
    const posYScaled = posY / this.worldScale;
    isoLines
    .map(l => l.setTo(l.x1 / this.worldScale, l.y1 / this.worldScale, l.x2 / this.worldScale, l.y2 / this.worldScale))
    .map(l => l.setTo(l.x1 + posXScaled, l.y1 + posYScaled, l.x2 + posXScaled, l.y2 + posYScaled))
    .forEach(l => this.terrainFixtures.createFixture(Pl.Edge(Pl.Vec2(l.x1, l.y1), Pl.Vec2(l.x2, l.y2))), {
      friction: 0,
      density: 0,
    });
  }

  private getTileEdges(x, y): ISquareDensityData {
    // Note: Internally edge values are still stored as floats but get transformed into integers to rendering the map
    // We use integers mainly to limit the num of cached Path2D objects and to simplify serialization for networking
    // Stored as floats so when sculpting the terrain fractional changes still get applied when far from center
    return {
      tl: Math.floor(this.terrain[y][x]),
      tr: Math.floor(this.terrain[y][x + 1]),
      br: Math.floor(this.terrain[y + 1][x + 1]),
      bl: Math.floor(this.terrain[y + 1][x]),
      threshold: this.config.tileDensityThreshold,
      maxDensity: this.config.tileDensityMax,
    };
  }

  private isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.config.numSquaresX && y < this.config.numSquaresY;
  }

  private generateVertices(noiseFunction) {
    console.time('generateVertices');
    for (let y = 0; y <= this.config.numSquaresY; y++) {
      const row: number[] = [];
      for (let x = 0; x <= this.config.numSquaresX; x++) {
        const noise: number = noiseFunction.call(this, x, y);
        row.push(noise);
      }
      this.terrain.push(row);
    }
    console.timeEnd('generateVertices');

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////

}
