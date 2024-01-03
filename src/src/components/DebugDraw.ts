import { b2 } from "..";

const sizeOfB2Vec2 = Float32Array.BYTES_PER_ELEMENT * 2;

export default class DebugDrawer {
  instance: Box2D.JSDraw = new b2.JSDraw();

  constructor(private graphics: Phaser.GameObjects.Graphics, private pixelsPerMeter: number, private lineWidth: number = 2) {
    this.instance.AppendFlags(b2.b2Draw.e_shapeBit);
    this.instance.AppendFlags(b2.b2Draw.e_jointBit);
    // this.instance.AppendFlags(b2.b2Draw.e_aabbBit);
    // this.instance.AppendFlags(b2.b2Draw.e_centerOfMassBit);
    // this.instance.AppendFlags(b2.b2Draw.e_pairBit);

    this.instance.DrawSegment = (vert1_p: number, vert2_p: number, color_p: number) => {
      const vert1 = b2.wrapPointer(vert1_p, b2.b2Vec2);
      const vert2 = b2.wrapPointer(vert2_p, b2.b2Vec2);
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1);
      this.graphics.lineBetween(vert1.x * this.pixelsPerMeter, -vert1.y * this.pixelsPerMeter, vert2.x * this.pixelsPerMeter, -vert2.y * this.pixelsPerMeter);
    };

    this.instance.DrawPolygon = (vertices_p: number, vertexCount: number, color_p: number) => {
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const vertices: Box2D.b2Vec2[] = [];
      for (let i = 0; i < vertexCount; i++) vertices.push(b2.wrapPointer(vertices_p + i * sizeOfB2Vec2, b2.b2Vec2));
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1.0);
      this.graphics.strokePoints(vertices.map(v => new Phaser.Math.Vector2(v.x * this.pixelsPerMeter, -v.y * this.pixelsPerMeter)), true, true);
    };
    
    this.instance.DrawCircle = (center_p: number, radius: number, color_p: number) => {
      const center = b2.wrapPointer(center_p, b2.b2Vec2);
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1);
      this.graphics.strokeCircle(center.x * this.pixelsPerMeter, -center.y * this.pixelsPerMeter, radius * this.pixelsPerMeter);
    };
    
    this.instance.DrawPoint = (vertex_p: number, sizeMetres: number, color_p: number) => {
      const vertex = b2.wrapPointer(vertex_p, b2.b2Vec2);
      const color = b2.wrapPointer(color_p, b2.b2Color);
      const c = new Phaser.Display.Color().setGLTo(color.r, color.g, color.b, 1);
      this.graphics.lineStyle(this.lineWidth, c.color, 1);
      this.graphics.strokeCircle(vertex.x * this.pixelsPerMeter, -vertex.y * this.pixelsPerMeter, sizeMetres);
    };
    
    this.instance.DrawSolidPolygon = (vertices_p: number, vertexCount: number, color_p: number) => this.instance.DrawPolygon(vertices_p, vertexCount, color_p);
    this.instance.DrawSolidCircle = (center_p: number, radius: number, axis_p: number, color_p: number) => this.instance.DrawCircle(center_p, radius, color_p);
    this.instance.DrawTransform = (transform_p: number) => { };
  }


  clear() {
    setTimeout(() => this.graphics.clear(), 0);
  }
}
