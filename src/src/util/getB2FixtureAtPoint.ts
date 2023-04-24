import * as Pl from '@box2d/core';
import {RubeEntity} from "./RUBE/RubeLoaderInterfaces";

export const getB2FixtureAtPoint = (world: Pl.b2World, point: Pl.XY, types: Set<Pl.b2BodyType> = new Set([Pl.b2BodyType.b2_dynamicBody])): Pl.b2Fixture & RubeEntity | null => {
  // Query the world for overlapping shapes.
  let hitFixture: Pl.b2Fixture | null = null;
  world.QueryPointAABB(point, fixture => {
    const body = fixture.GetBody();
    if (!types.has(body.GetType()) || !fixture.TestPoint(point)) return true; // continue query
    hitFixture = fixture;
    return false; // We are done, terminate the query.
  });

  return hitFixture;
}
