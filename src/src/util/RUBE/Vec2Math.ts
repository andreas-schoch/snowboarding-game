import { b2 } from "../..";

export class vec2Util {

  static Clone(v: Box2D.b2Vec2): Box2D.b2Vec2 {
    return new b2.b2Vec2(v.x, v.y);
  }

  static Add(v1: Box2D.b2Vec2, v2: Box2D.b2Vec2): Box2D.b2Vec2 {
    v1.x += v2.x;
    v1.y += v2.y;
    return v1;
  }

  static Rotate(v: Box2D.b2Vec2, radians: number) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const x = v.x;
    v.x = c * x - s * v.y;
    v.y = s * x + c * v.y;
    return v;
  }

  static Scale(v: Box2D.b2Vec2, scalar: number) {
    v.x *= scalar;
    v.y *= scalar;
    return v;
  }
}
