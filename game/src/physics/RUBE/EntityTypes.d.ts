import {CustomPropertyDefNames, CustomPropertyValue} from './RubeFile';

export interface WorldEntityData {
  type: 'world';
  world: Box2D.b2World;
  observer: Phaser.Events.EventEmitter; // TODO get rid of phaser dependency
  debugDrawer: DebugDrawer;
  debugDrawEnabled: boolean;
  isPaused: boolean;
  gravityX: number;
  gravityY: number;
  entityData: Map<Entity, EntityData>;
}

export type WorldEntityConfig = Pick<WorldEntityData, 'gravityX' | 'gravityY' | 'debugDrawEnabled'>;

////////////////////////////
// ENTITY AND ENTITY DATA //
////////////////////////////
export interface BaseEntityData {
  type: 'body' | 'fixture' | 'joint' | 'image';
  sceneId: LoadedScene['id'];
  id: string;
  name: string;
  customProps: RubeCustomPropsMap;
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

export interface LoadedScene {
  id: string;

  // All things loaded with this particular scene
  bodies: BodyEntityData[];
  joints: JointEntityData[];
  images: ImageEntityData[];

  // All the above but mapped by the entity reference
  entityData: Map<Entity, EntityData>;

  // These are technically world custom properties but we (mis)use them to store metadate specific to the loaded scene NOT the world
  // This is due to the fact that we load multiple scenes into the same world.
  customProps: RubeCustomPropsMap
  worldEntity: WorldEntityData;
}

export type RubeCustomPropsMap = Record<CustomPropertyDefNames, CustomPropertyValue>;
