import {b2, recordLeak} from '..';

// since box2d-wasm is using emscripten, it isn't immediately obvious how to iterate over a list of objects
// There are many methods which return a single object when you would normally expect an array of objects (see world.GetBodyList() for example
// (b2.reifyArray() or manual iteration using e.g. getPointer(first + byteOffset) could be used instead if the below helpers turn out to be problematic)

export function* iterBodies(world: Box2D.b2World) {
  for (let body = recordLeak(world.GetBodyList()); b2.getPointer(body) !== b2.getPointer(b2.NULL); body = recordLeak(body.GetNext())) {
    yield body;
  }
}

export function* iterFixtures(world: Box2D.b2World) {
  for (const body of iterBodies(world)) {
    for (const fixture of iterBodyFixtures(body)) {
      yield fixture;
    }
  }
}

export function* iterJoints(world: Box2D.b2World) {
  for (let joint = recordLeak(world.GetJointList()); b2.getPointer(joint) !== b2.getPointer(b2.NULL); joint = recordLeak(joint.GetNext())) {
    yield joint;
  }
}

export function* iterBodyFixtures(body: Box2D.b2Body) {
  for (let fixture = recordLeak(body.GetFixtureList()); b2.getPointer(fixture) !== b2.getPointer(b2.NULL); fixture = recordLeak(fixture.GetNext())) {
    yield fixture;
  }
}

export function* iterBodyJoints(body: Box2D.b2Body) {
  for (let joint = recordLeak(body.GetJointList()); b2.getPointer(joint) !== b2.getPointer(b2.NULL); joint = recordLeak(joint.next)) {
    yield joint.joint;
  }
}
