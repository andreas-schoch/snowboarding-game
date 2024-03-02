import {b2, ppm} from '..';

const sizeOfB2Vec2 = Float32Array.BYTES_PER_ELEMENT * 2;

export class DebugDrawer {
  instance: Box2D.JSDraw = new b2.JSDraw();
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, private lineWidth: number = 2) {
    this.graphics = scene.add.graphics().setDepth(1000);
    this.instance.AppendFlags(b2.b2Draw.e_shapeBit);
    // this.instance.AppendFlags(b2.b2Draw.e_jointBit);
    // this.instance.AppendFlags(b2.b2Draw.e_aabbBit);
    // this.instance.AppendFlags(b2.b2Draw.e_centerOfMassBit);
    // this.instance.AppendFlags(b2.b2Draw.e_pairBit);

    this.instance.DrawSegment = (vert1_p: number, vert2_p: number, color_p: number) => {
      const vert1 = b2.wrapPointer(vert1_p, b2.b2Vec2);
      const vert2 = b2.wrapPointer(vert2_p, b2.b2Vec2);
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1);
      this.graphics.lineBetween(vert1.x * ppm, -vert1.y * ppm, vert2.x * ppm, -vert2.y * ppm);
    };

    this.instance.DrawPolygon = (vertices_p: number, vertexCount: number, color_p: number) => {
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const vertices: Box2D.b2Vec2[] = [];
      for (let i = 0; i < vertexCount; i++) vertices.push(b2.wrapPointer(vertices_p + i * sizeOfB2Vec2, b2.b2Vec2));
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1.0);
      this.graphics.strokePoints(vertices.map(v => new Phaser.Math.Vector2(v.x * ppm, -v.y * ppm)), true, true);
    };

    this.instance.DrawCircle = (center_p: number, radius: number, color_p: number) => {
      const center = b2.wrapPointer(center_p, b2.b2Vec2);
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1);
      this.graphics.strokeCircle(center.x * ppm, -center.y * ppm, radius * ppm);
    };

    this.instance.DrawPoint = (vertex_p: number, sizeMetres: number, color_p: number) => {
      const vertex = b2.wrapPointer(vertex_p, b2.b2Vec2);
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1);
      this.graphics.strokeCircle(vertex.x * ppm, -vertex.y * ppm, sizeMetres);
    };

    this.instance.DrawSolidPolygon = (vertices_p: number, vertexCount: number, color_p: number) => this.instance.DrawPolygon(vertices_p, vertexCount, color_p);
    this.instance.DrawSolidCircle = (center_p: number, radius: number, axis_p: number, color_p: number) => this.instance.DrawCircle(center_p, radius, color_p);
    this.instance.DrawTransform = () => { };
  }

  clear() {
    setTimeout(() => this.graphics.clear(), 0);
  }

  private setGraphics(scene: Phaser.Scene) {
    if (this.graphics.scene !== scene) {
      this.graphics.destroy;
      this.graphics = scene.add.graphics();
    }
  }
}
