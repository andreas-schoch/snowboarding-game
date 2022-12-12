/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/gamestats.js/build lazy recursive ^\\.\\/gamestats\\-.*\\.module\\.js$":
/*!************************************************************************************************!*\
  !*** ./node_modules/gamestats.js/build/ lazy ^\.\/gamestats\-.*\.module\.js$ namespace object ***!
  \************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./gamestats-pixi.module.js": [
		"./node_modules/gamestats.js/build/gamestats-pixi.module.js",
		"vendors"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1]).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./node_modules/gamestats.js/build lazy recursive ^\\.\\/gamestats\\-.*\\.module\\.js$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src/src/components/Backdrop.ts":
/*!****************************************!*\
  !*** ./src/src/components/Backdrop.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Backdrop": () => (/* binding */ Backdrop)
/* harmony export */ });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");

class Backdrop {
    constructor(scene) {
        this.scene = scene;
        this.bgSpaceBack = this.registerLayer('bg_space_back.png');
        this.bgSpaceMid = this.registerLayer('bg_space_mid.png');
        this.bgSpaceFront = this.registerLayer('bg_space_front.png');
    }
    update() {
        _index__WEBPACK_IMPORTED_MODULE_0__.stats.begin('backdrop');
        const { scrollX, scrollY } = this.scene.cameras.main;
        this.bgSpaceBack.setTilePosition(scrollX * 0.005, scrollY * 0.005);
        this.bgSpaceMid.setTilePosition(scrollX * 0.01, scrollY * 0.01);
        this.bgSpaceFront.setTilePosition(scrollX * 0.025, scrollY * 0.025);
        _index__WEBPACK_IMPORTED_MODULE_0__.stats.end('backdrop');
    }
    registerLayer(key, scaleX = 1, scaleY = 1) {
        const { width, height, zoomX, zoomY, worldView } = this.scene.cameras.main;
        return this.scene.add.tileSprite(worldView.x + width / 2, worldView.y + height / 2, width, height, 'bg_space_pack', key)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0, 0)
            .setScale(scaleX * (1 / zoomX), scaleY * (1 / zoomY))
            .setDepth(-200);
    }
}


/***/ }),

/***/ "./src/src/components/Physics.ts":
/*!***************************************!*\
  !*** ./src/src/components/Physics.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Physics": () => (/* binding */ Physics)
/* harmony export */ });
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @box2d/core */ "./node_modules/@box2d/core/dist/index.js");
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_box2d_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");
/* harmony import */ var _util_RUBE_RubeLoader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/RUBE/RubeLoader */ "./src/src/util/RUBE/RubeLoader.ts");



class Physics extends Phaser.Events.EventEmitter {
    constructor(scene, worldScale, gravity) {
        super();
        this.isPaused = false;
        this.stepDeltaTime = 1 / 60;
        this.stepConfig = { positionIterations: 12, velocityIterations: 12 };
        this.debugDraw = scene.add.graphics();
        this.scene = scene;
        this.worldScale = worldScale;
        this.world = _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2World.Create(gravity);
        this.world.SetAutoClearForces(true);
        this.world.SetContactListener({
            BeginContact: contact => this.emit('begin_contact', contact),
            EndContact: () => null,
            PreSolve: () => null,
            PostSolve: (contact, impulse) => this.emit('post_solve', contact, impulse),
        });
        const sceneJso = this.scene.cache.json.get('santa');
        this.rubeLoader = new _util_RUBE_RubeLoader__WEBPACK_IMPORTED_MODULE_2__.RubeLoader(this.world, this.scene.add.graphics(), this.scene, this.worldScale);
        if (this.rubeLoader.loadScene(sceneJso))
            console.log('RUBE scene loaded successfully.');
        else
            throw new Error('Failed to load RUBE scene');
        this.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
    }
    update() {
        if (this.isPaused)
            return;
        _index__WEBPACK_IMPORTED_MODULE_1__.stats.begin('physics');
        // const iterations = Math.floor(Math.max(this.scene.game.loop.actualFps / 3, 9));
        this.world.Step(this.stepDeltaTime, this.stepConfig);
        // this.world.ClearForces(); // recommended after each time step if flag not set which does it automatically
        // iterate through all bodies
        const worldScale = this.worldScale;
        for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
            if (!body)
                continue;
            let bodyRepresentation = body.GetUserData();
            if (!bodyRepresentation)
                continue;
            if (bodyRepresentation) {
                if (body.IsEnabled()) {
                    // if (true) {
                    let { x, y } = body.GetPosition();
                    !bodyRepresentation.visible && bodyRepresentation.setVisible(true);
                    bodyRepresentation.x = x * worldScale;
                    bodyRepresentation.y = y * -worldScale;
                    // @ts-ignore
                    bodyRepresentation.rotation = -body.GetAngle() + (bodyRepresentation.custom_origin_angle || 0); // in radians;
                }
                else {
                    bodyRepresentation.setVisible(false);
                }
            }
            else {
                // @ts-ignore
                // console.log('no image', body.GetPosition(), body.name);
            }
        }
        _index__WEBPACK_IMPORTED_MODULE_1__.stats.end('physics');
    }
}


/***/ }),

/***/ "./src/src/components/PlayerController.ts":
/*!************************************************!*\
  !*** ./src/src/components/PlayerController.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PlayerController": () => (/* binding */ PlayerController)
/* harmony export */ });
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @box2d/core */ "./node_modules/@box2d/core/dist/index.js");
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_box2d_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");
/* harmony import */ var _Snowboard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Snowboard */ "./src/src/components/Snowboard.ts");
/* harmony import */ var _State__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./State */ "./src/src/components/State.ts");
/* harmony import */ var _util_DebugMouseJoint__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/DebugMouseJoint */ "./src/src/util/DebugMouseJoint.ts");
/* harmony import */ var _scenes_GameUIScene__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../scenes/GameUIScene */ "./src/src/scenes/GameUIScene.ts");






class PlayerController {
    constructor(scene, b2Physics) {
        this.jumpForce = 650 * 60;
        this.leanForce = 2.5 * 60;
        this.jumpVector = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, 0);
        this.scene = scene;
        this.b2Physics = b2Physics;
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.scene.observer.on('pause_game_icon_pressed', () => this.pauseGame());
        this.scene.observer.on('how_to_play_icon_pressed', () => this.pauseGame(_scenes_GameUIScene__WEBPACK_IMPORTED_MODULE_5__.PanelIds.PANEL_HOW_TO_PLAY));
        this.scene.input.keyboard.on('keydown-ESC', () => this.pauseGame());
        this.cursors.space.on('down', () => this.pauseGame());
        this.scene.observer.on('resume_game', () => this.b2Physics.isPaused = false);
        this.cursors.up.on('down', () => {
            // TODO simplify
            if (!this.state.isCrashed && !this.state.levelFinished && this.state.getState() === 'grounded' && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && !this.b2Physics.isPaused) {
                this.scene.observer.emit('jump_start');
            }
        });
        this.initBodyParts();
        this.board = new _Snowboard__WEBPACK_IMPORTED_MODULE_2__.WickedSnowboard(this);
        this.state = new _State__WEBPACK_IMPORTED_MODULE_3__.State(this);
        if (_index__WEBPACK_IMPORTED_MODULE_1__.DEBUG) {
            new _util_DebugMouseJoint__WEBPACK_IMPORTED_MODULE_4__.DebugMouseJoint(scene, b2Physics);
            this.scene.cameras.main.useBounds = false;
            this.debugControls = new Phaser.Cameras.Controls.SmoothedKeyControl({
                camera: this.scene.cameras.main,
                left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                right: this.cursors.right,
                up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                zoomIn: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
                zoomOut: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
                acceleration: 0.05,
                drag: 0.0015,
                maxSpeed: 1.0,
                zoomSpeed: 0.005,
                maxZoom: 0.75,
                minZoom: 0.1,
            });
        }
    }
    pauseGame(activePanel = _scenes_GameUIScene__WEBPACK_IMPORTED_MODULE_5__.PanelIds.PANEL_PAUSE_MENU) {
        if (this.state.isCrashed || this.state.levelFinished)
            return; // can only pause during an active run. After crash or finish, the "Your score" panel is shown.
        this.b2Physics.isPaused = !this.b2Physics.isPaused;
        this.scene.observer.emit('toggle_pause', this.b2Physics.isPaused, activePanel);
    }
    update(delta) {
        var _a;
        if (this.b2Physics.isPaused)
            return;
        _index__WEBPACK_IMPORTED_MODULE_1__.stats.begin('snowman');
        this.debugControls && this.debugControls.update(delta);
        this.state.update(delta);
        this.state.isCrashed && this.detachBoard(); // joints cannot be destroyed within post-solve callback
        this.board.getTimeInAir() > 100 && this.resetLegs();
        if (!this.state.isCrashed && !this.state.levelFinished) {
            this.board.update(delta);
            // Touch/Mouse input
            if (((_a = this.scene.input.activePointer) === null || _a === void 0 ? void 0 : _a.isDown) && this.scene.input.activePointer.wasTouch) {
                const pointer = this.scene.input.activePointer; // activePointer undefined until after first touch input
                pointer.motionFactor = 0.2;
                this.scene.input.activePointer.x < this.scene.cameras.main.width / 2 ? this.leanBackward(delta) : this.leanForward(delta);
                pointer.velocity.y < -30 && this.scene.game.getTime() - pointer.moveTime <= 250 && this.jump(delta);
            }
            else {
                this.scene.input.activePointer.motionFactor = 0.8;
            }
            // Keyboard input
            this.cursors.up.isDown && this.leanUp(delta);
            this.cursors.left.isDown && this.leanBackward(delta);
            this.cursors.right.isDown && this.leanForward(delta);
            this.cursors.down.isDown && this.leanCenter(delta);
            this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && this.jump(delta);
        }
        _index__WEBPACK_IMPORTED_MODULE_1__.stats.end('snowman');
    }
    detachBoard() {
        this.parts.bindingLeft && this.b2Physics.world.DestroyJoint(this.parts.bindingLeft);
        this.parts.bindingRight && this.b2Physics.world.DestroyJoint(this.parts.bindingRight);
        this.parts.distanceLegLeft && this.b2Physics.world.DestroyJoint(this.parts.distanceLegLeft);
        this.parts.distanceLegRight && this.b2Physics.world.DestroyJoint(this.parts.distanceLegRight);
        this.parts.weldCenter && this.b2Physics.world.DestroyJoint(this.parts.weldCenter);
        this.parts.prismatic && this.b2Physics.world.DestroyJoint(this.parts.prismatic);
    }
    jump(delta) {
        // prevents player from jumping too quickly after a landing
        if (this.scene.game.getTime() - this.state.timeGrounded < 100)
            return; // TODO change to numStepsGrounded
        this.leanUp(delta);
        const { isTailGrounded, isCenterGrounded, isNoseGrounded } = this.board;
        if (isCenterGrounded || isTailGrounded || isNoseGrounded) {
            const force = this.jumpForce * delta;
            const jumpVector = this.jumpVector.Set(0, 0);
            isCenterGrounded
                ? this.parts.body.GetWorldVector({ x: 0, y: force * 0.3 }, jumpVector).Add({ x: 0, y: force * 1.25 })
                : this.parts.body.GetWorldVector({ x: 0, y: force * 0.5 }, jumpVector).Add({ x: 0, y: force * 0.85 });
            this.parts.body.ApplyForceToCenter(jumpVector, true);
        }
    }
    resetLegs() {
        var _a, _b;
        (_a = this.parts.distanceLegLeft) === null || _a === void 0 ? void 0 : _a.SetLength(0.65);
        (_b = this.parts.distanceLegRight) === null || _b === void 0 ? void 0 : _b.SetLength(0.65);
    }
    leanBackward(delta) {
        var _a, _b;
        (_a = this.parts.distanceLegLeft) === null || _a === void 0 ? void 0 : _a.SetLength(0.55);
        (_b = this.parts.distanceLegRight) === null || _b === void 0 ? void 0 : _b.SetLength(0.8);
        // @ts-ignore
        this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * -10;
        this.parts.body.ApplyAngularImpulse(this.leanForce * delta);
    }
    leanForward(delta) {
        var _a, _b;
        (_a = this.parts.distanceLegLeft) === null || _a === void 0 ? void 0 : _a.SetLength(0.8);
        (_b = this.parts.distanceLegRight) === null || _b === void 0 ? void 0 : _b.SetLength(0.55);
        // @ts-ignore
        this.parts.weldCenter.m_referenceAngle = Math.PI / 180 * 10;
        this.parts.body.ApplyAngularImpulse(-this.leanForce * delta);
    }
    leanCenter(delta) {
        var _a, _b;
        (_a = this.parts.distanceLegLeft) === null || _a === void 0 ? void 0 : _a.SetLength(0.55);
        (_b = this.parts.distanceLegRight) === null || _b === void 0 ? void 0 : _b.SetLength(0.55);
        // @ts-ignore
        this.parts.weldCenter.m_referenceAngle = 0;
    }
    leanUp(delta) {
        var _a, _b;
        (_a = this.parts.distanceLegLeft) === null || _a === void 0 ? void 0 : _a.SetLength(0.8);
        (_b = this.parts.distanceLegRight) === null || _b === void 0 ? void 0 : _b.SetLength(0.8);
        // @ts-ignore
        this.parts.weldCenter.m_referenceAngle = 0;
    }
    initBodyParts() {
        this.parts = {
            head: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'head')[0],
            body: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'body')[0],
            boardSegments: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'boardSegment'),
            bindingLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingLeft')[0],
            bindingRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingRight')[0],
            distanceLegLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegLeft')[0],
            distanceLegRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegRight')[0],
            weldCenter: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'weldCenter')[0],
            prismatic: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'prismatic')[0],
        };
    }
}


/***/ }),

/***/ "./src/src/components/Snowboard.ts":
/*!*****************************************!*\
  !*** ./src/src/components/Snowboard.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WickedSnowboard": () => (/* binding */ WickedSnowboard)
/* harmony export */ });
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @box2d/core */ "./node_modules/@box2d/core/dist/index.js");
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_box2d_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");


class WickedSnowboard {
    constructor(player) {
        this.segments = [];
        this.pointStart = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, 0);
        this.pointEnd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, 0);
        this.player = player;
        this.scene = player.scene;
        this.b2Physics = player.b2Physics;
        this.debugGraphics = this.scene.add.graphics();
        this.initRays(this.b2Physics.worldScale / 4);
    }
    update(delta) {
        _index__WEBPACK_IMPORTED_MODULE_1__.DEBUG && this.debugGraphics.clear();
        const segments = this.segments;
        for (const segment of this.segments) {
            this.resetSegment(segment);
            segment.body.GetWorldPoint(_box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2.ZERO, this.pointStart);
            segment.body.GetWorldPoint(segment.groundRayDirection, this.pointEnd);
            this.b2Physics.world.RayCast(this.pointStart, this.pointEnd, segment.groundRayCallback);
            _index__WEBPACK_IMPORTED_MODULE_1__.DEBUG && this.drawDebug(segment.groundRayResult.hit ? 0x0000ff : 0x00ff00);
            if (segment.crashRayResult && segment.crashRayCallback && segment.crashRayDirection) {
                segment.body.GetWorldPoint(_box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2.ZERO, this.pointStart);
                segment.body.GetWorldPoint(segment.crashRayDirection, this.pointEnd);
                this.b2Physics.world.RayCast(this.pointStart, this.pointEnd, segment.crashRayCallback);
                _index__WEBPACK_IMPORTED_MODULE_1__.DEBUG && this.drawDebug(segment.crashRayResult.hit ? 0x0000ff : 0x00ff00);
            }
        }
        this.isTailGrounded = segments[0].groundRayResult.hit;
        this.isNoseGrounded = segments[segments.length - 1].groundRayResult.hit;
        this.isCenterGrounded = segments[3].groundRayResult.hit;
    }
    getTimeInAir() {
        if (this.segments.some(s => s.groundRayResult.hit))
            return -1;
        const mostRecentHit = Math.max(...this.segments.map(s => s.groundRayResult.lastHitTime));
        return this.scene.game.getTime() - mostRecentHit;
    }
    isInAir() {
        return this.getTimeInAir() !== -1;
    }
    rayCallbackFactory(hitResult) {
        return (fixture, point, normal, fraction) => {
            // coins and other sensors can mess with raycast leading to wrong trick score and rotation computation
            if (fixture.IsSensor())
                return;
            hitResult.hit = true;
            hitResult.point = point;
            hitResult.normal = normal;
            hitResult.fraction = fraction;
            hitResult.lastHitTime = this.scene.game.getTime();
            return fraction;
        };
    }
    resetSegment(segment) {
        segment.groundRayResult.hit = false;
        segment.groundRayResult.point = null;
        segment.groundRayResult.normal = null;
        segment.groundRayResult.fraction = -1;
        if (segment.crashRayResult) {
            segment.crashRayResult.hit = false;
            segment.crashRayResult.point = null;
            segment.crashRayResult.normal = null;
            segment.crashRayResult.fraction = -1;
        }
    }
    drawDebug(color) {
        this.debugGraphics.lineStyle(2, color, 1);
        const scale = this.b2Physics.worldScale;
        this.debugGraphics.lineBetween(this.pointStart.x * scale, -this.pointStart.y * scale, this.pointEnd.x * scale, -this.pointEnd.y * scale);
    }
    initRays(rayLength) {
        const temp = { hit: false, point: null, normal: null, fraction: -1, lastHitTime: -1 };
        for (const segment of this.player.parts.boardSegments) {
            const segmentIndex = this.b2Physics.rubeLoader.getCustomProperty(segment, 'int', 'phaserBoardSegmentIndex', -1);
            const isNose = segmentIndex === this.player.parts.boardSegments.length - 1;
            const groundHitResult = Object.assign({}, temp);
            const crashHitResult = Object.assign({}, temp);
            this.segments.push({
                body: segment,
                groundRayDirection: new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, -rayLength / this.b2Physics.worldScale),
                groundRayResult: groundHitResult,
                groundRayCallback: this.rayCallbackFactory(groundHitResult),
                crashRayDirection: isNose ? new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2((isNose ? rayLength * 2 : rayLength) / this.b2Physics.worldScale, 0) : undefined,
                crashRayResult: isNose ? crashHitResult : undefined,
                crashRayCallback: isNose ? this.rayCallbackFactory(crashHitResult) : undefined,
            });
            if (isNose)
                this.nose = this.segments[this.segments.length - 1];
        }
    }
}


/***/ }),

/***/ "./src/src/components/State.ts":
/*!*************************************!*\
  !*** ./src/src/components/State.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "State": () => (/* binding */ State)
/* harmony export */ });
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! phaser */ "./node_modules/phaser/dist/phaser.js");
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(phaser__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");


class State {
    constructor(playerController) {
        this.levelFinished = false;
        this.isCrashed = false;
        this.timeGrounded = 0;
        this.pickupsToProcess = new Set();
        this.seenSensors = new Set();
        this.comboAccumulatedScore = 0;
        this.comboMultiplier = 0;
        this.totalTrickScore = 0;
        this.totalCollectedPresents = 0;
        this.anglePreviousUpdate = 0;
        this.totalRotation = 0; // total rotation while in air without touching the ground
        this.currentFlipRotation = 0; // set to 0 after each flip
        this.pendingFrontFlips = 0;
        this.pendingBackFlips = 0;
        this.landedFrontFlips = 0;
        this.landedBackFlips = 0;
        this.lastDistance = 0;
        this.bestCombo = { accumulator: 0, multiplier: 0 };
        this.parts = playerController.parts;
        this.playerController = playerController;
        this.b2Physics = playerController.b2Physics;
        this.state = playerController.board.isInAir() ? 'in_air' : 'grounded';
        this.registerCollisionListeners();
        this.playerController.scene.observer.on('enter_in_air', () => this.state = 'in_air');
        this.playerController.scene.observer.on('enter_grounded', () => {
            this.state = 'grounded';
            this.timeGrounded = this.playerController.scene.game.getTime();
            this.landedFrontFlips += this.pendingFrontFlips;
            this.landedBackFlips += this.pendingBackFlips;
            const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
            if (numFlips >= 1) {
                const trickScore = numFlips * numFlips * _index__WEBPACK_IMPORTED_MODULE_1__.BASE_FLIP_POINTS;
                this.totalTrickScore += trickScore;
                this.comboAccumulatedScore += trickScore * _index__WEBPACK_IMPORTED_MODULE_1__.TRICK_POINTS_COMBO_FRACTION;
                this.comboMultiplier++;
                this.playerController.scene.observer.emit('combo_change', this.comboAccumulatedScore, this.comboMultiplier);
                this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
                this.comboLeewayTween.resetTweenData(true);
                this.comboLeewayTween.play();
            }
            this.totalRotation = 0;
            this.currentFlipRotation = 0;
            this.pendingBackFlips = 0;
            this.pendingFrontFlips = 0;
        });
        this.comboLeewayTween = this.playerController.scene.tweens.addCounter({
            paused: true,
            from: Math.PI * -0.5,
            to: Math.PI * 1.5,
            duration: 4000,
            onUpdate: (tween) => this.playerController.scene.observer.emit('combo_leeway_update', tween.getValue()),
            onComplete: tween => this.handleComboComplete(),
        });
    }
    reset() {
        this.totalTrickScore = 0;
        this.comboLeewayTween.stop();
        // this.comboLeewayTween = undefined;
        this.totalCollectedPresents = 0;
        this.comboMultiplier = 0;
        this.comboAccumulatedScore = 0;
        this.levelFinished = false;
        this.isCrashed = false;
        this.bestCombo = { accumulator: 0, multiplier: 0 };
        this.seenSensors.clear();
        this.pickupsToProcess.clear();
        this.pendingFrontFlips = 0;
        this.pendingBackFlips = 0;
        this.landedBackFlips = 0;
        this.landedFrontFlips = 0;
        this.currentFlipRotation = 0;
        this.anglePreviousUpdate = 0;
        this.lastDistance = 0;
        this.timeGrounded = 0;
        this.totalRotation = 0;
    }
    getCurrentScore() {
        return {
            distance: this.getTravelDistanceMeters(),
            coins: this.totalCollectedPresents,
            trickScore: this.totalTrickScore,
            bestCombo: this.bestCombo,
            finishedLevel: this.levelFinished,
            crashed: this.isCrashed,
        };
    }
    getState() {
        return this.state;
    }
    getTravelDistanceMeters() {
        const distance = this.parts.body.GetPosition().Length();
        return Math.floor(distance / 5) * 5;
    }
    registerCollisionListeners() {
        this.playerController.b2Physics.on('post_solve', (contact, impulse) => {
            if (this.isCrashed)
                return;
            const bodyA = contact.GetFixtureA().GetBody();
            const bodyB = contact.GetFixtureB().GetBody();
            if (bodyA === bodyB)
                return;
            if ((bodyA === this.parts.head || bodyB === this.parts.head) && Math.max(...impulse.normalImpulses) > _index__WEBPACK_IMPORTED_MODULE_1__.HEAD_MAX_IMPULSE) {
                !this.isCrashed && this.playerController.scene.observer.emit('enter_crashed', this.getCurrentScore());
                this.isCrashed = true;
                if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
                    this.comboLeewayTween.stop();
                    this.comboLeewayTween.resetTweenData(true);
                }
            }
        });
        this.playerController.b2Physics.on('begin_contact', (contact) => {
            var _a, _b;
            const fixtureA = contact.GetFixtureA();
            const fixtureB = contact.GetFixtureB();
            const bodyA = fixtureA.GetBody();
            const bodyB = fixtureB.GetBody();
            if (fixtureA.IsSensor() && !this.seenSensors.has(bodyA) && ((_a = fixtureA.customPropertiesMap) === null || _a === void 0 ? void 0 : _a.phaserSensorType))
                this.handleSensor(bodyA, fixtureA);
            else if (fixtureB.IsSensor() && !this.seenSensors.has(bodyB) && ((_b = fixtureB.customPropertiesMap) === null || _b === void 0 ? void 0 : _b.phaserSensorType))
                this.handleSensor(bodyB, fixtureB);
        });
    }
    handleSensor(body, fixture) {
        var _a;
        this.seenSensors.add(body);
        switch ((_a = fixture.customPropertiesMap) === null || _a === void 0 ? void 0 : _a.phaserSensorType) {
            case 'pickup_present': {
                this.pickupsToProcess.add(body);
                break;
            }
            case 'level_finish': {
                this.playerController.scene.cameras.main.stopFollow();
                console.log('congratulations you reached the end of the level');
                this.handleComboComplete();
                this.levelFinished = true;
                this.comboLeewayTween.stop();
                this.comboLeewayTween.resetTweenData(true);
                const currentScore = this.getCurrentScore();
                this.playerController.scene.observer.emit('score_change', currentScore);
                this.playerController.scene.observer.emit('level_finish', currentScore);
                break;
            }
            case 'level_deathzone': {
                break;
            }
        }
    }
    update(delta) {
        this.processPickups();
        const isInAir = this.playerController.board.isInAir();
        if (this.state === 'grounded' && isInAir && !this.isCrashed)
            this.playerController.scene.observer.emit('enter_in_air');
        else if (this.state === 'in_air' && !isInAir && !this.isCrashed)
            this.playerController.scene.observer.emit('enter_grounded');
        this.updateTrickCounter();
        this.updateComboLeeway();
        this.updateDistance();
    }
    processPickups() {
        for (const body of this.pickupsToProcess) {
            const img = body.GetUserData();
            this.b2Physics.world.DestroyBody(body);
            img.destroy();
            this.totalCollectedPresents++;
            this.playerController.scene.observer.emit('pickup_present', this.totalCollectedPresents);
            this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
        }
        this.pickupsToProcess.clear();
    }
    updateTrickCounter() {
        if (this.state === 'in_air') {
            const currentAngle = phaser__WEBPACK_IMPORTED_MODULE_0__.Math.Angle.Normalize(this.parts.body.GetAngle());
            const diff = this.calculateDifferenceBetweenAngles(this.anglePreviousUpdate, currentAngle);
            this.totalRotation += diff;
            this.currentFlipRotation += diff;
            this.anglePreviousUpdate = currentAngle;
            if (this.currentFlipRotation >= Math.PI * (this.pendingBackFlips === 0 ? 1.25 : 2)) {
                this.pendingBackFlips++;
                this.currentFlipRotation = 0;
            }
            else if (this.currentFlipRotation <= Math.PI * -(this.pendingFrontFlips === 0 ? 1.25 : 2)) {
                this.pendingFrontFlips++;
                this.currentFlipRotation = 0;
            }
        }
    }
    updateComboLeeway() {
        if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
            // checking for centerGrounded allows player to prolong leeway before combo completes while riding only on nose or tail
            if (this.state === 'in_air' || !this.playerController.board.isCenterGrounded) {
                this.comboLeewayTween.pause();
            }
            else {
                this.comboLeewayTween.resume();
            }
        }
    }
    // based on: https://www.construct.net/en/forum/construct-2/how-do-i-18/count-rotations-46674
    // http://blog.lexique-du-net.com/index.php?post/Calculate-the-real-difference-between-two-angles-keeping-the-sign
    calculateDifferenceBetweenAngles(firstAngle, secondAngle) {
        let difference = secondAngle - firstAngle;
        if (difference < -Math.PI)
            difference += Math.PI * 2;
        else if (difference > Math.PI)
            difference -= Math.PI * 2;
        return difference;
    }
    updateDistance() {
        const distance = this.getTravelDistanceMeters();
        if (distance !== this.lastDistance && !this.isCrashed && !this.levelFinished) {
            this.playerController.scene.observer.emit('distance_change', distance);
            this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
            this.lastDistance = distance;
        }
    }
    handleComboComplete() {
        if (this.levelFinished)
            return;
        const combo = this.comboAccumulatedScore * this.comboMultiplier;
        const prevBestCombo = this.bestCombo.accumulator * this.bestCombo.multiplier;
        if (combo > prevBestCombo)
            this.bestCombo = { accumulator: this.comboAccumulatedScore, multiplier: this.comboMultiplier };
        this.totalTrickScore += combo;
        this.playerController.scene.observer.emit('score_change', this.getCurrentScore());
        this.playerController.scene.observer.emit('combo_change', 0, 0);
        this.comboAccumulatedScore = 0;
        this.comboMultiplier = 0;
    }
}


/***/ }),

/***/ "./src/src/components/Terrain.ts":
/*!***************************************!*\
  !*** ./src/src/components/Terrain.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Terrain)
/* harmony export */ });
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @box2d/core */ "./node_modules/@box2d/core/dist/index.js");
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_box2d_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");


class Terrain {
    constructor(scene, physics) {
        var _a;
        this.zoomModifier = 1 / _index__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_ZOOM;
        this.layers = [
            { color: 0xC8E1EB, width: 5 * this.zoomModifier },
            { color: 0x5c8dc9, width: 22 * this.zoomModifier },
            { color: 0x223B7B, width: 10 * this.zoomModifier },
            { color: 0x2d2c2c, width: 5 * this.zoomModifier },
            { color: 0x3a3232, width: 250 * this.zoomModifier },
        ];
        this.pointsPool = [];
        this.vec2Pool = [];
        this.scene = scene;
        this.b2Physics = physics;
        const poolSize = 2500;
        for (let i = 0; i < poolSize; i++)
            this.pointsPool.push({ x: 0, y: 0 });
        for (let i = 0; i < poolSize; i++)
            this.vec2Pool.push(new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, 0));
        this.chunks = [
            this.scene.add.graphics().setDepth(10),
            this.scene.add.graphics().setDepth(10),
            this.scene.add.graphics().setDepth(10),
            this.scene.add.graphics().setDepth(10),
            this.scene.add.graphics().setDepth(10),
            this.scene.add.graphics().setDepth(10),
            this.scene.add.graphics().setDepth(10),
            this.scene.add.graphics().setDepth(10),
        ];
        this.terrainBody = this.b2Physics.world.CreateBody();
        const pos = this.terrainBody.GetPosition();
        const p = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserTerrain', true)[0];
        const fix = (_a = p.GetFixtureList()) === null || _a === void 0 ? void 0 : _a.GetShape();
        this.drawTerrain(fix.m_vertices.map(v => ({ x: (v.x + pos.x) * this.b2Physics.worldScale, y: -(v.y + pos.y) * this.b2Physics.worldScale })));
    }
    drawTerrain(points) {
        const chunk = this.chunks.shift();
        if (!chunk)
            return;
        this.chunks.push(chunk);
        chunk.clear();
        const lastIndex = points.length - 1;
        const end = Math.max(points[0].y, points[lastIndex].y) + this.scene.cameras.main.height * 2;
        let offset = 0;
        points.push({ x: points[lastIndex].x, y: end }, { x: points[0].x, y: end });
        for (const { color, width } of this.layers) {
            chunk.translateCanvas(0, offset);
            chunk.fillStyle(color);
            chunk.fillPoints(points, true, true);
            chunk.translateCanvas(0, 0);
            offset = width * 0.5;
        }
        points.length -= 2;
    }
}


/***/ }),

/***/ "./src/src/index.ts":
/*!**************************!*\
  !*** ./src/src/index.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BASE_FLIP_POINTS": () => (/* binding */ BASE_FLIP_POINTS),
/* harmony export */   "DEBUG": () => (/* binding */ DEBUG),
/* harmony export */   "DEFAULT_HEIGHT": () => (/* binding */ DEFAULT_HEIGHT),
/* harmony export */   "DEFAULT_WIDTH": () => (/* binding */ DEFAULT_WIDTH),
/* harmony export */   "DEFAULT_ZOOM": () => (/* binding */ DEFAULT_ZOOM),
/* harmony export */   "HEAD_MAX_IMPULSE": () => (/* binding */ HEAD_MAX_IMPULSE),
/* harmony export */   "KEY_USER_ID": () => (/* binding */ KEY_USER_ID),
/* harmony export */   "KEY_USER_NAME": () => (/* binding */ KEY_USER_NAME),
/* harmony export */   "KEY_USER_SCORES": () => (/* binding */ KEY_USER_SCORES),
/* harmony export */   "LEVEL_SUCCESS_BONUS_POINTS": () => (/* binding */ LEVEL_SUCCESS_BONUS_POINTS),
/* harmony export */   "POINTS_PER_COIN": () => (/* binding */ POINTS_PER_COIN),
/* harmony export */   "RESOLUTION_SCALE": () => (/* binding */ RESOLUTION_SCALE),
/* harmony export */   "SETTINGS_KEY_DEBUG": () => (/* binding */ SETTINGS_KEY_DEBUG),
/* harmony export */   "SETTINGS_KEY_DEBUG_ZOOM": () => (/* binding */ SETTINGS_KEY_DEBUG_ZOOM),
/* harmony export */   "SETTINGS_KEY_RESOLUTION": () => (/* binding */ SETTINGS_KEY_RESOLUTION),
/* harmony export */   "SETTINGS_KEY_VOLUME_MUSIC": () => (/* binding */ SETTINGS_KEY_VOLUME_MUSIC),
/* harmony export */   "SETTINGS_KEY_VOLUME_SFX": () => (/* binding */ SETTINGS_KEY_VOLUME_SFX),
/* harmony export */   "TRICK_POINTS_COMBO_FRACTION": () => (/* binding */ TRICK_POINTS_COMBO_FRACTION),
/* harmony export */   "gameConfig": () => (/* binding */ gameConfig),
/* harmony export */   "stats": () => (/* binding */ stats)
/* harmony export */ });
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! phaser */ "./node_modules/phaser/dist/phaser.js");
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(phaser__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _scenes_PreloadScene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scenes/PreloadScene */ "./src/src/scenes/PreloadScene.ts");
/* harmony import */ var _scenes_GameScene__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scenes/GameScene */ "./src/src/scenes/GameScene.ts");
/* harmony import */ var gamestats_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! gamestats.js */ "./node_modules/gamestats.js/build/gamestats.module.js");
/* harmony import */ var _scenes_GameUIScene__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scenes/GameUIScene */ "./src/src/scenes/GameUIScene.ts");





const SETTINGS_KEY_DEBUG = 'snowboarding_game_debug';
const SETTINGS_KEY_DEBUG_ZOOM = 'snowboarding_game_debug_zoom';
const SETTINGS_KEY_RESOLUTION = 'snowboarding_game_resolution';
const SETTINGS_KEY_VOLUME_MUSIC = 'snowboarding_game_volume_music';
const SETTINGS_KEY_VOLUME_SFX = 'snowboarding_game_volume_sfx';
const KEY_USER_ID = 'snowboarding_game_user_id';
const KEY_USER_NAME = 'snowboarding_game_user_name';
const KEY_USER_SCORES = 'snowboarding_game_user_scores';
const POINTS_PER_COIN = 100;
const LEVEL_SUCCESS_BONUS_POINTS = 5000;
const BASE_FLIP_POINTS = 200;
const TRICK_POINTS_COMBO_FRACTION = 0.2;
const HEAD_MAX_IMPULSE = 8;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const RESOLUTION_SCALE = Number(localStorage.getItem(SETTINGS_KEY_RESOLUTION) || 1);
// FIXME there is some kind of floating point precision issue (I assume) where the terrain gets weird once player moves to far from origin
//  It appears as the resolution and the scale have an influence on this. As temporary workaround I halved the world size and doubled the zoom.
//  This likely won't be an issue once terrain is split up in chunks (as it was when it used to be procedural before RUBE loader added).
const DEFAULT_ZOOM = Number(localStorage.getItem(SETTINGS_KEY_DEBUG_ZOOM) || 2);
const DEBUG = Boolean(localStorage.getItem(SETTINGS_KEY_DEBUG));
const gameConfig = {
    title: 'Snowboarding Game',
    version: '1.0.0',
    type: phaser__WEBPACK_IMPORTED_MODULE_0__.AUTO,
    backgroundColor: '#ffffff',
    disableContextMenu: true,
    parent: 'phaser-wrapper',
    dom: {
        createContainer: true,
    },
    fps: {
        min: 50,
        target: 60,
        smoothStep: true,
    },
    // roundPixels: true,
    // pixelArt: true,
    scale: {
        mode: phaser__WEBPACK_IMPORTED_MODULE_0__.Scale.FIT,
        autoCenter: phaser__WEBPACK_IMPORTED_MODULE_0__.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH * RESOLUTION_SCALE,
        height: DEFAULT_HEIGHT * RESOLUTION_SCALE,
    },
    scene: [_scenes_PreloadScene__WEBPACK_IMPORTED_MODULE_1__["default"], _scenes_GameScene__WEBPACK_IMPORTED_MODULE_2__["default"], _scenes_GameUIScene__WEBPACK_IMPORTED_MODULE_4__["default"]],
};
const config = {
    autoPlace: true,
    targetFPS: 60,
    redrawInterval: 200,
    maximumHistory: 200,
    scale: 1,
    memoryUpdateInterval: 100,
    memoryMaxHistory: 60 * 10,
    // Styling props
    FONT_FAMILY: 'Arial',
    COLOR_FPS_BAR: '#34cfa2',
    COLOR_FPS_AVG: '#FFF',
    COLOR_TEXT_LABEL: '#FFF',
    COLOR_TEXT_TO_LOW: '#eee207',
    COLOR_TEXT_BAD: '#d34646',
    COLOR_TEXT_TARGET: '#d249dd',
    COLOR_BG: '#333333',
};
let stats = { begin: () => null, end: () => null };
window.addEventListener('load', () => {
    const game = new phaser__WEBPACK_IMPORTED_MODULE_0__.Game(gameConfig);
    if (DEBUG) {
        stats = new gamestats_js__WEBPACK_IMPORTED_MODULE_3__["default"](config);
        document.body.appendChild(stats.dom);
    }
});


/***/ }),

/***/ "./src/src/scenes/GameScene.ts":
/*!*************************************!*\
  !*** ./src/src/scenes/GameScene.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GameScene)
/* harmony export */ });
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! phaser */ "./node_modules/phaser/dist/phaser.js");
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(phaser__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @box2d/core */ "./node_modules/@box2d/core/dist/index.js");
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_box2d_core__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_Terrain__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Terrain */ "./src/src/components/Terrain.ts");
/* harmony import */ var _components_Physics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/Physics */ "./src/src/components/Physics.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");
/* harmony import */ var _GameUIScene__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./GameUIScene */ "./src/src/scenes/GameUIScene.ts");
/* harmony import */ var _components_Backdrop__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/Backdrop */ "./src/src/components/Backdrop.ts");
/* harmony import */ var _components_PlayerController__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/PlayerController */ "./src/src/components/PlayerController.ts");








