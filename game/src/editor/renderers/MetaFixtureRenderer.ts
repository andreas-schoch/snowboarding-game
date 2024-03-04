// import {ppm} from '../..';
// import {XY} from '../../Terrain';
// import {throttle} from '../../helpers/debounce';
// import {rubeToXY} from '../../physics/RUBE/rubeTransformers';
// import {EditorFixture} from '../items/EditorFixture';

// type FixtureContext = {
//   fixture: EditorFixture;
//   outline: Phaser.GameObjects.Graphics;
// };

// TODO fix this
// export class MetaFixtureRenderer {
//   renderThrottled = throttle(this.render.bind(this), 100);
//   private contextMap: Map<EditorFixture['id'], FixtureContext> = new Map();

//   constructor(private scene: Phaser.Scene) { }

//   // TODO take offsetAngle into account
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   render(fixtures: EditorFixture[], offsetX = 0, offsetY = 0, offsetAngle = 0) {
//     for (const fixture of fixtures) {
//       const context = this.getContext(fixture);

//       const vertsPixelSpace = fixture.getVertices().map(vertex => ({x: (vertex.x + offsetX) * ppm, y: (vertex.y + offsetY) * ppm}));
//       this.drawOutline(context, vertsPixelSpace);
//     }
//   }

//   private drawOutline(context: FixtureContext, pointsWorld: XY[]): void {
//     const minX = Math.min(...pointsWorld.map(point => point.x));
//     const minY = Math.min(...pointsWorld.map(point => point.y));

//     context.outline.clear();

//     const parentPosition = context.fixture.parent?.getPosition() || {x: 0, y: 0};
//     const bodyPosition = rubeToXY(context.fixture.metaBody.position, parentPosition.x, -parentPosition.y);

//     const parentAngle = context.fixture.parent?.getAngle() || 0;
//     const bodyAngle = (-context.fixture.metaBody.angle || 0) + parentAngle;

//     // context.outline.setPosition(bodyPosition.x, bodyPosition.y);
//     // context.outline.setRotation(bodyAngle);

//     context.outline.fillStyle(0x00ff00, 1);
//     context.outline.setDepth(999999999999998);
//     context.outline.fillCircle(parentPosition.x * 40, parentPosition.y * 40, 5);

//     context.outline.fillStyle(0xff0000, 1);
//     context.outline.setDepth(999999999999999);
//     context.outline.fillCircle(bodyPosition.x * 40, bodyPosition.y * 40, 2);

//     // context.outline.setPosition(bodyPosition.x, bodyPosition.y);
//     // context.outline.setScale();
//     // context.outline.setRotation(context.fixture.getAngle());
//     const pointsLocal = new Phaser.Geom.Polygon(pointsWorld.map(point => ({x: point.x + bodyPosition.x, y: point.y + bodyPosition.y})));

//     const vertices = context.fixture.getPosition({local: true});
//     const pivot = bodyPosition;
//     const angleDiff = 0 - -bodyAngle; // TODO verify if this works when parent body is rotated

//     const newVertices = pointsLocal.points.map(v => {
//       const x = pivot.x + (v.x - pivot.x) * Math.cos(angleDiff) - (v.y - pivot.y) * Math.sin(angleDiff);
//       const y = pivot.y + (v.x - pivot.x) * Math.sin(angleDiff) + (v.y - pivot.y) * Math.cos(angleDiff);
//       return {x, y};
//     });

//     context.outline.lineStyle(1, 0x00ff00, 1);
//     context.outline.strokePoints(newVertices, false);
//   }

//   getContext(fixture: EditorFixture): FixtureContext {
//     let context = this.contextMap.get(fixture.id);
//     if (!context) {
//       const outline = this.scene.add.graphics().setDepth(10000000000);
//       context = {outline, fixture};
//       this.contextMap.set(fixture.id, context);
//     }
//     return context;
//   }
// }
