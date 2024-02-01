
////////////////////////////
// ENTITY AND ENTITY DATA //
////////////////////////////
export interface BaseEntityData {
  type: 'body' | 'fixture' | 'joint' | 'image';
  sceneId: LoadedScene['id'];
  id: string;
  name: string;
  customProps: Record<string, unknown>;
}

export interface BodyEntityData extends BaseEntityData {
  type: 'body';
  body: Box2D.b2Body;
  image: ImageEntityData | null;
  fixtures: FixtureEntityData[];
}

export interface FixtureEntityData extends BaseEntityData {
  type: 'fixture';
  fixture: Box2D.b2Fixture;
}

export interface JointEntityData extends BaseEntityData {
  type: 'joint';
  joint: Box2D.b2Joint;
}

export interface ImageEntityData extends BaseEntityData {
  type: 'image';
  image: unknown;
}

export type Entity = Box2D.b2Body | Box2D.b2Fixture | Box2D.b2Joint | unknown; // unknown represents the image
export type EntityData = BodyEntityData | FixtureEntityData | JointEntityData | ImageEntityData;

// export interface LoadedScene {
//   id: string;
//   bodies: (Box2D.b2Body | null)[];
//   joints: (Box2D.b2Joint | null)[];
//   images: (unknown | null)[];
// }

export interface LoadedScene {
  id: string;
  bodies: BodyEntityData[];
  joints: JointEntityData[];
  images: ImageEntityData[];
}