class GameScene extends phaser__WEBPACK_IMPORTED_MODULE_0__.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.observer = new phaser__WEBPACK_IMPORTED_MODULE_0__.Events.EventEmitter();
    }
    create() {
        this.cameras.main.setDeadzone(50 / 2, 125 / 2);
        this.cameras.main.setBackgroundColor(0x555555);
        const resolutionMod = this.cameras.main.width / _index__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_WIDTH;
        this.cameras.main.setZoom(_index__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_ZOOM * resolutionMod);
        this.cameras.main.scrollX -= this.cameras.main.width / 2;
        this.cameras.main.scrollY -= this.cameras.main.height / 2;
        // FIXME the world size is supposed to be set to 40px per 1m but due to floating point precision issues
        //  it is currently halfed and zoom is doubled temporarily. Visually it looks the same but needs to be fixed.
        //  The issue is that the terrain is a single object instead of chunked and gets weird once player moves too far from the origin.
        //  This wasn't an issue when terrain was procedural and chunked, so will likely fix itself once that is optimized again.
        this.b2Physics = new _components_Physics__WEBPACK_IMPORTED_MODULE_3__.Physics(this, 20, new _box2d_core__WEBPACK_IMPORTED_MODULE_1__.b2Vec2(0, -10));
        this.playerController = new _components_PlayerController__WEBPACK_IMPORTED_MODULE_7__.PlayerController(this, this.b2Physics);
        this.terrain = new _components_Terrain__WEBPACK_IMPORTED_MODULE_2__["default"](this, this.b2Physics);
        this.cameras.main.startFollow(this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserCameraFollow', true)[0].GetUserData(), false, 0.8, 0.25);
        this.cameras.main.followOffset.set(-375 / 2, 0);
        this.scene.launch(_GameUIScene__WEBPACK_IMPORTED_MODULE_5__["default"].name, [this.observer, () => {
                this.playerController.state.reset();
                this.scene.restart();
            }]);
        this.backdrop = new _components_Backdrop__WEBPACK_IMPORTED_MODULE_6__.Backdrop(this);
        if (_index__WEBPACK_IMPORTED_MODULE_4__.DEBUG) {
            const graphics = this.add.graphics();
            graphics.lineStyle(5, 0x048708, 1.0);
            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(40, 0);
            graphics.closePath();
            graphics.setDepth(1000);
            graphics.strokePath();
            graphics.lineStyle(5, 0xba0b28, 1.0);
            graphics.beginPath();
            graphics.moveTo(0, 0);
            graphics.lineTo(0, 40);
            graphics.closePath();
            graphics.setDepth(1000);
            graphics.strokePath();
        }
        this.observer.on('enter_crashed', () => this.cameras.main.shake(200, 0.01));
    }
    update() {
        _index__WEBPACK_IMPORTED_MODULE_4__.stats.begin();
        const delta = this.game.loop.delta / 1000;
        this.b2Physics.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
        this.playerController.update(delta);
        this.backdrop.update();
        _index__WEBPACK_IMPORTED_MODULE_4__.stats.end();
    }
}


/***/ }),

/***/ "./src/src/scenes/GameUIScene.ts":
/*!***************************************!*\
  !*** ./src/src/scenes/GameUIScene.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelIds": () => (/* binding */ PanelIds),
/* harmony export */   "default": () => (/* binding */ GameUIScene)
/* harmony export */ });
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! phaser */ "./node_modules/phaser/dist/phaser.js");
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(phaser__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");
/* harmony import */ var _util_calculateTotalScore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/calculateTotalScore */ "./src/src/util/calculateTotalScore.ts");



var PanelIds;
(function (PanelIds) {
    PanelIds["PANEL_PAUSE_MENU"] = "panel-pause-menu";
    PanelIds["PANEL_SELECT_LEVEL"] = "panel-select-level";
    PanelIds["PANEL_LEADERBOARDS"] = "panel-leaderboards";
    PanelIds["PANEL_HOW_TO_PLAY"] = "panel-how-to-play";
    PanelIds["PANEL_SETTINGS"] = "panel-settings";
    PanelIds["PANEL_CREDITS"] = "panel-credits";
    PanelIds["PANEL_YOUR_SCORE"] = "panel-your-score";
    PanelIds["NONE"] = "none";
})(PanelIds || (PanelIds = {}));
var HudIds;
(function (HudIds) {
    HudIds["HUD_DISTANCE"] = "hud-distance";
    HudIds["HUD_COMBO"] = "hud-combo";
    HudIds["HUD_SCORE"] = "hud-score";
})(HudIds || (HudIds = {}));
class GameUIScene extends phaser__WEBPACK_IMPORTED_MODULE_0__.Scene {
    constructor() {
        super({ key: 'GameUIScene' });
        this.panels = [];
        this.pendingScore = null;
        this.localScores = [];
    }
    init([observer, restartGameCB]) {
        this.observer = observer;
        this.restartGame = restartGameCB;
        this.resolutionMod = this.game.canvas.width / _index__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_WIDTH;
    }
    create() {
        const musicVolume = Number(localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_VOLUME_MUSIC) || 80) / 100;
        this.music = this.sound.add('riverside_ride', { loop: true, volume: musicVolume * 0.5, rate: 0.95, delay: 1, detune: 0 });
        this.music.play();
        const sfxVolume = Number(localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_VOLUME_SFX) || 80) / 100;
        this.sfx_jump_start = this.sound.add('boink', { detune: -200, volume: sfxVolume });
        this.sfx_pickup_present = this.sound.add('pickup_present', { detune: 100, rate: 1.1, volume: sfxVolume });
        this.sfx_death = this.sound.add('death', { detune: 700, rate: 1.25, volume: sfxVolume });
        this.sfx_grunt = this.sound.add('grunt', { detune: 700, rate: 1.25, volume: sfxVolume * 0.6 });
        this.sfx_applause = this.sound.add('applause', { detune: 0, rate: 1, volume: sfxVolume * 0.6 });
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.initDomUi();
        this.observer.on('toggle_pause', (paused, activePanel) => this.setPanelVisibility(paused ? activePanel : PanelIds.NONE));
        this.observer.on('jump_start', () => this.sfx_jump_start.play({ delay: 0.15 }));
        this.observer.on('pickup_present', total => {
            if (this.hudDistance)
                this.hudDistance.innerText = String(total) + 'x';
            this.sfx_pickup_present.play();
        });
        this.observer.on('combo_change', (accumulated, multiplier) => {
            if (this.hudCombo)
                this.hudCombo.innerText = accumulated ? (accumulated + 'x' + multiplier) : '-';
        });
        this.observer.on('score_change', score => {
            if (this.hudScore)
                this.hudScore.innerText = String((0,_util_calculateTotalScore__WEBPACK_IMPORTED_MODULE_2__.calculateTotalScore)(score));
        });
        this.comboLeewayChart = this.add.graphics();
        this.observer.on('combo_leeway_update', (value) => {
            this.comboLeewayChart
                .clear()
                .fillStyle(0xffffff)
                .slice(screenCenterX, 72 * this.resolutionMod, 12 * this.resolutionMod, value, Math.PI * 1.5)
                .fillPath();
        });
        this.observer.on('enter_crashed', (score) => {
            this.pendingScore = score;
            this.sfx_death.play();
            this.sfx_grunt.play();
            this.comboLeewayChart.clear();
            if (this.hudCombo)
                this.hudCombo.innerText = '-';
            this.tweens.add({
                targets: this.music,
                volume: 0.0,
                detune: -500,
                rate: 0.5,
                duration: 2000,
                onComplete: tween => {
                    this.music.stop();
                    this.updateYourScorePanelData(score);
                    this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
                },
            });
        });
        this.observer.on('level_finish', (score) => {
            this.pendingScore = score;
            this.sfx_applause.play();
            this.comboLeewayChart.clear();
            this.tweens.add({
                targets: this.music,
                volume: 0,
                duration: 2000,
                onComplete: tween => {
                    this.music.stop();
                    this.updateYourScorePanelData(score);
                    this.setPanelVisibility(PanelIds.PANEL_YOUR_SCORE);
                },
            });
        });
    }
    update() {
    }
    initDomUi() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        const element = this.add.dom(screenCenterX, screenCenterY).createFromCache('dom_game_ui');
        element.setScale(this.resolutionMod).addListener('click');
        const val = localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_RESOLUTION) || '1';
        const radios = Array.from(document.querySelectorAll('#settings-form input[name="resolution"]'));
        for (const radio of radios)
            if (radio.value === val)
                radio.checked = true;
        const valVolumeMusic = localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_VOLUME_MUSIC) || '80';
        const inputVolumeMusic = document.querySelector('#settings-form input[name="volumeMusic"]');
        if (inputVolumeMusic)
            inputVolumeMusic.value = valVolumeMusic;
        const valVolumeSfx = localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_VOLUME_SFX) || '80';
        const inputVolumeSfx = document.querySelector('#settings-form input[name="volumeSfx"]');
        if (inputVolumeSfx)
            inputVolumeSfx.value = valVolumeSfx;
        // The game may not run well on unverified browsers. For example it seems to run quite bad on firefox atm.
        // For now a text message is shown encouraging user to switch to a different browser if there are issues.
        // Older v0.5.0 prototype was running fairly well on lowest resolution on a raspberry pi. v1.0.0 can definitely be optimized better.
        const browser = this.sys.game.device.browser;
        if (!(browser.chrome || browser.edge || browser.opera)) {
            const elUnsupportedBrowserNotice = document.getElementById('unsupported-browser-notice');
            if (!elUnsupportedBrowserNotice)
                throw new Error('element with id "unsupported-browser-notice" not found');
            console.warn('Unsupported browser detected. Game may run well but it was not optimized for this particular browser:', browser);
            elUnsupportedBrowserNotice.classList.remove('hidden');
        }
        const elPauseIcon = document.getElementById('pause-game-icon');
        const elHowToPlayIcon = document.getElementById('how-to-play-icon');
        if (elPauseIcon && elHowToPlayIcon)
            setTimeout(() => {
                elPauseIcon.classList.remove('hidden');
                elHowToPlayIcon.classList.remove('hidden');
            }, 250); // if not hidden at the start it may show the material icon text for a split second until loaded.
        this.panelPauseMenu = document.getElementById(PanelIds.PANEL_PAUSE_MENU);
        this.panelSelectLevel = document.getElementById(PanelIds.PANEL_SELECT_LEVEL);
        this.panelHowToPlay = document.getElementById(PanelIds.PANEL_HOW_TO_PLAY);
        this.panelLeaderboards = document.getElementById(PanelIds.PANEL_LEADERBOARDS);
        this.panelSettings = document.getElementById(PanelIds.PANEL_SETTINGS);
        this.panelCredits = document.getElementById(PanelIds.PANEL_CREDITS);
        this.panelYourScore = document.getElementById(PanelIds.PANEL_YOUR_SCORE);
        this.hudDistance = document.getElementById(HudIds.HUD_DISTANCE);
        this.hudCombo = document.getElementById(HudIds.HUD_COMBO);
        this.hudScore = document.getElementById(HudIds.HUD_SCORE);
        if (!this.panelPauseMenu)
            throw new Error('panelPauseMenu not found');
        if (!this.panelSelectLevel)
            throw new Error('panelSelectLevel not found');
        if (!this.panelHowToPlay)
            throw new Error('panelHowToPlay not found');
        if (!this.panelLeaderboards)
            throw new Error('panelLeaderboards not found');
        if (!this.panelSettings)
            throw new Error('panelSettings not found');
        if (!this.panelCredits)
            throw new Error('panelCredits not found');
        if (!this.panelYourScore)
            throw new Error('panelYourScore not found');
        if (!this.hudDistance)
            throw new Error('hudDistance not found');
        if (!this.hudCombo)
            throw new Error('hudCombo not found');
        if (!this.hudScore)
            throw new Error('hudScore not found');
        this.panels = [
            this.panelPauseMenu,
            this.panelSelectLevel,
            this.panelHowToPlay,
            this.panelLeaderboards,
            this.panelSettings,
            this.panelCredits,
            this.panelYourScore,
        ];
        element.on('click', (evt) => {
            var _a, _b, _c;
            switch (evt.target.id) {
                case 'btn-goto-pause-menu': {
                    this.setPanelVisibility(PanelIds.PANEL_PAUSE_MENU);
                    break;
                }
                case 'btn-resume-game': {
                    this.setPanelVisibility(PanelIds.NONE);
                    this.observer.emit('resume_game');
                    break;
                }
                case 'btn-goto-select-level': {
                    this.setPanelVisibility(PanelIds.PANEL_SELECT_LEVEL);
                    break;
                }
                case 'btn-goto-how-to-play': {
                    this.setPanelVisibility(PanelIds.PANEL_HOW_TO_PLAY);
                    break;
                }
                case 'btn-goto-leaderboards': {
                    this.localScores = JSON.parse(localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_SCORES) || '[]');
                    this.updateLeaderboardPanelData(this.localScores);
                    this.setPanelVisibility(PanelIds.PANEL_LEADERBOARDS);
                    break;
                }
                case 'btn-goto-settings': {
                    this.setPanelVisibility(PanelIds.PANEL_SETTINGS);
                    break;
                }
                case 'btn-goto-credits': {
                    this.setPanelVisibility(PanelIds.PANEL_CREDITS);
                    break;
                }
                case 'pause-game-icon': {
                    if ((_a = this.panelPauseMenu) === null || _a === void 0 ? void 0 : _a.classList.contains('hidden')) {
                        this.observer.emit('pause_game_icon_pressed');
                    }
                    break;
                }
                case 'how-to-play-icon': {
                    if ((_b = this.panelPauseMenu) === null || _b === void 0 ? void 0 : _b.classList.contains('hidden')) {
                        this.observer.emit('how_to_play_icon_pressed');
                    }
                    break;
                }
                case 'btn-score-submit': {
                    const submitScoreForm = document.querySelector('.submit-score');
                    const nameInput = document.getElementById('username');
                    const name = nameInput === null || nameInput === void 0 ? void 0 : nameInput.value;
                    if (name && this.pendingScore && submitScoreForm) {
                        this.submitScore(this.pendingScore, name);
                        submitScoreForm.classList.add('hidden');
                    }
                    break;
                }
                case 'btn-save-settings': {
                    evt.preventDefault();
                    const settingsForm = (_c = this.panelSettings) === null || _c === void 0 ? void 0 : _c.querySelector('form');
                    if (settingsForm) {
                        localStorage.setItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_RESOLUTION, settingsForm.resolution.value || '1');
                        localStorage.setItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_VOLUME_MUSIC, settingsForm.volumeMusic.value);
                        localStorage.setItem(_index__WEBPACK_IMPORTED_MODULE_1__.SETTINGS_KEY_VOLUME_SFX, settingsForm.volumeSfx.value);
                        location.reload();
                    }
                    break;
                }
                case 'btn-play-again': {
                    this.playAgain();
                    break;
                }
                default: {
                    console.log('non-interactable target id', evt.target.id);
                }
            }
        });
        return element;
    }
    playAgain() {
        this.music.stop();
        this.restartGame();
    }
    setPanelVisibility(panelId) {
        const elPauseIcon = document.getElementById('pause-game-icon');
        const elHowtoPlay = document.getElementById('how-to-play-icon');
        if (elPauseIcon && elHowtoPlay) {
            if (panelId === PanelIds.NONE) {
                elPauseIcon.classList.remove('hidden');
                elHowtoPlay.classList.remove('hidden');
            }
            else {
                elPauseIcon.classList.add('hidden');
                elHowtoPlay.classList.add('hidden');
            }
        }
        this.panels.forEach(p => {
            if (p.id === panelId) {
                p.classList.remove('hidden');
            }
            else {
                p.classList.add('hidden');
            }
        });
    }
    updateYourScorePanelData(score) {
        if (this.panelYourScore) {
            const elDistance = document.getElementById('your-score-distance');
            const elCoins = document.getElementById('your-score-coins');
            const elTricks = document.getElementById('your-score-trick-score');
            const elTricksBestCombo = document.getElementById('your-score-best-combo');
            const elTotal = document.getElementById('your-score-total');
            const elUsername = document.getElementById('username');
            const elSubmitScoreForm = document.querySelector('.submit-score');
            score.finishedLevel
                ? this.panelYourScore.classList.add('succeeded')
                : this.panelYourScore.classList.remove('succeeded');
            if (elDistance)
                elDistance.innerText = String(score.distance) + 'm';
            if (elCoins)
                elCoins.innerText = `${score.coins}x${_index__WEBPACK_IMPORTED_MODULE_1__.POINTS_PER_COIN}`;
            if (elTricks)
                elTricks.innerText = String(score.trickScore);
            if (elTricksBestCombo)
                elTricksBestCombo.innerText = String(score.bestCombo.accumulator * score.bestCombo.multiplier);
            if (elTotal)
                elTotal.innerText = String((0,_util_calculateTotalScore__WEBPACK_IMPORTED_MODULE_2__.calculateTotalScore)(score));
            const username = localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_NAME);
            const userId = localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_ID);
            if (elUsername && !username) {
                // First time player without a username. Score is submitted manually somewhere else after clicking a button.
                elUsername.value = `Player_${this.pseudoRandomId()}`;
                elUsername.setAttribute('value', elUsername.value);
                // This game has no auth. Users are identified by pseudo secret userId which is stored locally and shall not be made public via API
                // This allows anonymous users to submit scores while making it impossible for others to submit a score in the name of someone else (as long as userId doesn't leak).
                // Maybe the game will have proper auth at some point in the future. If that happens, an anonymous user can be turned into a "real" user profile.
                localStorage.setItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_NAME, elUsername.value);
                localStorage.setItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_ID, crypto.randomUUID() || this.pseudoRandomId());
            }
            else if (username && userId) {
                elSubmitScoreForm === null || elSubmitScoreForm === void 0 ? void 0 : elSubmitScoreForm.classList.add('hidden');
                // Score is submitted automatically for users that submitted a score once before from this device and browser.
                this.submitScore(score, userId);
            }
        }
    }
    submitScore(score, userId) {
        // FIXME there are some annoying issues with the firebase based database. The changes will only be committed and pushed when I had time to deal with them...
        //  For now the game has only a local leaderboard where players can only see their own past scores.
        //  Scores are preserved locally in such a way that it may be possible to submit them later on when user plays the game again once leaderboards are enabled.
        const localScores = JSON.parse(localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_SCORES) || '[]');
        score.id = this.pseudoRandomId();
        score.timestamp = Date.now();
        localScores.push(score);
        this.localScores = localScores;
        console.log('localScores', localScores);
        localStorage.setItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_SCORES, JSON.stringify(localScores));
    }
    pseudoRandomId() {
        // fallback is unique enough for purposes of this game atm.
        return Math.random().toString(36).slice(2);
    }
    updateLeaderboardPanelData(localScores) {
        const leaderboardItemTemplate = document.getElementById('leaderboard-item-template');
        const leaderboardItemContainer = document.getElementById('leaderboard-item-container');
        if (this.panelLeaderboards && leaderboardItemTemplate && leaderboardItemContainer) {
            localScores = localScores
                .map(s => (Object.assign(Object.assign({}, s), { total: (0,_util_calculateTotalScore__WEBPACK_IMPORTED_MODULE_2__.calculateTotalScore)(s), username: s.username || localStorage.getItem(_index__WEBPACK_IMPORTED_MODULE_1__.KEY_USER_NAME) })))
                .sort((a, b) => b.total - a.total);
            for (const [i, score] of localScores.entries()) {
                const clone = leaderboardItemTemplate.content.cloneNode(true);
                const cloneElRank = clone.querySelector('#leaderboard-item-rank');
                const cloneElUsername = clone.querySelector('#leaderboard-item-username');
                const cloneElScore = clone.querySelector('#leaderboard-item-score');
                if (cloneElRank)
                    cloneElRank.innerHTML = String(i + 1);
                if (cloneElUsername)
                    cloneElUsername.innerHTML = String(score.username);
                if (cloneElScore)
                    cloneElScore.innerHTML = String(score.total);
                leaderboardItemContainer.appendChild(clone);
            }
        }
    }
}


/***/ }),

/***/ "./src/src/scenes/PreloadScene.ts":
/*!****************************************!*\
  !*** ./src/src/scenes/PreloadScene.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PreloadScene)
/* harmony export */ });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    preload() {
        this.loadAudio();
        this.loadImg();
        this.loadLevels();
        this.load.html('dom_game_ui', 'assets/html/game_ui.html');
    }
    create() {
        this.scene.start('GameScene');
    }
    loadAudio() {
        this.load.audio('riverside_ride', [
            'assets/audio/music/riverside_ride/riverside_ride.ogg',
            'assets/audio/music/riverside_ride/riverside_ride.mp3',
        ]);
        this.load.audio('boink', [
            'assets/audio/sfx/jump/boink.ogg',
            'assets/audio/sfx/jump/boink.mp3',
        ]);
        this.load.audio('pickup_present', [
            'assets/audio/sfx/pickup/pickupgem.ogg',
            'assets/audio/sfx/pickup/pickupgem.mp3',
        ]);
        this.load.audio('death', [
            'assets/audio/sfx/crash/death.ogg',
            'assets/audio/sfx/crash/death.mp3',
        ]);
        this.load.audio('grunt', [
            'assets/audio/sfx/crash_grunt/grunt.ogg',
            'assets/audio/sfx/crash_grunt/grunt.mp3',
        ]);
        this.load.audio('applause', [
            'assets/audio/sfx/applause/applause.ogg',
            'assets/audio/sfx/applause/applause.mp3',
        ]);
    }
    loadImg() {
        const height = _index__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_HEIGHT * _index__WEBPACK_IMPORTED_MODULE_0__.RESOLUTION_SCALE;
        const closestSize = [360, 540, 720].reduce((prev, curr) => Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev);
        const size = { 360: '640x360', 540: '960x540', 720: '1280x720' }[closestSize];
        this.load.atlas('bg_space_pack', `assets/img/packed/bg_space_${size}.png`, `assets/img/packed/bg_space_${size}.json`);
        this.load.atlas('atlas_santa', `assets/img/packed/character_santa_${size}.png`, `assets/img/packed/character_santa_${size}.json`);
        this.load.atlas('atlas_environment', `assets/img/packed/environment_${size}.png`, `assets/img/packed/environment_${size}.json`);
    }
    loadLevels() {
        this.load.json('santa', 'assets/levels/export/level_001.json');
    }
}


/***/ }),

/***/ "./src/src/util/DebugMouseJoint.ts":
/*!*****************************************!*\
  !*** ./src/src/util/DebugMouseJoint.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DebugMouseJoint": () => (/* binding */ DebugMouseJoint)
/* harmony export */ });
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @box2d/core */ "./node_modules/@box2d/core/dist/index.js");
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_box2d_core__WEBPACK_IMPORTED_MODULE_0__);


class DebugMouseJoint {
    constructor(scene, b2Physics) {
        this.scene = scene;
        this.b2Physics = b2Physics;
        this.scene.input.on('pointerdown', (pointer) => this.MouseDown({ x: pointer.worldX / this.b2Physics.worldScale, y: -pointer.worldY / this.b2Physics.worldScale }));
        this.scene.input.on('pointerup', (pointer) => this.MouseUp({ x: pointer.worldX / this.b2Physics.worldScale, y: -pointer.worldY / this.b2Physics.worldScale }));
        this.scene.input.on('pointermove', (pointer) => this.MouseMove({ x: pointer.worldX / this.b2Physics.worldScale, y: -pointer.worldY / this.b2Physics.worldScale }, true));
    }
    MouseMove(p, leftDrag) {
        if (leftDrag && this.mouseJoint) {
            this.mouseJoint.SetTarget(p);
        }
    }
    MouseUp(p) {
        if (this.mouseJoint) {
            this.b2Physics.world.DestroyJoint(this.mouseJoint);
            this.mouseJoint = null;
        }
    }
    MouseDown(p) {
        if (this.mouseJoint) {
            this.b2Physics.world.DestroyJoint(this.mouseJoint);
            this.mouseJoint = null;
        }
        // Query the world for overlapping shapes.
        let hit_fixture;
        this.b2Physics.world.QueryPointAABB(p, (fixture) => {
            const body = fixture.GetBody();
            if (body.GetType() === _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2BodyType.b2_dynamicBody && fixture.TestPoint(p)) {
                hit_fixture = fixture;
                return false; // We are done, terminate the query.
            }
            return true; // Continue the query.
        });
        if (hit_fixture) {
            const frequencyHz = 5;
            const dampingRatio = 0.5;
            const body = hit_fixture.GetBody();
            const jd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2MouseJointDef();
            jd.collideConnected = true;
            jd.damping = 0.1;
            jd.bodyA = this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserTerrain', true)[0];
            jd.bodyB = body;
            jd.target.Copy(p);
            jd.maxForce = 700 * body.GetMass();
            _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2LinearStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
            this.mouseJoint = this.b2Physics.world.CreateJoint(jd);
            body.SetAwake(true);
        }
    }
}


/***/ }),

/***/ "./src/src/util/RUBE/RubeLoader.ts":
/*!*****************************************!*\
  !*** ./src/src/util/RUBE/RubeLoader.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RubeLoader": () => (/* binding */ RubeLoader)
/* harmony export */ });
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @box2d/core */ "./node_modules/@box2d/core/dist/index.js");
/* harmony import */ var _box2d_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_box2d_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../index */ "./src/src/index.ts");
/*
*  R.U.B.E. Scene Loader for Phaser3 and https://github.com/lusito/box2d.ts.
* Based on provided example by Chris Campbell: https://www.iforce2d.net/rube/loaders/rube-phaser-sample.zip
*/


class RubeLoader {
    constructor(world, debugGraphics, scene, worldSize) {
        this.world = world;
        this.debugGraphics = debugGraphics;
        this.scene = scene;
        this.worldSize = worldSize;
    }
    loadScene(scene) {
        this.loadedBodies = scene.body ? scene.body.map(bodyJson => this.loadBody(bodyJson)) : [];
        this.loadedJoints = scene.joint ? scene.joint.map(jointJson => this.loadJoint(jointJson)) : [];
        this.loadedImages = scene.image ? scene.image.map(imageJson => this.loadImage(imageJson)) : [];
        const success = this.loadedBodies.every(b => b) && this.loadedJoints.every(j => j) && this.loadedImages.every(i => i);
        success
            ? console.log(`R.U.B.E. scene loaded successfully`, this.loadedBodies, this.loadedJoints, this.loadedImages)
            : console.error(`R.U.B.E. scene failed to load fully`, this.loadedBodies, this.loadedJoints, this.loadedImages);
        return success;
    }
    loadBody(bodyJson) {
        const bd = {};
        bd.type = Math.min(Math.max(bodyJson.type || 0, 0), 2); // clamp between 0-2.
        bd.angle = bodyJson.angle || 0;
        bd.angularVelocity = bodyJson.angularVelocity || 0;
        bd.awake = Boolean(bodyJson.awake);
        bd.enabled = bodyJson.hasOwnProperty('active') ? bodyJson.active : true;
        bd.fixedRotation = Boolean(bodyJson.fixedRotation);
        bd.linearVelocity = this.rubeToXY(bodyJson.linearVelocity);
        bd.linearDamping = bodyJson.linearDamping || 0;
        bd.angularDamping = bodyJson.angularDamping || 0;
        bd.position = this.rubeToXY(bodyJson.position);
        const body = this.world.CreateBody(bd);
        body.SetMassData({
            mass: bodyJson['massData-mass'] || 1,
            center: this.rubeToVec2(bodyJson['massData-center']),
            I: bodyJson['massData-I'] || 1,
        });
        body.name = bodyJson.name || '';
        body.customProperties = bodyJson.customProperties || [];
        body.customPropertiesMap = this.customPropertiesArrayToMap(body.customProperties || []);
        (bodyJson.fixture || []).map(fixtureJson => this.loadFixture(body, fixtureJson));
        return body;
    }
    loadFixture(body, fixtureJso) {
        const fd = this.getFixtureDefWithShape(fixtureJso, body);
        fd.friction = fixtureJso.friction || 0;
        fd.density = fixtureJso.density || 0;
        fd.restitution = fixtureJso.restitution || 0;
        fd.isSensor = Boolean(fixtureJso.sensor);
        fd.filter = {
            categoryBits: fixtureJso['filter-categoryBits'],
            maskBits: fixtureJso['filter-maskBits'] || 1,
            groupIndex: fixtureJso['filter-groupIndex'] || 65535,
        };
        const fixture = body.CreateFixture(fd);
        fixture.name = fixtureJso.name || '';
        fixture.customProperties = fixtureJso.customProperties || [];
        fixture.customPropertiesMap = this.customPropertiesArrayToMap(fixture.customProperties);
        return fixture;
    }
    loadJoint(jointJson) {
        if (jointJson.bodyA >= this.loadedBodies.length) {
            console.error('Index for bodyA is invalid: ' + jointJson);
            return null;
        }
        if (jointJson.bodyB >= this.loadedBodies.length) {
            console.error('Index for bodyB is invalid: ' + jointJson);
            return null;
        }
        const bodyA = this.loadedBodies[jointJson.bodyA];
        const bodyB = this.loadedBodies[jointJson.bodyB];
        if (!bodyA || !bodyB) {
            console.error('bodyA or bodyB are invalid', bodyA, bodyB, this.loadedBodies);
            return null;
        }
        let joint;
        switch (jointJson.type) {
            case 'revolute': {
                const jd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2RevoluteJointDef();
                jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()));
                jd.collideConnected = Boolean(jointJson.collideConnected);
                jd.referenceAngle = jointJson.refAngle || 0;
                jd.enableLimit = Boolean(jointJson.enableLimit);
                jd.lowerAngle = jointJson.lowerLimit || 0;
                jd.upperAngle = jointJson.upperLimit || 0;
                jd.enableMotor = Boolean(jointJson.enableMotor);
                jd.maxMotorTorque = jointJson.maxMotorTorque || 0;
                jd.motorSpeed = jointJson.motorSpeed || 0;
                joint = this.world.CreateJoint(jd);
                break;
            }
            // case 'rope': {
            //   // throw new Error('Rope joint not implemented');
            // }
            case 'distance': {
                const jd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2DistanceJointDef();
                jd.length = (jointJson.length || 0);
                jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()), this.rubeToVec2(jointJson.anchorB).Rotate(bodyB.GetAngle()).Add(bodyB.GetPosition()));
                jd.collideConnected = Boolean(jointJson.collideConnected);
                jd.length = jointJson.length || 0;
                // Not sure what the proper way is, but without setting min and max length explicitly, it remains stiff.
                jd.minLength = 0;
                jd.maxLength = jd.length * 2;
                _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2LinearStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
                joint = this.world.CreateJoint(jd);
                break;
            }
            case 'prismatic': {
                const jd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2PrismaticJointDef();
                jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()), this.rubeToXY(jointJson.localAxisA));
                jd.collideConnected = Boolean(jointJson.collideConnected);
                jd.referenceAngle = jointJson.refAngle || 0;
                jd.enableLimit = Boolean(jointJson.enableLimit);
                jd.lowerTranslation = jointJson.lowerLimit || 0;
                jd.upperTranslation = jointJson.upperLimit || 0;
                jd.enableMotor = Boolean(jointJson.enableMotor);
                jd.maxMotorForce = jointJson.maxMotorForce || 0;
                jd.motorSpeed = jointJson.motorSpeed || 0;
                joint = this.world.CreateJoint(jd);
                break;
            }
            case 'wheel': {
                const jd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2WheelJointDef();
                // TODO anchorA is 0 and B is XY in world space, which should be used?
                jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorB), this.rubeToVec2(jointJson.localAxisA));
                jd.collideConnected = Boolean(jointJson.collideConnected);
                jd.enableMotor = Boolean(jointJson.enableMotor);
                jd.maxMotorTorque = jointJson.maxMotorTorque || 0;
                jd.motorSpeed = jointJson.motorSpeed || 0;
                _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2LinearStiffness(jd, jointJson.springFrequency || 0, jointJson.springDampingRatio || 0, jd.bodyA, jd.bodyB);
                joint = this.world.CreateJoint(jd);
                break;
            }
            case 'friction': {
                const jd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2FrictionJointDef();
                jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()));
                jd.collideConnected = Boolean(jointJson.collideConnected);
                jd.maxForce = jointJson.maxForce || 0;
                jd.maxTorque = jointJson.maxTorque || 0;
                joint = this.world.CreateJoint(jd);
                break;
            }
            case 'weld': {
                const jd = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2WeldJointDef();
                jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()));
                jd.collideConnected = Boolean(jointJson.collideConnected);
                jd.referenceAngle = jointJson.refAngle || 0;
                _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2AngularStiffness(jd, jointJson.frequency || 0, jointJson.dampingRatio || 0, jd.bodyA, jd.bodyB);
                joint = this.world.CreateJoint(jd);
                break;
            }
            default:
                throw new Error('Unsupported joint type: ' + jointJson.type);
        }
        joint.name = jointJson.name;
        joint.customProperties = jointJson.customProperties || [];
        joint.customPropertiesMap = this.customPropertiesArrayToMap(joint.customProperties);
        return joint;
    }
    loadImage(imageJson) {
        const { file, body, center, customProperties, angle, aspectScale, scale, flip, renderOrder } = imageJson;
        const bodyObj = this.loadedBodies[body];
        const pos = bodyObj ? bodyObj.GetPosition().Add(this.rubeToXY(center)) : this.rubeToXY(center);
        if (!pos)
            return null;
        const texture = this.getCustomProperty(imageJson, 'string', 'phaserTexture', '');
        // textureFallback is used when the images in the exported RUBE scene don't define the phaserTexture or phaserTextureFrame custom properties.
        // It is quite a hassle to set it within RUBE if not done from the start. In the future only the phaserTexture custom prop will be necessary to specify which atlas to use.
        // The textureFrame will be taken from the image file name.
        const textureFallback = (file || '').split('/').reverse()[0];
        const textureFrame = this.getCustomProperty(imageJson, 'string', 'phaserTextureFrame', textureFallback);
        const img = this.scene.add.image(pos.x * this.worldSize, pos.y * -this.worldSize, texture || textureFallback, textureFrame);
        img.rotation = bodyObj ? -bodyObj.GetAngle() + -(angle || 0) : -(angle || 0);
        img.scaleY = (this.worldSize / img.height) * scale;
        img.scaleX = img.scaleY * aspectScale;
        img.flipX = flip;
        img.setDepth(renderOrder);
        // @ts-ignore
        img.custom_origin_angle = -(angle || 0);
        img.customProperties = customProperties || [];
        img.customPropertiesMap = this.customPropertiesArrayToMap(img.customProperties);
        bodyObj && bodyObj.SetUserData(img);
        return img;
    }
    ///////////////////
    rubeToXY(val, offset = { x: 0, y: 0 }) {
        return this.isXY(val) ? { x: val.x + offset.x, y: val.y + offset.y } : offset;
    }
    rubeToVec2(val) {
        return this.isXY(val) ? new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(val.x, val.y) : new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, 0);
    }
    getBodiesByName(name) {
        const bodies = [];
        for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
            if (!body)
                continue;
            // @ts-ignore
            if (body.name === name)
                bodies.push(body);
        }
        return bodies;
    }
    getBodiesByCustomProperty(propertyType, propertyName, valueToMatch) {
        const bodies = [];
        for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
            if (!body || !body.customProperties)
                continue;
            for (let i = 0; i < body.customProperties.length; i++) {
                if (!body.customProperties[i].hasOwnProperty('name'))
                    continue;
                if (!body.customProperties[i].hasOwnProperty(propertyType))
                    continue;
                if (body.customProperties[i].name == propertyName &&
                    body.customProperties[i][propertyType] == valueToMatch) // TODO refactor to strict equals
                    bodies.push(body);
            }
        }
        return bodies;
    }
    getFixturesByCustomProperty(propertyType, propertyName, valueToMatch) {
        const fixtures = [];
        for (let body = this.world.GetBodyList(); body; body = body.GetNext()) {
            for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
                if (!fixture || !fixture.customProperties)
                    continue;
                for (let i = 0; i < fixture.customProperties.length; i++) {
                    if (!fixture.customProperties[i].hasOwnProperty('name'))
                        continue;
                    if (!fixture.customProperties[i].hasOwnProperty(propertyType))
                        continue;
                    if (fixture.customProperties[i].name == propertyName &&
                        fixture.customProperties[i][propertyType] == valueToMatch) // TODO refactor to strict equals
                        fixtures.push(fixture);
                }
            }
        }
        return fixtures;
    }
    getJointsByCustomProperty(propertyType, propertyName, valueToMatch) {
        const joints = [];
        for (let joint = this.world.GetJointList(); joint; joint = joint.GetNext()) {
            if (!joint || !joint.customProperties)
                continue;
            for (let i = 0; i < joint.customProperties.length; i++) {
                if (!joint.customProperties[i].hasOwnProperty('name'))
                    continue;
                if (!joint.customProperties[i].hasOwnProperty(propertyType))
                    continue;
                if (joint.customProperties[i].name == propertyName &&
                    joint.customProperties[i][propertyType] == valueToMatch) // TODO refactor to strict equals
                    joints.push(joint);
            }
        }
        return joints;
    }
    // TODO turn into map instead of having to iterate over custom props
    getCustomProperty(entity, propertyType, propertyName, defaultValue) {
        if (!entity.customProperties)
            return defaultValue;
        for (const prop of entity.customProperties) {
            if (!prop.name || !prop.hasOwnProperty(propertyType))
                continue;
            if (prop.name === propertyName)
                return prop[propertyType];
        }
        return defaultValue;
    }
    customPropertiesArrayToMap(customProperties) {
        return customProperties.reduce((obj, cur) => {
            if (cur.hasOwnProperty('int'))
                obj[cur.name] = cur.int;
            else if (cur.hasOwnProperty('float'))
                obj[cur.name] = cur.float;
            else if (cur.hasOwnProperty('string'))
                obj[cur.name] = cur.string;
            else if (cur.hasOwnProperty('color'))
                obj[cur.name] = cur.color;
            else if (cur.hasOwnProperty('bool'))
                obj[cur.name] = cur.bool;
            else if (cur.hasOwnProperty('vec2'))
                obj[cur.name] = this.rubeToXY(cur.vec2);
            else
                throw new Error('invalid or missing custom property type');
            return obj;
        }, {});
    }
    getFixtureDefWithShape(fixtureJso, body) {
        if (fixtureJso.hasOwnProperty('circle') && fixtureJso.circle) {
            const shape = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2CircleShape();
            shape.Set(this.rubeToXY(fixtureJso.circle.center), fixtureJso.circle.radius);
            const bodyPos = body.GetPosition().Clone().Add(shape.m_p).Scale(this.worldSize);
            _index__WEBPACK_IMPORTED_MODULE_1__.DEBUG && this.debugGraphics.strokeCircle(bodyPos.x, -bodyPos.y, fixtureJso.circle.radius * this.worldSize);
            return { shape };
        }
        else if (fixtureJso.hasOwnProperty('polygon') && fixtureJso.polygon) {
            const verts = this.pointsFromSeparatedVertices(fixtureJso.polygon.vertices).reverse();
            const bodyPos = body.GetPosition();
            if (_index__WEBPACK_IMPORTED_MODULE_1__.DEBUG) {
                const pxVerts = verts
                    .map(p => bodyPos.Clone().Add(new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(p.x, p.y).Rotate(body.GetAngle())).Scale(this.worldSize))
                    .map(({ x, y }) => ({ x: x, y: -y }));
                this.debugGraphics.strokePoints(pxVerts, true).setDepth(100);
            }
            return { shape: new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2PolygonShape().Set(verts, verts.length) };
        }
        else if (fixtureJso.hasOwnProperty('chain') && fixtureJso.chain) {
            const verts = this.pointsFromSeparatedVertices(fixtureJso.chain.vertices).reverse();
            const bodyPos = body.GetPosition();
            if (_index__WEBPACK_IMPORTED_MODULE_1__.DEBUG) {
                const pxVerts = verts
                    .map(p => bodyPos.Clone().Add(new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(p.x, p.y).Rotate(body.GetAngle())).Scale(this.worldSize))
                    .map(({ x, y }) => ({ x: x, y: -y }));
                this.debugGraphics.strokePoints(pxVerts).setDepth(100);
            }
            const isLoop = fixtureJso.chain.hasNextVertex && fixtureJso.chain.hasPrevVertex && fixtureJso.chain.nextVertex && fixtureJso.chain.prevVertex;
            // TODO should polygon create loop chain instead to avoid ghost collisions? https://box2d.org/posts/2020/06/ghost-collisions/
            const shape = isLoop
                ? new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2ChainShape().CreateLoop(verts, verts.length)
                : new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2ChainShape().CreateChain(verts, verts.length, this.rubeToXY(fixtureJso.chain.prevVertex), this.rubeToXY(fixtureJso.chain.nextVertex));
            return { shape };
        }
        else {
            throw new Error('Could not find shape type for fixture');
        }
    }
    pointsFromSeparatedVertices(vertices) {
        const verts = [];
        for (let v = 0; v < vertices.x.length; v++)
            // In RUBE Editor the Y coordinates are upside down when compared to Phaser3
            verts.push(new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(vertices.x[v], vertices.y[v]));
        return verts;
    }
    isXY(val) {
        return Boolean(val && typeof val === 'object' && val.hasOwnProperty('x') && val.hasOwnProperty('y'));
    }
}


/***/ }),

/***/ "./src/src/util/calculateTotalScore.ts":
/*!*********************************************!*\
  !*** ./src/src/util/calculateTotalScore.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "calculateTotalScore": () => (/* binding */ calculateTotalScore)
/* harmony export */ });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");

const calculateTotalScore = (score) => {
    return score.distance + score.trickScore + (score.coins * _index__WEBPACK_IMPORTED_MODULE_0__.POINTS_PER_COIN) + (score.finishedLevel ? _index__WEBPACK_IMPORTED_MODULE_0__.LEVEL_SUCCESS_BONUS_POINTS : 0);
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		// The chunk loading function for additional chunks
/******/ 		// Since all referenced chunks are already included
/******/ 		// in this file, this function is empty here.
/******/ 		__webpack_require__.e = () => (Promise.resolve());
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunksnowboarding_game"] = self["webpackChunksnowboarding_game"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors"], () => (__webpack_require__("./src/src/index.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7UUFDdEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLCtDQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0UsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztTQUN2QyxDQUFDO1FBRUYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNyRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEcsTUFBTSxHQUFHLEdBQUcsT0FBQyxDQUFDLGNBQWMsRUFBRSwwQ0FBRSxRQUFRLEVBQXFCLENBQUM7UUFDOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0ksQ0FBQztJQUVPLFdBQVcsQ0FBQyxNQUFlO1FBQ2pDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVkLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDNUYsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1FBQ3hFLEtBQUssTUFBTSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3hDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQ3RCO1FBRUQsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDckIsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZFNEI7QUFDb0I7QUFDTjtBQUNOO0FBQ1U7QUFFeEMsTUFBTSxrQkFBa0IsR0FBRyx5QkFBeUIsQ0FBQztBQUNyRCxNQUFNLHVCQUF1QixHQUFHLDhCQUE4QixDQUFDO0FBQy9ELE1BQU0sdUJBQXVCLEdBQUcsOEJBQThCLENBQUM7QUFDL0QsTUFBTSx5QkFBeUIsR0FBRyxnQ0FBZ0MsQ0FBQztBQUNuRSxNQUFNLHVCQUF1QixHQUFHLDhCQUE4QixDQUFDO0FBRS9ELE1BQU0sV0FBVyxHQUFHLDJCQUEyQixDQUFDO0FBQ2hELE1BQU0sYUFBYSxHQUFHLDZCQUE2QixDQUFDO0FBQ3BELE1BQU0sZUFBZSxHQUFHLCtCQUErQixDQUFDO0FBRXhELE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQztBQUM1QixNQUFNLDBCQUEwQixHQUFHLElBQUksQ0FBQztBQUN4QyxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztBQUM3QixNQUFNLDJCQUEyQixHQUFHLEdBQUcsQ0FBQztBQUN4QyxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQUUzQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDM0IsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBQzNCLE1BQU0sZ0JBQWdCLEdBQVcsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNuRywwSUFBMEk7QUFDMUksK0lBQStJO0FBQy9JLHdJQUF3STtBQUNqSSxNQUFNLFlBQVksR0FBVyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLE1BQU0sS0FBSyxHQUFZLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztBQUV6RSxNQUFNLFVBQVUsR0FBNkI7SUFDbEQsS0FBSyxFQUFFLG1CQUFtQjtJQUMxQixPQUFPLEVBQUUsT0FBTztJQUNoQixJQUFJLEVBQUUsd0NBQU87SUFDYixlQUFlLEVBQUUsU0FBUztJQUMxQixrQkFBa0IsRUFBRSxJQUFJO0lBQ3hCLE1BQU0sRUFBRSxnQkFBZ0I7SUFDeEIsR0FBRyxFQUFFO1FBQ0gsZUFBZSxFQUFFLElBQUk7S0FDdEI7SUFDRCxHQUFHLEVBQUU7UUFDSCxHQUFHLEVBQUUsRUFBRTtRQUNQLE1BQU0sRUFBRSxFQUFFO1FBQ1YsVUFBVSxFQUFFLElBQUk7S0FDakI7SUFDRCxxQkFBcUI7SUFDckIsa0JBQWtCO0lBQ2xCLEtBQUssRUFBRTtRQUNMLElBQUksRUFBRSw2Q0FBWTtRQUNsQixVQUFVLEVBQUUscURBQW9CO1FBQ2hDLEtBQUssRUFBRSxhQUFhLEdBQUcsZ0JBQWdCO1FBQ3ZDLE1BQU0sRUFBRSxjQUFjLEdBQUcsZ0JBQWdCO0tBQzFDO0lBQ0QsS0FBSyxFQUFFLENBQUMsNERBQVksRUFBRSx5REFBUyxFQUFFLDJEQUFXLENBQUM7Q0FDOUMsQ0FBQztBQUVGLE1BQU0sTUFBTSxHQUFHO0lBQ2IsU0FBUyxFQUFFLElBQUk7SUFDZixTQUFTLEVBQUUsRUFBRTtJQUNiLGNBQWMsRUFBRSxHQUFHO0lBQ25CLGNBQWMsRUFBRSxHQUFHO0lBQ25CLEtBQUssRUFBRSxDQUFDO0lBQ1Isb0JBQW9CLEVBQUUsR0FBRztJQUN6QixnQkFBZ0IsRUFBRSxFQUFFLEdBQUcsRUFBRTtJQUV6QixnQkFBZ0I7SUFDaEIsV0FBVyxFQUFFLE9BQU87SUFDcEIsYUFBYSxFQUFFLFNBQVM7SUFDeEIsYUFBYSxFQUFFLE1BQU07SUFDckIsZ0JBQWdCLEVBQUUsTUFBTTtJQUN4QixpQkFBaUIsRUFBRSxTQUFTO0lBQzVCLGNBQWMsRUFBRSxTQUFTO0lBQ3pCLGlCQUFpQixFQUFFLFNBQVM7SUFDNUIsUUFBUSxFQUFFLFNBQVM7Q0FDcEIsQ0FBQztBQUVLLElBQUksS0FBSyxHQUFjLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUF5QixDQUFDO0FBQzNGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ25DLE1BQU0sSUFBSSxHQUFHLElBQUksd0NBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVyQyxJQUFJLEtBQUssRUFBRTtRQUNULEtBQUssR0FBRyxJQUFJLG9EQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3RDO0FBQ0gsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckYwQjtBQUNLO0FBQ1U7QUFDRTtBQUNxQjtBQUMzQjtBQUNRO0FBQ2dCO0FBRWpELE1BQU0sU0FBVSxTQUFRLHlDQUFRO0lBTzdDO1FBQ0UsS0FBSyxDQUFDLEVBQUMsR0FBRyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFQbkIsYUFBUSxHQUErQixJQUFJLHVEQUFzQixFQUFFLENBQUM7SUFRN0UsQ0FBQztJQUVPLE1BQU07UUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLGlEQUFhLENBQUM7UUFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdEQUFZLEdBQUcsYUFBYSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFMUQsdUdBQXVHO1FBQ3ZHLDZHQUE2RztRQUM3RyxpSUFBaUk7UUFDakkseUhBQXlIO1FBQ3pILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSx3REFBTyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSwrQ0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksMEVBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksMkRBQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWpELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUE4QixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEwsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMseURBQWdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDdkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLDBEQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkMsSUFBSSx5Q0FBSyxFQUFFO1lBQ1QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQixRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUV0QixRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZCLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQixRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUN2QjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVELE1BQU07UUFDSiwrQ0FBVyxFQUFFLENBQUM7UUFDZCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxxRkFBcUY7UUFDOUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLDZDQUFTLEVBQUUsQ0FBQztJQUNkLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM0U0QjtBQUNxSjtBQUVsSDtBQUdoRSxJQUFZLFFBU1g7QUFURCxXQUFZLFFBQVE7SUFDbEIsaURBQXFDO0lBQ3JDLHFEQUF5QztJQUN6QyxxREFBeUM7SUFDekMsbURBQXVDO0lBQ3ZDLDZDQUFpQztJQUNqQywyQ0FBK0I7SUFDL0IsaURBQXFDO0lBQ3JDLHlCQUFhO0FBQ2YsQ0FBQyxFQVRXLFFBQVEsS0FBUixRQUFRLFFBU25CO0FBR0QsSUFBSyxNQUlKO0FBSkQsV0FBSyxNQUFNO0lBQ1QsdUNBQTZCO0lBQzdCLGlDQUF1QjtJQUN2QixpQ0FBdUI7QUFDekIsQ0FBQyxFQUpJLE1BQU0sS0FBTixNQUFNLFFBSVY7QUFHYyxNQUFNLFdBQVksU0FBUSx5Q0FBUTtJQThCL0M7UUFDRSxLQUFLLENBQUMsRUFBQyxHQUFHLEVBQUUsYUFBYSxFQUFDLENBQUMsQ0FBQztRQWpCdEIsV0FBTSxHQUFrQixFQUFFLENBQUM7UUFhM0IsaUJBQVksR0FBa0IsSUFBSSxDQUFDO1FBQ25DLGdCQUFXLEdBQWEsRUFBRSxDQUFDO0lBS25DLENBQUM7SUFFRCxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUF1QztRQUNsRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxpREFBYSxDQUFDO0lBQzlELENBQUM7SUFFRCxNQUFNO1FBQ0osTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsNkRBQXlCLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDeEYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3hILElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsMkRBQXVCLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDcEYsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7UUFDakYsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO1FBQ3hHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEdBQUcsR0FBRyxFQUFDLENBQUMsQ0FBQztRQUM3RixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxHQUFHLEdBQUcsRUFBQyxDQUFDLENBQUM7UUFFOUYsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVuRixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6SCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3pDLElBQUksSUFBSSxDQUFDLFdBQVc7Z0JBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUN2RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUU7WUFDM0QsSUFBSSxJQUFJLENBQUMsUUFBUTtnQkFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3BHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3ZDLElBQUksSUFBSSxDQUFDLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLDhFQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxnQkFBZ0I7aUJBQ3BCLEtBQUssRUFBRTtpQkFDUCxTQUFTLENBQUMsUUFBUSxDQUFDO2lCQUNuQixLQUFLLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztpQkFDNUYsUUFBUSxFQUFFLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO1lBQ2xELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDOUIsSUFBSSxJQUFJLENBQUMsUUFBUTtnQkFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7WUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNuQixNQUFNLEVBQUUsR0FBRztnQkFDWCxNQUFNLEVBQUUsQ0FBQyxHQUFHO2dCQUNaLElBQUksRUFBRSxHQUFHO2dCQUNULFFBQVEsRUFBRSxJQUFJO2dCQUNkLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNyQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3JELENBQUM7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO1lBQ2pELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNkLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDbkIsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNsQixJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDckQsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU07SUFDTixDQUFDO0lBRU8sU0FBUztRQUNmLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNsRixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFbkYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxRixPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFMUQsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQywyREFBdUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUNqRSxNQUFNLE1BQU0sR0FBdUIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMseUNBQXlDLENBQUMsQ0FBQyxDQUFDO1FBQ3BILEtBQUssTUFBTSxLQUFLLElBQUksTUFBTTtZQUFFLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxHQUFHO2dCQUFFLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQzFFLE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsNkRBQXlCLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDL0UsTUFBTSxnQkFBZ0IsR0FBNEIsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3JILElBQUksZ0JBQWdCO1lBQUUsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQztRQUM5RCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLDJEQUF1QixDQUFDLElBQUksSUFBSSxDQUFDO1FBQzNFLE1BQU0sY0FBYyxHQUE0QixRQUFRLENBQUMsYUFBYSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFDakgsSUFBSSxjQUFjO1lBQUUsY0FBYyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUM7UUFFeEQsMEdBQTBHO1FBQzFHLHlHQUF5RztRQUN6RyxvSUFBb0k7UUFDcEksTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM3QyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RELE1BQU0sMEJBQTBCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQywwQkFBMEI7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1lBQzNHLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUdBQXVHLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0gsMEJBQTBCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN2RDtRQUVELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvRCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDcEUsSUFBSSxXQUFXLElBQUksZUFBZTtZQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xELFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3QyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxpR0FBaUc7UUFFMUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXpFLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQjtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUI7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFFdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNaLElBQUksQ0FBQyxjQUFjO1lBQ25CLElBQUksQ0FBQyxnQkFBZ0I7WUFDckIsSUFBSSxDQUFDLGNBQWM7WUFDbkIsSUFBSSxDQUFDLGlCQUFpQjtZQUN0QixJQUFJLENBQUMsYUFBYTtZQUNsQixJQUFJLENBQUMsWUFBWTtZQUNqQixJQUFJLENBQUMsY0FBYztTQUNwQixDQUFDO1FBRUYsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTs7WUFDeEIsUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtnQkFDckIsS0FBSyxxQkFBcUIsQ0FBQyxDQUFDO29CQUMxQixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ25ELE1BQU07aUJBQ1A7Z0JBQ0QsS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO29CQUN0QixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDbEMsTUFBTTtpQkFDUDtnQkFDRCxLQUFLLHVCQUF1QixDQUFDLENBQUM7b0JBQzVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDckQsTUFBTTtpQkFDUDtnQkFDRCxLQUFLLHNCQUFzQixDQUFDLENBQUM7b0JBQzNCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDcEQsTUFBTTtpQkFDUDtnQkFDRCxLQUFLLHVCQUF1QixDQUFDLENBQUM7b0JBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLG1EQUFlLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFDN0UsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDbEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUNyRCxNQUFNO2lCQUNQO2dCQUNELEtBQUssbUJBQW1CLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDakQsTUFBTTtpQkFDUDtnQkFDRCxLQUFLLGtCQUFrQixDQUFDLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ2hELE1BQU07aUJBQ1A7Z0JBQ0QsS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO29CQUN0QixJQUFJLFVBQUksQ0FBQyxjQUFjLDBDQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3JELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7cUJBQy9DO29CQUNELE1BQU07aUJBQ1A7Z0JBQ0QsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO29CQUN2QixJQUFJLFVBQUksQ0FBQyxjQUFjLDBDQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3JELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7cUJBQ2hEO29CQUNELE1BQU07aUJBQ1A7Z0JBQ0QsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO29CQUN2QixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUNoRSxNQUFNLFNBQVMsR0FBNEIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQXFCLENBQUM7b0JBQ25HLE1BQU0sSUFBSSxHQUFHLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxLQUFLLENBQUM7b0JBQzlCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksZUFBZSxFQUFFO3dCQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUV6QztvQkFDRCxNQUFNO2lCQUNQO2dCQUNELEtBQUssbUJBQW1CLENBQUMsQ0FBQztvQkFDeEIsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNyQixNQUFNLFlBQVksR0FBRyxVQUFJLENBQUMsYUFBYSwwQ0FBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQy9ELElBQUksWUFBWSxFQUFFO3dCQUNoQixZQUFZLENBQUMsT0FBTyxDQUFDLDJEQUF1QixFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO3dCQUNwRixZQUFZLENBQUMsT0FBTyxDQUFDLDZEQUF5QixFQUFFLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2hGLFlBQVksQ0FBQyxPQUFPLENBQUMsMkRBQXVCLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDNUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO3FCQUNuQjtvQkFDRCxNQUFNO2lCQUNQO2dCQUNELEtBQUssZ0JBQWdCLENBQUMsQ0FBQztvQkFDckIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNqQixNQUFNO2lCQUNQO2dCQUNELE9BQU8sQ0FBQyxDQUFDO29CQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDMUQ7YUFFRjtRQUNILENBQUMsQ0FDRixDQUFDO1FBRUYsT0FBTyxPQUFPLENBQUM7SUFFakIsQ0FBQztJQUVPLFNBQVM7UUFDZixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRU8sa0JBQWtCLENBQUMsT0FBaUI7UUFDMUMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoRSxJQUFJLFdBQVcsSUFBSSxXQUFXLEVBQUU7WUFDOUIsSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDN0IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3hDO2lCQUFNO2dCQUNMLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNyQztTQUNGO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLE9BQU8sRUFBRTtnQkFDcEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0wsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDM0I7UUFFSCxDQUFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFTyx3QkFBd0IsQ0FBQyxLQUFhO1FBQzVDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN2QixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDbEUsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzVELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUNuRSxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUMzRSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDNUQsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQXFCLENBQUM7WUFDM0UsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWxFLEtBQUssQ0FBQyxhQUFhO2dCQUNqQixDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV0RCxJQUFJLFVBQVU7Z0JBQUUsVUFBVSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNwRSxJQUFJLE9BQU87Z0JBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksbURBQWUsRUFBRSxDQUFDO1lBQ3JFLElBQUksUUFBUTtnQkFBRSxRQUFRLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUQsSUFBSSxpQkFBaUI7Z0JBQUUsaUJBQWlCLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RILElBQUksT0FBTztnQkFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyw4RUFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsaURBQWEsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsK0NBQVcsQ0FBQyxDQUFDO1lBQ2pELElBQUksVUFBVSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUMzQiw0R0FBNEc7Z0JBQzVHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQztnQkFDckQsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuRCxtSUFBbUk7Z0JBQ25JLHFLQUFxSztnQkFDckssaUpBQWlKO2dCQUNqSixZQUFZLENBQUMsT0FBTyxDQUFDLGlEQUFhLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0RCxZQUFZLENBQUMsT0FBTyxDQUFDLCtDQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2FBQ2pGO2lCQUFNLElBQUksUUFBUSxJQUFJLE1BQU0sRUFBRTtnQkFDN0IsaUJBQWlCLGFBQWpCLGlCQUFpQix1QkFBakIsaUJBQWlCLENBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDM0MsOEdBQThHO2dCQUM5RyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNqQztTQUNGO0lBQ0gsQ0FBQztJQUVPLFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBYztRQUMvQyw0SkFBNEo7UUFDNUosbUdBQW1HO1FBQ25HLDRKQUE0SjtRQUM1SixNQUFNLFdBQVcsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsbURBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQ3hGLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2pDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDeEMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxtREFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU8sY0FBYztRQUNwQiwyREFBMkQ7UUFDM0QsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU8sMEJBQTBCLENBQUMsV0FBcUI7UUFDdEQsTUFBTSx1QkFBdUIsR0FBK0IsUUFBUSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsQ0FBd0IsQ0FBQztRQUN4SSxNQUFNLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUN2RixJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSx1QkFBdUIsSUFBSSx3QkFBd0IsRUFBRTtZQUNqRixXQUFXLEdBQUcsV0FBVztpQkFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsaUNBQUssQ0FBQyxLQUFFLEtBQUssRUFBRSw4RUFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLGlEQUFhLENBQVcsSUFBRSxDQUFDO2lCQUN4SCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM5QyxNQUFNLEtBQUssR0FBZ0IsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQWdCLENBQUM7Z0JBQzFGLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDbEUsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUMxRSxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQ3BFLElBQUksV0FBVztvQkFBRSxXQUFXLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksZUFBZTtvQkFBRSxlQUFlLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3hFLElBQUksWUFBWTtvQkFBRSxZQUFZLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRS9ELHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUU3QztTQUVGO0lBQ0gsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3BaeUQ7QUFFM0MsTUFBTSxZQUFhLFNBQVEsTUFBTSxDQUFDLEtBQUs7SUFDcEQ7UUFDRSxLQUFLLENBQUMsRUFBQyxHQUFHLEVBQUUsY0FBYyxFQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU8sU0FBUztRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFO1lBQ2hDLHNEQUFzRDtZQUN0RCxzREFBc0Q7U0FDdkQsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLGlDQUFpQztZQUNqQyxpQ0FBaUM7U0FDbEMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7WUFDaEMsdUNBQXVDO1lBQ3ZDLHVDQUF1QztTQUN4QyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDdkIsa0NBQWtDO1lBQ2xDLGtDQUFrQztTQUNuQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDdkIsd0NBQXdDO1lBQ3hDLHdDQUF3QztTQUN6QyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7WUFDMUIsd0NBQXdDO1lBQ3hDLHdDQUF3QztTQUN6QyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sT0FBTztRQUNiLE1BQU0sTUFBTSxHQUFHLGtEQUFjLEdBQUcsb0RBQWdCLENBQUM7UUFDakQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVILE1BQU0sSUFBSSxHQUFHLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsOEJBQThCLElBQUksTUFBTSxFQUFFLDhCQUE4QixJQUFJLE9BQU8sQ0FBQyxDQUFDO1FBQ3RILElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxxQ0FBcUMsSUFBSSxNQUFNLEVBQUUscUNBQXFDLElBQUksT0FBTyxDQUFDLENBQUM7UUFDbEksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsaUNBQWlDLElBQUksTUFBTSxFQUFFLGlDQUFpQyxJQUFJLE9BQU8sQ0FBQyxDQUFDO0lBQ2xJLENBQUM7SUFFTyxVQUFVO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkRpQztBQUNLO0FBSWhDLE1BQU0sZUFBZTtJQU0xQixZQUFZLEtBQWdCLEVBQUUsU0FBa0I7UUFDOUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQXlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25MLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUF5QixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQztRQUMvSyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBeUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRTNMLENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUSxFQUFFLFFBQWlCO1FBQ25DLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDOUI7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLENBQVE7UUFDZCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUTtRQUNoQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN4QjtRQUVELDBDQUEwQztRQUMxQyxJQUFJLFdBQXFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2pELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMvQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxrRUFBeUIsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4RSxXQUFXLEdBQUcsT0FBTyxDQUFDO2dCQUN0QixPQUFPLEtBQUssQ0FBQyxDQUFDLG9DQUFvQzthQUNuRDtZQUNELE9BQU8sSUFBSSxDQUFDLENBQUMsc0JBQXNCO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxXQUFXLEVBQUU7WUFDZixNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDdEIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO1lBRXpCLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQyxNQUFNLEVBQUUsR0FBRyxJQUFJLHdEQUFrQixFQUFFLENBQUM7WUFDcEMsRUFBRSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUMzQixFQUFFLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUNqQixFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakcsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDaEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsRUFBRSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLDBEQUFvQixDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBb0IsQ0FBQztZQUMxRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkVEOzs7RUFHRTtBQUdnQztBQUVBO0FBRzNCLE1BQU0sVUFBVTtJQVVyQixZQUFZLEtBQWlCLEVBQUUsYUFBc0MsRUFBRSxLQUFlLEVBQUUsU0FBaUI7UUFDdkcsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFnQjtRQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDMUYsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQy9GLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUUvRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0SCxPQUFPO1lBQ0wsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDNUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsSCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRU8sUUFBUSxDQUFDLFFBQWtCO1FBQ2pDLE1BQU0sRUFBRSxHQUFpQixFQUFFLENBQUM7UUFDNUIsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUI7UUFDN0UsRUFBRSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDO1FBQ25ELEVBQUUsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN4RSxFQUFFLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkQsRUFBRSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzRCxFQUFFLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUM7UUFDakQsRUFBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUvQyxNQUFNLElBQUksR0FBMkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNmLElBQUksRUFBRSxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztZQUNwQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNwRCxDQUFDLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUV4RixDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyxXQUFXLENBQUMsSUFBZSxFQUFFLFVBQXVCO1FBQzFELE1BQU0sRUFBRSxHQUFvQixJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFFLEVBQUUsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUM7UUFDdkMsRUFBRSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUNyQyxFQUFFLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsTUFBTSxHQUFHO1lBQ1YsWUFBWSxFQUFFLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQztZQUMvQyxRQUFRLEVBQUUsVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztZQUM1QyxVQUFVLEVBQUUsVUFBVSxDQUFDLG1CQUFtQixDQUFDLElBQUksS0FBSztTQUNyRCxDQUFDO1FBRUYsTUFBTSxPQUFPLEdBQThCLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEUsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNyQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztRQUM3RCxPQUFPLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXhGLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFTyxTQUFTLENBQUMsU0FBb0I7UUFDcEMsSUFBSSxTQUFTLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO1lBQy9DLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFDMUQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUksU0FBUyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQzFELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0UsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksS0FBOEIsQ0FBQztRQUNuQyxRQUFRLFNBQVMsQ0FBQyxJQUFJLEVBQUU7WUFDdEIsS0FBSyxVQUFVLENBQUMsQ0FBQztnQkFDZixNQUFNLEVBQUUsR0FBRyxJQUFJLDJEQUFxQixFQUFFLENBQUM7Z0JBQ3ZDLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xILEVBQUUsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzFELEVBQUUsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUM7Z0JBQzVDLEVBQUUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDaEQsRUFBRSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztnQkFDMUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztnQkFDMUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoRCxFQUFFLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDO2dCQUNsRCxFQUFFLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO2dCQUMxQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLE1BQU07YUFDUDtZQUNELGlCQUFpQjtZQUNqQixzREFBc0Q7WUFDdEQsSUFBSTtZQUNKLEtBQUssVUFBVSxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLEdBQUcsSUFBSSwyREFBcUIsRUFBRSxDQUFDO2dCQUN2QyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDcEMsRUFBRSxDQUFDLFVBQVUsQ0FDWCxLQUFLLEVBQ0wsS0FBSyxFQUNMLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQ3BGLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQ3JGLENBQUM7Z0JBQ0YsRUFBRSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDMUQsRUFBRSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztnQkFDbEMsd0dBQXdHO2dCQUN4RyxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDakIsRUFBRSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDN0IsMERBQW9CLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxZQUFZLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLE1BQU07YUFDUDtZQUNELEtBQUssV0FBVyxDQUFDLENBQUM7Z0JBQ2hCLE1BQU0sRUFBRSxHQUFHLElBQUksNERBQXNCLEVBQUUsQ0FBQztnQkFDeEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDdkosRUFBRSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDMUQsRUFBRSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztnQkFDNUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoRCxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELEVBQUUsQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztnQkFDaEQsRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoRCxFQUFFLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO2dCQUNoRCxFQUFFLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO2dCQUMxQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLE1BQU07YUFDUDtZQUNELEtBQUssT0FBTyxDQUFDLENBQUM7Z0JBQ1osTUFBTSxFQUFFLEdBQUcsSUFBSSx3REFBa0IsRUFBRSxDQUFDO2dCQUNwQyxzRUFBc0U7Z0JBQ3RFLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN2RyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxRCxFQUFFLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2hELEVBQUUsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xELEVBQUUsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7Z0JBQzFDLDBEQUFvQixDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsZUFBZSxJQUFJLENBQUMsRUFBRSxTQUFTLENBQUMsa0JBQWtCLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoSCxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLE1BQU07YUFDUDtZQUNELEtBQUssVUFBVSxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLEdBQUcsSUFBSSwyREFBcUIsRUFBRSxDQUFDO2dCQUN2QyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsSCxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxRCxFQUFFLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO2dCQUN0QyxFQUFFLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO2dCQUN4QyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLE1BQU07YUFDUDtZQUNELEtBQUssTUFBTSxDQUFDLENBQUM7Z0JBQ1gsTUFBTSxFQUFFLEdBQUcsSUFBSSx1REFBaUIsRUFBRSxDQUFDO2dCQUNuQyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsSCxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxRCxFQUFFLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO2dCQUM1QywyREFBcUIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLFlBQVksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JHLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkMsTUFBTTthQUNQO1lBQ0Q7Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEU7UUFFRCxLQUFLLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDNUIsS0FBSyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7UUFDMUQsS0FBSyxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVwRixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxTQUFTLENBQUMsU0FBb0I7UUFDcEMsTUFBTSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUMsR0FBRyxTQUFTLENBQUM7UUFDdkcsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9GLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLDZJQUE2STtRQUM3SSwyS0FBMks7UUFDM0ssMkRBQTJEO1FBQzNELE1BQU0sZUFBZSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN4RyxNQUFNLEdBQUcsR0FBc0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLElBQUksZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQy9KLEdBQUcsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDbkQsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQztRQUN0QyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNqQixHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFCLGFBQWE7UUFDYixHQUFHLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4QyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLElBQUksRUFBRSxDQUFDO1FBQzlDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDaEYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBRUgsbUJBQW1CO0lBRWpCLFFBQVEsQ0FBQyxHQUFnQixFQUFFLFNBQWdCLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO1FBQ3JELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzlFLENBQUM7SUFFRCxVQUFVLENBQUMsR0FBZ0I7UUFDekIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLCtDQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksK0NBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELGVBQWUsQ0FBQyxJQUFJO1FBQ2xCLE1BQU0sTUFBTSxHQUFnQixFQUFFLENBQUM7UUFDL0IsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3JFLElBQUksQ0FBQyxJQUFJO2dCQUFFLFNBQVM7WUFDcEIsYUFBYTtZQUNiLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJO2dCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0M7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQseUJBQXlCLENBQUMsWUFBcUMsRUFBRSxZQUFvQixFQUFFLFlBQXFCO1FBQzFHLE1BQU0sTUFBTSxHQUFnQixFQUFFLENBQUM7UUFFL0IsS0FBSyxJQUFJLElBQUksR0FBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3hFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCO2dCQUFFLFNBQVM7WUFDOUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQztvQkFDbEQsU0FBUztnQkFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7b0JBQ3hELFNBQVM7Z0JBQ1gsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLFlBQVk7b0JBQy9DLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxZQUFZLEVBQUUsaUNBQWlDO29CQUN6RixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3JCO1NBQ0Y7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsMkJBQTJCLENBQUMsWUFBcUMsRUFBRSxZQUFvQixFQUFFLFlBQXFCO1FBQzVHLE1BQU0sUUFBUSxHQUFtQixFQUFFLENBQUM7UUFFcEMsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3JFLEtBQUssSUFBSSxPQUFPLEdBQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNqRixJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQjtvQkFBRSxTQUFTO2dCQUNwRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO3dCQUFFLFNBQVM7b0JBQ2xFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQzt3QkFBRSxTQUFTO29CQUN4RSxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksWUFBWTt3QkFDbEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLFlBQVksRUFBRSxpQ0FBaUM7d0JBQzVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzFCO2FBQ0Y7U0FDRjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxZQUFxQyxFQUFFLFlBQW9CLEVBQUUsWUFBcUI7UUFDMUcsTUFBTSxNQUFNLEdBQWlCLEVBQUUsQ0FBQztRQUVoQyxLQUFLLElBQUksS0FBSyxHQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0UsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0I7Z0JBQUUsU0FBUztZQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO29CQUNuRCxTQUFTO2dCQUNYLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztvQkFDekQsU0FBUztnQkFDWCxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksWUFBWTtvQkFDaEQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLFlBQVksRUFBRSxpQ0FBaUM7b0JBQzFGLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxvRUFBb0U7SUFDcEUsaUJBQWlCLENBQWMsTUFBa0IsRUFBRSxZQUFxQyxFQUFFLFlBQW9CLEVBQUUsWUFBZTtRQUM3SCxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQjtZQUFFLE9BQU8sWUFBWSxDQUFDO1FBQ2xELEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7Z0JBQUUsU0FBUztZQUMvRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssWUFBWTtnQkFBRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQWlCLENBQUM7U0FDM0U7UUFDRCxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBRU8sMEJBQTBCLENBQUMsZ0JBQXNDO1FBQ3ZFLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzFDLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7Z0JBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2lCQUNsRCxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztpQkFDM0QsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztnQkFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7aUJBQzdELElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7Z0JBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO2lCQUMzRCxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztpQkFDekQsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQztnQkFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOztnQkFDeEUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVPLHNCQUFzQixDQUFDLFVBQXVCLEVBQUUsSUFBZTtRQUNyRSxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUM1RCxNQUFNLEtBQUssR0FBRyxJQUFJLHNEQUFnQixFQUFFLENBQUM7WUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hGLHlDQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNHLE9BQU8sRUFBQyxLQUFLLEVBQUMsQ0FBQztTQUNoQjthQUFNLElBQUksVUFBVSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQ3JFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQyxJQUFJLHlDQUFLLEVBQUU7Z0JBQ1QsTUFBTSxPQUFPLEdBQUcsS0FBSztxQkFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLCtDQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDcEcsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM5RDtZQUNELE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSx1REFBaUIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUM7U0FDbEU7YUFBTSxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRTtZQUNqRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkMsSUFBSSx5Q0FBSyxFQUFFO2dCQUNULE1BQU0sT0FBTyxHQUFHLEtBQUs7cUJBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSwrQ0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7cUJBQ3BHLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4RDtZQUNELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQzlJLDZIQUE2SDtZQUM3SCxNQUFNLEtBQUssR0FBRyxNQUFNO2dCQUNsQixDQUFDLENBQUMsSUFBSSxxREFBZSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUN2RCxDQUFDLENBQUMsSUFBSSxxREFBZSxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNuSixPQUFPLEVBQUMsS0FBSyxFQUFDLENBQUM7U0FDaEI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztTQUMxRDtJQUNILENBQUM7SUFFTywyQkFBMkIsQ0FBQyxRQUFzQztRQUN4RSxNQUFNLEtBQUssR0FBWSxFQUFFLENBQUM7UUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtZQUN4Qyw0RUFBNEU7WUFDNUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLCtDQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxJQUFJLENBQUMsR0FBWTtRQUN2QixPQUFPLE9BQU8sQ0FBQyxHQUFHLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoWG9FO0FBRTlELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxLQUFhLEVBQVUsRUFBRTtJQUMzRCxPQUFPLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsbURBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsOERBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RJLENBQUMsQ0FBQzs7Ozs7OztVQ0xGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7Ozs7V0N6QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSwrQkFBK0Isd0NBQXdDO1dBQ3ZFO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLHFCQUFxQjtXQUN0QztXQUNBO1dBQ0Esa0JBQWtCLHFCQUFxQjtXQUN2QztXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0MzQkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NIQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9ub2RlX21vZHVsZXMvZ2FtZXN0YXRzLmpzL2J1aWxkLyBsYXp5IF5cXC5cXC9nYW1lc3RhdHNcXC0uKlxcLm1vZHVsZVxcLmpzJCBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL0JhY2tkcm9wLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL1BoeXNpY3MudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL2NvbXBvbmVudHMvUGxheWVyQ29udHJvbGxlci50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvY29tcG9uZW50cy9Tbm93Ym9hcmQudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL2NvbXBvbmVudHMvU3RhdGUudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL2NvbXBvbmVudHMvVGVycmFpbi50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL3NjZW5lcy9HYW1lU2NlbmUudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL3NjZW5lcy9HYW1lVUlTY2VuZS50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvc2NlbmVzL1ByZWxvYWRTY2VuZS50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvdXRpbC9EZWJ1Z01vdXNlSm9pbnQudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL3V0aWwvUlVCRS9SdWJlTG9hZGVyLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy91dGlsL2NhbGN1bGF0ZVRvdGFsU2NvcmUudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9ydW50aW1lL2Vuc3VyZSBjaHVuayIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBtYXAgPSB7XG5cdFwiLi9nYW1lc3RhdHMtcGl4aS5tb2R1bGUuanNcIjogW1xuXHRcdFwiLi9ub2RlX21vZHVsZXMvZ2FtZXN0YXRzLmpzL2J1aWxkL2dhbWVzdGF0cy1waXhpLm1vZHVsZS5qc1wiLFxuXHRcdFwidmVuZG9yc1wiXG5cdF1cbn07XG5mdW5jdGlvbiB3ZWJwYWNrQXN5bmNDb250ZXh0KHJlcSkge1xuXHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1hcCwgcmVxKSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHRcdHRocm93IGU7XG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgaWRzID0gbWFwW3JlcV0sIGlkID0gaWRzWzBdO1xuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5lKGlkc1sxXSkudGhlbigoKSA9PiB7XG5cdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oaWQpO1xuXHR9KTtcbn1cbndlYnBhY2tBc3luY0NvbnRleHQua2V5cyA9ICgpID0+IChPYmplY3Qua2V5cyhtYXApKTtcbndlYnBhY2tBc3luY0NvbnRleHQuaWQgPSBcIi4vbm9kZV9tb2R1bGVzL2dhbWVzdGF0cy5qcy9idWlsZCBsYXp5IHJlY3Vyc2l2ZSBeXFxcXC5cXFxcL2dhbWVzdGF0c1xcXFwtLipcXFxcLm1vZHVsZVxcXFwuanMkXCI7XG5tb2R1bGUuZXhwb3J0cyA9IHdlYnBhY2tBc3luY0NvbnRleHQ7IiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0IHtzdGF0c30gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBCYWNrZHJvcCB7XHJcbiAgcHJpdmF0ZSBzY2VuZTogR2FtZVNjZW5lO1xyXG5cclxuICBwcml2YXRlIGJnU3BhY2VCYWNrOiBQaGFzZXIuR2FtZU9iamVjdHMuVGlsZVNwcml0ZTtcclxuICBwcml2YXRlIGJnU3BhY2VNaWQ6IFBoYXNlci5HYW1lT2JqZWN0cy5UaWxlU3ByaXRlO1xyXG4gIHByaXZhdGUgYmdTcGFjZUZyb250OiBQaGFzZXIuR2FtZU9iamVjdHMuVGlsZVNwcml0ZTtcclxuXHJcbiAgY29uc3RydWN0b3Ioc2NlbmU6IEdhbWVTY2VuZSkge1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy5iZ1NwYWNlQmFjayA9IHRoaXMucmVnaXN0ZXJMYXllcignYmdfc3BhY2VfYmFjay5wbmcnKTtcclxuICAgIHRoaXMuYmdTcGFjZU1pZCA9IHRoaXMucmVnaXN0ZXJMYXllcignYmdfc3BhY2VfbWlkLnBuZycpO1xyXG4gICAgdGhpcy5iZ1NwYWNlRnJvbnQgPSB0aGlzLnJlZ2lzdGVyTGF5ZXIoJ2JnX3NwYWNlX2Zyb250LnBuZycpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgc3RhdHMuYmVnaW4oJ2JhY2tkcm9wJyk7XHJcbiAgICBjb25zdCB7c2Nyb2xsWCwgc2Nyb2xsWX0gPSB0aGlzLnNjZW5lLmNhbWVyYXMubWFpbjtcclxuICAgIHRoaXMuYmdTcGFjZUJhY2suc2V0VGlsZVBvc2l0aW9uKHNjcm9sbFggKiAwLjAwNSwgc2Nyb2xsWSAqIDAuMDA1KTtcclxuICAgIHRoaXMuYmdTcGFjZU1pZC5zZXRUaWxlUG9zaXRpb24oc2Nyb2xsWCAqIDAuMDEsIHNjcm9sbFkgKiAwLjAxKTtcclxuICAgIHRoaXMuYmdTcGFjZUZyb250LnNldFRpbGVQb3NpdGlvbihzY3JvbGxYICogMC4wMjUsIHNjcm9sbFkgKiAwLjAyNSk7XHJcbiAgICBzdGF0cy5lbmQoJ2JhY2tkcm9wJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlZ2lzdGVyTGF5ZXIoa2V5OiBzdHJpbmcsIHNjYWxlWDogbnVtYmVyID0gMSwgc2NhbGVZOiBudW1iZXIgPSAxKTogUGguR2FtZU9iamVjdHMuVGlsZVNwcml0ZSB7XHJcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgem9vbVgsIHpvb21ZLCB3b3JsZFZpZXd9ID0gdGhpcy5zY2VuZS5jYW1lcmFzLm1haW47XHJcbiAgICByZXR1cm4gdGhpcy5zY2VuZS5hZGQudGlsZVNwcml0ZSh3b3JsZFZpZXcueCArIHdpZHRoIC8gMiwgd29ybGRWaWV3LnkgKyBoZWlnaHQgLyAyLCB3aWR0aCwgaGVpZ2h0LCAnYmdfc3BhY2VfcGFjaycsIGtleSlcclxuICAgIC5zZXRPcmlnaW4oMC41LCAwLjUpXHJcbiAgICAuc2V0U2Nyb2xsRmFjdG9yKDAsIDApXHJcbiAgICAuc2V0U2NhbGUoc2NhbGVYICogKDEgLyB6b29tWCksIHNjYWxlWSAqICgxIC8gem9vbVkpKVxyXG4gICAgLnNldERlcHRoKC0yMDApO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7c3RhdHN9IGZyb20gJy4uL2luZGV4JztcclxuaW1wb3J0IEdhbWVTY2VuZSBmcm9tICcuLi9zY2VuZXMvR2FtZVNjZW5lJztcclxuaW1wb3J0IHtSdWJlU2NlbmV9IGZyb20gJy4uL3V0aWwvUlVCRS9SdWJlTG9hZGVySW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7UnViZUxvYWRlcn0gZnJvbSAnLi4vdXRpbC9SVUJFL1J1YmVMb2FkZXInO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBQaHlzaWNzIGV4dGVuZHMgUGhhc2VyLkV2ZW50cy5FdmVudEVtaXR0ZXIge1xyXG4gIGlzUGF1c2VkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgd29ybGRTY2FsZTogbnVtYmVyO1xyXG4gIHdvcmxkOiBQbC5iMldvcmxkO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NlbmU6IEdhbWVTY2VuZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHN0ZXBEZWx0YVRpbWUgPSAxIC8gNjA7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzdGVwQ29uZmlnID0ge3Bvc2l0aW9uSXRlcmF0aW9uczogMTIsIHZlbG9jaXR5SXRlcmF0aW9uczogMTJ9O1xyXG4gIGRlYnVnRHJhdzogUGguR2FtZU9iamVjdHMuR3JhcGhpY3M7XHJcbiAgcnViZUxvYWRlcjogUnViZUxvYWRlcjtcclxuXHJcbiAgY29uc3RydWN0b3Ioc2NlbmU6IEdhbWVTY2VuZSwgd29ybGRTY2FsZTogbnVtYmVyLCBncmF2aXR5OiBQbC5iMlZlYzIpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLmRlYnVnRHJhdyA9IHNjZW5lLmFkZC5ncmFwaGljcygpO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy53b3JsZFNjYWxlID0gd29ybGRTY2FsZTtcclxuICAgIHRoaXMud29ybGQgPSBQbC5iMldvcmxkLkNyZWF0ZShncmF2aXR5KTtcclxuICAgIHRoaXMud29ybGQuU2V0QXV0b0NsZWFyRm9yY2VzKHRydWUpO1xyXG4gICAgdGhpcy53b3JsZC5TZXRDb250YWN0TGlzdGVuZXIoe1xyXG4gICAgICBCZWdpbkNvbnRhY3Q6IGNvbnRhY3QgPT4gdGhpcy5lbWl0KCdiZWdpbl9jb250YWN0JywgY29udGFjdCksXHJcbiAgICAgIEVuZENvbnRhY3Q6ICgpID0+IG51bGwsXHJcbiAgICAgIFByZVNvbHZlOiAoKSA9PiBudWxsLFxyXG4gICAgICBQb3N0U29sdmU6IChjb250YWN0LCBpbXB1bHNlKSA9PiB0aGlzLmVtaXQoJ3Bvc3Rfc29sdmUnLCBjb250YWN0LCBpbXB1bHNlKSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHNjZW5lSnNvOiBSdWJlU2NlbmUgPSB0aGlzLnNjZW5lLmNhY2hlLmpzb24uZ2V0KCdzYW50YScpO1xyXG4gICAgdGhpcy5ydWJlTG9hZGVyID0gbmV3IFJ1YmVMb2FkZXIodGhpcy53b3JsZCwgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKSwgdGhpcy5zY2VuZSwgdGhpcy53b3JsZFNjYWxlKTtcclxuXHJcbiAgICBpZiAodGhpcy5ydWJlTG9hZGVyLmxvYWRTY2VuZShzY2VuZUpzbykpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdSVUJFIHNjZW5lIGxvYWRlZCBzdWNjZXNzZnVsbHkuJyk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgUlVCRSBzY2VuZScpO1xyXG4gICAgdGhpcy51cGRhdGUoKTsgLy8gbmVlZHMgdG8gaGFwcGVuIGJlZm9yZSB1cGRhdGUgb2Ygc25vd21hbiBvdGhlcndpc2UgYjJCb2R5LkdldFBvc2l0aW9uKCkgaW5hY2N1cmF0ZVxyXG5cclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGlmICh0aGlzLmlzUGF1c2VkKSByZXR1cm47XHJcblxyXG4gICAgc3RhdHMuYmVnaW4oJ3BoeXNpY3MnKTtcclxuICAgIC8vIGNvbnN0IGl0ZXJhdGlvbnMgPSBNYXRoLmZsb29yKE1hdGgubWF4KHRoaXMuc2NlbmUuZ2FtZS5sb29wLmFjdHVhbEZwcyAvIDMsIDkpKTtcclxuICAgIHRoaXMud29ybGQuU3RlcCh0aGlzLnN0ZXBEZWx0YVRpbWUsIHRoaXMuc3RlcENvbmZpZyk7XHJcbiAgICAvLyB0aGlzLndvcmxkLkNsZWFyRm9yY2VzKCk7IC8vIHJlY29tbWVuZGVkIGFmdGVyIGVhY2ggdGltZSBzdGVwIGlmIGZsYWcgbm90IHNldCB3aGljaCBkb2VzIGl0IGF1dG9tYXRpY2FsbHlcclxuXHJcbiAgICAvLyBpdGVyYXRlIHRocm91Z2ggYWxsIGJvZGllc1xyXG4gICAgY29uc3Qgd29ybGRTY2FsZSA9IHRoaXMud29ybGRTY2FsZTtcclxuICAgIGZvciAobGV0IGJvZHkgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlO1xyXG4gICAgICBsZXQgYm9keVJlcHJlc2VudGF0aW9uID0gYm9keS5HZXRVc2VyRGF0YSgpIGFzIFBoLkdhbWVPYmplY3RzLkltYWdlO1xyXG4gICAgICBpZiAoIWJvZHlSZXByZXNlbnRhdGlvbikgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoYm9keVJlcHJlc2VudGF0aW9uKSB7XHJcbiAgICAgICAgaWYgKGJvZHkuSXNFbmFibGVkKCkpIHtcclxuICAgICAgICAgIC8vIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICBsZXQge3gsIHl9ID0gYm9keS5HZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgIWJvZHlSZXByZXNlbnRhdGlvbi52aXNpYmxlICYmIGJvZHlSZXByZXNlbnRhdGlvbi5zZXRWaXNpYmxlKHRydWUpO1xyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnggPSB4ICogd29ybGRTY2FsZTtcclxuICAgICAgICAgIGJvZHlSZXByZXNlbnRhdGlvbi55ID0geSAqIC13b3JsZFNjYWxlO1xyXG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnJvdGF0aW9uID0gLWJvZHkuR2V0QW5nbGUoKSArIChib2R5UmVwcmVzZW50YXRpb24uY3VzdG9tX29yaWdpbl9hbmdsZSB8fCAwKTsgLy8gaW4gcmFkaWFucztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnNldFZpc2libGUoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGltYWdlJywgYm9keS5HZXRQb3NpdGlvbigpLCBib2R5Lm5hbWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0cy5lbmQoJ3BoeXNpY3MnKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0ICogYXMgUGwgZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQge1BoeXNpY3N9IGZyb20gJy4vUGh5c2ljcyc7XHJcbmltcG9ydCB7REVCVUcsIHN0YXRzfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi4vc2NlbmVzL0dhbWVTY2VuZSc7XHJcbmltcG9ydCB7V2lja2VkU25vd2JvYXJkfSBmcm9tICcuL1Nub3dib2FyZCc7XHJcbmltcG9ydCB7U3RhdGV9IGZyb20gJy4vU3RhdGUnO1xyXG5pbXBvcnQge1J1YmVFbnRpdHl9IGZyb20gJy4uL3V0aWwvUlVCRS9SdWJlTG9hZGVySW50ZXJmYWNlcyc7XHJcbmltcG9ydCB7RGVidWdNb3VzZUpvaW50fSBmcm9tICcuLi91dGlsL0RlYnVnTW91c2VKb2ludCc7XHJcbmltcG9ydCB7UGFuZWxJZHN9IGZyb20gJy4uL3NjZW5lcy9HYW1lVUlTY2VuZSc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFBsYXllckNvbnRyb2xsZXIge1xyXG4gIHJlYWRvbmx5IHNjZW5lOiBHYW1lU2NlbmU7XHJcbiAgcmVhZG9ubHkgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY3Vyc29yczogUGguVHlwZXMuSW5wdXQuS2V5Ym9hcmQuQ3Vyc29yS2V5cztcclxuXHJcbiAgcGFydHM6IElCb2R5UGFydHM7XHJcbiAgYm9hcmQ6IFdpY2tlZFNub3dib2FyZDtcclxuICBzdGF0ZTogU3RhdGU7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkganVtcEZvcmNlOiBudW1iZXIgPSA2NTAgKiA2MDtcclxuICBwcml2YXRlIGxlYW5Gb3JjZTogbnVtYmVyID0gMi41ICogNjA7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBqdW1wVmVjdG9yOiBQbC5iMlZlYzIgPSBuZXcgUGwuYjJWZWMyKDAsIDApO1xyXG4gIHByaXZhdGUgZGVidWdDb250cm9sczogUGhhc2VyLkNhbWVyYXMuQ29udHJvbHMuU21vb3RoZWRLZXlDb250cm9sO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCBiMlBoeXNpY3M6IFBoeXNpY3MpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuYjJQaHlzaWNzID0gYjJQaHlzaWNzO1xyXG4gICAgdGhpcy5jdXJzb3JzID0gdGhpcy5zY2VuZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcbiAgICB0aGlzLnNjZW5lLm9ic2VydmVyLm9uKCdwYXVzZV9nYW1lX2ljb25fcHJlc3NlZCcsICgpID0+IHRoaXMucGF1c2VHYW1lKCkpO1xyXG4gICAgdGhpcy5zY2VuZS5vYnNlcnZlci5vbignaG93X3RvX3BsYXlfaWNvbl9wcmVzc2VkJywgKCkgPT4gdGhpcy5wYXVzZUdhbWUoUGFuZWxJZHMuUEFORUxfSE9XX1RPX1BMQVkpKTtcclxuICAgIHRoaXMuc2NlbmUuaW5wdXQua2V5Ym9hcmQub24oJ2tleWRvd24tRVNDJywgKCkgPT4gdGhpcy5wYXVzZUdhbWUoKSk7XHJcbiAgICB0aGlzLmN1cnNvcnMuc3BhY2Uub24oJ2Rvd24nLCAoKSA9PiB0aGlzLnBhdXNlR2FtZSgpKTtcclxuICAgIHRoaXMuc2NlbmUub2JzZXJ2ZXIub24oJ3Jlc3VtZV9nYW1lJywgKCkgPT4gdGhpcy5iMlBoeXNpY3MuaXNQYXVzZWQgPSBmYWxzZSk7XHJcblxyXG4gICAgdGhpcy5jdXJzb3JzLnVwLm9uKCdkb3duJywgKCkgPT4ge1xyXG4gICAgICAvLyBUT0RPIHNpbXBsaWZ5XHJcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0NyYXNoZWQgJiYgIXRoaXMuc3RhdGUubGV2ZWxGaW5pc2hlZCAmJiB0aGlzLnN0YXRlLmdldFN0YXRlKCkgPT09ICdncm91bmRlZCcgJiYgdGhpcy5zY2VuZS5nYW1lLmdldFRpbWUoKSAtIHRoaXMuY3Vyc29ycy51cC50aW1lRG93biA8PSAyNTAgJiYgIXRoaXMuYjJQaHlzaWNzLmlzUGF1c2VkKSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5vYnNlcnZlci5lbWl0KCdqdW1wX3N0YXJ0Jyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuaW5pdEJvZHlQYXJ0cygpO1xyXG4gICAgdGhpcy5ib2FyZCA9IG5ldyBXaWNrZWRTbm93Ym9hcmQodGhpcyk7XHJcbiAgICB0aGlzLnN0YXRlID0gbmV3IFN0YXRlKHRoaXMpO1xyXG5cclxuICAgIGlmIChERUJVRykge1xyXG4gICAgICBuZXcgRGVidWdNb3VzZUpvaW50KHNjZW5lLCBiMlBoeXNpY3MpO1xyXG4gICAgICB0aGlzLnNjZW5lLmNhbWVyYXMubWFpbi51c2VCb3VuZHMgPSBmYWxzZTtcclxuICAgICAgdGhpcy5kZWJ1Z0NvbnRyb2xzID0gbmV3IFBoYXNlci5DYW1lcmFzLkNvbnRyb2xzLlNtb290aGVkS2V5Q29udHJvbCh7XHJcbiAgICAgICAgY2FtZXJhOiB0aGlzLnNjZW5lLmNhbWVyYXMubWFpbixcclxuICAgICAgICBsZWZ0OiB0aGlzLnNjZW5lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuSW5wdXQuS2V5Ym9hcmQuS2V5Q29kZXMuQSksXHJcbiAgICAgICAgcmlnaHQ6IHRoaXMuY3Vyc29ycy5yaWdodCxcclxuICAgICAgICB1cDogdGhpcy5zY2VuZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLklucHV0LktleWJvYXJkLktleUNvZGVzLlcpLFxyXG4gICAgICAgIGRvd246IHRoaXMuc2NlbmUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5JbnB1dC5LZXlib2FyZC5LZXlDb2Rlcy5TKSxcclxuICAgICAgICB6b29tSW46IHRoaXMuc2NlbmUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5JbnB1dC5LZXlib2FyZC5LZXlDb2Rlcy5RKSxcclxuICAgICAgICB6b29tT3V0OiB0aGlzLnNjZW5lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuSW5wdXQuS2V5Ym9hcmQuS2V5Q29kZXMuRSksXHJcbiAgICAgICAgYWNjZWxlcmF0aW9uOiAwLjA1LFxyXG4gICAgICAgIGRyYWc6IDAuMDAxNSxcclxuICAgICAgICBtYXhTcGVlZDogMS4wLFxyXG4gICAgICAgIHpvb21TcGVlZDogMC4wMDUsXHJcbiAgICAgICAgbWF4Wm9vbTogMC43NSxcclxuICAgICAgICBtaW5ab29tOiAwLjEsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXVzZUdhbWUoYWN0aXZlUGFuZWw6IFBhbmVsSWRzID0gUGFuZWxJZHMuUEFORUxfUEFVU0VfTUVOVSkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDcmFzaGVkIHx8IHRoaXMuc3RhdGUubGV2ZWxGaW5pc2hlZCkgcmV0dXJuOyAvLyBjYW4gb25seSBwYXVzZSBkdXJpbmcgYW4gYWN0aXZlIHJ1bi4gQWZ0ZXIgY3Jhc2ggb3IgZmluaXNoLCB0aGUgXCJZb3VyIHNjb3JlXCIgcGFuZWwgaXMgc2hvd24uXHJcbiAgICB0aGlzLmIyUGh5c2ljcy5pc1BhdXNlZCA9ICF0aGlzLmIyUGh5c2ljcy5pc1BhdXNlZDtcclxuICAgIHRoaXMuc2NlbmUub2JzZXJ2ZXIuZW1pdCgndG9nZ2xlX3BhdXNlJywgdGhpcy5iMlBoeXNpY3MuaXNQYXVzZWQsIGFjdGl2ZVBhbmVsKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YTogbnVtYmVyKSB7XHJcbiAgICBpZiAodGhpcy5iMlBoeXNpY3MuaXNQYXVzZWQpIHJldHVybjtcclxuICAgIHN0YXRzLmJlZ2luKCdzbm93bWFuJyk7XHJcbiAgICB0aGlzLmRlYnVnQ29udHJvbHMgJiYgdGhpcy5kZWJ1Z0NvbnRyb2xzLnVwZGF0ZShkZWx0YSk7XHJcblxyXG4gICAgdGhpcy5zdGF0ZS51cGRhdGUoZGVsdGEpO1xyXG4gICAgdGhpcy5zdGF0ZS5pc0NyYXNoZWQgJiYgdGhpcy5kZXRhY2hCb2FyZCgpOyAvLyBqb2ludHMgY2Fubm90IGJlIGRlc3Ryb3llZCB3aXRoaW4gcG9zdC1zb2x2ZSBjYWxsYmFja1xyXG4gICAgdGhpcy5ib2FyZC5nZXRUaW1lSW5BaXIoKSA+IDEwMCAmJiB0aGlzLnJlc2V0TGVncygpO1xyXG5cclxuICAgIGlmICghdGhpcy5zdGF0ZS5pc0NyYXNoZWQgJiYgIXRoaXMuc3RhdGUubGV2ZWxGaW5pc2hlZCkge1xyXG4gICAgICB0aGlzLmJvYXJkLnVwZGF0ZShkZWx0YSk7XHJcbiAgICAgIC8vIFRvdWNoL01vdXNlIGlucHV0XHJcbiAgICAgIGlmICh0aGlzLnNjZW5lLmlucHV0LmFjdGl2ZVBvaW50ZXI/LmlzRG93biAmJiB0aGlzLnNjZW5lLmlucHV0LmFjdGl2ZVBvaW50ZXIud2FzVG91Y2gpIHtcclxuICAgICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5zY2VuZS5pbnB1dC5hY3RpdmVQb2ludGVyOyAvLyBhY3RpdmVQb2ludGVyIHVuZGVmaW5lZCB1bnRpbCBhZnRlciBmaXJzdCB0b3VjaCBpbnB1dFxyXG4gICAgICAgIHBvaW50ZXIubW90aW9uRmFjdG9yID0gMC4yO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuaW5wdXQuYWN0aXZlUG9pbnRlci54IDwgdGhpcy5zY2VuZS5jYW1lcmFzLm1haW4ud2lkdGggLyAyID8gdGhpcy5sZWFuQmFja3dhcmQoZGVsdGEpIDogdGhpcy5sZWFuRm9yd2FyZChkZWx0YSk7XHJcbiAgICAgICAgcG9pbnRlci52ZWxvY2l0eS55IDwgLTMwICYmIHRoaXMuc2NlbmUuZ2FtZS5nZXRUaW1lKCkgLSBwb2ludGVyLm1vdmVUaW1lIDw9IDI1MCAmJiB0aGlzLmp1bXAoZGVsdGEpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2NlbmUuaW5wdXQuYWN0aXZlUG9pbnRlci5tb3Rpb25GYWN0b3IgPSAwLjg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEtleWJvYXJkIGlucHV0XHJcbiAgICAgIHRoaXMuY3Vyc29ycy51cC5pc0Rvd24gJiYgdGhpcy5sZWFuVXAoZGVsdGEpO1xyXG4gICAgICB0aGlzLmN1cnNvcnMubGVmdC5pc0Rvd24gJiYgdGhpcy5sZWFuQmFja3dhcmQoZGVsdGEpO1xyXG4gICAgICB0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duICYmIHRoaXMubGVhbkZvcndhcmQoZGVsdGEpO1xyXG4gICAgICB0aGlzLmN1cnNvcnMuZG93bi5pc0Rvd24gJiYgdGhpcy5sZWFuQ2VudGVyKGRlbHRhKTtcclxuICAgICAgdGhpcy5jdXJzb3JzLnVwLmlzRG93biAmJiB0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpIC0gdGhpcy5jdXJzb3JzLnVwLnRpbWVEb3duIDw9IDI1MCAmJiB0aGlzLmp1bXAoZGVsdGEpO1xyXG4gICAgfVxyXG4gICAgc3RhdHMuZW5kKCdzbm93bWFuJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRldGFjaEJvYXJkKCkge1xyXG4gICAgdGhpcy5wYXJ0cy5iaW5kaW5nTGVmdCAmJiB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Sm9pbnQodGhpcy5wYXJ0cy5iaW5kaW5nTGVmdCk7XHJcbiAgICB0aGlzLnBhcnRzLmJpbmRpbmdSaWdodCAmJiB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Sm9pbnQodGhpcy5wYXJ0cy5iaW5kaW5nUmlnaHQpO1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ0xlZnQgJiYgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0KTtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdSaWdodCAmJiB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Sm9pbnQodGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ1JpZ2h0KTtcclxuICAgIHRoaXMucGFydHMud2VsZENlbnRlciAmJiB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Sm9pbnQodGhpcy5wYXJ0cy53ZWxkQ2VudGVyKTtcclxuICAgIHRoaXMucGFydHMucHJpc21hdGljICYmIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLnBhcnRzLnByaXNtYXRpYyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGp1bXAoZGVsdGE6IG51bWJlcikge1xyXG4gICAgLy8gcHJldmVudHMgcGxheWVyIGZyb20ganVtcGluZyB0b28gcXVpY2tseSBhZnRlciBhIGxhbmRpbmdcclxuICAgIGlmICh0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpIC0gdGhpcy5zdGF0ZS50aW1lR3JvdW5kZWQgPCAxMDApIHJldHVybjsgLy8gVE9ETyBjaGFuZ2UgdG8gbnVtU3RlcHNHcm91bmRlZFxyXG5cclxuICAgIHRoaXMubGVhblVwKGRlbHRhKTtcclxuXHJcbiAgICBjb25zdCB7aXNUYWlsR3JvdW5kZWQsIGlzQ2VudGVyR3JvdW5kZWQsIGlzTm9zZUdyb3VuZGVkfSA9IHRoaXMuYm9hcmQ7XHJcbiAgICBpZiAoaXNDZW50ZXJHcm91bmRlZCB8fCBpc1RhaWxHcm91bmRlZCB8fCBpc05vc2VHcm91bmRlZCkge1xyXG4gICAgICBjb25zdCBmb3JjZSA9IHRoaXMuanVtcEZvcmNlICogZGVsdGE7XHJcbiAgICAgIGNvbnN0IGp1bXBWZWN0b3IgPSB0aGlzLmp1bXBWZWN0b3IuU2V0KDAsIDApO1xyXG4gICAgICBpc0NlbnRlckdyb3VuZGVkXHJcbiAgICAgICAgPyB0aGlzLnBhcnRzLmJvZHkuR2V0V29ybGRWZWN0b3Ioe3g6IDAsIHk6IGZvcmNlICogMC4zfSwganVtcFZlY3RvcikuQWRkKHt4OiAwLCB5OiBmb3JjZSAqIDEuMjV9KVxyXG4gICAgICAgIDogdGhpcy5wYXJ0cy5ib2R5LkdldFdvcmxkVmVjdG9yKHt4OiAwLCB5OiBmb3JjZSAqIDAuNX0sIGp1bXBWZWN0b3IpLkFkZCh7eDogMCwgeTogZm9yY2UgKiAwLjg1fSk7XHJcbiAgICAgIHRoaXMucGFydHMuYm9keS5BcHBseUZvcmNlVG9DZW50ZXIoanVtcFZlY3RvciwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0TGVncygpIHtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC42NSk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQ/LlNldExlbmd0aCgwLjY1KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbGVhbkJhY2t3YXJkKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC41NSk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQ/LlNldExlbmd0aCgwLjgpO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgdGhpcy5wYXJ0cy53ZWxkQ2VudGVyLm1fcmVmZXJlbmNlQW5nbGUgPSBNYXRoLlBJIC8gMTgwICogLTEwO1xyXG4gICAgdGhpcy5wYXJ0cy5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UodGhpcy5sZWFuRm9yY2UgKiBkZWx0YSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxlYW5Gb3J3YXJkKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC44KTtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdSaWdodD8uU2V0TGVuZ3RoKDAuNTUpO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgdGhpcy5wYXJ0cy53ZWxkQ2VudGVyLm1fcmVmZXJlbmNlQW5nbGUgPSBNYXRoLlBJIC8gMTgwICogMTA7XHJcbiAgICB0aGlzLnBhcnRzLmJvZHkuQXBwbHlBbmd1bGFySW1wdWxzZSgtdGhpcy5sZWFuRm9yY2UgKiBkZWx0YSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxlYW5DZW50ZXIoZGVsdGE6IG51bWJlcikge1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ0xlZnQ/LlNldExlbmd0aCgwLjU1KTtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdSaWdodD8uU2V0TGVuZ3RoKDAuNTUpO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgdGhpcy5wYXJ0cy53ZWxkQ2VudGVyLm1fcmVmZXJlbmNlQW5nbGUgPSAwO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsZWFuVXAoZGVsdGE6IG51bWJlcikge1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ0xlZnQ/LlNldExlbmd0aCgwLjgpO1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ1JpZ2h0Py5TZXRMZW5ndGgoMC44KTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIHRoaXMucGFydHMud2VsZENlbnRlci5tX3JlZmVyZW5jZUFuZ2xlID0gMDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdEJvZHlQYXJ0cygpIHtcclxuICAgIHRoaXMucGFydHMgPSB7XHJcbiAgICAgIGhlYWQ6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Qm9kaWVzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclBhcnQnLCAnaGVhZCcpWzBdLFxyXG4gICAgICBib2R5OiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJQYXJ0JywgJ2JvZHknKVswXSxcclxuICAgICAgYm9hcmRTZWdtZW50czogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyUGFydCcsICdib2FyZFNlZ21lbnQnKSxcclxuXHJcbiAgICAgIGJpbmRpbmdMZWZ0OiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEpvaW50c0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJTcHJpbmcnLCAnYmluZGluZ0xlZnQnKVswXSBhcyBQbC5iMlJldm9sdXRlSm9pbnQsXHJcbiAgICAgIGJpbmRpbmdSaWdodDogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRKb2ludHNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyU3ByaW5nJywgJ2JpbmRpbmdSaWdodCcpWzBdIGFzIFBsLmIyUmV2b2x1dGVKb2ludCxcclxuICAgICAgZGlzdGFuY2VMZWdMZWZ0OiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEpvaW50c0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJTcHJpbmcnLCAnZGlzdGFuY2VMZWdMZWZ0JylbMF0gYXMgUGwuYjJEaXN0YW5jZUpvaW50LFxyXG4gICAgICBkaXN0YW5jZUxlZ1JpZ2h0OiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEpvaW50c0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJTcHJpbmcnLCAnZGlzdGFuY2VMZWdSaWdodCcpWzBdIGFzIFBsLmIyRGlzdGFuY2VKb2ludCxcclxuICAgICAgd2VsZENlbnRlcjogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRKb2ludHNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyU3ByaW5nJywgJ3dlbGRDZW50ZXInKVswXSBhcyBQbC5iMldlbGRKb2ludCxcclxuICAgICAgcHJpc21hdGljOiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEpvaW50c0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJTcHJpbmcnLCAncHJpc21hdGljJylbMF0gYXMgUGwuYjJQcmlzbWF0aWNKb2ludCxcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJQm9keVBhcnRzIHtcclxuICBoZWFkOiBQbC5iMkJvZHkgJiBSdWJlRW50aXR5O1xyXG4gIGJvZHk6IFBsLmIyQm9keSAmIFJ1YmVFbnRpdHk7XHJcbiAgYm9hcmRTZWdtZW50czogKFBsLmIyQm9keSAmIFJ1YmVFbnRpdHkpW107XHJcblxyXG4gIGJpbmRpbmdMZWZ0OiBQbC5iMlJldm9sdXRlSm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICBiaW5kaW5nUmlnaHQ6IFBsLmIyUmV2b2x1dGVKb2ludCAmIFJ1YmVFbnRpdHkgfCBudWxsO1xyXG4gIGRpc3RhbmNlTGVnTGVmdDogUGwuYjJEaXN0YW5jZUpvaW50ICYgUnViZUVudGl0eSB8IG51bGw7XHJcbiAgZGlzdGFuY2VMZWdSaWdodDogUGwuYjJEaXN0YW5jZUpvaW50ICYgUnViZUVudGl0eSB8IG51bGw7XHJcbiAgd2VsZENlbnRlcjogUGwuYjJXZWxkSm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICBwcmlzbWF0aWM6IFBsLmIyUHJpc21hdGljSm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7UGh5c2ljc30gZnJvbSAnLi9QaHlzaWNzJztcclxuaW1wb3J0IEdhbWVTY2VuZSBmcm9tICcuLi9zY2VuZXMvR2FtZVNjZW5lJztcclxuaW1wb3J0IHtQbGF5ZXJDb250cm9sbGVyfSBmcm9tICcuL1BsYXllckNvbnRyb2xsZXInO1xyXG5pbXBvcnQge0RFQlVHfSBmcm9tICcuLi9pbmRleCc7XHJcblxyXG5cclxuaW50ZXJmYWNlIElSYXlDYXN0UmVzdWx0IHtcclxuICBoaXQ6IGJvb2xlYW47XHJcbiAgcG9pbnQ6IFBsLmIyVmVjMiB8IG51bGwgfCB1bmRlZmluZWQ7XHJcbiAgbm9ybWFsOiBQbC5iMlZlYzIgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG4gIGZyYWN0aW9uOiBudW1iZXI7XHJcbiAgbGFzdEhpdFRpbWU6IG51bWJlcjtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVNlZ21lbnQge1xyXG4gIGJvZHk6IFBsLmIyQm9keTtcclxuXHJcbiAgZ3JvdW5kUmF5RGlyZWN0aW9uOiBQbC5iMlZlYzI7XHJcbiAgZ3JvdW5kUmF5UmVzdWx0OiBJUmF5Q2FzdFJlc3VsdDtcclxuICBncm91bmRSYXlDYWxsYmFjazogUGwuYjJSYXlDYXN0Q2FsbGJhY2s7XHJcblxyXG4gIGNyYXNoUmF5RGlyZWN0aW9uPzogUGwuYjJWZWMyO1xyXG4gIGNyYXNoUmF5UmVzdWx0PzogSVJheUNhc3RSZXN1bHQ7XHJcbiAgY3Jhc2hSYXlDYWxsYmFjaz86IFBsLmIyUmF5Q2FzdENhbGxiYWNrO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFdpY2tlZFNub3dib2FyZCB7XHJcbiAgbm9zZT86IElTZWdtZW50O1xyXG5cclxuICBpc1RhaWxHcm91bmRlZDogYm9vbGVhbjtcclxuICBpc05vc2VHcm91bmRlZDogYm9vbGVhbjtcclxuICBpc0NlbnRlckdyb3VuZGVkOiBib29sZWFuO1xyXG5cclxuICByZWFkb25seSBzZWdtZW50czogSVNlZ21lbnRbXSA9IFtdO1xyXG5cclxuICBwcml2YXRlIHBvaW50U3RhcnQ6IFBsLmIyVmVjMiA9IG5ldyBQbC5iMlZlYzIoMCwgMCk7XHJcbiAgcHJpdmF0ZSBwb2ludEVuZDogUGwuYjJWZWMyID0gbmV3IFBsLmIyVmVjMigwLCAwKTtcclxuICBwcml2YXRlIGRlYnVnR3JhcGhpY3M6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHBsYXllcjogUGxheWVyQ29udHJvbGxlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHNjZW5lOiBHYW1lU2NlbmU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiMlBoeXNpY3M6IFBoeXNpY3M7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyQ29udHJvbGxlcikge1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLnNjZW5lID0gcGxheWVyLnNjZW5lO1xyXG4gICAgdGhpcy5iMlBoeXNpY3MgPSBwbGF5ZXIuYjJQaHlzaWNzO1xyXG5cclxuICAgIHRoaXMuZGVidWdHcmFwaGljcyA9IHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCk7XHJcbiAgICB0aGlzLmluaXRSYXlzKHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUgLyA0KTtcclxuXHJcbiAgfVxyXG5cclxuICB1cGRhdGUoZGVsdGE6IG51bWJlcikge1xyXG4gICAgREVCVUcgJiYgdGhpcy5kZWJ1Z0dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICBjb25zdCBzZWdtZW50cyA9IHRoaXMuc2VnbWVudHM7XHJcblxyXG4gICAgZm9yIChjb25zdCBzZWdtZW50IG9mIHRoaXMuc2VnbWVudHMpIHtcclxuICAgICAgdGhpcy5yZXNldFNlZ21lbnQoc2VnbWVudCk7XHJcbiAgICAgIHNlZ21lbnQuYm9keS5HZXRXb3JsZFBvaW50KFBsLmIyVmVjMi5aRVJPLCB0aGlzLnBvaW50U3RhcnQpO1xyXG4gICAgICBzZWdtZW50LmJvZHkuR2V0V29ybGRQb2ludChzZWdtZW50Lmdyb3VuZFJheURpcmVjdGlvbiwgdGhpcy5wb2ludEVuZCk7XHJcbiAgICAgIHRoaXMuYjJQaHlzaWNzLndvcmxkLlJheUNhc3QodGhpcy5wb2ludFN0YXJ0LCB0aGlzLnBvaW50RW5kLCBzZWdtZW50Lmdyb3VuZFJheUNhbGxiYWNrKTtcclxuICAgICAgREVCVUcgJiYgdGhpcy5kcmF3RGVidWcoc2VnbWVudC5ncm91bmRSYXlSZXN1bHQuaGl0ID8gMHgwMDAwZmYgOiAweDAwZmYwMCk7XHJcblxyXG4gICAgICBpZiAoc2VnbWVudC5jcmFzaFJheVJlc3VsdCAmJiBzZWdtZW50LmNyYXNoUmF5Q2FsbGJhY2sgJiYgc2VnbWVudC5jcmFzaFJheURpcmVjdGlvbikge1xyXG4gICAgICAgIHNlZ21lbnQuYm9keS5HZXRXb3JsZFBvaW50KFBsLmIyVmVjMi5aRVJPLCB0aGlzLnBvaW50U3RhcnQpO1xyXG4gICAgICAgIHNlZ21lbnQuYm9keS5HZXRXb3JsZFBvaW50KHNlZ21lbnQuY3Jhc2hSYXlEaXJlY3Rpb24sIHRoaXMucG9pbnRFbmQpO1xyXG4gICAgICAgIHRoaXMuYjJQaHlzaWNzLndvcmxkLlJheUNhc3QodGhpcy5wb2ludFN0YXJ0LCB0aGlzLnBvaW50RW5kLCBzZWdtZW50LmNyYXNoUmF5Q2FsbGJhY2spO1xyXG4gICAgICAgIERFQlVHICYmIHRoaXMuZHJhd0RlYnVnKHNlZ21lbnQuY3Jhc2hSYXlSZXN1bHQuaGl0ID8gMHgwMDAwZmYgOiAweDAwZmYwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzVGFpbEdyb3VuZGVkID0gc2VnbWVudHNbMF0uZ3JvdW5kUmF5UmVzdWx0LmhpdDtcclxuICAgIHRoaXMuaXNOb3NlR3JvdW5kZWQgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS5ncm91bmRSYXlSZXN1bHQuaGl0O1xyXG4gICAgdGhpcy5pc0NlbnRlckdyb3VuZGVkID0gc2VnbWVudHNbM10uZ3JvdW5kUmF5UmVzdWx0LmhpdDtcclxuICB9XHJcblxyXG4gIGdldFRpbWVJbkFpcigpOiBudW1iZXIge1xyXG4gICAgaWYgKHRoaXMuc2VnbWVudHMuc29tZShzID0+IHMuZ3JvdW5kUmF5UmVzdWx0LmhpdCkpIHJldHVybiAtMTtcclxuICAgIGNvbnN0IG1vc3RSZWNlbnRIaXQgPSBNYXRoLm1heCguLi50aGlzLnNlZ21lbnRzLm1hcChzID0+IHMuZ3JvdW5kUmF5UmVzdWx0Lmxhc3RIaXRUaW1lKSk7XHJcbiAgICByZXR1cm4gdGhpcy5zY2VuZS5nYW1lLmdldFRpbWUoKSAtIG1vc3RSZWNlbnRIaXQ7XHJcbiAgfVxyXG5cclxuICBpc0luQWlyKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VGltZUluQWlyKCkgIT09IC0xO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByYXlDYWxsYmFja0ZhY3RvcnkoaGl0UmVzdWx0OiBJUmF5Q2FzdFJlc3VsdCkge1xyXG4gICAgcmV0dXJuIChmaXh0dXJlLCBwb2ludCwgbm9ybWFsLCBmcmFjdGlvbikgPT4ge1xyXG4gICAgICAvLyBjb2lucyBhbmQgb3RoZXIgc2Vuc29ycyBjYW4gbWVzcyB3aXRoIHJheWNhc3QgbGVhZGluZyB0byB3cm9uZyB0cmljayBzY29yZSBhbmQgcm90YXRpb24gY29tcHV0YXRpb25cclxuICAgICAgaWYgKGZpeHR1cmUuSXNTZW5zb3IoKSkgcmV0dXJuO1xyXG4gICAgICBoaXRSZXN1bHQuaGl0ID0gdHJ1ZTtcclxuICAgICAgaGl0UmVzdWx0LnBvaW50ID0gcG9pbnQ7XHJcbiAgICAgIGhpdFJlc3VsdC5ub3JtYWwgPSBub3JtYWw7XHJcbiAgICAgIGhpdFJlc3VsdC5mcmFjdGlvbiA9IGZyYWN0aW9uO1xyXG4gICAgICBoaXRSZXN1bHQubGFzdEhpdFRpbWUgPSB0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpO1xyXG4gICAgICByZXR1cm4gZnJhY3Rpb247XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFNlZ21lbnQoc2VnbWVudDogSVNlZ21lbnQpIHtcclxuICAgIHNlZ21lbnQuZ3JvdW5kUmF5UmVzdWx0LmhpdCA9IGZhbHNlO1xyXG4gICAgc2VnbWVudC5ncm91bmRSYXlSZXN1bHQucG9pbnQgPSBudWxsO1xyXG4gICAgc2VnbWVudC5ncm91bmRSYXlSZXN1bHQubm9ybWFsID0gbnVsbDtcclxuICAgIHNlZ21lbnQuZ3JvdW5kUmF5UmVzdWx0LmZyYWN0aW9uID0gLTE7XHJcblxyXG4gICAgaWYgKHNlZ21lbnQuY3Jhc2hSYXlSZXN1bHQpIHtcclxuICAgICAgc2VnbWVudC5jcmFzaFJheVJlc3VsdC5oaXQgPSBmYWxzZTtcclxuICAgICAgc2VnbWVudC5jcmFzaFJheVJlc3VsdC5wb2ludCA9IG51bGw7XHJcbiAgICAgIHNlZ21lbnQuY3Jhc2hSYXlSZXN1bHQubm9ybWFsID0gbnVsbDtcclxuICAgICAgc2VnbWVudC5jcmFzaFJheVJlc3VsdC5mcmFjdGlvbiA9IC0xO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkcmF3RGVidWcoY29sb3I6IG51bWJlcikge1xyXG4gICAgdGhpcy5kZWJ1Z0dyYXBoaWNzLmxpbmVTdHlsZSgyLCBjb2xvciwgMSk7XHJcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGU7XHJcbiAgICB0aGlzLmRlYnVnR3JhcGhpY3MubGluZUJldHdlZW4oXHJcbiAgICAgIHRoaXMucG9pbnRTdGFydC54ICogc2NhbGUsXHJcbiAgICAgIC10aGlzLnBvaW50U3RhcnQueSAqIHNjYWxlLFxyXG4gICAgICB0aGlzLnBvaW50RW5kLnggKiBzY2FsZSxcclxuICAgICAgLXRoaXMucG9pbnRFbmQueSAqIHNjYWxlLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdFJheXMocmF5TGVuZ3RoOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHRlbXA6IElSYXlDYXN0UmVzdWx0ID0ge2hpdDogZmFsc2UsIHBvaW50OiBudWxsLCBub3JtYWw6IG51bGwsIGZyYWN0aW9uOiAtMSwgbGFzdEhpdFRpbWU6IC0xfTtcclxuICAgIGZvciAoY29uc3Qgc2VnbWVudCBvZiB0aGlzLnBsYXllci5wYXJ0cy5ib2FyZFNlZ21lbnRzKSB7XHJcbiAgICAgIGNvbnN0IHNlZ21lbnRJbmRleCA9IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Q3VzdG9tUHJvcGVydHkoc2VnbWVudCwgJ2ludCcsICdwaGFzZXJCb2FyZFNlZ21lbnRJbmRleCcsIC0xKTtcclxuICAgICAgY29uc3QgaXNOb3NlID0gc2VnbWVudEluZGV4ID09PSB0aGlzLnBsYXllci5wYXJ0cy5ib2FyZFNlZ21lbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgIGNvbnN0IGdyb3VuZEhpdFJlc3VsdCA9IHsuLi50ZW1wfTtcclxuICAgICAgY29uc3QgY3Jhc2hIaXRSZXN1bHQgPSB7Li4udGVtcH07XHJcbiAgICAgIHRoaXMuc2VnbWVudHMucHVzaCh7XHJcbiAgICAgICAgYm9keTogc2VnbWVudCxcclxuICAgICAgICBncm91bmRSYXlEaXJlY3Rpb246IG5ldyBQbC5iMlZlYzIoMCwgLXJheUxlbmd0aCAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUpLFxyXG4gICAgICAgIGdyb3VuZFJheVJlc3VsdDogZ3JvdW5kSGl0UmVzdWx0LFxyXG4gICAgICAgIGdyb3VuZFJheUNhbGxiYWNrOiB0aGlzLnJheUNhbGxiYWNrRmFjdG9yeShncm91bmRIaXRSZXN1bHQpLFxyXG4gICAgICAgIGNyYXNoUmF5RGlyZWN0aW9uOiBpc05vc2UgPyBuZXcgUGwuYjJWZWMyKChpc05vc2UgPyByYXlMZW5ndGggKiAyIDogcmF5TGVuZ3RoKSAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIDApIDogdW5kZWZpbmVkLFxyXG4gICAgICAgIGNyYXNoUmF5UmVzdWx0OiBpc05vc2UgPyBjcmFzaEhpdFJlc3VsdCA6IHVuZGVmaW5lZCxcclxuICAgICAgICBjcmFzaFJheUNhbGxiYWNrOiBpc05vc2UgPyB0aGlzLnJheUNhbGxiYWNrRmFjdG9yeShjcmFzaEhpdFJlc3VsdCkgOiB1bmRlZmluZWQsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGlzTm9zZSkgdGhpcy5ub3NlID0gdGhpcy5zZWdtZW50c1t0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0ICogYXMgUGwgZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQge1BoeXNpY3N9IGZyb20gJy4vUGh5c2ljcyc7XHJcbmltcG9ydCB7UnViZUVudGl0eX0gZnJvbSAnLi4vdXRpbC9SVUJFL1J1YmVMb2FkZXJJbnRlcmZhY2VzJztcclxuaW1wb3J0IHtJQm9keVBhcnRzLCBQbGF5ZXJDb250cm9sbGVyfSBmcm9tICcuL1BsYXllckNvbnRyb2xsZXInO1xyXG5pbXBvcnQge0JBU0VfRkxJUF9QT0lOVFMsIEhFQURfTUFYX0lNUFVMU0UsIExFVkVMX1NVQ0NFU1NfQk9OVVNfUE9JTlRTLCBUUklDS19QT0lOVFNfQ09NQk9fRlJBQ1RJT059IGZyb20gJy4uL2luZGV4JztcclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTY29yZSB7XHJcbiAgaWQ/OiBzdHJpbmc7XHJcbiAgdGltZXN0YW1wPzogbnVtYmVyO1xyXG4gIHVzZXJuYW1lPzogc3RyaW5nO1xyXG4gIHVzZXJJZD86IHN0cmluZztcclxuICB0b3RhbD86IG51bWJlcjsgLy8gZGVyaXZlZCBmcm9tIG90aGVyc1xyXG4gIGRpc3RhbmNlOiBudW1iZXI7XHJcbiAgY29pbnM6IG51bWJlcjtcclxuICB0cmlja1Njb3JlOiBudW1iZXI7XHJcbiAgYmVzdENvbWJvOiB7IG11bHRpcGxpZXI6IG51bWJlciwgYWNjdW11bGF0b3I6IG51bWJlciB9O1xyXG4gIGZpbmlzaGVkTGV2ZWw6IGJvb2xlYW47XHJcbiAgY3Jhc2hlZDogYm9vbGVhbjtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTdGF0ZSB7XHJcbiAgbGV2ZWxGaW5pc2hlZCA9IGZhbHNlO1xyXG4gIGlzQ3Jhc2hlZCA9IGZhbHNlO1xyXG4gIHRpbWVHcm91bmRlZCA9IDA7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGFydHM6IElCb2R5UGFydHM7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwbGF5ZXJDb250cm9sbGVyOiBQbGF5ZXJDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgc3RhdGU6ICdpbl9haXInIHwgJ2dyb3VuZGVkJzsgLy8gaGFuZGxlIHRoaXMgbW9yZSBjb25zaXN0ZW50XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGlja3Vwc1RvUHJvY2VzczogU2V0PFBsLmIyQm9keSAmIFJ1YmVFbnRpdHk+ID0gbmV3IFNldCgpO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2VlblNlbnNvcnM6IFNldDxQbC5iMkJvZHkgJiBSdWJlRW50aXR5PiA9IG5ldyBTZXQoKTtcclxuICBwcml2YXRlIGNvbWJvTGVld2F5VHdlZW46IFBoYXNlci5Ud2VlbnMuVHdlZW47XHJcbiAgcHJpdmF0ZSBjb21ib0FjY3VtdWxhdGVkU2NvcmUgPSAwO1xyXG4gIHByaXZhdGUgY29tYm9NdWx0aXBsaWVyID0gMDtcclxuICBwcml2YXRlIHRvdGFsVHJpY2tTY29yZSA9IDA7XHJcbiAgcHJpdmF0ZSB0b3RhbENvbGxlY3RlZFByZXNlbnRzID0gMDtcclxuXHJcbiAgcHJpdmF0ZSBhbmdsZVByZXZpb3VzVXBkYXRlID0gMDtcclxuICBwcml2YXRlIHRvdGFsUm90YXRpb24gPSAwOyAvLyB0b3RhbCByb3RhdGlvbiB3aGlsZSBpbiBhaXIgd2l0aG91dCB0b3VjaGluZyB0aGUgZ3JvdW5kXHJcbiAgcHJpdmF0ZSBjdXJyZW50RmxpcFJvdGF0aW9uID0gMDsgLy8gc2V0IHRvIDAgYWZ0ZXIgZWFjaCBmbGlwXHJcbiAgcHJpdmF0ZSBwZW5kaW5nRnJvbnRGbGlwcyA9IDA7XHJcbiAgcHJpdmF0ZSBwZW5kaW5nQmFja0ZsaXBzID0gMDtcclxuICBwcml2YXRlIGxhbmRlZEZyb250RmxpcHMgPSAwO1xyXG4gIHByaXZhdGUgbGFuZGVkQmFja0ZsaXBzID0gMDtcclxuICBwcml2YXRlIGxhc3REaXN0YW5jZSA9IDA7XHJcbiAgcHJpdmF0ZSBiZXN0Q29tYm86IElTY29yZVsnYmVzdENvbWJvJ10gPSB7YWNjdW11bGF0b3I6IDAsIG11bHRpcGxpZXI6IDB9O1xyXG5cclxuICBjb25zdHJ1Y3RvcihwbGF5ZXJDb250cm9sbGVyOiBQbGF5ZXJDb250cm9sbGVyKSB7XHJcbiAgICB0aGlzLnBhcnRzID0gcGxheWVyQ29udHJvbGxlci5wYXJ0cztcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlciA9IHBsYXllckNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLmIyUGh5c2ljcyA9IHBsYXllckNvbnRyb2xsZXIuYjJQaHlzaWNzO1xyXG4gICAgdGhpcy5zdGF0ZSA9IHBsYXllckNvbnRyb2xsZXIuYm9hcmQuaXNJbkFpcigpID8gJ2luX2FpcicgOiAnZ3JvdW5kZWQnO1xyXG4gICAgdGhpcy5yZWdpc3RlckNvbGxpc2lvbkxpc3RlbmVycygpO1xyXG5cclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5vbignZW50ZXJfaW5fYWlyJywgKCkgPT4gdGhpcy5zdGF0ZSA9ICdpbl9haXInKTtcclxuXHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIub24oJ2VudGVyX2dyb3VuZGVkJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAnZ3JvdW5kZWQnO1xyXG4gICAgICAgIHRoaXMudGltZUdyb3VuZGVkID0gdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLmdhbWUuZ2V0VGltZSgpO1xyXG4gICAgICAgIHRoaXMubGFuZGVkRnJvbnRGbGlwcyArPSB0aGlzLnBlbmRpbmdGcm9udEZsaXBzO1xyXG4gICAgICAgIHRoaXMubGFuZGVkQmFja0ZsaXBzICs9IHRoaXMucGVuZGluZ0JhY2tGbGlwcztcclxuXHJcbiAgICAgICAgY29uc3QgbnVtRmxpcHMgPSB0aGlzLnBlbmRpbmdCYWNrRmxpcHMgKyB0aGlzLnBlbmRpbmdGcm9udEZsaXBzO1xyXG4gICAgICAgIGlmIChudW1GbGlwcyA+PSAxKSB7XHJcbiAgICAgICAgICBjb25zdCB0cmlja1Njb3JlID0gbnVtRmxpcHMgKiBudW1GbGlwcyAqIEJBU0VfRkxJUF9QT0lOVFM7XHJcbiAgICAgICAgICB0aGlzLnRvdGFsVHJpY2tTY29yZSArPSB0cmlja1Njb3JlO1xyXG4gICAgICAgICAgdGhpcy5jb21ib0FjY3VtdWxhdGVkU2NvcmUgKz0gdHJpY2tTY29yZSAqIFRSSUNLX1BPSU5UU19DT01CT19GUkFDVElPTjtcclxuICAgICAgICAgIHRoaXMuY29tYm9NdWx0aXBsaWVyKys7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnY29tYm9fY2hhbmdlJywgdGhpcy5jb21ib0FjY3VtdWxhdGVkU2NvcmUsIHRoaXMuY29tYm9NdWx0aXBsaWVyKTtcclxuICAgICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdzY29yZV9jaGFuZ2UnLCB0aGlzLmdldEN1cnJlbnRTY29yZSgpKTtcclxuICAgICAgICAgIHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5yZXNldFR3ZWVuRGF0YSh0cnVlKTtcclxuICAgICAgICAgIHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRvdGFsUm90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZsaXBSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQmFja0ZsaXBzID0gMDtcclxuICAgICAgICB0aGlzLnBlbmRpbmdGcm9udEZsaXBzID0gMDtcclxuICAgICAgfSxcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5jb21ib0xlZXdheVR3ZWVuID0gdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLnR3ZWVucy5hZGRDb3VudGVyKHtcclxuICAgICAgcGF1c2VkOiB0cnVlLFxyXG4gICAgICBmcm9tOiBNYXRoLlBJICogLTAuNSxcclxuICAgICAgdG86IE1hdGguUEkgKiAxLjUsXHJcbiAgICAgIGR1cmF0aW9uOiA0MDAwLFxyXG4gICAgICBvblVwZGF0ZTogKHR3ZWVuKSA9PiB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnY29tYm9fbGVld2F5X3VwZGF0ZScsIHR3ZWVuLmdldFZhbHVlKCkpLFxyXG4gICAgICBvbkNvbXBsZXRlOiB0d2VlbiA9PiB0aGlzLmhhbmRsZUNvbWJvQ29tcGxldGUoKSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnRvdGFsVHJpY2tTY29yZSA9IDA7XHJcbiAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4uc3RvcCgpO1xyXG4gICAgLy8gdGhpcy5jb21ib0xlZXdheVR3ZWVuID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy50b3RhbENvbGxlY3RlZFByZXNlbnRzID0gMDtcclxuICAgIHRoaXMuY29tYm9NdWx0aXBsaWVyID0gMDtcclxuICAgIHRoaXMuY29tYm9BY2N1bXVsYXRlZFNjb3JlID0gMDtcclxuICAgIHRoaXMubGV2ZWxGaW5pc2hlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0NyYXNoZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuYmVzdENvbWJvID0ge2FjY3VtdWxhdG9yOiAwLCBtdWx0aXBsaWVyOiAwfTtcclxuICAgIHRoaXMuc2VlblNlbnNvcnMuY2xlYXIoKTtcclxuICAgIHRoaXMucGlja3Vwc1RvUHJvY2Vzcy5jbGVhcigpO1xyXG4gICAgdGhpcy5wZW5kaW5nRnJvbnRGbGlwcyA9IDA7XHJcbiAgICB0aGlzLnBlbmRpbmdCYWNrRmxpcHMgPSAwO1xyXG4gICAgdGhpcy5sYW5kZWRCYWNrRmxpcHMgPSAwO1xyXG4gICAgdGhpcy5sYW5kZWRGcm9udEZsaXBzID0gMDtcclxuICAgIHRoaXMuY3VycmVudEZsaXBSb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLmFuZ2xlUHJldmlvdXNVcGRhdGUgPSAwO1xyXG4gICAgdGhpcy5sYXN0RGlzdGFuY2UgPSAwO1xyXG4gICAgdGhpcy50aW1lR3JvdW5kZWQgPSAwO1xyXG4gICAgdGhpcy50b3RhbFJvdGF0aW9uID0gMDtcclxuICB9XHJcblxyXG4gIGdldEN1cnJlbnRTY29yZSgpOiBJU2NvcmUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZGlzdGFuY2U6IHRoaXMuZ2V0VHJhdmVsRGlzdGFuY2VNZXRlcnMoKSxcclxuICAgICAgY29pbnM6IHRoaXMudG90YWxDb2xsZWN0ZWRQcmVzZW50cyxcclxuICAgICAgdHJpY2tTY29yZTogdGhpcy50b3RhbFRyaWNrU2NvcmUsXHJcbiAgICAgIGJlc3RDb21ibzogdGhpcy5iZXN0Q29tYm8sXHJcbiAgICAgIGZpbmlzaGVkTGV2ZWw6IHRoaXMubGV2ZWxGaW5pc2hlZCxcclxuICAgICAgY3Jhc2hlZDogdGhpcy5pc0NyYXNoZWQsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0U3RhdGUoKTogJ2dyb3VuZGVkJyB8ICdpbl9haXInIHwgJ2NyYXNoZWQnIHtcclxuICAgIHJldHVybiB0aGlzLnN0YXRlO1xyXG4gIH1cclxuXHJcbiAgZ2V0VHJhdmVsRGlzdGFuY2VNZXRlcnMoKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5wYXJ0cy5ib2R5LkdldFBvc2l0aW9uKCkuTGVuZ3RoKCk7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihkaXN0YW5jZSAvIDUpICogNTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVnaXN0ZXJDb2xsaXNpb25MaXN0ZW5lcnMoKSB7XHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuYjJQaHlzaWNzLm9uKCdwb3N0X3NvbHZlJywgKGNvbnRhY3Q6IFBsLmIyQ29udGFjdCwgaW1wdWxzZTogUGwuYjJDb250YWN0SW1wdWxzZSkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5pc0NyYXNoZWQpIHJldHVybjtcclxuICAgICAgY29uc3QgYm9keUEgPSBjb250YWN0LkdldEZpeHR1cmVBKCkuR2V0Qm9keSgpO1xyXG4gICAgICBjb25zdCBib2R5QiA9IGNvbnRhY3QuR2V0Rml4dHVyZUIoKS5HZXRCb2R5KCk7XHJcbiAgICAgIGlmIChib2R5QSA9PT0gYm9keUIpIHJldHVybjtcclxuICAgICAgaWYgKChib2R5QSA9PT0gdGhpcy5wYXJ0cy5oZWFkIHx8IGJvZHlCID09PSB0aGlzLnBhcnRzLmhlYWQpICYmIE1hdGgubWF4KC4uLmltcHVsc2Uubm9ybWFsSW1wdWxzZXMpID4gSEVBRF9NQVhfSU1QVUxTRSkge1xyXG4gICAgICAgICF0aGlzLmlzQ3Jhc2hlZCAmJiB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnZW50ZXJfY3Jhc2hlZCcsIHRoaXMuZ2V0Q3VycmVudFNjb3JlKCkpO1xyXG4gICAgICAgIHRoaXMuaXNDcmFzaGVkID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGhpcy5jb21ib0xlZXdheVR3ZWVuLmlzUGxheWluZygpIHx8IHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5pc1BhdXNlZCgpKSB7XHJcbiAgICAgICAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4uc3RvcCgpO1xyXG4gICAgICAgICAgdGhpcy5jb21ib0xlZXdheVR3ZWVuLnJlc2V0VHdlZW5EYXRhKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLmIyUGh5c2ljcy5vbignYmVnaW5fY29udGFjdCcsIChjb250YWN0OiBQbC5iMkNvbnRhY3QpID0+IHtcclxuICAgICAgY29uc3QgZml4dHVyZUE6IFBsLmIyRml4dHVyZSAmIFJ1YmVFbnRpdHkgPSBjb250YWN0LkdldEZpeHR1cmVBKCk7XHJcbiAgICAgIGNvbnN0IGZpeHR1cmVCOiBQbC5iMkZpeHR1cmUgJiBSdWJlRW50aXR5ID0gY29udGFjdC5HZXRGaXh0dXJlQigpO1xyXG4gICAgICBjb25zdCBib2R5QSA9IGZpeHR1cmVBLkdldEJvZHkoKTtcclxuICAgICAgY29uc3QgYm9keUIgPSBmaXh0dXJlQi5HZXRCb2R5KCk7XHJcbiAgICAgIGlmIChmaXh0dXJlQS5Jc1NlbnNvcigpICYmICF0aGlzLnNlZW5TZW5zb3JzLmhhcyhib2R5QSkgJiYgZml4dHVyZUEuY3VzdG9tUHJvcGVydGllc01hcD8ucGhhc2VyU2Vuc29yVHlwZSkgdGhpcy5oYW5kbGVTZW5zb3IoYm9keUEsIGZpeHR1cmVBKTtcclxuICAgICAgZWxzZSBpZiAoZml4dHVyZUIuSXNTZW5zb3IoKSAmJiAhdGhpcy5zZWVuU2Vuc29ycy5oYXMoYm9keUIpICYmIGZpeHR1cmVCLmN1c3RvbVByb3BlcnRpZXNNYXA/LnBoYXNlclNlbnNvclR5cGUpIHRoaXMuaGFuZGxlU2Vuc29yKGJvZHlCLCBmaXh0dXJlQik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlU2Vuc29yKGJvZHk6IFBsLmIyQm9keSAmIFJ1YmVFbnRpdHksIGZpeHR1cmU6IFBsLmIyRml4dHVyZSAmIFJ1YmVFbnRpdHkpIHtcclxuICAgIHRoaXMuc2VlblNlbnNvcnMuYWRkKGJvZHkpO1xyXG4gICAgc3dpdGNoIChmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXNNYXA/LnBoYXNlclNlbnNvclR5cGUpIHtcclxuICAgICAgY2FzZSAncGlja3VwX3ByZXNlbnQnOiB7XHJcbiAgICAgICAgdGhpcy5waWNrdXBzVG9Qcm9jZXNzLmFkZChib2R5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdsZXZlbF9maW5pc2gnOiB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLmNhbWVyYXMubWFpbi5zdG9wRm9sbG93KCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NvbmdyYXR1bGF0aW9ucyB5b3UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBsZXZlbCcpO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlQ29tYm9Db21wbGV0ZSgpO1xyXG4gICAgICAgIHRoaXMubGV2ZWxGaW5pc2hlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jb21ib0xlZXdheVR3ZWVuLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4ucmVzZXRUd2VlbkRhdGEodHJ1ZSk7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFNjb3JlID0gdGhpcy5nZXRDdXJyZW50U2NvcmUoKTtcclxuICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnc2NvcmVfY2hhbmdlJywgY3VycmVudFNjb3JlKTtcclxuICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnbGV2ZWxfZmluaXNoJywgY3VycmVudFNjb3JlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdsZXZlbF9kZWF0aHpvbmUnOiB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLnByb2Nlc3NQaWNrdXBzKCk7XHJcblxyXG4gICAgY29uc3QgaXNJbkFpciA9IHRoaXMucGxheWVyQ29udHJvbGxlci5ib2FyZC5pc0luQWlyKCk7XHJcbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ2dyb3VuZGVkJyAmJiBpc0luQWlyICYmICF0aGlzLmlzQ3Jhc2hlZCkgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2VudGVyX2luX2FpcicpO1xyXG4gICAgZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gJ2luX2FpcicgJiYgIWlzSW5BaXIgJiYgIXRoaXMuaXNDcmFzaGVkKSB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnZW50ZXJfZ3JvdW5kZWQnKTtcclxuICAgIHRoaXMudXBkYXRlVHJpY2tDb3VudGVyKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUNvbWJvTGVld2F5KCk7XHJcbiAgICB0aGlzLnVwZGF0ZURpc3RhbmNlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHByb2Nlc3NQaWNrdXBzKCkge1xyXG4gICAgZm9yIChjb25zdCBib2R5IG9mIHRoaXMucGlja3Vwc1RvUHJvY2Vzcykge1xyXG4gICAgICBjb25zdCBpbWc6IFBoLkdhbWVPYmplY3RzLkltYWdlID0gYm9keS5HZXRVc2VyRGF0YSgpO1xyXG4gICAgICB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Qm9keShib2R5KTtcclxuICAgICAgaW1nLmRlc3Ryb3koKTtcclxuICAgICAgdGhpcy50b3RhbENvbGxlY3RlZFByZXNlbnRzKys7XHJcbiAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdwaWNrdXBfcHJlc2VudCcsIHRoaXMudG90YWxDb2xsZWN0ZWRQcmVzZW50cyk7XHJcbiAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdzY29yZV9jaGFuZ2UnLCB0aGlzLmdldEN1cnJlbnRTY29yZSgpKTtcclxuXHJcbiAgICB9XHJcbiAgICB0aGlzLnBpY2t1cHNUb1Byb2Nlc3MuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlVHJpY2tDb3VudGVyKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09ICdpbl9haXInKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRBbmdsZSA9IFBoLk1hdGguQW5nbGUuTm9ybWFsaXplKHRoaXMucGFydHMuYm9keS5HZXRBbmdsZSgpKTtcclxuXHJcbiAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLmNhbGN1bGF0ZURpZmZlcmVuY2VCZXR3ZWVuQW5nbGVzKHRoaXMuYW5nbGVQcmV2aW91c1VwZGF0ZSwgY3VycmVudEFuZ2xlKTtcclxuICAgICAgdGhpcy50b3RhbFJvdGF0aW9uICs9IGRpZmY7XHJcbiAgICAgIHRoaXMuY3VycmVudEZsaXBSb3RhdGlvbiArPSBkaWZmO1xyXG4gICAgICB0aGlzLmFuZ2xlUHJldmlvdXNVcGRhdGUgPSBjdXJyZW50QW5nbGU7XHJcblxyXG4gICAgICBpZiAodGhpcy5jdXJyZW50RmxpcFJvdGF0aW9uID49IE1hdGguUEkgKiAodGhpcy5wZW5kaW5nQmFja0ZsaXBzID09PSAwID8gMS4yNSA6IDIpKSB7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQmFja0ZsaXBzKys7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RmxpcFJvdGF0aW9uID0gMDtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRGbGlwUm90YXRpb24gPD0gTWF0aC5QSSAqIC0odGhpcy5wZW5kaW5nRnJvbnRGbGlwcyA9PT0gMCA/IDEuMjUgOiAyKSkge1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0Zyb250RmxpcHMrKztcclxuICAgICAgICB0aGlzLmN1cnJlbnRGbGlwUm90YXRpb24gPSAwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUNvbWJvTGVld2F5KCkge1xyXG4gICAgaWYgKHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5pc1BsYXlpbmcoKSB8fCB0aGlzLmNvbWJvTGVld2F5VHdlZW4uaXNQYXVzZWQoKSkge1xyXG4gICAgICAvLyBjaGVja2luZyBmb3IgY2VudGVyR3JvdW5kZWQgYWxsb3dzIHBsYXllciB0byBwcm9sb25nIGxlZXdheSBiZWZvcmUgY29tYm8gY29tcGxldGVzIHdoaWxlIHJpZGluZyBvbmx5IG9uIG5vc2Ugb3IgdGFpbFxyXG4gICAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ2luX2FpcicgfHwgIXRoaXMucGxheWVyQ29udHJvbGxlci5ib2FyZC5pc0NlbnRlckdyb3VuZGVkKSB7XHJcbiAgICAgICAgdGhpcy5jb21ib0xlZXdheVR3ZWVuLnBhdXNlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb21ib0xlZXdheVR3ZWVuLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBiYXNlZCBvbjogaHR0cHM6Ly93d3cuY29uc3RydWN0Lm5ldC9lbi9mb3J1bS9jb25zdHJ1Y3QtMi9ob3ctZG8taS0xOC9jb3VudC1yb3RhdGlvbnMtNDY2NzRcclxuICAvLyBodHRwOi8vYmxvZy5sZXhpcXVlLWR1LW5ldC5jb20vaW5kZXgucGhwP3Bvc3QvQ2FsY3VsYXRlLXRoZS1yZWFsLWRpZmZlcmVuY2UtYmV0d2Vlbi10d28tYW5nbGVzLWtlZXBpbmctdGhlLXNpZ25cclxuICBwcml2YXRlIGNhbGN1bGF0ZURpZmZlcmVuY2VCZXR3ZWVuQW5nbGVzKGZpcnN0QW5nbGU6IG51bWJlciwgc2Vjb25kQW5nbGU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBsZXQgZGlmZmVyZW5jZSA9IHNlY29uZEFuZ2xlIC0gZmlyc3RBbmdsZTtcclxuICAgIGlmIChkaWZmZXJlbmNlIDwgLU1hdGguUEkpIGRpZmZlcmVuY2UgKz0gTWF0aC5QSSAqIDI7XHJcbiAgICBlbHNlIGlmIChkaWZmZXJlbmNlID4gTWF0aC5QSSkgZGlmZmVyZW5jZSAtPSBNYXRoLlBJICogMjtcclxuICAgIHJldHVybiBkaWZmZXJlbmNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVEaXN0YW5jZSgpIHtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5nZXRUcmF2ZWxEaXN0YW5jZU1ldGVycygpO1xyXG4gICAgaWYgKGRpc3RhbmNlICE9PSB0aGlzLmxhc3REaXN0YW5jZSAmJiAhdGhpcy5pc0NyYXNoZWQgJiYgIXRoaXMubGV2ZWxGaW5pc2hlZCkge1xyXG4gICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnZGlzdGFuY2VfY2hhbmdlJywgZGlzdGFuY2UpO1xyXG4gICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnc2NvcmVfY2hhbmdlJywgdGhpcy5nZXRDdXJyZW50U2NvcmUoKSk7XHJcbiAgICAgIHRoaXMubGFzdERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNvbWJvQ29tcGxldGUoKSB7XHJcbiAgICBpZiAodGhpcy5sZXZlbEZpbmlzaGVkKSByZXR1cm47XHJcbiAgICBjb25zdCBjb21ibyA9IHRoaXMuY29tYm9BY2N1bXVsYXRlZFNjb3JlICogdGhpcy5jb21ib011bHRpcGxpZXI7XHJcbiAgICBjb25zdCBwcmV2QmVzdENvbWJvID0gdGhpcy5iZXN0Q29tYm8uYWNjdW11bGF0b3IgKiB0aGlzLmJlc3RDb21iby5tdWx0aXBsaWVyO1xyXG4gICAgaWYgKGNvbWJvID4gcHJldkJlc3RDb21ibykgdGhpcy5iZXN0Q29tYm8gPSB7YWNjdW11bGF0b3I6IHRoaXMuY29tYm9BY2N1bXVsYXRlZFNjb3JlLCBtdWx0aXBsaWVyOiB0aGlzLmNvbWJvTXVsdGlwbGllcn07XHJcbiAgICB0aGlzLnRvdGFsVHJpY2tTY29yZSArPSBjb21ibztcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdzY29yZV9jaGFuZ2UnLCB0aGlzLmdldEN1cnJlbnRTY29yZSgpKTtcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdjb21ib19jaGFuZ2UnLCAwLCAwKTtcclxuICAgIHRoaXMuY29tYm9BY2N1bXVsYXRlZFNjb3JlID0gMDtcclxuICAgIHRoaXMuY29tYm9NdWx0aXBsaWVyID0gMDtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0ICogYXMgUGwgZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQge1BoeXNpY3N9IGZyb20gJy4vUGh5c2ljcyc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi4vc2NlbmVzL0dhbWVTY2VuZSc7XHJcbmltcG9ydCB7REVGQVVMVF9aT09NfSBmcm9tICcuLi9pbmRleCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJyYWluIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRlcnJhaW5Cb2R5OiBQbC5iMkJvZHk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjaHVua3M6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzW107XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NlbmU6IEdhbWVTY2VuZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHpvb21Nb2RpZmllciA9IDEgLyBERUZBVUxUX1pPT007XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsYXllcnMgPSBbXHJcbiAgICB7Y29sb3I6IDB4QzhFMUVCLCB3aWR0aDogNSAqIHRoaXMuem9vbU1vZGlmaWVyfSwgLy8gdG9wIGxheWVyIG9mIHNub3dcclxuICAgIHtjb2xvcjogMHg1YzhkYzksIHdpZHRoOiAyMiAqIHRoaXMuem9vbU1vZGlmaWVyfSxcclxuICAgIHtjb2xvcjogMHgyMjNCN0IsIHdpZHRoOiAxMCAqIHRoaXMuem9vbU1vZGlmaWVyfSxcclxuICAgIHtjb2xvcjogMHgyZDJjMmMsIHdpZHRoOiA1ICogdGhpcy56b29tTW9kaWZpZXJ9LFxyXG4gICAge2NvbG9yOiAweDNhMzIzMiwgd2lkdGg6IDI1MCAqIHRoaXMuem9vbU1vZGlmaWVyfSxcclxuICBdO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHBvaW50c1Bvb2w6IFBsLlhZW10gPSBbXTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHZlYzJQb29sOiBQbC5iMlZlYzJbXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCBwaHlzaWNzOiBQaHlzaWNzKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmIyUGh5c2ljcyA9IHBoeXNpY3M7XHJcblxyXG4gICAgY29uc3QgcG9vbFNpemUgPSAyNTAwO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sU2l6ZTsgaSsrKSB0aGlzLnBvaW50c1Bvb2wucHVzaCh7eDogMCwgeTogMH0pO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sU2l6ZTsgaSsrKSB0aGlzLnZlYzJQb29sLnB1c2gobmV3IFBsLmIyVmVjMigwLCAwKSk7XHJcblxyXG4gICAgdGhpcy5jaHVua3MgPSBbXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgICAgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKS5zZXREZXB0aCgxMCksXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgICAgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKS5zZXREZXB0aCgxMCksXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy50ZXJyYWluQm9keSA9IHRoaXMuYjJQaHlzaWNzLndvcmxkLkNyZWF0ZUJvZHkoKTtcclxuICAgIGNvbnN0IHBvcyA9IHRoaXMudGVycmFpbkJvZHkuR2V0UG9zaXRpb24oKTtcclxuXHJcbiAgICBjb25zdCBwID0gdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KCdib29sJywgJ3BoYXNlclRlcnJhaW4nLCB0cnVlKVswXTtcclxuICAgIGNvbnN0IGZpeCA9IHAuR2V0Rml4dHVyZUxpc3QoKT8uR2V0U2hhcGUoKSBhcyBQbC5iMkNoYWluU2hhcGU7XHJcbiAgICB0aGlzLmRyYXdUZXJyYWluKGZpeC5tX3ZlcnRpY2VzLm1hcCh2ID0+ICh7eDogKHYueCArIHBvcy54KSAqIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIHk6IC0odi55ICsgcG9zLnkpICogdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZX0pKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdUZXJyYWluKHBvaW50czogUGwuWFlbXSk6IHZvaWQge1xyXG4gICAgY29uc3QgY2h1bmsgPSB0aGlzLmNodW5rcy5zaGlmdCgpO1xyXG4gICAgaWYgKCFjaHVuaykgcmV0dXJuO1xyXG4gICAgdGhpcy5jaHVua3MucHVzaChjaHVuayk7XHJcbiAgICBjaHVuay5jbGVhcigpO1xyXG5cclxuICAgIGNvbnN0IGxhc3RJbmRleCA9IHBvaW50cy5sZW5ndGggLSAxO1xyXG4gICAgY29uc3QgZW5kID0gTWF0aC5tYXgocG9pbnRzWzBdLnksIHBvaW50c1tsYXN0SW5kZXhdLnkpICsgdGhpcy5zY2VuZS5jYW1lcmFzLm1haW4uaGVpZ2h0ICogMjtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgcG9pbnRzLnB1c2goe3g6IHBvaW50c1tsYXN0SW5kZXhdLngsIHk6IGVuZH0sIHt4OiBwb2ludHNbMF0ueCwgeTogZW5kfSk7XHJcbiAgICBmb3IgKGNvbnN0IHtjb2xvciwgd2lkdGh9IG9mIHRoaXMubGF5ZXJzKSB7XHJcbiAgICAgIGNodW5rLnRyYW5zbGF0ZUNhbnZhcygwLCBvZmZzZXQpO1xyXG4gICAgICBjaHVuay5maWxsU3R5bGUoY29sb3IpO1xyXG4gICAgICBjaHVuay5maWxsUG9pbnRzKHBvaW50cywgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgIGNodW5rLnRyYW5zbGF0ZUNhbnZhcygwLCAwKTtcclxuICAgICAgb2Zmc2V0ID0gd2lkdGggKiAwLjU7XHJcbiAgICB9XHJcblxyXG4gICAgcG9pbnRzLmxlbmd0aCAtPSAyO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgUHJlbG9hZFNjZW5lIGZyb20gJy4vc2NlbmVzL1ByZWxvYWRTY2VuZSc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi9zY2VuZXMvR2FtZVNjZW5lJztcclxuaW1wb3J0IEdhbWVTdGF0cyBmcm9tICdnYW1lc3RhdHMuanMnO1xyXG5pbXBvcnQgR2FtZVVJU2NlbmUgZnJvbSAnLi9zY2VuZXMvR2FtZVVJU2NlbmUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX0tFWV9ERUJVRyA9ICdzbm93Ym9hcmRpbmdfZ2FtZV9kZWJ1Zyc7XHJcbmV4cG9ydCBjb25zdCBTRVRUSU5HU19LRVlfREVCVUdfWk9PTSA9ICdzbm93Ym9hcmRpbmdfZ2FtZV9kZWJ1Z196b29tJztcclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTX0tFWV9SRVNPTFVUSU9OID0gJ3Nub3dib2FyZGluZ19nYW1lX3Jlc29sdXRpb24nO1xyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfS0VZX1ZPTFVNRV9NVVNJQyA9ICdzbm93Ym9hcmRpbmdfZ2FtZV92b2x1bWVfbXVzaWMnO1xyXG5leHBvcnQgY29uc3QgU0VUVElOR1NfS0VZX1ZPTFVNRV9TRlggPSAnc25vd2JvYXJkaW5nX2dhbWVfdm9sdW1lX3NmeCc7XHJcblxyXG5leHBvcnQgY29uc3QgS0VZX1VTRVJfSUQgPSAnc25vd2JvYXJkaW5nX2dhbWVfdXNlcl9pZCc7XHJcbmV4cG9ydCBjb25zdCBLRVlfVVNFUl9OQU1FID0gJ3Nub3dib2FyZGluZ19nYW1lX3VzZXJfbmFtZSc7XHJcbmV4cG9ydCBjb25zdCBLRVlfVVNFUl9TQ09SRVMgPSAnc25vd2JvYXJkaW5nX2dhbWVfdXNlcl9zY29yZXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBPSU5UU19QRVJfQ09JTiA9IDEwMDtcclxuZXhwb3J0IGNvbnN0IExFVkVMX1NVQ0NFU1NfQk9OVVNfUE9JTlRTID0gNTAwMDtcclxuZXhwb3J0IGNvbnN0IEJBU0VfRkxJUF9QT0lOVFMgPSAyMDA7XHJcbmV4cG9ydCBjb25zdCBUUklDS19QT0lOVFNfQ09NQk9fRlJBQ1RJT04gPSAwLjI7XHJcbmV4cG9ydCBjb25zdCBIRUFEX01BWF9JTVBVTFNFID0gODtcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1dJRFRIID0gMTI4MDtcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfSEVJR0hUID0gNzIwO1xyXG5leHBvcnQgY29uc3QgUkVTT0xVVElPTl9TQ0FMRTogbnVtYmVyID0gTnVtYmVyKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNFVFRJTkdTX0tFWV9SRVNPTFVUSU9OKSB8fCAxKTtcclxuLy8gRklYTUUgdGhlcmUgaXMgc29tZSBraW5kIG9mIGZsb2F0aW5nIHBvaW50IHByZWNpc2lvbiBpc3N1ZSAoSSBhc3N1bWUpIHdoZXJlIHRoZSB0ZXJyYWluIGdldHMgd2VpcmQgb25jZSBwbGF5ZXIgbW92ZXMgdG8gZmFyIGZyb20gb3JpZ2luXHJcbi8vICBJdCBhcHBlYXJzIGFzIHRoZSByZXNvbHV0aW9uIGFuZCB0aGUgc2NhbGUgaGF2ZSBhbiBpbmZsdWVuY2Ugb24gdGhpcy4gQXMgdGVtcG9yYXJ5IHdvcmthcm91bmQgSSBoYWx2ZWQgdGhlIHdvcmxkIHNpemUgYW5kIGRvdWJsZWQgdGhlIHpvb20uXHJcbi8vICBUaGlzIGxpa2VseSB3b24ndCBiZSBhbiBpc3N1ZSBvbmNlIHRlcnJhaW4gaXMgc3BsaXQgdXAgaW4gY2h1bmtzIChhcyBpdCB3YXMgd2hlbiBpdCB1c2VkIHRvIGJlIHByb2NlZHVyYWwgYmVmb3JlIFJVQkUgbG9hZGVyIGFkZGVkKS5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfWk9PTTogbnVtYmVyID0gTnVtYmVyKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNFVFRJTkdTX0tFWV9ERUJVR19aT09NKSB8fCAyKTtcclxuZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuID0gQm9vbGVhbihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTRVRUSU5HU19LRVlfREVCVUcpKTtcclxuXHJcbmV4cG9ydCBjb25zdCBnYW1lQ29uZmlnOiBQaC5UeXBlcy5Db3JlLkdhbWVDb25maWcgPSB7XHJcbiAgdGl0bGU6ICdTbm93Ym9hcmRpbmcgR2FtZScsXHJcbiAgdmVyc2lvbjogJzEuMC4wJyxcclxuICB0eXBlOiBQaC5BVVRPLFxyXG4gIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gIGRpc2FibGVDb250ZXh0TWVudTogdHJ1ZSxcclxuICBwYXJlbnQ6ICdwaGFzZXItd3JhcHBlcicsXHJcbiAgZG9tOiB7XHJcbiAgICBjcmVhdGVDb250YWluZXI6IHRydWUsXHJcbiAgfSxcclxuICBmcHM6IHtcclxuICAgIG1pbjogNTAsXHJcbiAgICB0YXJnZXQ6IDYwLFxyXG4gICAgc21vb3RoU3RlcDogdHJ1ZSxcclxuICB9LFxyXG4gIC8vIHJvdW5kUGl4ZWxzOiB0cnVlLFxyXG4gIC8vIHBpeGVsQXJ0OiB0cnVlLFxyXG4gIHNjYWxlOiB7XHJcbiAgICBtb2RlOiBQaC5TY2FsZS5GSVQsXHJcbiAgICBhdXRvQ2VudGVyOiBQaC5TY2FsZS5DRU5URVJfQk9USCxcclxuICAgIHdpZHRoOiBERUZBVUxUX1dJRFRIICogUkVTT0xVVElPTl9TQ0FMRSxcclxuICAgIGhlaWdodDogREVGQVVMVF9IRUlHSFQgKiBSRVNPTFVUSU9OX1NDQUxFLFxyXG4gIH0sXHJcbiAgc2NlbmU6IFtQcmVsb2FkU2NlbmUsIEdhbWVTY2VuZSwgR2FtZVVJU2NlbmVdLFxyXG59O1xyXG5cclxuY29uc3QgY29uZmlnID0ge1xyXG4gIGF1dG9QbGFjZTogdHJ1ZSwgLyogYXV0byBwbGFjZSBpbiB0aGUgZG9tICovXHJcbiAgdGFyZ2V0RlBTOiA2MCwgLyogdGhlIHRhcmdldCBtYXggRlBTICovXHJcbiAgcmVkcmF3SW50ZXJ2YWw6IDIwMCwgLyogdGhlIGludGVydmFsIGluIE1TIGZvciByZWRyYXdpbmcgdGhlIEZQUyBncmFwaCAqL1xyXG4gIG1heGltdW1IaXN0b3J5OiAyMDAsIC8qIHRoZSBsZW5ndGggb2YgdGhlIHZpc3VhbCBncmFwaCBoaXN0b3J5IGluIGZyYW1lcyAqL1xyXG4gIHNjYWxlOiAxLCAvKiB0aGUgc2NhbGUgb2YgdGhlIGNhbnZhcyAqL1xyXG4gIG1lbW9yeVVwZGF0ZUludGVydmFsOiAxMDAsIC8qIHRoZSBpbnRlcnZhbCBmb3IgbWVhc3VyaW5nIHRoZSBtZW1vcnkgKi9cclxuICBtZW1vcnlNYXhIaXN0b3J5OiA2MCAqIDEwLCAvKiB0aGUgbWF4IGFtb3VudCBvZiBtZW1vcnkgbWVhc3VyZXMgKi9cclxuXHJcbiAgLy8gU3R5bGluZyBwcm9wc1xyXG4gIEZPTlRfRkFNSUxZOiAnQXJpYWwnLFxyXG4gIENPTE9SX0ZQU19CQVI6ICcjMzRjZmEyJyxcclxuICBDT0xPUl9GUFNfQVZHOiAnI0ZGRicsXHJcbiAgQ09MT1JfVEVYVF9MQUJFTDogJyNGRkYnLFxyXG4gIENPTE9SX1RFWFRfVE9fTE9XOiAnI2VlZTIwNycsXHJcbiAgQ09MT1JfVEVYVF9CQUQ6ICcjZDM0NjQ2JyxcclxuICBDT0xPUl9URVhUX1RBUkdFVDogJyNkMjQ5ZGQnLFxyXG4gIENPTE9SX0JHOiAnIzMzMzMzMycsXHJcbn07XHJcblxyXG5leHBvcnQgbGV0IHN0YXRzOiBHYW1lU3RhdHMgPSB7YmVnaW46ICgpID0+IG51bGwsIGVuZDogKCkgPT4gbnVsbH0gYXMgdW5rbm93biBhcyBHYW1lU3RhdHM7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gIGNvbnN0IGdhbWUgPSBuZXcgUGguR2FtZShnYW1lQ29uZmlnKTtcclxuXHJcbiAgaWYgKERFQlVHKSB7XHJcbiAgICBzdGF0cyA9IG5ldyBHYW1lU3RhdHMoY29uZmlnKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMuZG9tKTtcclxuICB9XHJcbn0pO1xyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCBUZXJyYWluIGZyb20gJy4uL2NvbXBvbmVudHMvVGVycmFpbic7XHJcbmltcG9ydCB7UGh5c2ljc30gZnJvbSAnLi4vY29tcG9uZW50cy9QaHlzaWNzJztcclxuaW1wb3J0IHtERUJVRywgREVGQVVMVF9XSURUSCwgREVGQVVMVF9aT09NLCBzdGF0c30gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgR2FtZVVJU2NlbmUgZnJvbSAnLi9HYW1lVUlTY2VuZSc7XHJcbmltcG9ydCB7QmFja2Ryb3B9IGZyb20gJy4uL2NvbXBvbmVudHMvQmFja2Ryb3AnO1xyXG5pbXBvcnQge1BsYXllckNvbnRyb2xsZXJ9IGZyb20gJy4uL2NvbXBvbmVudHMvUGxheWVyQ29udHJvbGxlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NlbmUgZXh0ZW5kcyBQaC5TY2VuZSB7XHJcbiAgcmVhZG9ubHkgb2JzZXJ2ZXI6IFBoYXNlci5FdmVudHMuRXZlbnRFbWl0dGVyID0gbmV3IFBoLkV2ZW50cy5FdmVudEVtaXR0ZXIoKTtcclxuICBwcml2YXRlIGIyUGh5c2ljczogUGh5c2ljcztcclxuICBwcml2YXRlIHRlcnJhaW46IFRlcnJhaW47XHJcbiAgcHJpdmF0ZSBwbGF5ZXJDb250cm9sbGVyOiBQbGF5ZXJDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgYmFja2Ryb3A6IEJhY2tkcm9wO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKHtrZXk6ICdHYW1lU2NlbmUnfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZSgpIHtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnNldERlYWR6b25lKDUwIC8gMiwgMTI1IC8gMik7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zZXRCYWNrZ3JvdW5kQ29sb3IoMHg1NTU1NTUpO1xyXG4gICAgY29uc3QgcmVzb2x1dGlvbk1vZCA9IHRoaXMuY2FtZXJhcy5tYWluLndpZHRoIC8gREVGQVVMVF9XSURUSDtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnNldFpvb20oREVGQVVMVF9aT09NICogcmVzb2x1dGlvbk1vZCk7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zY3JvbGxYIC09IHRoaXMuY2FtZXJhcy5tYWluLndpZHRoIC8gMjtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnNjcm9sbFkgLT0gdGhpcy5jYW1lcmFzLm1haW4uaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAvLyBGSVhNRSB0aGUgd29ybGQgc2l6ZSBpcyBzdXBwb3NlZCB0byBiZSBzZXQgdG8gNDBweCBwZXIgMW0gYnV0IGR1ZSB0byBmbG9hdGluZyBwb2ludCBwcmVjaXNpb24gaXNzdWVzXHJcbiAgICAvLyAgaXQgaXMgY3VycmVudGx5IGhhbGZlZCBhbmQgem9vbSBpcyBkb3VibGVkIHRlbXBvcmFyaWx5LiBWaXN1YWxseSBpdCBsb29rcyB0aGUgc2FtZSBidXQgbmVlZHMgdG8gYmUgZml4ZWQuXHJcbiAgICAvLyAgVGhlIGlzc3VlIGlzIHRoYXQgdGhlIHRlcnJhaW4gaXMgYSBzaW5nbGUgb2JqZWN0IGluc3RlYWQgb2YgY2h1bmtlZCBhbmQgZ2V0cyB3ZWlyZCBvbmNlIHBsYXllciBtb3ZlcyB0b28gZmFyIGZyb20gdGhlIG9yaWdpbi5cclxuICAgIC8vICBUaGlzIHdhc24ndCBhbiBpc3N1ZSB3aGVuIHRlcnJhaW4gd2FzIHByb2NlZHVyYWwgYW5kIGNodW5rZWQsIHNvIHdpbGwgbGlrZWx5IGZpeCBpdHNlbGYgb25jZSB0aGF0IGlzIG9wdGltaXplZCBhZ2Fpbi5cclxuICAgIHRoaXMuYjJQaHlzaWNzID0gbmV3IFBoeXNpY3ModGhpcywgMjAsIG5ldyBQbC5iMlZlYzIoMCwgLTEwKSk7XHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBuZXcgUGxheWVyQ29udHJvbGxlcih0aGlzLCB0aGlzLmIyUGh5c2ljcyk7XHJcbiAgICB0aGlzLnRlcnJhaW4gPSBuZXcgVGVycmFpbih0aGlzLCB0aGlzLmIyUGh5c2ljcyk7XHJcblxyXG4gICAgdGhpcy5jYW1lcmFzLm1haW4uc3RhcnRGb2xsb3codGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KCdib29sJywgJ3BoYXNlckNhbWVyYUZvbGxvdycsIHRydWUpWzBdLkdldFVzZXJEYXRhKCkgYXMgUGhhc2VyLkdhbWVPYmplY3RzLkltYWdlLCBmYWxzZSwgMC44LCAwLjI1KTtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLmZvbGxvd09mZnNldC5zZXQoLTM3NSAvIDIsIDApO1xyXG4gICAgdGhpcy5zY2VuZS5sYXVuY2goR2FtZVVJU2NlbmUubmFtZSwgW3RoaXMub2JzZXJ2ZXIsICgpID0+IHtcclxuICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnN0YXRlLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMuc2NlbmUucmVzdGFydCgpO1xyXG4gICAgfV0pO1xyXG5cclxuICAgIHRoaXMuYmFja2Ryb3AgPSBuZXcgQmFja2Ryb3AodGhpcyk7XHJcblxyXG4gICAgaWYgKERFQlVHKSB7XHJcbiAgICAgIGNvbnN0IGdyYXBoaWNzID0gdGhpcy5hZGQuZ3JhcGhpY3MoKTtcclxuICAgICAgZ3JhcGhpY3MubGluZVN0eWxlKDUsIDB4MDQ4NzA4LCAxLjApO1xyXG4gICAgICBncmFwaGljcy5iZWdpblBhdGgoKTtcclxuICAgICAgZ3JhcGhpY3MubW92ZVRvKDAsIDApO1xyXG4gICAgICBncmFwaGljcy5saW5lVG8oNDAsIDApO1xyXG4gICAgICBncmFwaGljcy5jbG9zZVBhdGgoKTtcclxuICAgICAgZ3JhcGhpY3Muc2V0RGVwdGgoMTAwMCk7XHJcbiAgICAgIGdyYXBoaWNzLnN0cm9rZVBhdGgoKTtcclxuXHJcbiAgICAgIGdyYXBoaWNzLmxpbmVTdHlsZSg1LCAweGJhMGIyOCwgMS4wKTtcclxuICAgICAgZ3JhcGhpY3MuYmVnaW5QYXRoKCk7XHJcbiAgICAgIGdyYXBoaWNzLm1vdmVUbygwLCAwKTtcclxuICAgICAgZ3JhcGhpY3MubGluZVRvKDAsIDQwKTtcclxuICAgICAgZ3JhcGhpY3MuY2xvc2VQYXRoKCk7XHJcbiAgICAgIGdyYXBoaWNzLnNldERlcHRoKDEwMDApO1xyXG4gICAgICBncmFwaGljcy5zdHJva2VQYXRoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vYnNlcnZlci5vbignZW50ZXJfY3Jhc2hlZCcsICgpID0+IHRoaXMuY2FtZXJhcy5tYWluLnNoYWtlKDIwMCwgMC4wMSkpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgc3RhdHMuYmVnaW4oKTtcclxuICAgIGNvbnN0IGRlbHRhID0gdGhpcy5nYW1lLmxvb3AuZGVsdGEgLyAxMDAwO1xyXG4gICAgdGhpcy5iMlBoeXNpY3MudXBkYXRlKCk7IC8vIG5lZWRzIHRvIGhhcHBlbiBiZWZvcmUgdXBkYXRlIG9mIHNub3dtYW4gb3RoZXJ3aXNlIGIyQm9keS5HZXRQb3NpdGlvbigpIGluYWNjdXJhdGVcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci51cGRhdGUoZGVsdGEpO1xyXG4gICAgdGhpcy5iYWNrZHJvcC51cGRhdGUoKTtcclxuICAgIHN0YXRzLmVuZCgpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQge0RFRkFVTFRfV0lEVEgsIEtFWV9VU0VSX0lELCBLRVlfVVNFUl9OQU1FLCBLRVlfVVNFUl9TQ09SRVMsIFBPSU5UU19QRVJfQ09JTiwgU0VUVElOR1NfS0VZX1JFU09MVVRJT04sIFNFVFRJTkdTX0tFWV9WT0xVTUVfTVVTSUMsIFNFVFRJTkdTX0tFWV9WT0xVTUVfU0ZYfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCB7SVNjb3JlfSBmcm9tICcuLi9jb21wb25lbnRzL1N0YXRlJztcclxuaW1wb3J0IHtjYWxjdWxhdGVUb3RhbFNjb3JlfSBmcm9tICcuLi91dGlsL2NhbGN1bGF0ZVRvdGFsU2NvcmUnO1xyXG5cclxuXHJcbmV4cG9ydCBlbnVtIFBhbmVsSWRzIHtcclxuICBQQU5FTF9QQVVTRV9NRU5VID0gJ3BhbmVsLXBhdXNlLW1lbnUnLFxyXG4gIFBBTkVMX1NFTEVDVF9MRVZFTCA9ICdwYW5lbC1zZWxlY3QtbGV2ZWwnLFxyXG4gIFBBTkVMX0xFQURFUkJPQVJEUyA9ICdwYW5lbC1sZWFkZXJib2FyZHMnLFxyXG4gIFBBTkVMX0hPV19UT19QTEFZID0gJ3BhbmVsLWhvdy10by1wbGF5JyxcclxuICBQQU5FTF9TRVRUSU5HUyA9ICdwYW5lbC1zZXR0aW5ncycsXHJcbiAgUEFORUxfQ1JFRElUUyA9ICdwYW5lbC1jcmVkaXRzJyxcclxuICBQQU5FTF9ZT1VSX1NDT1JFID0gJ3BhbmVsLXlvdXItc2NvcmUnLFxyXG4gIE5PTkUgPSAnbm9uZScsXHJcbn1cclxuXHJcblxyXG5lbnVtIEh1ZElkcyB7XHJcbiAgSFVEX0RJU1RBTkNFID0gJ2h1ZC1kaXN0YW5jZScsXHJcbiAgSFVEX0NPTUJPID0gJ2h1ZC1jb21ibycsXHJcbiAgSFVEX1NDT1JFID0gJ2h1ZC1zY29yZScsXHJcbn1cclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lVUlTY2VuZSBleHRlbmRzIFBoLlNjZW5lIHtcclxuICBwcml2YXRlIG9ic2VydmVyOiBQaGFzZXIuRXZlbnRzLkV2ZW50RW1pdHRlcjtcclxuICBwcml2YXRlIHJlc3RhcnRHYW1lOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwcml2YXRlIG11c2ljOiBQaGFzZXIuU291bmQuQmFzZVNvdW5kO1xyXG4gIHByaXZhdGUgc2Z4X2p1bXBfc3RhcnQ6IFBoYXNlci5Tb3VuZC5CYXNlU291bmQ7XHJcbiAgcHJpdmF0ZSBzZnhfcGlja3VwX3ByZXNlbnQ6IFBoYXNlci5Tb3VuZC5CYXNlU291bmQ7XHJcbiAgcHJpdmF0ZSBzZnhfZGVhdGg6IFBoYXNlci5Tb3VuZC5CYXNlU291bmQ7XHJcbiAgcHJpdmF0ZSBzZnhfZ3J1bnQ6IFBoYXNlci5Tb3VuZC5CYXNlU291bmQ7XHJcbiAgcHJpdmF0ZSBzZnhfYXBwbGF1c2U6IFBoYXNlci5Tb3VuZC5CYXNlU291bmQ7XHJcblxyXG4gIHByaXZhdGUgY29tYm9MZWV3YXlDaGFydDogUGguR2FtZU9iamVjdHMuR3JhcGhpY3M7XHJcbiAgcHJpdmF0ZSByZXNvbHV0aW9uTW9kOiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgcGFuZWxzOiBIVE1MRWxlbWVudFtdID0gW107XHJcbiAgcHJpdmF0ZSBwYW5lbFBhdXNlTWVudTogSFRNTEVsZW1lbnQgfCBudWxsO1xyXG4gIHByaXZhdGUgcGFuZWxMZWFkZXJib2FyZHM6IEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICBwcml2YXRlIHBhbmVsU2VsZWN0TGV2ZWw6IEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICBwcml2YXRlIHBhbmVsSG93VG9QbGF5OiBIVE1MRWxlbWVudCB8IG51bGw7XHJcbiAgcHJpdmF0ZSBwYW5lbFNldHRpbmdzOiBIVE1MRWxlbWVudCB8IG51bGw7XHJcbiAgcHJpdmF0ZSBwYW5lbENyZWRpdHM6IEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICBwcml2YXRlIHBhbmVsWW91clNjb3JlOiBIVE1MRWxlbWVudCB8IG51bGw7XHJcblxyXG4gIHByaXZhdGUgaHVkRGlzdGFuY2U6IEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICBwcml2YXRlIGh1ZENvbWJvOiBIVE1MRWxlbWVudCB8IG51bGw7XHJcbiAgcHJpdmF0ZSBodWRTY29yZTogSFRNTEVsZW1lbnQgfCBudWxsO1xyXG5cclxuICBwcml2YXRlIHBlbmRpbmdTY29yZTogSVNjb3JlIHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBsb2NhbFNjb3JlczogSVNjb3JlW10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcih7a2V5OiAnR2FtZVVJU2NlbmUnfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgaW5pdChbb2JzZXJ2ZXIsIHJlc3RhcnRHYW1lQ0JdOiBbUGguRXZlbnRzLkV2ZW50RW1pdHRlciwgKCkgPT4gdm9pZF0pIHtcclxuICAgIHRoaXMub2JzZXJ2ZXIgPSBvYnNlcnZlcjtcclxuICAgIHRoaXMucmVzdGFydEdhbWUgPSByZXN0YXJ0R2FtZUNCO1xyXG4gICAgdGhpcy5yZXNvbHV0aW9uTW9kID0gdGhpcy5nYW1lLmNhbnZhcy53aWR0aCAvIERFRkFVTFRfV0lEVEg7XHJcbiAgfVxyXG5cclxuICBjcmVhdGUoKSB7XHJcbiAgICBjb25zdCBtdXNpY1ZvbHVtZSA9IE51bWJlcihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTRVRUSU5HU19LRVlfVk9MVU1FX01VU0lDKSB8fCA4MCkgLyAxMDA7XHJcbiAgICB0aGlzLm11c2ljID0gdGhpcy5zb3VuZC5hZGQoJ3JpdmVyc2lkZV9yaWRlJywge2xvb3A6IHRydWUsIHZvbHVtZTogbXVzaWNWb2x1bWUgKiAwLjUsIHJhdGU6IDAuOTUsIGRlbGF5OiAxLCBkZXR1bmU6IDB9KTtcclxuICAgIHRoaXMubXVzaWMucGxheSgpO1xyXG4gICAgY29uc3Qgc2Z4Vm9sdW1lID0gTnVtYmVyKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNFVFRJTkdTX0tFWV9WT0xVTUVfU0ZYKSB8fCA4MCkgLyAxMDA7XHJcbiAgICB0aGlzLnNmeF9qdW1wX3N0YXJ0ID0gdGhpcy5zb3VuZC5hZGQoJ2JvaW5rJywge2RldHVuZTogLTIwMCwgdm9sdW1lOiBzZnhWb2x1bWV9KTtcclxuICAgIHRoaXMuc2Z4X3BpY2t1cF9wcmVzZW50ID0gdGhpcy5zb3VuZC5hZGQoJ3BpY2t1cF9wcmVzZW50Jywge2RldHVuZTogMTAwLCByYXRlOiAxLjEsIHZvbHVtZTogc2Z4Vm9sdW1lfSk7XHJcbiAgICB0aGlzLnNmeF9kZWF0aCA9IHRoaXMuc291bmQuYWRkKCdkZWF0aCcsIHtkZXR1bmU6IDcwMCwgcmF0ZTogMS4yNSwgdm9sdW1lOiBzZnhWb2x1bWV9KTtcclxuICAgIHRoaXMuc2Z4X2dydW50ID0gdGhpcy5zb3VuZC5hZGQoJ2dydW50Jywge2RldHVuZTogNzAwLCByYXRlOiAxLjI1LCB2b2x1bWU6IHNmeFZvbHVtZSAqIDAuNn0pO1xyXG4gICAgdGhpcy5zZnhfYXBwbGF1c2UgPSB0aGlzLnNvdW5kLmFkZCgnYXBwbGF1c2UnLCB7ZGV0dW5lOiAwLCByYXRlOiAxLCB2b2x1bWU6IHNmeFZvbHVtZSAqIDAuNn0pO1xyXG5cclxuICAgIGNvbnN0IHNjcmVlbkNlbnRlclggPSB0aGlzLmNhbWVyYXMubWFpbi53b3JsZFZpZXcueCArIHRoaXMuY2FtZXJhcy5tYWluLndpZHRoIC8gMjtcclxuICAgIGNvbnN0IHNjcmVlbkNlbnRlclkgPSB0aGlzLmNhbWVyYXMubWFpbi53b3JsZFZpZXcueSArIHRoaXMuY2FtZXJhcy5tYWluLmhlaWdodCAvIDI7XHJcblxyXG4gICAgdGhpcy5pbml0RG9tVWkoKTtcclxuXHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCd0b2dnbGVfcGF1c2UnLCAocGF1c2VkLCBhY3RpdmVQYW5lbCkgPT4gdGhpcy5zZXRQYW5lbFZpc2liaWxpdHkocGF1c2VkID8gYWN0aXZlUGFuZWwgOiBQYW5lbElkcy5OT05FKSk7XHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCdqdW1wX3N0YXJ0JywgKCkgPT4gdGhpcy5zZnhfanVtcF9zdGFydC5wbGF5KHtkZWxheTogMC4xNX0pKTtcclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ3BpY2t1cF9wcmVzZW50JywgdG90YWwgPT4ge1xyXG4gICAgICBpZiAodGhpcy5odWREaXN0YW5jZSkgdGhpcy5odWREaXN0YW5jZS5pbm5lclRleHQgPSBTdHJpbmcodG90YWwpICsgJ3gnO1xyXG4gICAgICB0aGlzLnNmeF9waWNrdXBfcHJlc2VudC5wbGF5KCk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ2NvbWJvX2NoYW5nZScsIChhY2N1bXVsYXRlZCwgbXVsdGlwbGllcikgPT4ge1xyXG4gICAgICBpZiAodGhpcy5odWRDb21ibykgdGhpcy5odWRDb21iby5pbm5lclRleHQgPSBhY2N1bXVsYXRlZCA/IChhY2N1bXVsYXRlZCArICd4JyArIG11bHRpcGxpZXIpIDogJy0nO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCdzY29yZV9jaGFuZ2UnLCBzY29yZSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmh1ZFNjb3JlKSB0aGlzLmh1ZFNjb3JlLmlubmVyVGV4dCA9IFN0cmluZyhjYWxjdWxhdGVUb3RhbFNjb3JlKHNjb3JlKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNvbWJvTGVld2F5Q2hhcnQgPSB0aGlzLmFkZC5ncmFwaGljcygpO1xyXG4gICAgdGhpcy5vYnNlcnZlci5vbignY29tYm9fbGVld2F5X3VwZGF0ZScsICh2YWx1ZSkgPT4ge1xyXG4gICAgICB0aGlzLmNvbWJvTGVld2F5Q2hhcnRcclxuICAgICAgLmNsZWFyKClcclxuICAgICAgLmZpbGxTdHlsZSgweGZmZmZmZilcclxuICAgICAgLnNsaWNlKHNjcmVlbkNlbnRlclgsIDcyICogdGhpcy5yZXNvbHV0aW9uTW9kLCAxMiAqIHRoaXMucmVzb2x1dGlvbk1vZCwgdmFsdWUsIE1hdGguUEkgKiAxLjUpXHJcbiAgICAgIC5maWxsUGF0aCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5vYnNlcnZlci5vbignZW50ZXJfY3Jhc2hlZCcsIChzY29yZTogSVNjb3JlKSA9PiB7XHJcbiAgICAgIHRoaXMucGVuZGluZ1Njb3JlID0gc2NvcmU7XHJcbiAgICAgIHRoaXMuc2Z4X2RlYXRoLnBsYXkoKTtcclxuICAgICAgdGhpcy5zZnhfZ3J1bnQucGxheSgpO1xyXG4gICAgICB0aGlzLmNvbWJvTGVld2F5Q2hhcnQuY2xlYXIoKTtcclxuICAgICAgaWYgKHRoaXMuaHVkQ29tYm8pIHRoaXMuaHVkQ29tYm8uaW5uZXJUZXh0ID0gJy0nO1xyXG4gICAgICB0aGlzLnR3ZWVucy5hZGQoe1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMubXVzaWMsXHJcbiAgICAgICAgdm9sdW1lOiAwLjAsXHJcbiAgICAgICAgZGV0dW5lOiAtNTAwLFxyXG4gICAgICAgIHJhdGU6IDAuNSxcclxuICAgICAgICBkdXJhdGlvbjogMjAwMCxcclxuICAgICAgICBvbkNvbXBsZXRlOiB0d2VlbiA9PiB7XHJcbiAgICAgICAgICB0aGlzLm11c2ljLnN0b3AoKTtcclxuICAgICAgICAgIHRoaXMudXBkYXRlWW91clNjb3JlUGFuZWxEYXRhKHNjb3JlKTtcclxuICAgICAgICAgIHRoaXMuc2V0UGFuZWxWaXNpYmlsaXR5KFBhbmVsSWRzLlBBTkVMX1lPVVJfU0NPUkUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5vYnNlcnZlci5vbignbGV2ZWxfZmluaXNoJywgKHNjb3JlOiBJU2NvcmUpID0+IHtcclxuICAgICAgdGhpcy5wZW5kaW5nU2NvcmUgPSBzY29yZTtcclxuICAgICAgdGhpcy5zZnhfYXBwbGF1c2UucGxheSgpO1xyXG4gICAgICB0aGlzLmNvbWJvTGVld2F5Q2hhcnQuY2xlYXIoKTtcclxuICAgICAgdGhpcy50d2VlbnMuYWRkKHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLm11c2ljLFxyXG4gICAgICAgIHZvbHVtZTogMCxcclxuICAgICAgICBkdXJhdGlvbjogMjAwMCxcclxuICAgICAgICBvbkNvbXBsZXRlOiB0d2VlbiA9PiB7XHJcbiAgICAgICAgICB0aGlzLm11c2ljLnN0b3AoKTtcclxuICAgICAgICAgIHRoaXMudXBkYXRlWW91clNjb3JlUGFuZWxEYXRhKHNjb3JlKTtcclxuICAgICAgICAgIHRoaXMuc2V0UGFuZWxWaXNpYmlsaXR5KFBhbmVsSWRzLlBBTkVMX1lPVVJfU0NPUkUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXREb21VaSgpOiBQaC5HYW1lT2JqZWN0cy5ET01FbGVtZW50IHtcclxuICAgIGNvbnN0IHNjcmVlbkNlbnRlclggPSB0aGlzLmNhbWVyYXMubWFpbi53b3JsZFZpZXcueCArIHRoaXMuY2FtZXJhcy5tYWluLndpZHRoIC8gMjtcclxuICAgIGNvbnN0IHNjcmVlbkNlbnRlclkgPSB0aGlzLmNhbWVyYXMubWFpbi53b3JsZFZpZXcueSArIHRoaXMuY2FtZXJhcy5tYWluLmhlaWdodCAvIDI7XHJcblxyXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuYWRkLmRvbShzY3JlZW5DZW50ZXJYLCBzY3JlZW5DZW50ZXJZKS5jcmVhdGVGcm9tQ2FjaGUoJ2RvbV9nYW1lX3VpJyk7XHJcbiAgICBlbGVtZW50LnNldFNjYWxlKHRoaXMucmVzb2x1dGlvbk1vZCkuYWRkTGlzdGVuZXIoJ2NsaWNrJyk7XHJcblxyXG4gICAgY29uc3QgdmFsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oU0VUVElOR1NfS0VZX1JFU09MVVRJT04pIHx8ICcxJztcclxuICAgIGNvbnN0IHJhZGlvczogSFRNTElucHV0RWxlbWVudFtdID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjc2V0dGluZ3MtZm9ybSBpbnB1dFtuYW1lPVwicmVzb2x1dGlvblwiXScpKTtcclxuICAgIGZvciAoY29uc3QgcmFkaW8gb2YgcmFkaW9zKSBpZiAocmFkaW8udmFsdWUgPT09IHZhbCkgcmFkaW8uY2hlY2tlZCA9IHRydWU7XHJcbiAgICBjb25zdCB2YWxWb2x1bWVNdXNpYyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNFVFRJTkdTX0tFWV9WT0xVTUVfTVVTSUMpIHx8ICc4MCc7XHJcbiAgICBjb25zdCBpbnB1dFZvbHVtZU11c2ljOiBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZXR0aW5ncy1mb3JtIGlucHV0W25hbWU9XCJ2b2x1bWVNdXNpY1wiXScpO1xyXG4gICAgaWYgKGlucHV0Vm9sdW1lTXVzaWMpIGlucHV0Vm9sdW1lTXVzaWMudmFsdWUgPSB2YWxWb2x1bWVNdXNpYztcclxuICAgIGNvbnN0IHZhbFZvbHVtZVNmeCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNFVFRJTkdTX0tFWV9WT0xVTUVfU0ZYKSB8fCAnODAnO1xyXG4gICAgY29uc3QgaW5wdXRWb2x1bWVTZng6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NldHRpbmdzLWZvcm0gaW5wdXRbbmFtZT1cInZvbHVtZVNmeFwiXScpO1xyXG4gICAgaWYgKGlucHV0Vm9sdW1lU2Z4KSBpbnB1dFZvbHVtZVNmeC52YWx1ZSA9IHZhbFZvbHVtZVNmeDtcclxuXHJcbiAgICAvLyBUaGUgZ2FtZSBtYXkgbm90IHJ1biB3ZWxsIG9uIHVudmVyaWZpZWQgYnJvd3NlcnMuIEZvciBleGFtcGxlIGl0IHNlZW1zIHRvIHJ1biBxdWl0ZSBiYWQgb24gZmlyZWZveCBhdG0uXHJcbiAgICAvLyBGb3Igbm93IGEgdGV4dCBtZXNzYWdlIGlzIHNob3duIGVuY291cmFnaW5nIHVzZXIgdG8gc3dpdGNoIHRvIGEgZGlmZmVyZW50IGJyb3dzZXIgaWYgdGhlcmUgYXJlIGlzc3Vlcy5cclxuICAgIC8vIE9sZGVyIHYwLjUuMCBwcm90b3R5cGUgd2FzIHJ1bm5pbmcgZmFpcmx5IHdlbGwgb24gbG93ZXN0IHJlc29sdXRpb24gb24gYSByYXNwYmVycnkgcGkuIHYxLjAuMCBjYW4gZGVmaW5pdGVseSBiZSBvcHRpbWl6ZWQgYmV0dGVyLlxyXG4gICAgY29uc3QgYnJvd3NlciA9IHRoaXMuc3lzLmdhbWUuZGV2aWNlLmJyb3dzZXI7XHJcbiAgICBpZiAoIShicm93c2VyLmNocm9tZSB8fCBicm93c2VyLmVkZ2UgfHwgYnJvd3Nlci5vcGVyYSkpIHtcclxuICAgICAgY29uc3QgZWxVbnN1cHBvcnRlZEJyb3dzZXJOb3RpY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndW5zdXBwb3J0ZWQtYnJvd3Nlci1ub3RpY2UnKTtcclxuICAgICAgaWYgKCFlbFVuc3VwcG9ydGVkQnJvd3Nlck5vdGljZSkgdGhyb3cgbmV3IEVycm9yKCdlbGVtZW50IHdpdGggaWQgXCJ1bnN1cHBvcnRlZC1icm93c2VyLW5vdGljZVwiIG5vdCBmb3VuZCcpO1xyXG4gICAgICBjb25zb2xlLndhcm4oJ1Vuc3VwcG9ydGVkIGJyb3dzZXIgZGV0ZWN0ZWQuIEdhbWUgbWF5IHJ1biB3ZWxsIGJ1dCBpdCB3YXMgbm90IG9wdGltaXplZCBmb3IgdGhpcyBwYXJ0aWN1bGFyIGJyb3dzZXI6JywgYnJvd3Nlcik7XHJcbiAgICAgIGVsVW5zdXBwb3J0ZWRCcm93c2VyTm90aWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGVsUGF1c2VJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhdXNlLWdhbWUtaWNvbicpO1xyXG4gICAgY29uc3QgZWxIb3dUb1BsYXlJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hvdy10by1wbGF5LWljb24nKTtcclxuICAgIGlmIChlbFBhdXNlSWNvbiAmJiBlbEhvd1RvUGxheUljb24pIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBlbFBhdXNlSWNvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgZWxIb3dUb1BsYXlJY29uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgfSwgMjUwKTsgLy8gaWYgbm90IGhpZGRlbiBhdCB0aGUgc3RhcnQgaXQgbWF5IHNob3cgdGhlIG1hdGVyaWFsIGljb24gdGV4dCBmb3IgYSBzcGxpdCBzZWNvbmQgdW50aWwgbG9hZGVkLlxyXG5cclxuICAgIHRoaXMucGFuZWxQYXVzZU1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChQYW5lbElkcy5QQU5FTF9QQVVTRV9NRU5VKTtcclxuICAgIHRoaXMucGFuZWxTZWxlY3RMZXZlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFBhbmVsSWRzLlBBTkVMX1NFTEVDVF9MRVZFTCk7XHJcbiAgICB0aGlzLnBhbmVsSG93VG9QbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoUGFuZWxJZHMuUEFORUxfSE9XX1RPX1BMQVkpO1xyXG4gICAgdGhpcy5wYW5lbExlYWRlcmJvYXJkcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFBhbmVsSWRzLlBBTkVMX0xFQURFUkJPQVJEUyk7XHJcbiAgICB0aGlzLnBhbmVsU2V0dGluZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChQYW5lbElkcy5QQU5FTF9TRVRUSU5HUyk7XHJcbiAgICB0aGlzLnBhbmVsQ3JlZGl0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFBhbmVsSWRzLlBBTkVMX0NSRURJVFMpO1xyXG4gICAgdGhpcy5wYW5lbFlvdXJTY29yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFBhbmVsSWRzLlBBTkVMX1lPVVJfU0NPUkUpO1xyXG5cclxuICAgIHRoaXMuaHVkRGlzdGFuY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChIdWRJZHMuSFVEX0RJU1RBTkNFKTtcclxuICAgIHRoaXMuaHVkQ29tYm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChIdWRJZHMuSFVEX0NPTUJPKTtcclxuICAgIHRoaXMuaHVkU2NvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChIdWRJZHMuSFVEX1NDT1JFKTtcclxuXHJcbiAgICBpZiAoIXRoaXMucGFuZWxQYXVzZU1lbnUpIHRocm93IG5ldyBFcnJvcigncGFuZWxQYXVzZU1lbnUgbm90IGZvdW5kJyk7XHJcbiAgICBpZiAoIXRoaXMucGFuZWxTZWxlY3RMZXZlbCkgdGhyb3cgbmV3IEVycm9yKCdwYW5lbFNlbGVjdExldmVsIG5vdCBmb3VuZCcpO1xyXG4gICAgaWYgKCF0aGlzLnBhbmVsSG93VG9QbGF5KSB0aHJvdyBuZXcgRXJyb3IoJ3BhbmVsSG93VG9QbGF5IG5vdCBmb3VuZCcpO1xyXG4gICAgaWYgKCF0aGlzLnBhbmVsTGVhZGVyYm9hcmRzKSB0aHJvdyBuZXcgRXJyb3IoJ3BhbmVsTGVhZGVyYm9hcmRzIG5vdCBmb3VuZCcpO1xyXG4gICAgaWYgKCF0aGlzLnBhbmVsU2V0dGluZ3MpIHRocm93IG5ldyBFcnJvcigncGFuZWxTZXR0aW5ncyBub3QgZm91bmQnKTtcclxuICAgIGlmICghdGhpcy5wYW5lbENyZWRpdHMpIHRocm93IG5ldyBFcnJvcigncGFuZWxDcmVkaXRzIG5vdCBmb3VuZCcpO1xyXG4gICAgaWYgKCF0aGlzLnBhbmVsWW91clNjb3JlKSB0aHJvdyBuZXcgRXJyb3IoJ3BhbmVsWW91clNjb3JlIG5vdCBmb3VuZCcpO1xyXG5cclxuICAgIGlmICghdGhpcy5odWREaXN0YW5jZSkgdGhyb3cgbmV3IEVycm9yKCdodWREaXN0YW5jZSBub3QgZm91bmQnKTtcclxuICAgIGlmICghdGhpcy5odWRDb21ibykgdGhyb3cgbmV3IEVycm9yKCdodWRDb21ibyBub3QgZm91bmQnKTtcclxuICAgIGlmICghdGhpcy5odWRTY29yZSkgdGhyb3cgbmV3IEVycm9yKCdodWRTY29yZSBub3QgZm91bmQnKTtcclxuXHJcbiAgICB0aGlzLnBhbmVscyA9IFtcclxuICAgICAgdGhpcy5wYW5lbFBhdXNlTWVudSxcclxuICAgICAgdGhpcy5wYW5lbFNlbGVjdExldmVsLFxyXG4gICAgICB0aGlzLnBhbmVsSG93VG9QbGF5LFxyXG4gICAgICB0aGlzLnBhbmVsTGVhZGVyYm9hcmRzLFxyXG4gICAgICB0aGlzLnBhbmVsU2V0dGluZ3MsXHJcbiAgICAgIHRoaXMucGFuZWxDcmVkaXRzLFxyXG4gICAgICB0aGlzLnBhbmVsWW91clNjb3JlLFxyXG4gICAgXTtcclxuXHJcbiAgICBlbGVtZW50Lm9uKCdjbGljaycsIChldnQpID0+IHtcclxuICAgICAgICBzd2l0Y2ggKGV2dC50YXJnZXQuaWQpIHtcclxuICAgICAgICAgIGNhc2UgJ2J0bi1nb3RvLXBhdXNlLW1lbnUnOiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UGFuZWxWaXNpYmlsaXR5KFBhbmVsSWRzLlBBTkVMX1BBVVNFX01FTlUpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhc2UgJ2J0bi1yZXN1bWUtZ2FtZSc6IHtcclxuICAgICAgICAgICAgdGhpcy5zZXRQYW5lbFZpc2liaWxpdHkoUGFuZWxJZHMuTk9ORSk7XHJcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXIuZW1pdCgncmVzdW1lX2dhbWUnKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlICdidG4tZ290by1zZWxlY3QtbGV2ZWwnOiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UGFuZWxWaXNpYmlsaXR5KFBhbmVsSWRzLlBBTkVMX1NFTEVDVF9MRVZFTCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FzZSAnYnRuLWdvdG8taG93LXRvLXBsYXknOiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UGFuZWxWaXNpYmlsaXR5KFBhbmVsSWRzLlBBTkVMX0hPV19UT19QTEFZKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlICdidG4tZ290by1sZWFkZXJib2FyZHMnOiB7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxTY29yZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKEtFWV9VU0VSX1NDT1JFUykgfHwgJ1tdJyk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGVhZGVyYm9hcmRQYW5lbERhdGEodGhpcy5sb2NhbFNjb3Jlcyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UGFuZWxWaXNpYmlsaXR5KFBhbmVsSWRzLlBBTkVMX0xFQURFUkJPQVJEUyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FzZSAnYnRuLWdvdG8tc2V0dGluZ3MnOiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UGFuZWxWaXNpYmlsaXR5KFBhbmVsSWRzLlBBTkVMX1NFVFRJTkdTKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlICdidG4tZ290by1jcmVkaXRzJzoge1xyXG4gICAgICAgICAgICB0aGlzLnNldFBhbmVsVmlzaWJpbGl0eShQYW5lbElkcy5QQU5FTF9DUkVESVRTKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlICdwYXVzZS1nYW1lLWljb24nOiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhbmVsUGF1c2VNZW51Py5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5vYnNlcnZlci5lbWl0KCdwYXVzZV9nYW1lX2ljb25fcHJlc3NlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FzZSAnaG93LXRvLXBsYXktaWNvbic6IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFuZWxQYXVzZU1lbnU/LmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykpIHtcclxuICAgICAgICAgICAgICB0aGlzLm9ic2VydmVyLmVtaXQoJ2hvd190b19wbGF5X2ljb25fcHJlc3NlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FzZSAnYnRuLXNjb3JlLXN1Ym1pdCc6IHtcclxuICAgICAgICAgICAgY29uc3Qgc3VibWl0U2NvcmVGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1Ym1pdC1zY29yZScpO1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVJbnB1dD8udmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuYW1lICYmIHRoaXMucGVuZGluZ1Njb3JlICYmIHN1Ym1pdFNjb3JlRm9ybSkge1xyXG4gICAgICAgICAgICAgIHRoaXMuc3VibWl0U2NvcmUodGhpcy5wZW5kaW5nU2NvcmUsIG5hbWUpO1xyXG4gICAgICAgICAgICAgIHN1Ym1pdFNjb3JlRm9ybS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlICdidG4tc2F2ZS1zZXR0aW5ncyc6IHtcclxuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzRm9ybSA9IHRoaXMucGFuZWxTZXR0aW5ncz8ucXVlcnlTZWxlY3RvcignZm9ybScpO1xyXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3NGb3JtKSB7XHJcbiAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU0VUVElOR1NfS0VZX1JFU09MVVRJT04sIHNldHRpbmdzRm9ybS5yZXNvbHV0aW9uLnZhbHVlIHx8ICcxJyk7XHJcbiAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU0VUVElOR1NfS0VZX1ZPTFVNRV9NVVNJQywgc2V0dGluZ3NGb3JtLnZvbHVtZU11c2ljLnZhbHVlKTtcclxuICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTRVRUSU5HU19LRVlfVk9MVU1FX1NGWCwgc2V0dGluZ3NGb3JtLnZvbHVtZVNmeC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXNlICdidG4tcGxheS1hZ2Fpbic6IHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5QWdhaW4oKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdub24taW50ZXJhY3RhYmxlIHRhcmdldCBpZCcsIGV2dC50YXJnZXQuaWQpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBlbGVtZW50O1xyXG5cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGxheUFnYWluKCkge1xyXG4gICAgdGhpcy5tdXNpYy5zdG9wKCk7XHJcbiAgICB0aGlzLnJlc3RhcnRHYW1lKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldFBhbmVsVmlzaWJpbGl0eShwYW5lbElkOiBQYW5lbElkcykge1xyXG4gICAgY29uc3QgZWxQYXVzZUljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF1c2UtZ2FtZS1pY29uJyk7XHJcbiAgICBjb25zdCBlbEhvd3RvUGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdob3ctdG8tcGxheS1pY29uJyk7XHJcbiAgICBpZiAoZWxQYXVzZUljb24gJiYgZWxIb3d0b1BsYXkpIHtcclxuICAgICAgaWYgKHBhbmVsSWQgPT09IFBhbmVsSWRzLk5PTkUpIHtcclxuICAgICAgICBlbFBhdXNlSWNvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBlbEhvd3RvUGxheS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbFBhdXNlSWNvbi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBlbEhvd3RvUGxheS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucGFuZWxzLmZvckVhY2gocCA9PiB7XHJcbiAgICAgIGlmIChwLmlkID09PSBwYW5lbElkKSB7XHJcbiAgICAgICAgcC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVZb3VyU2NvcmVQYW5lbERhdGEoc2NvcmU6IElTY29yZSkge1xyXG4gICAgaWYgKHRoaXMucGFuZWxZb3VyU2NvcmUpIHtcclxuICAgICAgY29uc3QgZWxEaXN0YW5jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd5b3VyLXNjb3JlLWRpc3RhbmNlJyk7XHJcbiAgICAgIGNvbnN0IGVsQ29pbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneW91ci1zY29yZS1jb2lucycpO1xyXG4gICAgICBjb25zdCBlbFRyaWNrcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd5b3VyLXNjb3JlLXRyaWNrLXNjb3JlJyk7XHJcbiAgICAgIGNvbnN0IGVsVHJpY2tzQmVzdENvbWJvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3lvdXItc2NvcmUtYmVzdC1jb21ibycpO1xyXG4gICAgICBjb25zdCBlbFRvdGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3lvdXItc2NvcmUtdG90YWwnKTtcclxuICAgICAgY29uc3QgZWxVc2VybmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VybmFtZScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgIGNvbnN0IGVsU3VibWl0U2NvcmVGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1Ym1pdC1zY29yZScpO1xyXG5cclxuICAgICAgc2NvcmUuZmluaXNoZWRMZXZlbFxyXG4gICAgICAgID8gdGhpcy5wYW5lbFlvdXJTY29yZS5jbGFzc0xpc3QuYWRkKCdzdWNjZWVkZWQnKVxyXG4gICAgICAgIDogdGhpcy5wYW5lbFlvdXJTY29yZS5jbGFzc0xpc3QucmVtb3ZlKCdzdWNjZWVkZWQnKTtcclxuXHJcbiAgICAgIGlmIChlbERpc3RhbmNlKSBlbERpc3RhbmNlLmlubmVyVGV4dCA9IFN0cmluZyhzY29yZS5kaXN0YW5jZSkgKyAnbSc7XHJcbiAgICAgIGlmIChlbENvaW5zKSBlbENvaW5zLmlubmVyVGV4dCA9IGAke3Njb3JlLmNvaW5zfXgke1BPSU5UU19QRVJfQ09JTn1gO1xyXG4gICAgICBpZiAoZWxUcmlja3MpIGVsVHJpY2tzLmlubmVyVGV4dCA9IFN0cmluZyhzY29yZS50cmlja1Njb3JlKTtcclxuICAgICAgaWYgKGVsVHJpY2tzQmVzdENvbWJvKSBlbFRyaWNrc0Jlc3RDb21iby5pbm5lclRleHQgPSBTdHJpbmcoc2NvcmUuYmVzdENvbWJvLmFjY3VtdWxhdG9yICogc2NvcmUuYmVzdENvbWJvLm11bHRpcGxpZXIpO1xyXG4gICAgICBpZiAoZWxUb3RhbCkgZWxUb3RhbC5pbm5lclRleHQgPSBTdHJpbmcoY2FsY3VsYXRlVG90YWxTY29yZShzY29yZSkpO1xyXG5cclxuICAgICAgY29uc3QgdXNlcm5hbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShLRVlfVVNFUl9OQU1FKTtcclxuICAgICAgY29uc3QgdXNlcklkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oS0VZX1VTRVJfSUQpO1xyXG4gICAgICBpZiAoZWxVc2VybmFtZSAmJiAhdXNlcm5hbWUpIHtcclxuICAgICAgICAvLyBGaXJzdCB0aW1lIHBsYXllciB3aXRob3V0IGEgdXNlcm5hbWUuIFNjb3JlIGlzIHN1Ym1pdHRlZCBtYW51YWxseSBzb21ld2hlcmUgZWxzZSBhZnRlciBjbGlja2luZyBhIGJ1dHRvbi5cclxuICAgICAgICBlbFVzZXJuYW1lLnZhbHVlID0gYFBsYXllcl8ke3RoaXMucHNldWRvUmFuZG9tSWQoKX1gO1xyXG4gICAgICAgIGVsVXNlcm5hbWUuc2V0QXR0cmlidXRlKCd2YWx1ZScsIGVsVXNlcm5hbWUudmFsdWUpO1xyXG4gICAgICAgIC8vIFRoaXMgZ2FtZSBoYXMgbm8gYXV0aC4gVXNlcnMgYXJlIGlkZW50aWZpZWQgYnkgcHNldWRvIHNlY3JldCB1c2VySWQgd2hpY2ggaXMgc3RvcmVkIGxvY2FsbHkgYW5kIHNoYWxsIG5vdCBiZSBtYWRlIHB1YmxpYyB2aWEgQVBJXHJcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgYW5vbnltb3VzIHVzZXJzIHRvIHN1Ym1pdCBzY29yZXMgd2hpbGUgbWFraW5nIGl0IGltcG9zc2libGUgZm9yIG90aGVycyB0byBzdWJtaXQgYSBzY29yZSBpbiB0aGUgbmFtZSBvZiBzb21lb25lIGVsc2UgKGFzIGxvbmcgYXMgdXNlcklkIGRvZXNuJ3QgbGVhaykuXHJcbiAgICAgICAgLy8gTWF5YmUgdGhlIGdhbWUgd2lsbCBoYXZlIHByb3BlciBhdXRoIGF0IHNvbWUgcG9pbnQgaW4gdGhlIGZ1dHVyZS4gSWYgdGhhdCBoYXBwZW5zLCBhbiBhbm9ueW1vdXMgdXNlciBjYW4gYmUgdHVybmVkIGludG8gYSBcInJlYWxcIiB1c2VyIHByb2ZpbGUuXHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oS0VZX1VTRVJfTkFNRSwgZWxVc2VybmFtZS52YWx1ZSk7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oS0VZX1VTRVJfSUQsIGNyeXB0by5yYW5kb21VVUlEKCkgfHwgdGhpcy5wc2V1ZG9SYW5kb21JZCgpKTtcclxuICAgICAgfSBlbHNlIGlmICh1c2VybmFtZSAmJiB1c2VySWQpIHtcclxuICAgICAgICBlbFN1Ym1pdFNjb3JlRm9ybT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgLy8gU2NvcmUgaXMgc3VibWl0dGVkIGF1dG9tYXRpY2FsbHkgZm9yIHVzZXJzIHRoYXQgc3VibWl0dGVkIGEgc2NvcmUgb25jZSBiZWZvcmUgZnJvbSB0aGlzIGRldmljZSBhbmQgYnJvd3Nlci5cclxuICAgICAgICB0aGlzLnN1Ym1pdFNjb3JlKHNjb3JlLCB1c2VySWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN1Ym1pdFNjb3JlKHNjb3JlOiBJU2NvcmUsIHVzZXJJZDogc3RyaW5nKSB7XHJcbiAgICAvLyBGSVhNRSB0aGVyZSBhcmUgc29tZSBhbm5veWluZyBpc3N1ZXMgd2l0aCB0aGUgZmlyZWJhc2UgYmFzZWQgZGF0YWJhc2UuIFRoZSBjaGFuZ2VzIHdpbGwgb25seSBiZSBjb21taXR0ZWQgYW5kIHB1c2hlZCB3aGVuIEkgaGFkIHRpbWUgdG8gZGVhbCB3aXRoIHRoZW0uLi5cclxuICAgIC8vICBGb3Igbm93IHRoZSBnYW1lIGhhcyBvbmx5IGEgbG9jYWwgbGVhZGVyYm9hcmQgd2hlcmUgcGxheWVycyBjYW4gb25seSBzZWUgdGhlaXIgb3duIHBhc3Qgc2NvcmVzLlxyXG4gICAgLy8gIFNjb3JlcyBhcmUgcHJlc2VydmVkIGxvY2FsbHkgaW4gc3VjaCBhIHdheSB0aGF0IGl0IG1heSBiZSBwb3NzaWJsZSB0byBzdWJtaXQgdGhlbSBsYXRlciBvbiB3aGVuIHVzZXIgcGxheXMgdGhlIGdhbWUgYWdhaW4gb25jZSBsZWFkZXJib2FyZHMgYXJlIGVuYWJsZWQuXHJcbiAgICBjb25zdCBsb2NhbFNjb3JlczogSVNjb3JlW10gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKEtFWV9VU0VSX1NDT1JFUykgfHwgJ1tdJyk7XHJcbiAgICBzY29yZS5pZCA9IHRoaXMucHNldWRvUmFuZG9tSWQoKTtcclxuICAgIHNjb3JlLnRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICBsb2NhbFNjb3Jlcy5wdXNoKHNjb3JlKTtcclxuICAgIHRoaXMubG9jYWxTY29yZXMgPSBsb2NhbFNjb3JlcztcclxuICAgIGNvbnNvbGUubG9nKCdsb2NhbFNjb3JlcycsIGxvY2FsU2NvcmVzKTtcclxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEtFWV9VU0VSX1NDT1JFUywgSlNPTi5zdHJpbmdpZnkobG9jYWxTY29yZXMpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcHNldWRvUmFuZG9tSWQoKTogc3RyaW5nIHtcclxuICAgIC8vIGZhbGxiYWNrIGlzIHVuaXF1ZSBlbm91Z2ggZm9yIHB1cnBvc2VzIG9mIHRoaXMgZ2FtZSBhdG0uXHJcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUxlYWRlcmJvYXJkUGFuZWxEYXRhKGxvY2FsU2NvcmVzOiBJU2NvcmVbXSkge1xyXG4gICAgY29uc3QgbGVhZGVyYm9hcmRJdGVtVGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlYWRlcmJvYXJkLWl0ZW0tdGVtcGxhdGUnKSBhcyBIVE1MVGVtcGxhdGVFbGVtZW50O1xyXG4gICAgY29uc3QgbGVhZGVyYm9hcmRJdGVtQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlYWRlcmJvYXJkLWl0ZW0tY29udGFpbmVyJyk7XHJcbiAgICBpZiAodGhpcy5wYW5lbExlYWRlcmJvYXJkcyAmJiBsZWFkZXJib2FyZEl0ZW1UZW1wbGF0ZSAmJiBsZWFkZXJib2FyZEl0ZW1Db250YWluZXIpIHtcclxuICAgICAgbG9jYWxTY29yZXMgPSBsb2NhbFNjb3Jlc1xyXG4gICAgICAubWFwKHMgPT4gKHsuLi5zLCB0b3RhbDogY2FsY3VsYXRlVG90YWxTY29yZShzKSwgdXNlcm5hbWU6IHMudXNlcm5hbWUgfHwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oS0VZX1VTRVJfTkFNRSkgYXMgc3RyaW5nfSkpXHJcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnRvdGFsIC0gYS50b3RhbCk7XHJcbiAgICAgIGZvciAoY29uc3QgW2ksIHNjb3JlXSBvZiBsb2NhbFNjb3Jlcy5lbnRyaWVzKCkpIHtcclxuICAgICAgICBjb25zdCBjbG9uZTogSFRNTEVsZW1lbnQgPSBsZWFkZXJib2FyZEl0ZW1UZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICBjb25zdCBjbG9uZUVsUmFuayA9IGNsb25lLnF1ZXJ5U2VsZWN0b3IoJyNsZWFkZXJib2FyZC1pdGVtLXJhbmsnKTtcclxuICAgICAgICBjb25zdCBjbG9uZUVsVXNlcm5hbWUgPSBjbG9uZS5xdWVyeVNlbGVjdG9yKCcjbGVhZGVyYm9hcmQtaXRlbS11c2VybmFtZScpO1xyXG4gICAgICAgIGNvbnN0IGNsb25lRWxTY29yZSA9IGNsb25lLnF1ZXJ5U2VsZWN0b3IoJyNsZWFkZXJib2FyZC1pdGVtLXNjb3JlJyk7XHJcbiAgICAgICAgaWYgKGNsb25lRWxSYW5rKSBjbG9uZUVsUmFuay5pbm5lckhUTUwgPSBTdHJpbmcoaSArIDEpO1xyXG4gICAgICAgIGlmIChjbG9uZUVsVXNlcm5hbWUpIGNsb25lRWxVc2VybmFtZS5pbm5lckhUTUwgPSBTdHJpbmcoc2NvcmUudXNlcm5hbWUpO1xyXG4gICAgICAgIGlmIChjbG9uZUVsU2NvcmUpIGNsb25lRWxTY29yZS5pbm5lckhUTUwgPSBTdHJpbmcoc2NvcmUudG90YWwpO1xyXG5cclxuICAgICAgICBsZWFkZXJib2FyZEl0ZW1Db250YWluZXIuYXBwZW5kQ2hpbGQoY2xvbmUpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtERUZBVUxUX0hFSUdIVCwgUkVTT0xVVElPTl9TQ0FMRX0gZnJvbSAnLi4vaW5kZXgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlbG9hZFNjZW5lIGV4dGVuZHMgUGhhc2VyLlNjZW5lIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKHtrZXk6ICdQcmVsb2FkU2NlbmUnfSk7XHJcbiAgfVxyXG5cclxuICBwcmVsb2FkKCkge1xyXG4gICAgdGhpcy5sb2FkQXVkaW8oKTtcclxuICAgIHRoaXMubG9hZEltZygpO1xyXG4gICAgdGhpcy5sb2FkTGV2ZWxzKCk7XHJcbiAgICB0aGlzLmxvYWQuaHRtbCgnZG9tX2dhbWVfdWknLCAnYXNzZXRzL2h0bWwvZ2FtZV91aS5odG1sJyk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGUoKSB7XHJcbiAgICB0aGlzLnNjZW5lLnN0YXJ0KCdHYW1lU2NlbmUnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZEF1ZGlvKCkge1xyXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdyaXZlcnNpZGVfcmlkZScsIFtcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9tdXNpYy9yaXZlcnNpZGVfcmlkZS9yaXZlcnNpZGVfcmlkZS5vZ2cnLFxyXG4gICAgICAnYXNzZXRzL2F1ZGlvL211c2ljL3JpdmVyc2lkZV9yaWRlL3JpdmVyc2lkZV9yaWRlLm1wMycsXHJcbiAgICBdKTtcclxuICAgIHRoaXMubG9hZC5hdWRpbygnYm9pbmsnLCBbXHJcbiAgICAgICdhc3NldHMvYXVkaW8vc2Z4L2p1bXAvYm9pbmsub2dnJyxcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvanVtcC9ib2luay5tcDMnLFxyXG4gICAgXSk7XHJcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ3BpY2t1cF9wcmVzZW50JywgW1xyXG4gICAgICAnYXNzZXRzL2F1ZGlvL3NmeC9waWNrdXAvcGlja3VwZ2VtLm9nZycsXHJcbiAgICAgICdhc3NldHMvYXVkaW8vc2Z4L3BpY2t1cC9waWNrdXBnZW0ubXAzJyxcclxuICAgIF0pO1xyXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdkZWF0aCcsIFtcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvY3Jhc2gvZGVhdGgub2dnJyxcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvY3Jhc2gvZGVhdGgubXAzJyxcclxuICAgIF0pO1xyXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdncnVudCcsIFtcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvY3Jhc2hfZ3J1bnQvZ3J1bnQub2dnJyxcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvY3Jhc2hfZ3J1bnQvZ3J1bnQubXAzJyxcclxuICAgIF0pO1xyXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdhcHBsYXVzZScsIFtcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvYXBwbGF1c2UvYXBwbGF1c2Uub2dnJyxcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvYXBwbGF1c2UvYXBwbGF1c2UubXAzJyxcclxuICAgIF0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2FkSW1nKCkge1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gREVGQVVMVF9IRUlHSFQgKiBSRVNPTFVUSU9OX1NDQUxFO1xyXG4gICAgY29uc3QgY2xvc2VzdFNpemUgPSBbMzYwLCA1NDAsIDcyMF0ucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBNYXRoLmFicyhjdXJyIC0gaGVpZ2h0KSA8IE1hdGguYWJzKHByZXYgLSBoZWlnaHQpID8gY3VyciA6IHByZXYpO1xyXG4gICAgY29uc3Qgc2l6ZSA9IHszNjA6ICc2NDB4MzYwJywgNTQwOiAnOTYweDU0MCcsIDcyMDogJzEyODB4NzIwJ31bY2xvc2VzdFNpemVdO1xyXG4gICAgdGhpcy5sb2FkLmF0bGFzKCdiZ19zcGFjZV9wYWNrJywgYGFzc2V0cy9pbWcvcGFja2VkL2JnX3NwYWNlXyR7c2l6ZX0ucG5nYCwgYGFzc2V0cy9pbWcvcGFja2VkL2JnX3NwYWNlXyR7c2l6ZX0uanNvbmApO1xyXG4gICAgdGhpcy5sb2FkLmF0bGFzKCdhdGxhc19zYW50YScsIGBhc3NldHMvaW1nL3BhY2tlZC9jaGFyYWN0ZXJfc2FudGFfJHtzaXplfS5wbmdgLCBgYXNzZXRzL2ltZy9wYWNrZWQvY2hhcmFjdGVyX3NhbnRhXyR7c2l6ZX0uanNvbmApO1xyXG4gICAgdGhpcy5sb2FkLmF0bGFzKCdhdGxhc19lbnZpcm9ubWVudCcsIGBhc3NldHMvaW1nL3BhY2tlZC9lbnZpcm9ubWVudF8ke3NpemV9LnBuZ2AsIGBhc3NldHMvaW1nL3BhY2tlZC9lbnZpcm9ubWVudF8ke3NpemV9Lmpzb25gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZExldmVscygpIHtcclxuICAgIHRoaXMubG9hZC5qc29uKCdzYW50YScsICdhc3NldHMvbGV2ZWxzL2V4cG9ydC9sZXZlbF8wMDEuanNvbicpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge1BoeXNpY3N9IGZyb20gJy4uL2NvbXBvbmVudHMvUGh5c2ljcyc7XHJcbmltcG9ydCBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7YjJCb2R5VHlwZX0gZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEZWJ1Z01vdXNlSm9pbnQge1xyXG4gIHByaXZhdGUgbW91c2VKb2ludDogUGwuYjJNb3VzZUpvaW50IHwgbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSBzY2VuZTogR2FtZVNjZW5lO1xyXG4gIHByaXZhdGUgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCBiMlBoeXNpY3M6IFBoeXNpY3MpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuYjJQaHlzaWNzID0gYjJQaHlzaWNzO1xyXG5cclxuICAgIHRoaXMuc2NlbmUuaW5wdXQub24oJ3BvaW50ZXJkb3duJywgKHBvaW50ZXI6IFBoLklucHV0LlBvaW50ZXIpID0+IHRoaXMuTW91c2VEb3duKHt4OiBwb2ludGVyLndvcmxkWCAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIHk6IC1wb2ludGVyLndvcmxkWSAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGV9KSk7XHJcbiAgICB0aGlzLnNjZW5lLmlucHV0Lm9uKCdwb2ludGVydXAnLCAocG9pbnRlcjogUGguSW5wdXQuUG9pbnRlcikgPT4gdGhpcy5Nb3VzZVVwKHt4OiBwb2ludGVyLndvcmxkWCAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIHk6IC1wb2ludGVyLndvcmxkWSAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGV9KSk7XHJcbiAgICB0aGlzLnNjZW5lLmlucHV0Lm9uKCdwb2ludGVybW92ZScsIChwb2ludGVyOiBQaC5JbnB1dC5Qb2ludGVyKSA9PiB0aGlzLk1vdXNlTW92ZSh7eDogcG9pbnRlci53b3JsZFggLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlLCB5OiAtcG9pbnRlci53b3JsZFkgLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlfSwgdHJ1ZSkpO1xyXG5cclxuICB9XHJcblxyXG4gIE1vdXNlTW92ZShwOiBQbC5YWSwgbGVmdERyYWc6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGlmIChsZWZ0RHJhZyAmJiB0aGlzLm1vdXNlSm9pbnQpIHtcclxuICAgICAgdGhpcy5tb3VzZUpvaW50LlNldFRhcmdldChwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE1vdXNlVXAocDogUGwuWFkpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm1vdXNlSm9pbnQpIHtcclxuICAgICAgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMubW91c2VKb2ludCk7XHJcbiAgICAgIHRoaXMubW91c2VKb2ludCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNb3VzZURvd24ocDogUGwuWFkpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm1vdXNlSm9pbnQpIHtcclxuICAgICAgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMubW91c2VKb2ludCk7XHJcbiAgICAgIHRoaXMubW91c2VKb2ludCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUXVlcnkgdGhlIHdvcmxkIGZvciBvdmVybGFwcGluZyBzaGFwZXMuXHJcbiAgICBsZXQgaGl0X2ZpeHR1cmU6IFBsLmIyRml4dHVyZSB8IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuYjJQaHlzaWNzLndvcmxkLlF1ZXJ5UG9pbnRBQUJCKHAsIChmaXh0dXJlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSBmaXh0dXJlLkdldEJvZHkoKTtcclxuICAgICAgaWYgKGJvZHkuR2V0VHlwZSgpID09PSBiMkJvZHlUeXBlLmIyX2R5bmFtaWNCb2R5ICYmIGZpeHR1cmUuVGVzdFBvaW50KHApKSB7XHJcbiAgICAgICAgaGl0X2ZpeHR1cmUgPSBmaXh0dXJlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gV2UgYXJlIGRvbmUsIHRlcm1pbmF0ZSB0aGUgcXVlcnkuXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7IC8vIENvbnRpbnVlIHRoZSBxdWVyeS5cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChoaXRfZml4dHVyZSkge1xyXG4gICAgICBjb25zdCBmcmVxdWVuY3lIeiA9IDU7XHJcbiAgICAgIGNvbnN0IGRhbXBpbmdSYXRpbyA9IDAuNTtcclxuXHJcbiAgICAgIGNvbnN0IGJvZHkgPSBoaXRfZml4dHVyZS5HZXRCb2R5KCk7XHJcbiAgICAgIGNvbnN0IGpkID0gbmV3IFBsLmIyTW91c2VKb2ludERlZigpO1xyXG4gICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gdHJ1ZTtcclxuICAgICAgamQuZGFtcGluZyA9IDAuMTtcclxuICAgICAgamQuYm9keUEgPSB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkoJ2Jvb2wnLCAncGhhc2VyVGVycmFpbicsIHRydWUpWzBdO1xyXG4gICAgICBqZC5ib2R5QiA9IGJvZHk7XHJcbiAgICAgIGpkLnRhcmdldC5Db3B5KHApO1xyXG4gICAgICBqZC5tYXhGb3JjZSA9IDcwMCAqIGJvZHkuR2V0TWFzcygpO1xyXG4gICAgICBQbC5iMkxpbmVhclN0aWZmbmVzcyhqZCwgZnJlcXVlbmN5SHosIGRhbXBpbmdSYXRpbywgamQuYm9keUEsIGpkLmJvZHlCKTtcclxuXHJcbiAgICAgIHRoaXMubW91c2VKb2ludCA9IHRoaXMuYjJQaHlzaWNzLndvcmxkLkNyZWF0ZUpvaW50KGpkKSBhcyBQbC5iMk1vdXNlSm9pbnQ7XHJcbiAgICAgIGJvZHkuU2V0QXdha2UodHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIi8qXHJcbiogIFIuVS5CLkUuIFNjZW5lIExvYWRlciBmb3IgUGhhc2VyMyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL2x1c2l0by9ib3gyZC50cy5cclxuKiBCYXNlZCBvbiBwcm92aWRlZCBleGFtcGxlIGJ5IENocmlzIENhbXBiZWxsOiBodHRwczovL3d3dy5pZm9yY2UyZC5uZXQvcnViZS9sb2FkZXJzL3J1YmUtcGhhc2VyLXNhbXBsZS56aXBcclxuKi9cclxuXHJcbmltcG9ydCAqIGFzIFBoIGZyb20gJ3BoYXNlcic7XHJcbmltcG9ydCAqIGFzIFBsIGZyb20gJ0Bib3gyZC9jb3JlJztcclxuaW1wb3J0IHtSdWJlQm9keSwgUnViZUZpeHR1cmUsIFJ1YmVFbnRpdHksIFJ1YmVTY2VuZSwgUnViZUpvaW50LCBSdWJlQ3VzdG9tUHJvcGVydHlUeXBlcywgUnViZUltYWdlLCBSdWJlVmVjdG9yLCBSdWJlQ3VzdG9tUHJvcGVydHl9IGZyb20gJy4vUnViZUxvYWRlckludGVyZmFjZXMnO1xyXG5pbXBvcnQge0RFQlVHfSBmcm9tICcuLi8uLi9pbmRleCc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFJ1YmVMb2FkZXIge1xyXG4gIHByaXZhdGUgd29ybGQ6IFBsLmIyV29ybGQ7XHJcbiAgcHJpdmF0ZSBkZWJ1Z0dyYXBoaWNzOiBQaC5HYW1lT2JqZWN0cy5HcmFwaGljcztcclxuICBwcml2YXRlIHNjZW5lOiBQaC5TY2VuZTtcclxuICBwcml2YXRlIHdvcmxkU2l6ZTogbnVtYmVyO1xyXG5cclxuICBsb2FkZWRCb2RpZXM6IChQbC5iMkJvZHkgfCBudWxsKVtdO1xyXG4gIGxvYWRlZEpvaW50czogKFBsLmIySm9pbnQgfCBudWxsKVtdO1xyXG4gIGxvYWRlZEltYWdlczogKChQaC5HYW1lT2JqZWN0cy5JbWFnZSAmIFJ1YmVFbnRpdHkpIHwgbnVsbClbXTtcclxuXHJcbiAgY29uc3RydWN0b3Iod29ybGQ6IFBsLmIyV29ybGQsIGRlYnVnR3JhcGhpY3M6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzLCBzY2VuZTogUGguU2NlbmUsIHdvcmxkU2l6ZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLndvcmxkID0gd29ybGQ7XHJcbiAgICB0aGlzLmRlYnVnR3JhcGhpY3MgPSBkZWJ1Z0dyYXBoaWNzO1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy53b3JsZFNpemUgPSB3b3JsZFNpemU7XHJcbiAgfVxyXG5cclxuICBsb2FkU2NlbmUoc2NlbmU6IFJ1YmVTY2VuZSk6IGJvb2xlYW4ge1xyXG4gICAgdGhpcy5sb2FkZWRCb2RpZXMgPSBzY2VuZS5ib2R5ID8gc2NlbmUuYm9keS5tYXAoYm9keUpzb24gPT4gdGhpcy5sb2FkQm9keShib2R5SnNvbikpIDogW107XHJcbiAgICB0aGlzLmxvYWRlZEpvaW50cyA9IHNjZW5lLmpvaW50ID8gc2NlbmUuam9pbnQubWFwKGpvaW50SnNvbiA9PiB0aGlzLmxvYWRKb2ludChqb2ludEpzb24pKSA6IFtdO1xyXG4gICAgdGhpcy5sb2FkZWRJbWFnZXMgPSBzY2VuZS5pbWFnZSA/IHNjZW5lLmltYWdlLm1hcChpbWFnZUpzb24gPT4gdGhpcy5sb2FkSW1hZ2UoaW1hZ2VKc29uKSkgOiBbXTtcclxuXHJcbiAgICBjb25zdCBzdWNjZXNzID0gdGhpcy5sb2FkZWRCb2RpZXMuZXZlcnkoYiA9PiBiKSAmJiB0aGlzLmxvYWRlZEpvaW50cy5ldmVyeShqID0+IGopICYmIHRoaXMubG9hZGVkSW1hZ2VzLmV2ZXJ5KGkgPT4gaSk7XHJcbiAgICBzdWNjZXNzXHJcbiAgICAgID8gY29uc29sZS5sb2coYFIuVS5CLkUuIHNjZW5lIGxvYWRlZCBzdWNjZXNzZnVsbHlgLCB0aGlzLmxvYWRlZEJvZGllcywgdGhpcy5sb2FkZWRKb2ludHMsIHRoaXMubG9hZGVkSW1hZ2VzKVxyXG4gICAgICA6IGNvbnNvbGUuZXJyb3IoYFIuVS5CLkUuIHNjZW5lIGZhaWxlZCB0byBsb2FkIGZ1bGx5YCwgdGhpcy5sb2FkZWRCb2RpZXMsIHRoaXMubG9hZGVkSm9pbnRzLCB0aGlzLmxvYWRlZEltYWdlcyk7XHJcbiAgICByZXR1cm4gc3VjY2VzcztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZEJvZHkoYm9keUpzb246IFJ1YmVCb2R5KTogUGwuYjJCb2R5IHwgbnVsbCB7XHJcbiAgICBjb25zdCBiZDogUGwuYjJCb2R5RGVmID0ge307XHJcbiAgICBiZC50eXBlID0gTWF0aC5taW4oTWF0aC5tYXgoYm9keUpzb24udHlwZSB8fCAwLCAwKSwgMik7IC8vIGNsYW1wIGJldHdlZW4gMC0yLlxyXG4gICAgYmQuYW5nbGUgPSBib2R5SnNvbi5hbmdsZSB8fCAwO1xyXG4gICAgYmQuYW5ndWxhclZlbG9jaXR5ID0gYm9keUpzb24uYW5ndWxhclZlbG9jaXR5IHx8IDA7XHJcbiAgICBiZC5hd2FrZSA9IEJvb2xlYW4oYm9keUpzb24uYXdha2UpO1xyXG4gICAgYmQuZW5hYmxlZCA9IGJvZHlKc29uLmhhc093blByb3BlcnR5KCdhY3RpdmUnKSA/IGJvZHlKc29uLmFjdGl2ZSA6IHRydWU7XHJcbiAgICBiZC5maXhlZFJvdGF0aW9uID0gQm9vbGVhbihib2R5SnNvbi5maXhlZFJvdGF0aW9uKTtcclxuICAgIGJkLmxpbmVhclZlbG9jaXR5ID0gdGhpcy5ydWJlVG9YWShib2R5SnNvbi5saW5lYXJWZWxvY2l0eSk7XHJcbiAgICBiZC5saW5lYXJEYW1waW5nID0gYm9keUpzb24ubGluZWFyRGFtcGluZyB8fCAwO1xyXG4gICAgYmQuYW5ndWxhckRhbXBpbmcgPSBib2R5SnNvbi5hbmd1bGFyRGFtcGluZyB8fCAwO1xyXG4gICAgYmQucG9zaXRpb24gPSB0aGlzLnJ1YmVUb1hZKGJvZHlKc29uLnBvc2l0aW9uKTtcclxuXHJcbiAgICBjb25zdCBib2R5OiBQbC5iMkJvZHkgJiBSdWJlRW50aXR5ID0gdGhpcy53b3JsZC5DcmVhdGVCb2R5KGJkKTtcclxuICAgIGJvZHkuU2V0TWFzc0RhdGEoe1xyXG4gICAgICBtYXNzOiBib2R5SnNvblsnbWFzc0RhdGEtbWFzcyddIHx8IDEsXHJcbiAgICAgIGNlbnRlcjogdGhpcy5ydWJlVG9WZWMyKGJvZHlKc29uWydtYXNzRGF0YS1jZW50ZXInXSksXHJcbiAgICAgIEk6IGJvZHlKc29uWydtYXNzRGF0YS1JJ10gfHwgMSxcclxuICAgIH0pO1xyXG5cclxuICAgIGJvZHkubmFtZSA9IGJvZHlKc29uLm5hbWUgfHwgJyc7XHJcbiAgICBib2R5LmN1c3RvbVByb3BlcnRpZXMgPSBib2R5SnNvbi5jdXN0b21Qcm9wZXJ0aWVzIHx8IFtdO1xyXG4gICAgYm9keS5jdXN0b21Qcm9wZXJ0aWVzTWFwID0gdGhpcy5jdXN0b21Qcm9wZXJ0aWVzQXJyYXlUb01hcChib2R5LmN1c3RvbVByb3BlcnRpZXMgfHwgW10pO1xyXG5cclxuICAgIChib2R5SnNvbi5maXh0dXJlIHx8IFtdKS5tYXAoZml4dHVyZUpzb24gPT4gdGhpcy5sb2FkRml4dHVyZShib2R5LCBmaXh0dXJlSnNvbikpO1xyXG4gICAgcmV0dXJuIGJvZHk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxvYWRGaXh0dXJlKGJvZHk6IFBsLmIyQm9keSwgZml4dHVyZUpzbzogUnViZUZpeHR1cmUpOiBQbC5iMkZpeHR1cmUge1xyXG4gICAgY29uc3QgZmQ6IFBsLmIyRml4dHVyZURlZiA9IHRoaXMuZ2V0Rml4dHVyZURlZldpdGhTaGFwZShmaXh0dXJlSnNvLCBib2R5KTtcclxuICAgIGZkLmZyaWN0aW9uID0gZml4dHVyZUpzby5mcmljdGlvbiB8fCAwO1xyXG4gICAgZmQuZGVuc2l0eSA9IGZpeHR1cmVKc28uZGVuc2l0eSB8fCAwO1xyXG4gICAgZmQucmVzdGl0dXRpb24gPSBmaXh0dXJlSnNvLnJlc3RpdHV0aW9uIHx8IDA7XHJcbiAgICBmZC5pc1NlbnNvciA9IEJvb2xlYW4oZml4dHVyZUpzby5zZW5zb3IpO1xyXG4gICAgZmQuZmlsdGVyID0ge1xyXG4gICAgICBjYXRlZ29yeUJpdHM6IGZpeHR1cmVKc29bJ2ZpbHRlci1jYXRlZ29yeUJpdHMnXSxcclxuICAgICAgbWFza0JpdHM6IGZpeHR1cmVKc29bJ2ZpbHRlci1tYXNrQml0cyddIHx8IDEsXHJcbiAgICAgIGdyb3VwSW5kZXg6IGZpeHR1cmVKc29bJ2ZpbHRlci1ncm91cEluZGV4J10gfHwgNjU1MzUsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGZpeHR1cmU6IFBsLmIyRml4dHVyZSAmIFJ1YmVFbnRpdHkgPSBib2R5LkNyZWF0ZUZpeHR1cmUoZmQpO1xyXG4gICAgZml4dHVyZS5uYW1lID0gZml4dHVyZUpzby5uYW1lIHx8ICcnO1xyXG4gICAgZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzID0gZml4dHVyZUpzby5jdXN0b21Qcm9wZXJ0aWVzIHx8IFtdO1xyXG4gICAgZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzTWFwID0gdGhpcy5jdXN0b21Qcm9wZXJ0aWVzQXJyYXlUb01hcChmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXMpO1xyXG5cclxuICAgIHJldHVybiBmaXh0dXJlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2FkSm9pbnQoam9pbnRKc29uOiBSdWJlSm9pbnQpOiBQbC5iMkpvaW50IHwgbnVsbCB7XHJcbiAgICBpZiAoam9pbnRKc29uLmJvZHlBID49IHRoaXMubG9hZGVkQm9kaWVzLmxlbmd0aCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdJbmRleCBmb3IgYm9keUEgaXMgaW52YWxpZDogJyArIGpvaW50SnNvbik7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKGpvaW50SnNvbi5ib2R5QiA+PSB0aGlzLmxvYWRlZEJvZGllcy5sZW5ndGgpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignSW5kZXggZm9yIGJvZHlCIGlzIGludmFsaWQ6ICcgKyBqb2ludEpzb24pO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBib2R5QSA9IHRoaXMubG9hZGVkQm9kaWVzW2pvaW50SnNvbi5ib2R5QV07XHJcbiAgICBjb25zdCBib2R5QiA9IHRoaXMubG9hZGVkQm9kaWVzW2pvaW50SnNvbi5ib2R5Ql07XHJcbiAgICBpZiAoIWJvZHlBIHx8ICFib2R5Qikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdib2R5QSBvciBib2R5QiBhcmUgaW52YWxpZCcsIGJvZHlBLCBib2R5QiwgdGhpcy5sb2FkZWRCb2RpZXMpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgam9pbnQ6IFBsLmIySm9pbnQgJiBSdWJlRW50aXR5O1xyXG4gICAgc3dpdGNoIChqb2ludEpzb24udHlwZSkge1xyXG4gICAgICBjYXNlICdyZXZvbHV0ZSc6IHtcclxuICAgICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMlJldm9sdXRlSm9pbnREZWYoKTtcclxuICAgICAgICBqZC5Jbml0aWFsaXplKGJvZHlBLCBib2R5QiwgdGhpcy5ydWJlVG9WZWMyKGpvaW50SnNvbi5hbmNob3JBKS5Sb3RhdGUoYm9keUEuR2V0QW5nbGUoKSkuQWRkKGJvZHlBLkdldFBvc2l0aW9uKCkpKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQucmVmZXJlbmNlQW5nbGUgPSBqb2ludEpzb24ucmVmQW5nbGUgfHwgMDtcclxuICAgICAgICBqZC5lbmFibGVMaW1pdCA9IEJvb2xlYW4oam9pbnRKc29uLmVuYWJsZUxpbWl0KTtcclxuICAgICAgICBqZC5sb3dlckFuZ2xlID0gam9pbnRKc29uLmxvd2VyTGltaXQgfHwgMDtcclxuICAgICAgICBqZC51cHBlckFuZ2xlID0gam9pbnRKc29uLnVwcGVyTGltaXQgfHwgMDtcclxuICAgICAgICBqZC5lbmFibGVNb3RvciA9IEJvb2xlYW4oam9pbnRKc29uLmVuYWJsZU1vdG9yKTtcclxuICAgICAgICBqZC5tYXhNb3RvclRvcnF1ZSA9IGpvaW50SnNvbi5tYXhNb3RvclRvcnF1ZSB8fCAwO1xyXG4gICAgICAgIGpkLm1vdG9yU3BlZWQgPSBqb2ludEpzb24ubW90b3JTcGVlZCB8fCAwO1xyXG4gICAgICAgIGpvaW50ID0gdGhpcy53b3JsZC5DcmVhdGVKb2ludChqZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgLy8gY2FzZSAncm9wZSc6IHtcclxuICAgICAgLy8gICAvLyB0aHJvdyBuZXcgRXJyb3IoJ1JvcGUgam9pbnQgbm90IGltcGxlbWVudGVkJyk7XHJcbiAgICAgIC8vIH1cclxuICAgICAgY2FzZSAnZGlzdGFuY2UnOiB7XHJcbiAgICAgICAgY29uc3QgamQgPSBuZXcgUGwuYjJEaXN0YW5jZUpvaW50RGVmKCk7XHJcbiAgICAgICAgamQubGVuZ3RoID0gKGpvaW50SnNvbi5sZW5ndGggfHwgMCk7XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShcclxuICAgICAgICAgIGJvZHlBLFxyXG4gICAgICAgICAgYm9keUIsXHJcbiAgICAgICAgICB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmFuY2hvckEpLlJvdGF0ZShib2R5QS5HZXRBbmdsZSgpKS5BZGQoYm9keUEuR2V0UG9zaXRpb24oKSksXHJcbiAgICAgICAgICB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmFuY2hvckIpLlJvdGF0ZShib2R5Qi5HZXRBbmdsZSgpKS5BZGQoYm9keUIuR2V0UG9zaXRpb24oKSksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQubGVuZ3RoID0gam9pbnRKc29uLmxlbmd0aCB8fCAwO1xyXG4gICAgICAgIC8vIE5vdCBzdXJlIHdoYXQgdGhlIHByb3BlciB3YXkgaXMsIGJ1dCB3aXRob3V0IHNldHRpbmcgbWluIGFuZCBtYXggbGVuZ3RoIGV4cGxpY2l0bHksIGl0IHJlbWFpbnMgc3RpZmYuXHJcbiAgICAgICAgamQubWluTGVuZ3RoID0gMDtcclxuICAgICAgICBqZC5tYXhMZW5ndGggPSBqZC5sZW5ndGggKiAyO1xyXG4gICAgICAgIFBsLmIyTGluZWFyU3RpZmZuZXNzKGpkLCBqb2ludEpzb24uZnJlcXVlbmN5IHx8IDAsIGpvaW50SnNvbi5kYW1waW5nUmF0aW8gfHwgMCwgamQuYm9keUEsIGpkLmJvZHlCKTtcclxuICAgICAgICBqb2ludCA9IHRoaXMud29ybGQuQ3JlYXRlSm9pbnQoamQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ3ByaXNtYXRpYyc6IHtcclxuICAgICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMlByaXNtYXRpY0pvaW50RGVmKCk7XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShib2R5QSwgYm9keUIsIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQSkuUm90YXRlKGJvZHlBLkdldEFuZ2xlKCkpLkFkZChib2R5QS5HZXRQb3NpdGlvbigpKSwgdGhpcy5ydWJlVG9YWShqb2ludEpzb24ubG9jYWxBeGlzQSkpO1xyXG4gICAgICAgIGpkLmNvbGxpZGVDb25uZWN0ZWQgPSBCb29sZWFuKGpvaW50SnNvbi5jb2xsaWRlQ29ubmVjdGVkKTtcclxuICAgICAgICBqZC5yZWZlcmVuY2VBbmdsZSA9IGpvaW50SnNvbi5yZWZBbmdsZSB8fCAwO1xyXG4gICAgICAgIGpkLmVuYWJsZUxpbWl0ID0gQm9vbGVhbihqb2ludEpzb24uZW5hYmxlTGltaXQpO1xyXG4gICAgICAgIGpkLmxvd2VyVHJhbnNsYXRpb24gPSBqb2ludEpzb24ubG93ZXJMaW1pdCB8fCAwO1xyXG4gICAgICAgIGpkLnVwcGVyVHJhbnNsYXRpb24gPSBqb2ludEpzb24udXBwZXJMaW1pdCB8fCAwO1xyXG4gICAgICAgIGpkLmVuYWJsZU1vdG9yID0gQm9vbGVhbihqb2ludEpzb24uZW5hYmxlTW90b3IpO1xyXG4gICAgICAgIGpkLm1heE1vdG9yRm9yY2UgPSBqb2ludEpzb24ubWF4TW90b3JGb3JjZSB8fCAwO1xyXG4gICAgICAgIGpkLm1vdG9yU3BlZWQgPSBqb2ludEpzb24ubW90b3JTcGVlZCB8fCAwO1xyXG4gICAgICAgIGpvaW50ID0gdGhpcy53b3JsZC5DcmVhdGVKb2ludChqZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnd2hlZWwnOiB7XHJcbiAgICAgICAgY29uc3QgamQgPSBuZXcgUGwuYjJXaGVlbEpvaW50RGVmKCk7XHJcbiAgICAgICAgLy8gVE9ETyBhbmNob3JBIGlzIDAgYW5kIEIgaXMgWFkgaW4gd29ybGQgc3BhY2UsIHdoaWNoIHNob3VsZCBiZSB1c2VkP1xyXG4gICAgICAgIGpkLkluaXRpYWxpemUoYm9keUEsIGJvZHlCLCB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmFuY2hvckIpLCB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmxvY2FsQXhpc0EpKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQuZW5hYmxlTW90b3IgPSBCb29sZWFuKGpvaW50SnNvbi5lbmFibGVNb3Rvcik7XHJcbiAgICAgICAgamQubWF4TW90b3JUb3JxdWUgPSBqb2ludEpzb24ubWF4TW90b3JUb3JxdWUgfHwgMDtcclxuICAgICAgICBqZC5tb3RvclNwZWVkID0gam9pbnRKc29uLm1vdG9yU3BlZWQgfHwgMDtcclxuICAgICAgICBQbC5iMkxpbmVhclN0aWZmbmVzcyhqZCwgam9pbnRKc29uLnNwcmluZ0ZyZXF1ZW5jeSB8fCAwLCBqb2ludEpzb24uc3ByaW5nRGFtcGluZ1JhdGlvIHx8IDAsIGpkLmJvZHlBLCBqZC5ib2R5Qik7XHJcbiAgICAgICAgam9pbnQgPSB0aGlzLndvcmxkLkNyZWF0ZUpvaW50KGpkKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdmcmljdGlvbic6IHtcclxuICAgICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMkZyaWN0aW9uSm9pbnREZWYoKTtcclxuICAgICAgICBqZC5Jbml0aWFsaXplKGJvZHlBLCBib2R5QiwgdGhpcy5ydWJlVG9WZWMyKGpvaW50SnNvbi5hbmNob3JBKS5Sb3RhdGUoYm9keUEuR2V0QW5nbGUoKSkuQWRkKGJvZHlBLkdldFBvc2l0aW9uKCkpKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQubWF4Rm9yY2UgPSBqb2ludEpzb24ubWF4Rm9yY2UgfHwgMDtcclxuICAgICAgICBqZC5tYXhUb3JxdWUgPSBqb2ludEpzb24ubWF4VG9ycXVlIHx8IDA7XHJcbiAgICAgICAgam9pbnQgPSB0aGlzLndvcmxkLkNyZWF0ZUpvaW50KGpkKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd3ZWxkJzoge1xyXG4gICAgICAgIGNvbnN0IGpkID0gbmV3IFBsLmIyV2VsZEpvaW50RGVmKCk7XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShib2R5QSwgYm9keUIsIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQSkuUm90YXRlKGJvZHlBLkdldEFuZ2xlKCkpLkFkZChib2R5QS5HZXRQb3NpdGlvbigpKSk7XHJcbiAgICAgICAgamQuY29sbGlkZUNvbm5lY3RlZCA9IEJvb2xlYW4oam9pbnRKc29uLmNvbGxpZGVDb25uZWN0ZWQpO1xyXG4gICAgICAgIGpkLnJlZmVyZW5jZUFuZ2xlID0gam9pbnRKc29uLnJlZkFuZ2xlIHx8IDA7XHJcbiAgICAgICAgUGwuYjJBbmd1bGFyU3RpZmZuZXNzKGpkLCBqb2ludEpzb24uZnJlcXVlbmN5IHx8IDAsIGpvaW50SnNvbi5kYW1waW5nUmF0aW8gfHwgMCwgamQuYm9keUEsIGpkLmJvZHlCKTtcclxuICAgICAgICBqb2ludCA9IHRoaXMud29ybGQuQ3JlYXRlSm9pbnQoamQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBqb2ludCB0eXBlOiAnICsgam9pbnRKc29uLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGpvaW50Lm5hbWUgPSBqb2ludEpzb24ubmFtZTtcclxuICAgIGpvaW50LmN1c3RvbVByb3BlcnRpZXMgPSBqb2ludEpzb24uY3VzdG9tUHJvcGVydGllcyB8fCBbXTtcclxuICAgIGpvaW50LmN1c3RvbVByb3BlcnRpZXNNYXAgPSB0aGlzLmN1c3RvbVByb3BlcnRpZXNBcnJheVRvTWFwKGpvaW50LmN1c3RvbVByb3BlcnRpZXMpO1xyXG5cclxuICAgIHJldHVybiBqb2ludDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZEltYWdlKGltYWdlSnNvbjogUnViZUltYWdlKTogKFBoLkdhbWVPYmplY3RzLkltYWdlICYgUnViZUVudGl0eSkgfCBudWxsIHtcclxuICAgIGNvbnN0IHtmaWxlLCBib2R5LCBjZW50ZXIsIGN1c3RvbVByb3BlcnRpZXMsIGFuZ2xlLCBhc3BlY3RTY2FsZSwgc2NhbGUsIGZsaXAsIHJlbmRlck9yZGVyfSA9IGltYWdlSnNvbjtcclxuICAgIGNvbnN0IGJvZHlPYmogPSB0aGlzLmxvYWRlZEJvZGllc1tib2R5XTtcclxuICAgIGNvbnN0IHBvcyA9IGJvZHlPYmogPyBib2R5T2JqLkdldFBvc2l0aW9uKCkuQWRkKHRoaXMucnViZVRvWFkoY2VudGVyKSkgOiB0aGlzLnJ1YmVUb1hZKGNlbnRlcik7XHJcblxyXG4gICAgaWYgKCFwb3MpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IHRleHR1cmUgPSB0aGlzLmdldEN1c3RvbVByb3BlcnR5KGltYWdlSnNvbiwgJ3N0cmluZycsICdwaGFzZXJUZXh0dXJlJywgJycpO1xyXG4gICAgLy8gdGV4dHVyZUZhbGxiYWNrIGlzIHVzZWQgd2hlbiB0aGUgaW1hZ2VzIGluIHRoZSBleHBvcnRlZCBSVUJFIHNjZW5lIGRvbid0IGRlZmluZSB0aGUgcGhhc2VyVGV4dHVyZSBvciBwaGFzZXJUZXh0dXJlRnJhbWUgY3VzdG9tIHByb3BlcnRpZXMuXHJcbiAgICAvLyBJdCBpcyBxdWl0ZSBhIGhhc3NsZSB0byBzZXQgaXQgd2l0aGluIFJVQkUgaWYgbm90IGRvbmUgZnJvbSB0aGUgc3RhcnQuIEluIHRoZSBmdXR1cmUgb25seSB0aGUgcGhhc2VyVGV4dHVyZSBjdXN0b20gcHJvcCB3aWxsIGJlIG5lY2Vzc2FyeSB0byBzcGVjaWZ5IHdoaWNoIGF0bGFzIHRvIHVzZS5cclxuICAgIC8vIFRoZSB0ZXh0dXJlRnJhbWUgd2lsbCBiZSB0YWtlbiBmcm9tIHRoZSBpbWFnZSBmaWxlIG5hbWUuXHJcbiAgICBjb25zdCB0ZXh0dXJlRmFsbGJhY2sgPSAoZmlsZSB8fCAnJykuc3BsaXQoJy8nKS5yZXZlcnNlKClbMF07XHJcbiAgICBjb25zdCB0ZXh0dXJlRnJhbWUgPSB0aGlzLmdldEN1c3RvbVByb3BlcnR5KGltYWdlSnNvbiwgJ3N0cmluZycsICdwaGFzZXJUZXh0dXJlRnJhbWUnLCB0ZXh0dXJlRmFsbGJhY2spO1xyXG4gICAgY29uc3QgaW1nOiBQaC5HYW1lT2JqZWN0cy5JbWFnZSAmIFJ1YmVFbnRpdHkgPSB0aGlzLnNjZW5lLmFkZC5pbWFnZShwb3MueCAqIHRoaXMud29ybGRTaXplLCBwb3MueSAqIC10aGlzLndvcmxkU2l6ZSwgdGV4dHVyZSB8fCB0ZXh0dXJlRmFsbGJhY2ssIHRleHR1cmVGcmFtZSk7XHJcbiAgICBpbWcucm90YXRpb24gPSBib2R5T2JqID8gLWJvZHlPYmouR2V0QW5nbGUoKSArIC0oYW5nbGUgfHwgMCkgOiAtKGFuZ2xlIHx8IDApO1xyXG4gICAgaW1nLnNjYWxlWSA9ICh0aGlzLndvcmxkU2l6ZSAvIGltZy5oZWlnaHQpICogc2NhbGU7XHJcbiAgICBpbWcuc2NhbGVYID0gaW1nLnNjYWxlWSAqIGFzcGVjdFNjYWxlO1xyXG4gICAgaW1nLmZsaXBYID0gZmxpcDtcclxuICAgIGltZy5zZXREZXB0aChyZW5kZXJPcmRlcik7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBpbWcuY3VzdG9tX29yaWdpbl9hbmdsZSA9IC0oYW5nbGUgfHwgMCk7XHJcbiAgICBpbWcuY3VzdG9tUHJvcGVydGllcyA9IGN1c3RvbVByb3BlcnRpZXMgfHwgW107XHJcbiAgICBpbWcuY3VzdG9tUHJvcGVydGllc01hcCA9IHRoaXMuY3VzdG9tUHJvcGVydGllc0FycmF5VG9NYXAoaW1nLmN1c3RvbVByb3BlcnRpZXMpO1xyXG4gICAgYm9keU9iaiAmJiBib2R5T2JqLlNldFVzZXJEYXRhKGltZyk7XHJcbiAgICByZXR1cm4gaW1nO1xyXG4gIH1cclxuXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgcnViZVRvWFkodmFsPzogUnViZVZlY3Rvciwgb2Zmc2V0OiBQbC5YWSA9IHt4OiAwLCB5OiAwfSk6IFBsLlhZIHtcclxuICAgIHJldHVybiB0aGlzLmlzWFkodmFsKSA/IHt4OiB2YWwueCArIG9mZnNldC54LCB5OiB2YWwueSArIG9mZnNldC55fSA6IG9mZnNldDtcclxuICB9XHJcblxyXG4gIHJ1YmVUb1ZlYzIodmFsPzogUnViZVZlY3Rvcik6IFBsLmIyVmVjMiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1hZKHZhbCkgPyBuZXcgUGwuYjJWZWMyKHZhbC54LCB2YWwueSkgOiBuZXcgUGwuYjJWZWMyKDAsIDApO1xyXG4gIH1cclxuXHJcbiAgZ2V0Qm9kaWVzQnlOYW1lKG5hbWUpIHtcclxuICAgIGNvbnN0IGJvZGllczogUGwuYjJCb2R5W10gPSBbXTtcclxuICAgIGZvciAobGV0IGJvZHkgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlO1xyXG4gICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgIGlmIChib2R5Lm5hbWUgPT09IG5hbWUpIGJvZGllcy5wdXNoKGJvZHkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJvZGllcztcclxuICB9XHJcblxyXG4gIGdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkocHJvcGVydHlUeXBlOiBSdWJlQ3VzdG9tUHJvcGVydHlUeXBlcywgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlVG9NYXRjaDogdW5rbm93bik6IFBsLmIyQm9keVtdIHtcclxuICAgIGNvbnN0IGJvZGllczogUGwuYjJCb2R5W10gPSBbXTtcclxuICAgIHR5cGUgYiA9IFBsLmIyQm9keSAmIFJ1YmVFbnRpdHkgfCBudWxsO1xyXG4gICAgZm9yIChsZXQgYm9keTogYiA9IHRoaXMud29ybGQuR2V0Qm9keUxpc3QoKTsgYm9keTsgYm9keSA9IGJvZHkuR2V0TmV4dCgpKSB7XHJcbiAgICAgIGlmICghYm9keSB8fCAhYm9keS5jdXN0b21Qcm9wZXJ0aWVzKSBjb250aW51ZTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2R5LmN1c3RvbVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoIWJvZHkuY3VzdG9tUHJvcGVydGllc1tpXS5oYXNPd25Qcm9wZXJ0eSgnbmFtZScpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKCFib2R5LmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkocHJvcGVydHlUeXBlKSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmIChib2R5LmN1c3RvbVByb3BlcnRpZXNbaV0ubmFtZSA9PSBwcm9wZXJ0eU5hbWUgJiZcclxuICAgICAgICAgIGJvZHkuY3VzdG9tUHJvcGVydGllc1tpXVtwcm9wZXJ0eVR5cGVdID09IHZhbHVlVG9NYXRjaCkgLy8gVE9ETyByZWZhY3RvciB0byBzdHJpY3QgZXF1YWxzXHJcbiAgICAgICAgICBib2RpZXMucHVzaChib2R5KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJvZGllcztcclxuICB9XHJcblxyXG4gIGdldEZpeHR1cmVzQnlDdXN0b21Qcm9wZXJ0eShwcm9wZXJ0eVR5cGU6IFJ1YmVDdXN0b21Qcm9wZXJ0eVR5cGVzLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWVUb01hdGNoOiB1bmtub3duKTogUGwuYjJGaXh0dXJlW10ge1xyXG4gICAgY29uc3QgZml4dHVyZXM6IFBsLmIyRml4dHVyZVtdID0gW107XHJcbiAgICB0eXBlIGYgPSBQbC5iMkZpeHR1cmUgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICAgIGZvciAobGV0IGJvZHkgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBmb3IgKGxldCBmaXh0dXJlOiBmID0gYm9keS5HZXRGaXh0dXJlTGlzdCgpOyBmaXh0dXJlOyBmaXh0dXJlID0gZml4dHVyZS5HZXROZXh0KCkpIHtcclxuICAgICAgICBpZiAoIWZpeHR1cmUgfHwgIWZpeHR1cmUuY3VzdG9tUHJvcGVydGllcykgY29udGludWU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmICghZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzW2ldLmhhc093blByb3BlcnR5KCduYW1lJykpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgaWYgKCFmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkocHJvcGVydHlUeXBlKSkgY29udGludWU7XHJcbiAgICAgICAgICBpZiAoZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzW2ldLm5hbWUgPT0gcHJvcGVydHlOYW1lICYmXHJcbiAgICAgICAgICAgIGZpeHR1cmUuY3VzdG9tUHJvcGVydGllc1tpXVtwcm9wZXJ0eVR5cGVdID09IHZhbHVlVG9NYXRjaCkgLy8gVE9ETyByZWZhY3RvciB0byBzdHJpY3QgZXF1YWxzXHJcbiAgICAgICAgICAgIGZpeHR1cmVzLnB1c2goZml4dHVyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZml4dHVyZXM7XHJcbiAgfVxyXG5cclxuICBnZXRKb2ludHNCeUN1c3RvbVByb3BlcnR5KHByb3BlcnR5VHlwZTogUnViZUN1c3RvbVByb3BlcnR5VHlwZXMsIHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZVRvTWF0Y2g6IHVua25vd24pOiBQbC5iMkpvaW50W10ge1xyXG4gICAgY29uc3Qgam9pbnRzOiBQbC5iMkpvaW50W10gPSBbXTtcclxuICAgIHR5cGUgaiA9IFBsLmIySm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICAgIGZvciAobGV0IGpvaW50OiBqID0gdGhpcy53b3JsZC5HZXRKb2ludExpc3QoKTsgam9pbnQ7IGpvaW50ID0gam9pbnQuR2V0TmV4dCgpKSB7XHJcbiAgICAgIGlmICgham9pbnQgfHwgIWpvaW50LmN1c3RvbVByb3BlcnRpZXMpIGNvbnRpbnVlO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpvaW50LmN1c3RvbVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoIWpvaW50LmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkoJ25hbWUnKSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmICgham9pbnQuY3VzdG9tUHJvcGVydGllc1tpXS5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eVR5cGUpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKGpvaW50LmN1c3RvbVByb3BlcnRpZXNbaV0ubmFtZSA9PSBwcm9wZXJ0eU5hbWUgJiZcclxuICAgICAgICAgIGpvaW50LmN1c3RvbVByb3BlcnRpZXNbaV1bcHJvcGVydHlUeXBlXSA9PSB2YWx1ZVRvTWF0Y2gpIC8vIFRPRE8gcmVmYWN0b3IgdG8gc3RyaWN0IGVxdWFsc1xyXG4gICAgICAgICAgam9pbnRzLnB1c2goam9pbnQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gam9pbnRzO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyB0dXJuIGludG8gbWFwIGluc3RlYWQgb2YgaGF2aW5nIHRvIGl0ZXJhdGUgb3ZlciBjdXN0b20gcHJvcHNcclxuICBnZXRDdXN0b21Qcm9wZXJ0eTxUID0gdW5rbm93bj4oZW50aXR5OiBSdWJlRW50aXR5LCBwcm9wZXJ0eVR5cGU6IFJ1YmVDdXN0b21Qcm9wZXJ0eVR5cGVzLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBUKTogVCB7XHJcbiAgICBpZiAoIWVudGl0eS5jdXN0b21Qcm9wZXJ0aWVzKSByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgZm9yIChjb25zdCBwcm9wIG9mIGVudGl0eS5jdXN0b21Qcm9wZXJ0aWVzKSB7XHJcbiAgICAgIGlmICghcHJvcC5uYW1lIHx8ICFwcm9wLmhhc093blByb3BlcnR5KHByb3BlcnR5VHlwZSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAocHJvcC5uYW1lID09PSBwcm9wZXJ0eU5hbWUpIHJldHVybiBwcm9wW3Byb3BlcnR5VHlwZV0gYXMgdW5rbm93biBhcyBUO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3VzdG9tUHJvcGVydGllc0FycmF5VG9NYXAoY3VzdG9tUHJvcGVydGllczogUnViZUN1c3RvbVByb3BlcnR5W10pOiB7IFtrZXk6IHN0cmluZ106IHVua25vd24gfSB7XHJcbiAgICByZXR1cm4gY3VzdG9tUHJvcGVydGllcy5yZWR1Y2UoKG9iaiwgY3VyKSA9PiB7XHJcbiAgICAgIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ2ludCcpKSBvYmpbY3VyLm5hbWVdID0gY3VyLmludDtcclxuICAgICAgZWxzZSBpZiAoY3VyLmhhc093blByb3BlcnR5KCdmbG9hdCcpKSBvYmpbY3VyLm5hbWVdID0gY3VyLmZsb2F0O1xyXG4gICAgICBlbHNlIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ3N0cmluZycpKSBvYmpbY3VyLm5hbWVdID0gY3VyLnN0cmluZztcclxuICAgICAgZWxzZSBpZiAoY3VyLmhhc093blByb3BlcnR5KCdjb2xvcicpKSBvYmpbY3VyLm5hbWVdID0gY3VyLmNvbG9yO1xyXG4gICAgICBlbHNlIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ2Jvb2wnKSkgb2JqW2N1ci5uYW1lXSA9IGN1ci5ib29sO1xyXG4gICAgICBlbHNlIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ3ZlYzInKSkgb2JqW2N1ci5uYW1lXSA9IHRoaXMucnViZVRvWFkoY3VyLnZlYzIpO1xyXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBvciBtaXNzaW5nIGN1c3RvbSBwcm9wZXJ0eSB0eXBlJyk7XHJcbiAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9LCB7fSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEZpeHR1cmVEZWZXaXRoU2hhcGUoZml4dHVyZUpzbzogUnViZUZpeHR1cmUsIGJvZHk6IFBsLmIyQm9keSk6IFBsLmIyRml4dHVyZURlZiB7XHJcbiAgICBpZiAoZml4dHVyZUpzby5oYXNPd25Qcm9wZXJ0eSgnY2lyY2xlJykgJiYgZml4dHVyZUpzby5jaXJjbGUpIHtcclxuICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgUGwuYjJDaXJjbGVTaGFwZSgpO1xyXG4gICAgICBzaGFwZS5TZXQodGhpcy5ydWJlVG9YWShmaXh0dXJlSnNvLmNpcmNsZS5jZW50ZXIpLCBmaXh0dXJlSnNvLmNpcmNsZS5yYWRpdXMpO1xyXG4gICAgICBjb25zdCBib2R5UG9zID0gYm9keS5HZXRQb3NpdGlvbigpLkNsb25lKCkuQWRkKHNoYXBlLm1fcCkuU2NhbGUodGhpcy53b3JsZFNpemUpO1xyXG4gICAgICBERUJVRyAmJiB0aGlzLmRlYnVnR3JhcGhpY3Muc3Ryb2tlQ2lyY2xlKGJvZHlQb3MueCwgLWJvZHlQb3MueSwgZml4dHVyZUpzby5jaXJjbGUucmFkaXVzICogdGhpcy53b3JsZFNpemUpO1xyXG4gICAgICByZXR1cm4ge3NoYXBlfTtcclxuICAgIH0gZWxzZSBpZiAoZml4dHVyZUpzby5oYXNPd25Qcm9wZXJ0eSgncG9seWdvbicpICYmIGZpeHR1cmVKc28ucG9seWdvbikge1xyXG4gICAgICBjb25zdCB2ZXJ0cyA9IHRoaXMucG9pbnRzRnJvbVNlcGFyYXRlZFZlcnRpY2VzKGZpeHR1cmVKc28ucG9seWdvbi52ZXJ0aWNlcykucmV2ZXJzZSgpO1xyXG4gICAgICBjb25zdCBib2R5UG9zID0gYm9keS5HZXRQb3NpdGlvbigpO1xyXG4gICAgICBpZiAoREVCVUcpIHtcclxuICAgICAgICBjb25zdCBweFZlcnRzID0gdmVydHNcclxuICAgICAgICAubWFwKHAgPT4gYm9keVBvcy5DbG9uZSgpLkFkZChuZXcgUGwuYjJWZWMyKHAueCwgcC55KS5Sb3RhdGUoYm9keS5HZXRBbmdsZSgpKSkuU2NhbGUodGhpcy53b3JsZFNpemUpKVxyXG4gICAgICAgIC5tYXAoKHt4LCB5fSkgPT4gKHt4OiB4LCB5OiAteX0pKTtcclxuICAgICAgICB0aGlzLmRlYnVnR3JhcGhpY3Muc3Ryb2tlUG9pbnRzKHB4VmVydHMsIHRydWUpLnNldERlcHRoKDEwMCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtzaGFwZTogbmV3IFBsLmIyUG9seWdvblNoYXBlKCkuU2V0KHZlcnRzLCB2ZXJ0cy5sZW5ndGgpfTtcclxuICAgIH0gZWxzZSBpZiAoZml4dHVyZUpzby5oYXNPd25Qcm9wZXJ0eSgnY2hhaW4nKSAmJiBmaXh0dXJlSnNvLmNoYWluKSB7XHJcbiAgICAgIGNvbnN0IHZlcnRzID0gdGhpcy5wb2ludHNGcm9tU2VwYXJhdGVkVmVydGljZXMoZml4dHVyZUpzby5jaGFpbi52ZXJ0aWNlcykucmV2ZXJzZSgpO1xyXG4gICAgICBjb25zdCBib2R5UG9zID0gYm9keS5HZXRQb3NpdGlvbigpO1xyXG4gICAgICBpZiAoREVCVUcpIHtcclxuICAgICAgICBjb25zdCBweFZlcnRzID0gdmVydHNcclxuICAgICAgICAubWFwKHAgPT4gYm9keVBvcy5DbG9uZSgpLkFkZChuZXcgUGwuYjJWZWMyKHAueCwgcC55KS5Sb3RhdGUoYm9keS5HZXRBbmdsZSgpKSkuU2NhbGUodGhpcy53b3JsZFNpemUpKVxyXG4gICAgICAgIC5tYXAoKHt4LCB5fSkgPT4gKHt4OiB4LCB5OiAteX0pKTtcclxuICAgICAgICB0aGlzLmRlYnVnR3JhcGhpY3Muc3Ryb2tlUG9pbnRzKHB4VmVydHMpLnNldERlcHRoKDEwMCk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgaXNMb29wID0gZml4dHVyZUpzby5jaGFpbi5oYXNOZXh0VmVydGV4ICYmIGZpeHR1cmVKc28uY2hhaW4uaGFzUHJldlZlcnRleCAmJiBmaXh0dXJlSnNvLmNoYWluLm5leHRWZXJ0ZXggJiYgZml4dHVyZUpzby5jaGFpbi5wcmV2VmVydGV4O1xyXG4gICAgICAvLyBUT0RPIHNob3VsZCBwb2x5Z29uIGNyZWF0ZSBsb29wIGNoYWluIGluc3RlYWQgdG8gYXZvaWQgZ2hvc3QgY29sbGlzaW9ucz8gaHR0cHM6Ly9ib3gyZC5vcmcvcG9zdHMvMjAyMC8wNi9naG9zdC1jb2xsaXNpb25zL1xyXG4gICAgICBjb25zdCBzaGFwZSA9IGlzTG9vcFxyXG4gICAgICAgID8gbmV3IFBsLmIyQ2hhaW5TaGFwZSgpLkNyZWF0ZUxvb3AodmVydHMsIHZlcnRzLmxlbmd0aClcclxuICAgICAgICA6IG5ldyBQbC5iMkNoYWluU2hhcGUoKS5DcmVhdGVDaGFpbih2ZXJ0cywgdmVydHMubGVuZ3RoLCB0aGlzLnJ1YmVUb1hZKGZpeHR1cmVKc28uY2hhaW4ucHJldlZlcnRleCksIHRoaXMucnViZVRvWFkoZml4dHVyZUpzby5jaGFpbi5uZXh0VmVydGV4KSk7XHJcbiAgICAgIHJldHVybiB7c2hhcGV9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBzaGFwZSB0eXBlIGZvciBmaXh0dXJlJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBvaW50c0Zyb21TZXBhcmF0ZWRWZXJ0aWNlcyh2ZXJ0aWNlczogeyB4OiBudW1iZXJbXSwgeTogbnVtYmVyW10gfSkge1xyXG4gICAgY29uc3QgdmVydHM6IFBsLlhZW10gPSBbXTtcclxuICAgIGZvciAobGV0IHYgPSAwOyB2IDwgdmVydGljZXMueC5sZW5ndGg7IHYrKylcclxuICAgICAgLy8gSW4gUlVCRSBFZGl0b3IgdGhlIFkgY29vcmRpbmF0ZXMgYXJlIHVwc2lkZSBkb3duIHdoZW4gY29tcGFyZWQgdG8gUGhhc2VyM1xyXG4gICAgICB2ZXJ0cy5wdXNoKG5ldyBQbC5iMlZlYzIodmVydGljZXMueFt2XSwgdmVydGljZXMueVt2XSkpO1xyXG4gICAgcmV0dXJuIHZlcnRzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc1hZKHZhbDogdW5rbm93bik6IHZhbCBpcyBQbC5YWSB7XHJcbiAgICByZXR1cm4gQm9vbGVhbih2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdmFsLmhhc093blByb3BlcnR5KCd4JykgJiYgdmFsLmhhc093blByb3BlcnR5KCd5JykpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge0lTY29yZX0gZnJvbSAnLi4vY29tcG9uZW50cy9TdGF0ZSc7XHJcbmltcG9ydCB7TEVWRUxfU1VDQ0VTU19CT05VU19QT0lOVFMsIFBPSU5UU19QRVJfQ09JTn0gZnJvbSAnLi4vaW5kZXgnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNhbGN1bGF0ZVRvdGFsU2NvcmUgPSAoc2NvcmU6IElTY29yZSk6IG51bWJlciA9PiB7XHJcbiAgcmV0dXJuIHNjb3JlLmRpc3RhbmNlICsgc2NvcmUudHJpY2tTY29yZSArIChzY29yZS5jb2lucyAqIFBPSU5UU19QRVJfQ09JTikgKyAoc2NvcmUuZmluaXNoZWRMZXZlbCA/IExFVkVMX1NVQ0NFU1NfQk9OVVNfUE9JTlRTIDogMCk7XHJcbn07XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCIvLyBUaGUgY2h1bmsgbG9hZGluZyBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBjaHVua3Ncbi8vIFNpbmNlIGFsbCByZWZlcmVuY2VkIGNodW5rcyBhcmUgYWxyZWFkeSBpbmNsdWRlZFxuLy8gaW4gdGhpcyBmaWxlLCB0aGlzIGZ1bmN0aW9uIGlzIGVtcHR5IGhlcmUuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmUgPSAoKSA9PiAoUHJvbWlzZS5yZXNvbHZlKCkpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJtYWluXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua3Nub3dib2FyZGluZ19nYW1lXCJdID0gc2VsZltcIndlYnBhY2tDaHVua3Nub3dib2FyZGluZ19nYW1lXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJ2ZW5kb3JzXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3NyYy9pbmRleC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9