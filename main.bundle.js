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
        this.textureKeys = new Set();
        this.ZERO = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, 0);
        this.bulletTime = { rate: 1 };
        this.debugDraw = scene.add.graphics();
        this.scene = scene;
        this.worldScale = worldScale;
        this.world = _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2World.Create(gravity);
        this.world.SetContactListener({
            BeginContact: contact => this.emit('begin-contact', contact),
            EndContact: () => null,
            PreSolve: () => null,
            PostSolve: (contact, impulse) => this.emit('post-solve', contact, impulse),
        });
        this.world.SetAllowSleeping(false);
        this.world.SetWarmStarting(true);
        this.userDataGraphics = scene.add.graphics();
        const sceneJso = this.scene.cache.json.get('santa');
        this.rubeLoader = new _util_RUBE_RubeLoader__WEBPACK_IMPORTED_MODULE_2__.RubeLoader(this.world, this.scene.add.graphics(), this.scene, this.worldScale);
        if (this.rubeLoader.loadScene(sceneJso))
            console.log('RUBE scene loaded successfully.');
        else
            throw new Error('Failed to load RUBE scene');
        this.update(); // needs to happen before update of snowman otherwise b2Body.GetPosition() inaccurate
    }
    update() {
        _index__WEBPACK_IMPORTED_MODULE_1__.stats.begin('physics');
        // const iterations = Math.floor(Math.max(this.scene.game.loop.actualFps / 3, 9));
        this.world.Step(1 / 60, { positionIterations: 12, velocityIterations: 12 });
        this.world.ClearForces(); // recommended after each time step
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
    enterBulletTime(duration, rate) {
        this.bulletTime.rate = rate;
        this.scene.tweens.add({
            delay: duration,
            targets: [this.bulletTime],
            rate: 0.9,
            duration: 500,
            // onComplete: tween => console.log('done tween'),
        });
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





class PlayerController {
    constructor(scene, b2Physics) {
        this.jumpForce = 650 * 60;
        this.leanForce = 2.5 * 60;
        this.jumpVector = new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(0, 0);
        this.debug = false;
        this.scene = scene;
        this.b2Physics = b2Physics;
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.cursors.up.on('down', () => {
            console.log('up down');
            this.state.getState() === 'grounded' && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && this.scene.observer.emit('jump_start');
        });
        this.initBodyParts();
        this.board = new _Snowboard__WEBPACK_IMPORTED_MODULE_2__.WickedSnowboard(this);
        this.state = new _State__WEBPACK_IMPORTED_MODULE_3__.State(this);
        this.debug && new _util_DebugMouseJoint__WEBPACK_IMPORTED_MODULE_4__.DebugMouseJoint(scene, b2Physics);
    }
    update(delta) {
        var _a;
        _index__WEBPACK_IMPORTED_MODULE_1__.stats.begin('snowman');
        this.state.update(delta);
        this.state.isCrashed && this.detachBoard(); // joints cannot be destroyed within post-solve callback
        this.board.getTimeInAir() > 100 && this.resetLegs();
        // Debug input
        // this.cursors.up.isDown && (this.scene.cameras.main.scrollY -= 15);
        // this.cursors.left.isDown && (this.scene.cameras.main.scrollX -= 15);
        // this.cursors.right.isDown && (this.scene.cameras.main.scrollX += 15);
        // this.cursors.down.isDown && (this.scene.cameras.main.scrollY += 15);
        if (!this.state.isCrashed) {
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
            this.cursors.up.isDown && this.scene.game.getTime() - this.cursors.up.timeDown <= 250 && this.jump(delta);
            this.cursors.left.isDown && this.leanBackward(delta);
            this.cursors.right.isDown && this.leanForward(delta);
            this.cursors.down.isDown && this.leanCenter(delta);
        }
        _index__WEBPACK_IMPORTED_MODULE_1__.stats.end('snowman');
    }
    detachBoard() {
        this.parts.bindingLeft && this.b2Physics.world.DestroyJoint(this.parts.bindingLeft);
        this.parts.bindingRight && this.b2Physics.world.DestroyJoint(this.parts.bindingRight);
        this.parts.distanceLegLeft && this.b2Physics.world.DestroyJoint(this.parts.distanceLegLeft);
        this.parts.distanceLegRight && this.b2Physics.world.DestroyJoint(this.parts.distanceLegRight);
        this.parts.weldCenter && this.b2Physics.world.DestroyJoint(this.parts.weldCenter);
    }
    jump(delta) {
        var _a, _b;
        // prevents player from jumping too quickly after a landing
        if (this.scene.game.getTime() - this.state.timeGrounded < 100)
            return; // TODO change to numStepsGrounded
        (_a = this.parts.distanceLegLeft) === null || _a === void 0 ? void 0 : _a.SetLength(0.8);
        (_b = this.parts.distanceLegRight) === null || _b === void 0 ? void 0 : _b.SetLength(0.8);
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
    initBodyParts() {
        this.parts = {
            head: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'head')[0],
            body: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'body')[0],
            boardSegments: this.b2Physics.rubeLoader.getBodiesByCustomProperty('string', 'phaserPlayerCharacterPart', 'boardSegment'),
            boardEdges: this.b2Physics.rubeLoader.getFixturesByCustomProperty('bool', 'phaserBoardEdge', true),
            bindingLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingLeft')[0],
            bindingRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'bindingRight')[0],
            distanceLegLeft: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegLeft')[0],
            distanceLegRight: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'distanceLegRight')[0],
            weldCenter: this.b2Physics.rubeLoader.getJointsByCustomProperty('string', 'phaserPlayerCharacterSpring', 'weldCenter')[0],
        };
        console.log('initBodyParts', this.parts);
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
        this.player.debug && this.debugGraphics.clear();
        const segments = this.segments;
        for (const segment of this.segments) {
            this.resetSegment(segment);
            segment.body.GetWorldPoint(_box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2.ZERO, this.pointStart);
            segment.body.GetWorldPoint(segment.groundRayDirection, this.pointEnd);
            this.b2Physics.world.RayCast(this.pointStart, this.pointEnd, segment.groundRayCallback);
            this.player.debug && this.drawDebug(segment.groundRayResult.hit ? 0x0000ff : 0x00ff00);
            if (segment.crashRayResult && segment.crashRayCallback && segment.crashRayDirection) {
                segment.body.GetWorldPoint(_box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2.ZERO, this.pointStart);
                segment.body.GetWorldPoint(segment.crashRayDirection, this.pointEnd);
                this.b2Physics.world.RayCast(this.pointStart, this.pointEnd, segment.crashRayCallback);
                this.player.debug && this.drawDebug(segment.crashRayResult.hit ? 0x0000ff : 0x00ff00);
            }
        }
        this.isTailGrounded = segments[0].groundRayResult.hit;
        this.isNoseGrounded = segments[segments.length - 1].groundRayResult.hit;
        this.isCenterGrounded = segments[2].groundRayResult.hit || segments[3].groundRayResult.hit || segments[4].groundRayResult.hit;
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
            this.b2Physics.rubeLoader.getCustomProperty(fixture, 'bool', 'phaserCrashSensorIgnore', false);
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

class State {
    constructor(playerController) {
        // TODO add particle effect when boost enabled
        this.BASE_BOOST_FLOW = 22.5 * 60;
        this.BASE_TRICK_POINTS = 200;
        this.maxBoost = this.BASE_BOOST_FLOW * 25; // 25 seconds worth of boost
        this.availableBoost = this.maxBoost;
        this.landedFrontFlips = 0;
        this.landedBackFlips = 0;
        this.timeGrounded = 0;
        this.totalTrickScore = 0;
        this.protoTrickScore = 0;
        this.comboAccumulatedScore = 0;
        this.anglePreviousUpdate = 0;
        this.totalRotation = 0; // total rotation while in air without touching the ground
        this.currentFlipRotation = 0; // set to 0 after each flip
        this.pendingFrontFlips = 0;
        this.pendingBackFlips = 0;
        this.pickupsToProcess = new Set();
        this.comboMultiplier = 0;
        this.alreadyCollectedCoins = new Set();
        this.playerController = playerController;
        this.parts = playerController.parts;
        this.b2Physics = playerController.b2Physics;
        // this.crashIgnoredParts = [this.parts.armLowerLeft, this.parts.armLowerRight, this.parts.body];
        this.state = playerController.board.isInAir() ? 'in-air' : 'grounded';
        this.registerCollisionListeners();
        this.playerController.scene.observer.on('enter-in-air', () => this.state = 'in-air');
        this.playerController.scene.observer.on('enter-grounded', () => {
            this.state = 'grounded';
            this.timeGrounded = this.playerController.scene.game.getTime();
            this.landedFrontFlips += this.pendingFrontFlips;
            this.landedBackFlips += this.pendingBackFlips;
            const numFlips = this.pendingBackFlips + this.pendingFrontFlips;
            if (numFlips >= 1) {
                const trickScore = numFlips * numFlips * this.BASE_TRICK_POINTS;
                this.totalTrickScore += trickScore;
                this.comboAccumulatedScore += trickScore * 0.1;
                this.comboMultiplier++;
                // this.gainBoost(1, numFlips * 5);
                this.playerController.scene.observer.emit('combo-change', this.comboAccumulatedScore, this.comboMultiplier);
                this.playerController.scene.observer.emit('score-change', this.totalTrickScore);
                this.playerController.scene.observer.emit('boost-change', this.availableBoost, this.maxBoost);
                this.comboLeewayTween.resetTweenData(true);
                this.comboLeewayTween.play();
            }
            this.totalRotation = 0;
            this.currentFlipRotation = 0;
            this.pendingBackFlips = 0;
            this.pendingFrontFlips = 0;
        });
        this.playerController.scene.observer.on('enter-crashed', () => {
            this.state = 'crashed';
            if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
                this.comboLeewayTween.stop();
            }
        });
        this.comboLeewayTween = this.playerController.scene.tweens.addCounter({
            paused: true,
            from: Math.PI * -0.5,
            to: Math.PI * 1.5,
            duration: 2000,
            onUpdate: (tween) => this.playerController.scene.observer.emit('combo-leeway-update', tween.getValue()),
            onComplete: tween => {
                this.totalTrickScore += this.comboAccumulatedScore * this.comboMultiplier;
                this.playerController.scene.observer.emit('score-change', this.totalTrickScore);
                this.playerController.scene.observer.emit('combo-change', 0, 0);
                this.protoTrickScore = 0;
                this.comboAccumulatedScore = 0;
                this.comboMultiplier = 0;
            },
        });
    }
    getState() {
        return this.state;
    }
    getTravelDistanceMeters() {
        const distance = this.parts.body.GetPosition().Length();
        return Math.floor(distance / 50) * 50;
    }
    gainBoost(delta, boostUnits) {
        const boost = Math.min(this.maxBoost, (this.BASE_BOOST_FLOW * boostUnits * delta) + this.availableBoost);
        this.availableBoost = boost;
        this.playerController.scene.observer.emit('boost-change', this.availableBoost, this.maxBoost);
        return boost;
    }
    consumeBoost(delta, boostUnits) {
        if (this.availableBoost <= 0)
            return 0;
        const boost = Math.min(this.availableBoost, this.BASE_BOOST_FLOW * boostUnits * delta);
        this.availableBoost -= boost * (boostUnits > 1 ? 1.5 : 1);
        this.playerController.scene.observer.emit('boost-change', this.availableBoost, this.maxBoost);
        return boost;
    }
    registerCollisionListeners() {
        this.playerController.b2Physics.on('post-solve', (contact, impulse) => {
            if (this.isCrashed)
                return;
            const bodyA = contact.GetFixtureA().GetBody();
            const bodyB = contact.GetFixtureB().GetBody();
            if (bodyA === bodyB)
                return;
            this.isCrashed = (bodyA === this.parts.head || bodyB === this.parts.head) && Math.max(...impulse.normalImpulses) > 8;
        });
        this.playerController.b2Physics.on('begin-contact', (contact) => {
            var _a, _b;
            const fixtureA = contact.GetFixtureA();
            const fixtureB = contact.GetFixtureB();
            const bodyA = fixtureA.GetBody();
            const bodyB = fixtureB.GetBody();
            if (fixtureA.IsSensor() && !this.pickupsToProcess.has(bodyA) && ((_a = fixtureA.customPropertiesMap) === null || _a === void 0 ? void 0 : _a.phaserSensorType) === 'pickup_present') {
                console.log('-------------pickup A', fixtureA.name);
                this.pickupsToProcess.add(bodyA);
                // setTimeout(() => bodyA.SetEnabled(false)); // cannot change bodies within contact listeners
                // setTimeout(() => this.b2Physics.world.DestroyBody(bodyA));
            }
            else if (fixtureB.IsSensor() && !this.pickupsToProcess.has(bodyB) && ((_b = fixtureB.customPropertiesMap) === null || _b === void 0 ? void 0 : _b.phaserSensorType) === 'pickup_present') {
                this.pickupsToProcess.add(bodyB);
                console.log('-------------pickup B', fixtureB.name);
                // setTimeout(() => bodyB.SetEnabled(false)); // cannot change bodies within contact listeners
                // setTimeout(() => this.b2Physics.world.DestroyBody(bodyB));
            }
            // if (fixtureA.IsSensor() && bodyA.IsEnabled() && !this.ignoredSensorBodies.has(bodyA)) {
            //   this.ignoredSensorBodies.add(bodyA);
            //   this.totalTrickScore += 25;
            //   this.playerController.scene.observer.emit('collected-coin', bodyA);
            //   this.playerController.scene.observer.emit('score-change', this.totalTrickScore);
            //   setTimeout(() => bodyA.SetEnabled(false)); // cannot change bodies within contact listeners
            //
            // } else if (fixtureB.IsSensor() && bodyB.IsEnabled() && !this.ignoredSensorBodies.has(bodyB)) {
            //   this.ignoredSensorBodies.add(bodyB);
            //   // this.gainBoost(1, 0.25);
            //   this.totalTrickScore += 25;
            //   this.playerController.scene.observer.emit('collected-coin', bodyB);
            //   this.playerController.scene.observer.emit('score-change', this.totalTrickScore);
            //   setTimeout(() => bodyB.SetEnabled(false)); // cannot change bodies within contact listeners
            // }
        });
    }
    update(delta) {
        this.pickupsToProcess.size && console.log('pickups', this.pickupsToProcess.size);
        for (const body of this.pickupsToProcess) {
            const img = body.GetUserData();
            this.b2Physics.world.DestroyBody(body);
            img.destroy();
            this.playerController.scene.observer.emit('pickup_present');
        }
        this.pickupsToProcess.clear();
        const isInAir = this.playerController.board.isInAir();
        if (this.state !== 'crashed' && this.isCrashed)
            this.playerController.scene.observer.emit('enter-crashed');
        if (this.state === 'grounded' && isInAir && !this.isCrashed)
            this.playerController.scene.observer.emit('enter-in-air');
        else if (this.state === 'in-air' && !isInAir && !this.isCrashed)
            this.playerController.scene.observer.emit('enter-grounded');
        this.updateTrickCounter();
        this.updateComboLeeway();
        this.updateDistance();
    }
    updateTrickCounter() {
        // console.log('-----state', this.state);
        if (this.state === 'in-air') {
            const currentAngle = phaser__WEBPACK_IMPORTED_MODULE_0__.Math.Angle.Normalize(this.parts.body.GetAngle());
            const diff = this.calculateDifferenceBetweenAngles(this.anglePreviousUpdate, currentAngle);
            this.totalRotation += diff;
            this.currentFlipRotation += diff;
            this.anglePreviousUpdate = currentAngle;
            if (this.currentFlipRotation >= Math.PI * (this.pendingFrontFlips === 0 ? 1.25 : 2)) {
                this.pendingFrontFlips++;
                this.currentFlipRotation = 0;
            }
            else if (this.currentFlipRotation <= Math.PI * -(this.pendingBackFlips === 0 ? 1.25 : 2)) {
                this.pendingBackFlips++;
                this.currentFlipRotation = 0;
            }
        }
    }
    updateComboLeeway() {
        if (this.comboLeewayTween.isPlaying() || this.comboLeewayTween.isPaused()) {
            if (this.state === 'in-air' || !this.playerController.board.isCenterGrounded) {
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
        if (distance !== this.lastDistance) {
            this.playerController.scene.observer.emit('distance-change', distance);
            this.lastDistance = distance;
        }
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

class Terrain {
    constructor(scene, physics) {
        var _a;
        this.layers = [
            { color: 0xC8E1EB, width: 5 },
            { color: 0x5c8dc9, width: 22 },
            { color: 0x223B7B, width: 10 },
            { color: 0x2d2c2c, width: 5 },
            { color: 0x3a3232, width: 250 },
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
/* harmony export */   "DEFAULT_HEIGHT": () => (/* binding */ DEFAULT_HEIGHT),
/* harmony export */   "DEFAULT_WIDTH": () => (/* binding */ DEFAULT_WIDTH),
/* harmony export */   "DEFAULT_ZOOM": () => (/* binding */ DEFAULT_ZOOM),
/* harmony export */   "RESOLUTION_SCALE": () => (/* binding */ RESOLUTION_SCALE),
/* harmony export */   "gameConfig": () => (/* binding */ gameConfig),
/* harmony export */   "stats": () => (/* binding */ stats)
/* harmony export */ });
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! phaser */ "./node_modules/phaser/dist/phaser.js");
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(phaser__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _scenes_PreloadScene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scenes/PreloadScene */ "./src/src/scenes/PreloadScene.ts");
/* harmony import */ var _scenes_GameScene__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scenes/GameScene */ "./src/src/scenes/GameScene.ts");
/* harmony import */ var gamestats_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! gamestats.js */ "./node_modules/gamestats.js/build/gamestats.module.js");
/* harmony import */ var _scenes_GameUIScene__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scenes/GameUIScene */ "./src/src/scenes/GameUIScene.ts");





const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const DEFAULT_ZOOM = 1;
const RESOLUTION_SCALE = 1;
const gameConfig = {
    title: 'Snowboarding Game',
    version: '1.0.0',
    type: phaser__WEBPACK_IMPORTED_MODULE_0__.WEBGL,
    backgroundColor: '#ffffff',
    disableContextMenu: true,
    fps: {
        min: 50,
        target: 60,
        smoothStep: true,
    },
    // roundPixels: true,
    // pixelArt: true,
    scale: {
        parent: 'phaser-wrapper',
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
let stats;
window.addEventListener('load', () => {
    const game = new phaser__WEBPACK_IMPORTED_MODULE_0__.Game(gameConfig);
    stats = new gamestats_js__WEBPACK_IMPORTED_MODULE_3__["default"](config);
    document.body.appendChild(stats.dom);
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
        this.cameras.main.setDeadzone(50, 125);
        this.cameras.main.setBackgroundColor(0x555555);
        const resolutionMod = this.cameras.main.width / _index__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_WIDTH;
        this.cameras.main.setZoom(_index__WEBPACK_IMPORTED_MODULE_4__.DEFAULT_ZOOM * resolutionMod);
        this.cameras.main.scrollX -= this.cameras.main.width / 2;
        this.cameras.main.scrollY -= this.cameras.main.height / 2;
        this.b2Physics = new _components_Physics__WEBPACK_IMPORTED_MODULE_3__.Physics(this, 40, new _box2d_core__WEBPACK_IMPORTED_MODULE_1__.b2Vec2(0, -10));
        this.playerController = new _components_PlayerController__WEBPACK_IMPORTED_MODULE_7__.PlayerController(this, this.b2Physics);
        this.terrain = new _components_Terrain__WEBPACK_IMPORTED_MODULE_2__["default"](this, this.b2Physics);
        this.cameras.main.startFollow(this.b2Physics.rubeLoader.getBodiesByCustomProperty('bool', 'phaserCameraFollow', true)[0].GetUserData(), false, 0.8, 0.25);
        this.cameras.main.followOffset.set(-375, 0);
        this.scene.launch(_GameUIScene__WEBPACK_IMPORTED_MODULE_5__["default"].name, [this.observer, () => this.scene.restart()]);
        this.backdrop = new _components_Backdrop__WEBPACK_IMPORTED_MODULE_6__.Backdrop(this);
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
        this.observer.on('enter-crashed', () => {
            this.cameras.main.shake(200, 0.01);
            this.b2Physics.enterBulletTime(-1, 0.4);
        });
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
/* harmony export */   "default": () => (/* binding */ GameUIScene)
/* harmony export */ });
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! phaser */ "./node_modules/phaser/dist/phaser.js");
/* harmony import */ var phaser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(phaser__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../index */ "./src/src/index.ts");


class GameUIScene extends phaser__WEBPACK_IMPORTED_MODULE_0__.Scene {
    constructor() {
        super({ key: 'GameUIScene' });
    }
    init([observer, restartGameCB]) {
        this.observer = observer;
        this.restartGame = restartGameCB;
    }
    create() {
        console.log('--------------ui scene create');
        debugger;
        this.cameras.main.setRoundPixels(true);
        const resolutionMod = this.game.canvas.width / _index__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_WIDTH;
        // const resolutionModifier = this.game.canvas.width === DEFAULT_WIDTH ? 1 : 0.5;
        const FONTSIZE_TITLE = 20 * resolutionMod;
        const FONTSIZE_VALUE = 18 * resolutionMod;
        const FONTSIZE_BUTTON = 24 * resolutionMod;
        const PADDING = 4 * resolutionMod;
        // this.music = this.sound.add('xmas_synth', {loop: true, volume: 0.2, rate: 0.85, delay: 1, detune: -100});
        this.music = this.sound.add('riverside_ride', { loop: true, volume: 0.2, rate: 0.95, delay: 1, detune: 0 });
        this.music.play();
        this.sfx_jump_start = this.sound.add('boink', { detune: -200 });
        this.sfx_pickup_present = this.sound.add('pickup_present', { detune: 100, rate: 1.1 });
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        // this.boostBar = new BoostBar(this, this.observer, 10, 100);
        this.playAgainButton = this.add.bitmapText(screenCenterX, screenCenterY * 1.5, 'atari-classic', 'PLAY AGAIN?')
            .setScrollFactor(0)
            .setFontSize(FONTSIZE_BUTTON)
            .setOrigin(0.5)
            .setDropShadow(1, 2, 0x222222)
            .setAlpha(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.playAgain())
            .on('pointerover', () => this.playAgainButton.setCharacterTint(0, -1, true, 10, 10, 10, 10))
            .on('pointerout', () => this.playAgainButton.setCharacterTint(0, -1, false, -10, -10, -10, -10));
        // const bounds1 = this.playAgainButton.getTextBounds();
        // this.graphics.fillRect(bounds1.global.x, bounds1.global.y, bounds1.global.width, bounds1.global.height);
        this.add.bitmapText(4, 4, 'atari-classic', 'DISTANCE').setScrollFactor(0, 0).setFontSize(FONTSIZE_TITLE);
        this.textDistance = this.add.bitmapText(PADDING * 1.5, FONTSIZE_TITLE + (PADDING * 2), 'atari-classic', 'Distance: 0m').setScrollFactor(0, 0).setFontSize(FONTSIZE_VALUE);
        this.add.bitmapText(screenCenterX, PADDING, 'atari-classic', 'COMBO').setScrollFactor(0, 0).setOrigin(0.5, 0).setFontSize(FONTSIZE_TITLE);
        this.textCombo = this.add.bitmapText(screenCenterX, FONTSIZE_TITLE + (PADDING * 2), 'atari-classic', '-').setScrollFactor(0, 0).setFontSize(FONTSIZE_VALUE).setOrigin(0.5, 0);
        this.add.bitmapText(screenCenterX * 2 - PADDING, PADDING, 'atari-classic', 'SCORE').setScrollFactor(0, 0).setOrigin(1, 0).setFontSize(FONTSIZE_TITLE);
        this.textScore = this.add.bitmapText(screenCenterX * 2 - PADDING, FONTSIZE_TITLE + (PADDING * 2), 'atari-classic', '0').setScrollFactor(0, 0).setFontSize(FONTSIZE_VALUE).setOrigin(1, 0);
        this.observer.on('jump_start', () => this.sfx_jump_start.play({ delay: 0.1 }));
        this.observer.on('pickup_present', () => this.sfx_pickup_present.play());
        this.observer.on('combo-change', (accumulated, multiplier) => this.textCombo.setText(accumulated ? (accumulated + 'x' + multiplier) : '-'));
        this.observer.on('score-change', score => this.textScore.setText(score));
        this.observer.on('distance-change', distance => this.textDistance.setText(String(distance) + 'm'));
        this.comboLeewayChart = this.add.graphics();
        this.observer.on('combo-leeway-update', (value) => {
            this.comboLeewayChart
                .clear()
                .fillStyle(0xffffff)
                .slice(screenCenterX, 72 * resolutionMod, 12 * resolutionMod, value, Math.PI * 1.5)
                .fillPath();
        });
        this.observer.on('enter-crashed', () => {
            this.playAgainButton.setAlpha(1);
            this.tweens.add({
                targets: this.music,
                volume: 0.0,
                detune: -500,
                rate: 0.5,
                duration: 3000,
                onComplete: tween => this.music.stop(),
            });
        });
    }
    update() {
    }
    playAgain() {
        this.music.stop();
        this.restartGame();
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
        this.load.audio('riverside_ride', [
            'assets/audio/riverside_ride/riverside_ride.ogg',
            'assets/audio/riverside_ride/riverside_ride.mp3',
        ]);
        // TODO convert wav to ogg, mp3 and aac
        this.load.audio('boink', [
            'assets/audio/sfx/boink.wav',
        ]);
        this.load.audio('pickup_present', [
            'assets/audio/sfx/pickupgem.wav',
        ]);
        this.load.json('santa', 'assets/santa-v01.json');
        const size = `${_index__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_WIDTH * _index__WEBPACK_IMPORTED_MODULE_0__.RESOLUTION_SCALE}x${_index__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_HEIGHT * _index__WEBPACK_IMPORTED_MODULE_0__.RESOLUTION_SCALE}`;
        this.load.atlas('bg_space_pack', `assets/img/packed/bg_space_${size}.png`, `assets/img/packed/bg_space_${size}.json`);
        // TODO create packed for everything needed
        this.load.image('ice_spikes', 'assets/img/obstacles/ice_spikes.png');
        this.load.image('snowy_rock', 'assets/img/obstacles/snowy_rock.png');
        this.load.image('present_temp', 'assets/img/present_temp.png');
        this.load.image('tree_01.png', 'assets/img/svgsilh/tree_01.png');
        this.load.image('cottage2.png', 'assets/img/svgsilh/cottage2.png');
        this.load.image('santa-board.png', 'assets/img/santa_parts_v01/santa-board.png');
        this.load.atlas('atlas-santa', `assets/img/packed/character-santa.png`, `assets/img/packed/character-santa.json`);
        this.load.bitmapFont('atari-classic', 'assets/fonts/bitmap/atari-classic.png', 'assets/fonts/bitmap/atari-classic.xml');
    }
    create() {
        this.scene.start('GameScene');
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
                // const {x, y} = bodyA.GetPosition();
                jd.Initialize(bodyA, bodyB, this.rubeToVec2(jointJson.anchorA).Rotate(bodyA.GetAngle()).Add(bodyA.GetPosition()));
                // console.log(jointJson.anchorA, x, y)
                // jd.Initialize(bodyA, bodyB, {x: 0.190875, y: -1.31445});
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
                console.log('d joint', joint);
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
        const textureFallback = (file || '').split("/").reverse()[0];
        const textureFrame = this.getCustomProperty(imageJson, 'string', 'phaserTextureFrame', undefined);
        console.log('------------- texture', texture, textureFrame);
        // console.log('textureFallback', textureFallback);
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
            // this.debugGraphics.strokeCircle(bodyPos.x, -bodyPos.y, fixtureJso.circle.radius * this.worldSize);
            return { shape };
        }
        else if (fixtureJso.hasOwnProperty('polygon') && fixtureJso.polygon) {
            const verts = this.pointsFromSeparatedVertices(fixtureJso.polygon.vertices).reverse();
            const bodyPos = body.GetPosition();
            const pxVerts = verts
                .map(p => bodyPos.Clone().Add(new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(p.x, p.y).Rotate(body.GetAngle())).Scale(this.worldSize))
                .map(({ x, y }) => ({ x: x, y: -y }));
            // this.debugGraphics.strokePoints(pxVerts, true).setDepth(100);
            return { shape: new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2PolygonShape().Set(verts, verts.length) };
        }
        else if (fixtureJso.hasOwnProperty('chain') && fixtureJso.chain) {
            const verts = this.pointsFromSeparatedVertices(fixtureJso.chain.vertices).reverse();
            const bodyPos = body.GetPosition();
            const pxVerts = verts
                .map(p => bodyPos.Clone().Add(new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2Vec2(p.x, p.y).Rotate(body.GetAngle())).Scale(this.worldSize))
                .map(({ x, y }) => ({ x: x, y: -y }));
            // this.debugGraphics.strokePoints(pxVerts).setDepth(100);
            // console.log('-----------draw', verts, pxVerts);
            const isLoop = fixtureJso.chain.hasNextVertex && fixtureJso.chain.hasPrevVertex && fixtureJso.chain.nextVertex && fixtureJso.chain.prevVertex;
            // TODO should polygon create loop chain instead to avoid ghost collisions? https://box2d.org/posts/2020/06/ghost-collisions/
            const shape = isLoop
                ? new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2ChainShape().CreateLoop(verts, verts.length)
                : new _box2d_core__WEBPACK_IMPORTED_MODULE_0__.b2ChainShape().CreateChain(verts, verts.length, this.rubeToXY(fixtureJso.chain.prevVertex), this.rubeToXY(fixtureJso.chain.nextVertex));
            return { shape };
        }
        else {
            // console.log('Could not find shape type for fixture');
            throw Error('Could not find shape type for fixture');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1lBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3RFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSwrQ0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNFLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7U0FDdkMsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFB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Q0EsK0JBQStCLHdDQUF3QztXQUN2RTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlCQUFpQixxQkFBcUI7V0FDdEM7V0FDQTtXQUNBLGtCQUFrQixxQkFBcUI7V0FDdkM7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDSEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vbm9kZV9tb2R1bGVzL2dhbWVzdGF0cy5qcy9idWlsZC8gbGF6eSBeXFwuXFwvZ2FtZXN0YXRzXFwtLipcXC5tb2R1bGVcXC5qcyQgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvY29tcG9uZW50cy9CYWNrZHJvcC50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvY29tcG9uZW50cy9QaHlzaWNzLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL1BsYXllckNvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL2NvbXBvbmVudHMvU25vd2JvYXJkLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL1N0YXRlLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL1RlcnJhaW4udHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL2luZGV4LnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9zY2VuZXMvR2FtZVNjZW5lLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9zY2VuZXMvR2FtZVVJU2NlbmUudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL3NjZW5lcy9QcmVsb2FkU2NlbmUudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL3V0aWwvRGVidWdNb3VzZUpvaW50LnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy91dGlsL1JVQkUvUnViZUxvYWRlci50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvZW5zdXJlIGNodW5rIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIG1hcCA9IHtcblx0XCIuL2dhbWVzdGF0cy1waXhpLm1vZHVsZS5qc1wiOiBbXG5cdFx0XCIuL25vZGVfbW9kdWxlcy9nYW1lc3RhdHMuanMvYnVpbGQvZ2FtZXN0YXRzLXBpeGkubW9kdWxlLmpzXCIsXG5cdFx0XCJ2ZW5kb3JzXCJcblx0XVxufTtcbmZ1bmN0aW9uIHdlYnBhY2tBc3luY0NvbnRleHQocmVxKSB7XG5cdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8obWFwLCByZXEpKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgcmVxICsgXCInXCIpO1xuXHRcdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9KTtcblx0fVxuXG5cdHZhciBpZHMgPSBtYXBbcmVxXSwgaWQgPSBpZHNbMF07XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLmUoaWRzWzFdKS50aGVuKCgpID0+IHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhpZCk7XG5cdH0pO1xufVxud2VicGFja0FzeW5jQ29udGV4dC5rZXlzID0gKCkgPT4gKE9iamVjdC5rZXlzKG1hcCkpO1xud2VicGFja0FzeW5jQ29udGV4dC5pZCA9IFwiLi9ub2RlX21vZHVsZXMvZ2FtZXN0YXRzLmpzL2J1aWxkIGxhenkgcmVjdXJzaXZlIF5cXFxcLlxcXFwvZ2FtZXN0YXRzXFxcXC0uKlxcXFwubW9kdWxlXFxcXC5qcyRcIjtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0FzeW5jQ29udGV4dDsiLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQge3N0YXRzfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi4vc2NlbmVzL0dhbWVTY2VuZSc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEJhY2tkcm9wIHtcclxuICBwcml2YXRlIHNjZW5lOiBHYW1lU2NlbmU7XHJcblxyXG4gIHByaXZhdGUgYmdTcGFjZUJhY2s6IFBoYXNlci5HYW1lT2JqZWN0cy5UaWxlU3ByaXRlO1xyXG4gIHByaXZhdGUgYmdTcGFjZU1pZDogUGhhc2VyLkdhbWVPYmplY3RzLlRpbGVTcHJpdGU7XHJcbiAgcHJpdmF0ZSBiZ1NwYWNlRnJvbnQ6IFBoYXNlci5HYW1lT2JqZWN0cy5UaWxlU3ByaXRlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmJnU3BhY2VCYWNrID0gdGhpcy5yZWdpc3RlckxheWVyKCdiZ19zcGFjZV9iYWNrLnBuZycpO1xyXG4gICAgdGhpcy5iZ1NwYWNlTWlkID0gdGhpcy5yZWdpc3RlckxheWVyKCdiZ19zcGFjZV9taWQucG5nJyk7XHJcbiAgICB0aGlzLmJnU3BhY2VGcm9udCA9IHRoaXMucmVnaXN0ZXJMYXllcignYmdfc3BhY2VfZnJvbnQucG5nJyk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBzdGF0cy5iZWdpbignYmFja2Ryb3AnKTtcclxuICAgIGNvbnN0IHtzY3JvbGxYLCBzY3JvbGxZfSA9IHRoaXMuc2NlbmUuY2FtZXJhcy5tYWluO1xyXG4gICAgdGhpcy5iZ1NwYWNlQmFjay5zZXRUaWxlUG9zaXRpb24oc2Nyb2xsWCAqIDAuMDA1LCBzY3JvbGxZICogMC4wMDUpO1xyXG4gICAgdGhpcy5iZ1NwYWNlTWlkLnNldFRpbGVQb3NpdGlvbihzY3JvbGxYICogMC4wMSwgc2Nyb2xsWSAqIDAuMDEpO1xyXG4gICAgdGhpcy5iZ1NwYWNlRnJvbnQuc2V0VGlsZVBvc2l0aW9uKHNjcm9sbFggKiAwLjAyNSwgc2Nyb2xsWSAqIDAuMDI1KTtcclxuICAgIHN0YXRzLmVuZCgnYmFja2Ryb3AnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVnaXN0ZXJMYXllcihrZXk6IHN0cmluZywgc2NhbGVYOiBudW1iZXIgPSAxLCBzY2FsZVk6IG51bWJlciA9IDEpOiBQaC5HYW1lT2JqZWN0cy5UaWxlU3ByaXRlIHtcclxuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCB6b29tWCwgem9vbVksIHdvcmxkVmlld30gPSB0aGlzLnNjZW5lLmNhbWVyYXMubWFpbjtcclxuICAgIHJldHVybiB0aGlzLnNjZW5lLmFkZC50aWxlU3ByaXRlKHdvcmxkVmlldy54ICsgd2lkdGggLyAyLCB3b3JsZFZpZXcueSArIGhlaWdodCAvIDIsIHdpZHRoLCBoZWlnaHQsICdiZ19zcGFjZV9wYWNrJywga2V5KVxyXG4gICAgLnNldE9yaWdpbigwLjUsIDAuNSlcclxuICAgIC5zZXRTY3JvbGxGYWN0b3IoMCwgMClcclxuICAgIC5zZXRTY2FsZShzY2FsZVggKiAoMSAvIHpvb21YKSwgc2NhbGVZICogKDEgLyB6b29tWSkpXHJcbiAgICAuc2V0RGVwdGgoLTIwMCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIFBoIGZyb20gJ3BoYXNlcic7XHJcbmltcG9ydCAqIGFzIFBsIGZyb20gJ0Bib3gyZC9jb3JlJztcclxuaW1wb3J0IHtzdGF0c30gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5pbXBvcnQge1J1YmVTY2VuZX0gZnJvbSAnLi4vdXRpbC9SVUJFL1J1YmVMb2FkZXJJbnRlcmZhY2VzJztcclxuaW1wb3J0IHtSdWJlTG9hZGVyfSBmcm9tICcuLi91dGlsL1JVQkUvUnViZUxvYWRlcic7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFBoeXNpY3MgZXh0ZW5kcyBQaGFzZXIuRXZlbnRzLkV2ZW50RW1pdHRlciB7XHJcbiAgcHJpdmF0ZSBzY2VuZTogR2FtZVNjZW5lO1xyXG4gIHdvcmxkU2NhbGU6IG51bWJlcjtcclxuICB3b3JsZDogUGwuYjJXb3JsZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IHVzZXJEYXRhR3JhcGhpY3M6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdGV4dHVyZUtleXM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgWkVSTzogUGwuYjJWZWMyID0gbmV3IFBsLmIyVmVjMigwLCAwKTtcclxuICBwcml2YXRlIGJ1bGxldFRpbWU6IHsgcmF0ZTogbnVtYmVyIH0gPSB7cmF0ZTogMX07XHJcbiAgZGVidWdEcmF3OiBQaC5HYW1lT2JqZWN0cy5HcmFwaGljcztcclxuICBydWJlTG9hZGVyOiBSdWJlTG9hZGVyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCB3b3JsZFNjYWxlOiBudW1iZXIsIGdyYXZpdHk6IFBsLmIyVmVjMikge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuZGVidWdEcmF3ID0gc2NlbmUuYWRkLmdyYXBoaWNzKCk7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLndvcmxkU2NhbGUgPSB3b3JsZFNjYWxlO1xyXG4gICAgdGhpcy53b3JsZCA9IFBsLmIyV29ybGQuQ3JlYXRlKGdyYXZpdHkpO1xyXG4gICAgdGhpcy53b3JsZC5TZXRDb250YWN0TGlzdGVuZXIoe1xyXG4gICAgICBCZWdpbkNvbnRhY3Q6IGNvbnRhY3QgPT4gdGhpcy5lbWl0KCdiZWdpbi1jb250YWN0JywgY29udGFjdCksXHJcbiAgICAgIEVuZENvbnRhY3Q6ICgpID0+IG51bGwsXHJcbiAgICAgIFByZVNvbHZlOiAoKSA9PiBudWxsLFxyXG4gICAgICBQb3N0U29sdmU6IChjb250YWN0LCBpbXB1bHNlKSA9PiB0aGlzLmVtaXQoJ3Bvc3Qtc29sdmUnLCBjb250YWN0LCBpbXB1bHNlKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMud29ybGQuU2V0QWxsb3dTbGVlcGluZyhmYWxzZSk7XHJcbiAgICB0aGlzLndvcmxkLlNldFdhcm1TdGFydGluZyh0cnVlKTtcclxuICAgIHRoaXMudXNlckRhdGFHcmFwaGljcyA9IHNjZW5lLmFkZC5ncmFwaGljcygpO1xyXG5cclxuICAgIGNvbnN0IHNjZW5lSnNvOiBSdWJlU2NlbmUgPSB0aGlzLnNjZW5lLmNhY2hlLmpzb24uZ2V0KCdzYW50YScpO1xyXG4gICAgdGhpcy5ydWJlTG9hZGVyID0gbmV3IFJ1YmVMb2FkZXIodGhpcy53b3JsZCwgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKSwgdGhpcy5zY2VuZSwgdGhpcy53b3JsZFNjYWxlKTtcclxuXHJcbiAgICBpZiAodGhpcy5ydWJlTG9hZGVyLmxvYWRTY2VuZShzY2VuZUpzbykpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdSVUJFIHNjZW5lIGxvYWRlZCBzdWNjZXNzZnVsbHkuJyk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgUlVCRSBzY2VuZScpO1xyXG4gICAgdGhpcy51cGRhdGUoKTsgLy8gbmVlZHMgdG8gaGFwcGVuIGJlZm9yZSB1cGRhdGUgb2Ygc25vd21hbiBvdGhlcndpc2UgYjJCb2R5LkdldFBvc2l0aW9uKCkgaW5hY2N1cmF0ZVxyXG5cclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIHN0YXRzLmJlZ2luKCdwaHlzaWNzJyk7XHJcblxyXG4gICAgLy8gY29uc3QgaXRlcmF0aW9ucyA9IE1hdGguZmxvb3IoTWF0aC5tYXgodGhpcy5zY2VuZS5nYW1lLmxvb3AuYWN0dWFsRnBzIC8gMywgOSkpO1xyXG4gICAgdGhpcy53b3JsZC5TdGVwKDEgLyA2MCwge3Bvc2l0aW9uSXRlcmF0aW9uczogMTIsIHZlbG9jaXR5SXRlcmF0aW9uczogMTJ9KTtcclxuICAgIHRoaXMud29ybGQuQ2xlYXJGb3JjZXMoKTsgLy8gcmVjb21tZW5kZWQgYWZ0ZXIgZWFjaCB0aW1lIHN0ZXBcclxuXHJcbiAgICAvLyBpdGVyYXRlIHRocm91Z2ggYWxsIGJvZGllc1xyXG4gICAgY29uc3Qgd29ybGRTY2FsZSA9IHRoaXMud29ybGRTY2FsZTtcclxuICAgIGZvciAobGV0IGJvZHkgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlO1xyXG4gICAgICBsZXQgYm9keVJlcHJlc2VudGF0aW9uID0gYm9keS5HZXRVc2VyRGF0YSgpIGFzIFBoLkdhbWVPYmplY3RzLkltYWdlO1xyXG4gICAgICBpZiAoIWJvZHlSZXByZXNlbnRhdGlvbikgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoYm9keVJlcHJlc2VudGF0aW9uKSB7XHJcbiAgICAgICAgaWYgKGJvZHkuSXNFbmFibGVkKCkpIHtcclxuICAgICAgICAgIC8vIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICBsZXQge3gsIHl9ID0gYm9keS5HZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgIWJvZHlSZXByZXNlbnRhdGlvbi52aXNpYmxlICYmIGJvZHlSZXByZXNlbnRhdGlvbi5zZXRWaXNpYmxlKHRydWUpO1xyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnggPSB4ICogd29ybGRTY2FsZTtcclxuICAgICAgICAgIGJvZHlSZXByZXNlbnRhdGlvbi55ID0geSAqIC13b3JsZFNjYWxlO1xyXG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnJvdGF0aW9uID0gLWJvZHkuR2V0QW5nbGUoKSArIChib2R5UmVwcmVzZW50YXRpb24uY3VzdG9tX29yaWdpbl9hbmdsZSB8fCAwKTsgLy8gaW4gcmFkaWFucztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnNldFZpc2libGUoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGltYWdlJywgYm9keS5HZXRQb3NpdGlvbigpLCBib2R5Lm5hbWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0cy5lbmQoJ3BoeXNpY3MnKTtcclxuICB9XHJcblxyXG4gIGVudGVyQnVsbGV0VGltZShkdXJhdGlvbjogbnVtYmVyLCByYXRlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuYnVsbGV0VGltZS5yYXRlID0gcmF0ZTtcclxuICAgIHRoaXMuc2NlbmUudHdlZW5zLmFkZCh7XHJcbiAgICAgIGRlbGF5OiBkdXJhdGlvbixcclxuICAgICAgdGFyZ2V0czogW3RoaXMuYnVsbGV0VGltZV0sXHJcbiAgICAgIHJhdGU6IDAuOSxcclxuICAgICAgZHVyYXRpb246IDUwMCxcclxuICAgICAgLy8gb25Db21wbGV0ZTogdHdlZW4gPT4gY29uc29sZS5sb2coJ2RvbmUgdHdlZW4nKSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7UGh5c2ljc30gZnJvbSAnLi9QaHlzaWNzJztcclxuaW1wb3J0IHtzdGF0c30gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5pbXBvcnQge1dpY2tlZFNub3dib2FyZH0gZnJvbSAnLi9Tbm93Ym9hcmQnO1xyXG5pbXBvcnQge1N0YXRlfSBmcm9tICcuL1N0YXRlJztcclxuaW1wb3J0IHtSdWJlRW50aXR5fSBmcm9tICcuLi91dGlsL1JVQkUvUnViZUxvYWRlckludGVyZmFjZXMnO1xyXG5pbXBvcnQge0RlYnVnTW91c2VKb2ludH0gZnJvbSAnLi4vdXRpbC9EZWJ1Z01vdXNlSm9pbnQnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXJDb250cm9sbGVyIHtcclxuICByZWFkb25seSBzY2VuZTogR2FtZVNjZW5lO1xyXG4gIHJlYWRvbmx5IGIyUGh5c2ljczogUGh5c2ljcztcclxuICBwcml2YXRlIHJlYWRvbmx5IGN1cnNvcnM6IFBoLlR5cGVzLklucHV0LktleWJvYXJkLkN1cnNvcktleXM7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkZWJ1Z0N1cnNvcnM6IFBoLlR5cGVzLklucHV0LktleWJvYXJkLkN1cnNvcktleXM7XHJcblxyXG4gIHBhcnRzOiBJQm9keVBhcnRzO1xyXG4gIGJvYXJkOiBXaWNrZWRTbm93Ym9hcmQ7XHJcbiAgc3RhdGU6IFN0YXRlO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGp1bXBGb3JjZTogbnVtYmVyID0gNjUwICogNjA7XHJcbiAgcHJpdmF0ZSBsZWFuRm9yY2U6IG51bWJlciA9IDIuNSAqIDYwO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkganVtcFZlY3RvcjogUGwuYjJWZWMyID0gbmV3IFBsLmIyVmVjMigwLCAwKTtcclxuICBkZWJ1ZyA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCBiMlBoeXNpY3M6IFBoeXNpY3MpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuYjJQaHlzaWNzID0gYjJQaHlzaWNzO1xyXG4gICAgdGhpcy5jdXJzb3JzID0gdGhpcy5zY2VuZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblxyXG4gICAgdGhpcy5jdXJzb3JzLnVwLm9uKCdkb3duJywgKCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygndXAgZG93bicpO1xyXG4gICAgICB0aGlzLnN0YXRlLmdldFN0YXRlKCkgPT09ICdncm91bmRlZCcgJiYgdGhpcy5zY2VuZS5nYW1lLmdldFRpbWUoKSAtIHRoaXMuY3Vyc29ycy51cC50aW1lRG93biA8PSAyNTAgJiYgdGhpcy5zY2VuZS5vYnNlcnZlci5lbWl0KCdqdW1wX3N0YXJ0Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmluaXRCb2R5UGFydHMoKTtcclxuICAgIHRoaXMuYm9hcmQgPSBuZXcgV2lja2VkU25vd2JvYXJkKHRoaXMpO1xyXG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBTdGF0ZSh0aGlzKTtcclxuICAgIHRoaXMuZGVidWcgJiYgbmV3IERlYnVnTW91c2VKb2ludChzY2VuZSwgYjJQaHlzaWNzKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YTogbnVtYmVyKSB7XHJcbiAgICBzdGF0cy5iZWdpbignc25vd21hbicpO1xyXG5cclxuICAgIHRoaXMuc3RhdGUudXBkYXRlKGRlbHRhKTtcclxuICAgIHRoaXMuc3RhdGUuaXNDcmFzaGVkICYmIHRoaXMuZGV0YWNoQm9hcmQoKTsgLy8gam9pbnRzIGNhbm5vdCBiZSBkZXN0cm95ZWQgd2l0aGluIHBvc3Qtc29sdmUgY2FsbGJhY2tcclxuICAgICAgICB0aGlzLmJvYXJkLmdldFRpbWVJbkFpcigpID4gMTAwICYmIHRoaXMucmVzZXRMZWdzKCk7XHJcblxyXG5cclxuICAgIC8vIERlYnVnIGlucHV0XHJcbiAgICAvLyB0aGlzLmN1cnNvcnMudXAuaXNEb3duICYmICh0aGlzLnNjZW5lLmNhbWVyYXMubWFpbi5zY3JvbGxZIC09IDE1KTtcclxuICAgIC8vIHRoaXMuY3Vyc29ycy5sZWZ0LmlzRG93biAmJiAodGhpcy5zY2VuZS5jYW1lcmFzLm1haW4uc2Nyb2xsWCAtPSAxNSk7XHJcbiAgICAvLyB0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duICYmICh0aGlzLnNjZW5lLmNhbWVyYXMubWFpbi5zY3JvbGxYICs9IDE1KTtcclxuICAgIC8vIHRoaXMuY3Vyc29ycy5kb3duLmlzRG93biAmJiAodGhpcy5zY2VuZS5jYW1lcmFzLm1haW4uc2Nyb2xsWSArPSAxNSk7XHJcblxyXG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ3Jhc2hlZCkge1xyXG4gICAgICB0aGlzLmJvYXJkLnVwZGF0ZShkZWx0YSk7XHJcbiAgICAgIC8vIFRvdWNoL01vdXNlIGlucHV0XHJcbiAgICAgIGlmICh0aGlzLnNjZW5lLmlucHV0LmFjdGl2ZVBvaW50ZXI/LmlzRG93biAmJiB0aGlzLnNjZW5lLmlucHV0LmFjdGl2ZVBvaW50ZXIud2FzVG91Y2gpIHtcclxuICAgICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5zY2VuZS5pbnB1dC5hY3RpdmVQb2ludGVyOyAvLyBhY3RpdmVQb2ludGVyIHVuZGVmaW5lZCB1bnRpbCBhZnRlciBmaXJzdCB0b3VjaCBpbnB1dFxyXG4gICAgICAgIHBvaW50ZXIubW90aW9uRmFjdG9yID0gMC4yO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuaW5wdXQuYWN0aXZlUG9pbnRlci54IDwgdGhpcy5zY2VuZS5jYW1lcmFzLm1haW4ud2lkdGggLyAyID8gdGhpcy5sZWFuQmFja3dhcmQoZGVsdGEpIDogdGhpcy5sZWFuRm9yd2FyZChkZWx0YSk7XHJcbiAgICAgICAgcG9pbnRlci52ZWxvY2l0eS55IDwgLTMwICYmIHRoaXMuc2NlbmUuZ2FtZS5nZXRUaW1lKCkgLSBwb2ludGVyLm1vdmVUaW1lIDw9IDI1MCAmJiB0aGlzLmp1bXAoZGVsdGEpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2NlbmUuaW5wdXQuYWN0aXZlUG9pbnRlci5tb3Rpb25GYWN0b3IgPSAwLjg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEtleWJvYXJkIGlucHV0XHJcbiAgICAgIHRoaXMuY3Vyc29ycy51cC5pc0Rvd24gJiYgdGhpcy5zY2VuZS5nYW1lLmdldFRpbWUoKSAtIHRoaXMuY3Vyc29ycy51cC50aW1lRG93biA8PSAyNTAgJiYgdGhpcy5qdW1wKGRlbHRhKTtcclxuICAgICAgdGhpcy5jdXJzb3JzLmxlZnQuaXNEb3duICYmIHRoaXMubGVhbkJhY2t3YXJkKGRlbHRhKTtcclxuICAgICAgdGhpcy5jdXJzb3JzLnJpZ2h0LmlzRG93biAmJiB0aGlzLmxlYW5Gb3J3YXJkKGRlbHRhKTtcclxuICAgICAgdGhpcy5jdXJzb3JzLmRvd24uaXNEb3duICYmIHRoaXMubGVhbkNlbnRlcihkZWx0YSk7XHJcbiAgICB9XHJcbiAgICBzdGF0cy5lbmQoJ3Nub3dtYW4nKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGV0YWNoQm9hcmQoKSB7XHJcbiAgICB0aGlzLnBhcnRzLmJpbmRpbmdMZWZ0ICYmIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLnBhcnRzLmJpbmRpbmdMZWZ0KTtcclxuICAgIHRoaXMucGFydHMuYmluZGluZ1JpZ2h0ICYmIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLnBhcnRzLmJpbmRpbmdSaWdodCk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnTGVmdCAmJiB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Sm9pbnQodGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ0xlZnQpO1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ1JpZ2h0ICYmIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQpO1xyXG4gICAgdGhpcy5wYXJ0cy53ZWxkQ2VudGVyICYmIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLnBhcnRzLndlbGRDZW50ZXIpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBqdW1wKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIC8vIHByZXZlbnRzIHBsYXllciBmcm9tIGp1bXBpbmcgdG9vIHF1aWNrbHkgYWZ0ZXIgYSBsYW5kaW5nXHJcbiAgICBpZiAodGhpcy5zY2VuZS5nYW1lLmdldFRpbWUoKSAtIHRoaXMuc3RhdGUudGltZUdyb3VuZGVkIDwgMTAwKSByZXR1cm47IC8vIFRPRE8gY2hhbmdlIHRvIG51bVN0ZXBzR3JvdW5kZWRcclxuXHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnTGVmdD8uU2V0TGVuZ3RoKDAuOCk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQ/LlNldExlbmd0aCgwLjgpO1xyXG5cclxuICAgIGNvbnN0IHtpc1RhaWxHcm91bmRlZCwgaXNDZW50ZXJHcm91bmRlZCwgaXNOb3NlR3JvdW5kZWR9ID0gdGhpcy5ib2FyZDtcclxuICAgIGlmIChpc0NlbnRlckdyb3VuZGVkIHx8IGlzVGFpbEdyb3VuZGVkIHx8IGlzTm9zZUdyb3VuZGVkKSB7XHJcbiAgICAgIGNvbnN0IGZvcmNlID0gdGhpcy5qdW1wRm9yY2UgKiBkZWx0YTtcclxuICAgICAgY29uc3QganVtcFZlY3RvciA9IHRoaXMuanVtcFZlY3Rvci5TZXQoMCwgMCk7XHJcbiAgICAgIGlzQ2VudGVyR3JvdW5kZWRcclxuICAgICAgICA/IHRoaXMucGFydHMuYm9keS5HZXRXb3JsZFZlY3Rvcih7eDogMCwgeTogZm9yY2UgKiAwLjN9LCBqdW1wVmVjdG9yKS5BZGQoe3g6IDAsIHk6IGZvcmNlICogMS4yNX0pXHJcbiAgICAgICAgOiB0aGlzLnBhcnRzLmJvZHkuR2V0V29ybGRWZWN0b3Ioe3g6IDAsIHk6IGZvcmNlICogMC41fSwganVtcFZlY3RvcikuQWRkKHt4OiAwLCB5OiBmb3JjZSAqIDAuODV9KTtcclxuICAgICAgdGhpcy5wYXJ0cy5ib2R5LkFwcGx5Rm9yY2VUb0NlbnRlcihqdW1wVmVjdG9yLCB0cnVlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZXNldExlZ3MoKSB7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnTGVmdD8uU2V0TGVuZ3RoKDAuNjUpO1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ1JpZ2h0Py5TZXRMZW5ndGgoMC42NSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxlYW5CYWNrd2FyZChkZWx0YTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnTGVmdD8uU2V0TGVuZ3RoKDAuNTUpO1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ1JpZ2h0Py5TZXRMZW5ndGgoMC44KTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIHRoaXMucGFydHMud2VsZENlbnRlci5tX3JlZmVyZW5jZUFuZ2xlID0gTWF0aC5QSSAvIDE4MCAqIC0xMDtcclxuICAgIHRoaXMucGFydHMuYm9keS5BcHBseUFuZ3VsYXJJbXB1bHNlKHRoaXMubGVhbkZvcmNlICogZGVsdGEpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsZWFuRm9yd2FyZChkZWx0YTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnTGVmdD8uU2V0TGVuZ3RoKDAuOCk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQ/LlNldExlbmd0aCgwLjU1KTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIHRoaXMucGFydHMud2VsZENlbnRlci5tX3JlZmVyZW5jZUFuZ2xlID0gTWF0aC5QSSAvIDE4MCAqIDEwO1xyXG4gICAgdGhpcy5wYXJ0cy5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UoLXRoaXMubGVhbkZvcmNlICogZGVsdGEpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsZWFuQ2VudGVyKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC41NSk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQ/LlNldExlbmd0aCgwLjU1KTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIHRoaXMucGFydHMud2VsZENlbnRlci5tX3JlZmVyZW5jZUFuZ2xlID0gMDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdEJvZHlQYXJ0cygpIHtcclxuICAgIHRoaXMucGFydHMgPSB7XHJcbiAgICAgIGhlYWQ6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Qm9kaWVzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclBhcnQnLCAnaGVhZCcpWzBdLFxyXG4gICAgICBib2R5OiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJQYXJ0JywgJ2JvZHknKVswXSxcclxuICAgICAgYm9hcmRTZWdtZW50czogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyUGFydCcsICdib2FyZFNlZ21lbnQnKSxcclxuXHJcbiAgICAgIGJvYXJkRWRnZXM6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Rml4dHVyZXNCeUN1c3RvbVByb3BlcnR5KCdib29sJywgJ3BoYXNlckJvYXJkRWRnZScsIHRydWUpLFxyXG5cclxuICAgICAgYmluZGluZ0xlZnQ6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Sm9pbnRzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclNwcmluZycsICdiaW5kaW5nTGVmdCcpWzBdIGFzIFBsLmIyUmV2b2x1dGVKb2ludCxcclxuICAgICAgYmluZGluZ1JpZ2h0OiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEpvaW50c0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJTcHJpbmcnLCAnYmluZGluZ1JpZ2h0JylbMF0gYXMgUGwuYjJSZXZvbHV0ZUpvaW50LFxyXG4gICAgICBkaXN0YW5jZUxlZ0xlZnQ6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Sm9pbnRzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclNwcmluZycsICdkaXN0YW5jZUxlZ0xlZnQnKVswXSBhcyBQbC5iMkRpc3RhbmNlSm9pbnQsXHJcbiAgICAgIGRpc3RhbmNlTGVnUmlnaHQ6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Sm9pbnRzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclNwcmluZycsICdkaXN0YW5jZUxlZ1JpZ2h0JylbMF0gYXMgUGwuYjJEaXN0YW5jZUpvaW50LFxyXG4gICAgICB3ZWxkQ2VudGVyOiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEpvaW50c0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJTcHJpbmcnLCAnd2VsZENlbnRlcicpWzBdIGFzIFBsLmIyV2VsZEpvaW50LFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zb2xlLmxvZygnaW5pdEJvZHlQYXJ0cycsIHRoaXMucGFydHMpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElCb2R5UGFydHMge1xyXG4gIGhlYWQ6IFBsLmIyQm9keSAmIFJ1YmVFbnRpdHk7XHJcbiAgYm9keTogUGwuYjJCb2R5ICYgUnViZUVudGl0eTtcclxuICBib2FyZFNlZ21lbnRzOiAoUGwuYjJCb2R5ICYgUnViZUVudGl0eSlbXTtcclxuICBib2FyZEVkZ2VzOiAoUGwuYjJGaXh0dXJlICYgUnViZUVudGl0eSlbXTsgLy8gdGFpbCBhbmQgbm9zZSBlZGdlcyB3aGVuIGhpdCB0cmlnZ2VyIGNyYXNoO1xyXG5cclxuICBiaW5kaW5nTGVmdDogUGwuYjJSZXZvbHV0ZUpvaW50ICYgUnViZUVudGl0eSB8IG51bGw7XHJcbiAgYmluZGluZ1JpZ2h0OiBQbC5iMlJldm9sdXRlSm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICBkaXN0YW5jZUxlZ0xlZnQ6IFBsLmIyRGlzdGFuY2VKb2ludCAmIFJ1YmVFbnRpdHkgfCBudWxsO1xyXG4gIGRpc3RhbmNlTGVnUmlnaHQ6IFBsLmIyRGlzdGFuY2VKb2ludCAmIFJ1YmVFbnRpdHkgfCBudWxsO1xyXG4gIHdlbGRDZW50ZXI6IFBsLmIyV2VsZEpvaW50ICYgUnViZUVudGl0eSB8IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0ICogYXMgUGwgZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQge1BoeXNpY3N9IGZyb20gJy4vUGh5c2ljcyc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi4vc2NlbmVzL0dhbWVTY2VuZSc7XHJcbmltcG9ydCB7UGxheWVyQ29udHJvbGxlcn0gZnJvbSAnLi9QbGF5ZXJDb250cm9sbGVyJztcclxuXHJcblxyXG5pbnRlcmZhY2UgSVJheUNhc3RSZXN1bHQge1xyXG4gIGhpdDogYm9vbGVhbjtcclxuICBwb2ludDogUGwuYjJWZWMyIHwgbnVsbCB8IHVuZGVmaW5lZDtcclxuICBub3JtYWw6IFBsLmIyVmVjMiB8IG51bGwgfCB1bmRlZmluZWQ7XHJcbiAgZnJhY3Rpb246IG51bWJlcjtcclxuICBsYXN0SGl0VGltZTogbnVtYmVyO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU2VnbWVudCB7XHJcbiAgYm9keTogUGwuYjJCb2R5O1xyXG5cclxuICBncm91bmRSYXlEaXJlY3Rpb246IFBsLmIyVmVjMjtcclxuICBncm91bmRSYXlSZXN1bHQ6IElSYXlDYXN0UmVzdWx0O1xyXG4gIGdyb3VuZFJheUNhbGxiYWNrOiBQbC5iMlJheUNhc3RDYWxsYmFjaztcclxuXHJcbiAgY3Jhc2hSYXlEaXJlY3Rpb24/OiBQbC5iMlZlYzI7XHJcbiAgY3Jhc2hSYXlSZXN1bHQ/OiBJUmF5Q2FzdFJlc3VsdDtcclxuICBjcmFzaFJheUNhbGxiYWNrPzogUGwuYjJSYXlDYXN0Q2FsbGJhY2s7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgV2lja2VkU25vd2JvYXJkIHtcclxuICBub3NlPzogSVNlZ21lbnQ7XHJcblxyXG4gIGlzVGFpbEdyb3VuZGVkOiBib29sZWFuO1xyXG4gIGlzTm9zZUdyb3VuZGVkOiBib29sZWFuO1xyXG4gIGlzQ2VudGVyR3JvdW5kZWQ6IGJvb2xlYW47XHJcblxyXG4gIHJlYWRvbmx5IHNlZ21lbnRzOiBJU2VnbWVudFtdID0gW107XHJcblxyXG4gIHByaXZhdGUgcG9pbnRTdGFydDogUGwuYjJWZWMyID0gbmV3IFBsLmIyVmVjMigwLCAwKTtcclxuICBwcml2YXRlIHBvaW50RW5kOiBQbC5iMlZlYzIgPSBuZXcgUGwuYjJWZWMyKDAsIDApO1xyXG4gIHByaXZhdGUgZGVidWdHcmFwaGljczogUGguR2FtZU9iamVjdHMuR3JhcGhpY3M7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGxheWVyOiBQbGF5ZXJDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NlbmU6IEdhbWVTY2VuZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGIyUGh5c2ljczogUGh5c2ljcztcclxuXHJcbiAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXJDb250cm9sbGVyKSB7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICAgIHRoaXMuc2NlbmUgPSBwbGF5ZXIuc2NlbmU7XHJcbiAgICB0aGlzLmIyUGh5c2ljcyA9IHBsYXllci5iMlBoeXNpY3M7XHJcblxyXG4gICAgdGhpcy5kZWJ1Z0dyYXBoaWNzID0gdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKTtcclxuICAgIHRoaXMuaW5pdFJheXModGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZSAvIDQpO1xyXG5cclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnBsYXllci5kZWJ1ZyAmJiB0aGlzLmRlYnVnR3JhcGhpY3MuY2xlYXIoKTtcclxuICAgIGNvbnN0IHNlZ21lbnRzID0gdGhpcy5zZWdtZW50cztcclxuXHJcbiAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2YgdGhpcy5zZWdtZW50cykge1xyXG4gICAgICB0aGlzLnJlc2V0U2VnbWVudChzZWdtZW50KTtcclxuICAgICAgc2VnbWVudC5ib2R5LkdldFdvcmxkUG9pbnQoUGwuYjJWZWMyLlpFUk8sIHRoaXMucG9pbnRTdGFydCk7XHJcbiAgICAgIHNlZ21lbnQuYm9keS5HZXRXb3JsZFBvaW50KHNlZ21lbnQuZ3JvdW5kUmF5RGlyZWN0aW9uLCB0aGlzLnBvaW50RW5kKTtcclxuICAgICAgdGhpcy5iMlBoeXNpY3Mud29ybGQuUmF5Q2FzdCh0aGlzLnBvaW50U3RhcnQsIHRoaXMucG9pbnRFbmQsIHNlZ21lbnQuZ3JvdW5kUmF5Q2FsbGJhY2spO1xyXG4gICAgICB0aGlzLnBsYXllci5kZWJ1ZyAmJiB0aGlzLmRyYXdEZWJ1ZyhzZWdtZW50Lmdyb3VuZFJheVJlc3VsdC5oaXQgPyAweDAwMDBmZiA6IDB4MDBmZjAwKTtcclxuXHJcbiAgICAgIGlmIChzZWdtZW50LmNyYXNoUmF5UmVzdWx0ICYmIHNlZ21lbnQuY3Jhc2hSYXlDYWxsYmFjayAmJiBzZWdtZW50LmNyYXNoUmF5RGlyZWN0aW9uKSB7XHJcbiAgICAgICAgc2VnbWVudC5ib2R5LkdldFdvcmxkUG9pbnQoUGwuYjJWZWMyLlpFUk8sIHRoaXMucG9pbnRTdGFydCk7XHJcbiAgICAgICAgc2VnbWVudC5ib2R5LkdldFdvcmxkUG9pbnQoc2VnbWVudC5jcmFzaFJheURpcmVjdGlvbiwgdGhpcy5wb2ludEVuZCk7XHJcbiAgICAgICAgdGhpcy5iMlBoeXNpY3Mud29ybGQuUmF5Q2FzdCh0aGlzLnBvaW50U3RhcnQsIHRoaXMucG9pbnRFbmQsIHNlZ21lbnQuY3Jhc2hSYXlDYWxsYmFjayk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIuZGVidWcgJiYgdGhpcy5kcmF3RGVidWcoc2VnbWVudC5jcmFzaFJheVJlc3VsdC5oaXQgPyAweDAwMDBmZiA6IDB4MDBmZjAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaXNUYWlsR3JvdW5kZWQgPSBzZWdtZW50c1swXS5ncm91bmRSYXlSZXN1bHQuaGl0O1xyXG4gICAgdGhpcy5pc05vc2VHcm91bmRlZCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLmdyb3VuZFJheVJlc3VsdC5oaXQ7XHJcbiAgICB0aGlzLmlzQ2VudGVyR3JvdW5kZWQgPSBzZWdtZW50c1syXS5ncm91bmRSYXlSZXN1bHQuaGl0IHx8IHNlZ21lbnRzWzNdLmdyb3VuZFJheVJlc3VsdC5oaXQgfHwgc2VnbWVudHNbNF0uZ3JvdW5kUmF5UmVzdWx0LmhpdDtcclxuICB9XHJcblxyXG4gIGdldFRpbWVJbkFpcigpOiBudW1iZXIge1xyXG4gICAgaWYgKHRoaXMuc2VnbWVudHMuc29tZShzID0+IHMuZ3JvdW5kUmF5UmVzdWx0LmhpdCkpIHJldHVybiAtMTtcclxuICAgIGNvbnN0IG1vc3RSZWNlbnRIaXQgPSBNYXRoLm1heCguLi50aGlzLnNlZ21lbnRzLm1hcChzID0+IHMuZ3JvdW5kUmF5UmVzdWx0Lmxhc3RIaXRUaW1lKSk7XHJcbiAgICByZXR1cm4gdGhpcy5zY2VuZS5nYW1lLmdldFRpbWUoKSAtIG1vc3RSZWNlbnRIaXQ7XHJcbiAgfVxyXG5cclxuICBpc0luQWlyKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VGltZUluQWlyKCkgIT09IC0xO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByYXlDYWxsYmFja0ZhY3RvcnkoaGl0UmVzdWx0OiBJUmF5Q2FzdFJlc3VsdCkge1xyXG4gICAgcmV0dXJuIChmaXh0dXJlLCBwb2ludCwgbm9ybWFsLCBmcmFjdGlvbikgPT4ge1xyXG4gICAgICB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEN1c3RvbVByb3BlcnR5KGZpeHR1cmUsICdib29sJywgJ3BoYXNlckNyYXNoU2Vuc29ySWdub3JlJywgZmFsc2UpO1xyXG4gICAgICBoaXRSZXN1bHQuaGl0ID0gdHJ1ZTtcclxuICAgICAgaGl0UmVzdWx0LnBvaW50ID0gcG9pbnQ7XHJcbiAgICAgIGhpdFJlc3VsdC5ub3JtYWwgPSBub3JtYWw7XHJcbiAgICAgIGhpdFJlc3VsdC5mcmFjdGlvbiA9IGZyYWN0aW9uO1xyXG4gICAgICBoaXRSZXN1bHQubGFzdEhpdFRpbWUgPSB0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpO1xyXG4gICAgICByZXR1cm4gZnJhY3Rpb247XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNldFNlZ21lbnQoc2VnbWVudDogSVNlZ21lbnQpIHtcclxuICAgIHNlZ21lbnQuZ3JvdW5kUmF5UmVzdWx0LmhpdCA9IGZhbHNlO1xyXG4gICAgc2VnbWVudC5ncm91bmRSYXlSZXN1bHQucG9pbnQgPSBudWxsO1xyXG4gICAgc2VnbWVudC5ncm91bmRSYXlSZXN1bHQubm9ybWFsID0gbnVsbDtcclxuICAgIHNlZ21lbnQuZ3JvdW5kUmF5UmVzdWx0LmZyYWN0aW9uID0gLTE7XHJcblxyXG4gICAgaWYgKHNlZ21lbnQuY3Jhc2hSYXlSZXN1bHQpIHtcclxuICAgICAgc2VnbWVudC5jcmFzaFJheVJlc3VsdC5oaXQgPSBmYWxzZTtcclxuICAgICAgc2VnbWVudC5jcmFzaFJheVJlc3VsdC5wb2ludCA9IG51bGw7XHJcbiAgICAgIHNlZ21lbnQuY3Jhc2hSYXlSZXN1bHQubm9ybWFsID0gbnVsbDtcclxuICAgICAgc2VnbWVudC5jcmFzaFJheVJlc3VsdC5mcmFjdGlvbiA9IC0xO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkcmF3RGVidWcoY29sb3I6IG51bWJlcikge1xyXG4gICAgdGhpcy5kZWJ1Z0dyYXBoaWNzLmxpbmVTdHlsZSgyLCBjb2xvciwgMSk7XHJcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGU7XHJcbiAgICB0aGlzLmRlYnVnR3JhcGhpY3MubGluZUJldHdlZW4oXHJcbiAgICAgIHRoaXMucG9pbnRTdGFydC54ICogc2NhbGUsXHJcbiAgICAgIC10aGlzLnBvaW50U3RhcnQueSAqIHNjYWxlLFxyXG4gICAgICB0aGlzLnBvaW50RW5kLnggKiBzY2FsZSxcclxuICAgICAgLXRoaXMucG9pbnRFbmQueSAqIHNjYWxlLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdFJheXMocmF5TGVuZ3RoOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHRlbXA6IElSYXlDYXN0UmVzdWx0ID0ge2hpdDogZmFsc2UsIHBvaW50OiBudWxsLCBub3JtYWw6IG51bGwsIGZyYWN0aW9uOiAtMSwgbGFzdEhpdFRpbWU6IC0xfTtcclxuICAgIGZvciAoY29uc3Qgc2VnbWVudCBvZiB0aGlzLnBsYXllci5wYXJ0cy5ib2FyZFNlZ21lbnRzKSB7XHJcbiAgICAgIGNvbnN0IHNlZ21lbnRJbmRleCA9IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Q3VzdG9tUHJvcGVydHkoc2VnbWVudCwgJ2ludCcsICdwaGFzZXJCb2FyZFNlZ21lbnRJbmRleCcsIC0xKTtcclxuICAgICAgY29uc3QgaXNOb3NlID0gc2VnbWVudEluZGV4ID09PSB0aGlzLnBsYXllci5wYXJ0cy5ib2FyZFNlZ21lbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgIGNvbnN0IGdyb3VuZEhpdFJlc3VsdCA9IHsuLi50ZW1wfTtcclxuICAgICAgY29uc3QgY3Jhc2hIaXRSZXN1bHQgPSB7Li4udGVtcH07XHJcbiAgICAgIHRoaXMuc2VnbWVudHMucHVzaCh7XHJcbiAgICAgICAgYm9keTogc2VnbWVudCxcclxuICAgICAgICBncm91bmRSYXlEaXJlY3Rpb246IG5ldyBQbC5iMlZlYzIoMCwgLXJheUxlbmd0aCAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUpLFxyXG4gICAgICAgIGdyb3VuZFJheVJlc3VsdDogZ3JvdW5kSGl0UmVzdWx0LFxyXG4gICAgICAgIGdyb3VuZFJheUNhbGxiYWNrOiB0aGlzLnJheUNhbGxiYWNrRmFjdG9yeShncm91bmRIaXRSZXN1bHQpLFxyXG4gICAgICAgIGNyYXNoUmF5RGlyZWN0aW9uOiBpc05vc2UgPyBuZXcgUGwuYjJWZWMyKChpc05vc2UgPyByYXlMZW5ndGggKiAyIDogcmF5TGVuZ3RoKSAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIDApIDogdW5kZWZpbmVkLFxyXG4gICAgICAgIGNyYXNoUmF5UmVzdWx0OiBpc05vc2UgPyBjcmFzaEhpdFJlc3VsdCA6IHVuZGVmaW5lZCxcclxuICAgICAgICBjcmFzaFJheUNhbGxiYWNrOiBpc05vc2UgPyB0aGlzLnJheUNhbGxiYWNrRmFjdG9yeShjcmFzaEhpdFJlc3VsdCkgOiB1bmRlZmluZWQsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGlzTm9zZSkgdGhpcy5ub3NlID0gdGhpcy5zZWdtZW50c1t0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0ICogYXMgUGwgZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQge1BoeXNpY3N9IGZyb20gJy4vUGh5c2ljcyc7XHJcbmltcG9ydCB7UnViZUVudGl0eX0gZnJvbSAnLi4vdXRpbC9SVUJFL1J1YmVMb2FkZXJJbnRlcmZhY2VzJztcclxuaW1wb3J0IHtJQm9keVBhcnRzLCBQbGF5ZXJDb250cm9sbGVyfSBmcm9tICcuL1BsYXllckNvbnRyb2xsZXInO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTdGF0ZSB7XHJcbiAgLy8gVE9ETyBhZGQgcGFydGljbGUgZWZmZWN0IHdoZW4gYm9vc3QgZW5hYmxlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgQkFTRV9CT09TVF9GTE9XOiBudW1iZXIgPSAyMi41ICogNjA7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBCQVNFX1RSSUNLX1BPSU5UUzogbnVtYmVyID0gMjAwO1xyXG4gIG1heEJvb3N0OiBudW1iZXIgPSB0aGlzLkJBU0VfQk9PU1RfRkxPVyAqIDI1OyAvLyAyNSBzZWNvbmRzIHdvcnRoIG9mIGJvb3N0XHJcbiAgYXZhaWxhYmxlQm9vc3Q6IG51bWJlciA9IHRoaXMubWF4Qm9vc3Q7XHJcblxyXG4gIGxvc3RIZWFkOiBCb29sZWFuO1xyXG4gIGlzQ3Jhc2hlZDogYm9vbGVhbjtcclxuICBsYW5kZWRGcm9udEZsaXBzID0gMDtcclxuICBsYW5kZWRCYWNrRmxpcHMgPSAwO1xyXG4gIHRpbWVHcm91bmRlZDogbnVtYmVyID0gMDtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBiMlBoeXNpY3M6IFBoeXNpY3M7XHJcbiAgcHJpdmF0ZSBwbGF5ZXJDb250cm9sbGVyOiBQbGF5ZXJDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgc3RhdGU6ICdpbi1haXInIHwgJ2dyb3VuZGVkJyB8ICdjcmFzaGVkJztcclxuXHJcbiAgcHJpdmF0ZSB0b3RhbFRyaWNrU2NvcmU6IG51bWJlciA9IDA7XHJcbiAgcHJpdmF0ZSBwcm90b1RyaWNrU2NvcmU6IG51bWJlciA9IDA7XHJcbiAgcHJpdmF0ZSBjb21ib0FjY3VtdWxhdGVkU2NvcmU6IG51bWJlciA9IDA7XHJcbiAgcHJpdmF0ZSBhbmdsZVByZXZpb3VzVXBkYXRlOiBudW1iZXIgPSAwO1xyXG5cclxuICBwcml2YXRlIHRvdGFsUm90YXRpb246IG51bWJlciA9IDA7IC8vIHRvdGFsIHJvdGF0aW9uIHdoaWxlIGluIGFpciB3aXRob3V0IHRvdWNoaW5nIHRoZSBncm91bmRcclxuICBwcml2YXRlIGN1cnJlbnRGbGlwUm90YXRpb246IG51bWJlciA9IDA7IC8vIHNldCB0byAwIGFmdGVyIGVhY2ggZmxpcFxyXG5cclxuICBwcml2YXRlIHBlbmRpbmdGcm9udEZsaXBzOiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgcGVuZGluZ0JhY2tGbGlwczogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIHJlYWRvbmx5IHBhcnRzOiBJQm9keVBhcnRzO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHBpY2t1cHNUb1Byb2Nlc3M6IFNldDxQbC5iMkJvZHkgJiBSdWJlRW50aXR5PiA9IG5ldyBTZXQoKTtcclxuICBwcml2YXRlIGNvbWJvTXVsdGlwbGllcjogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIGNvbWJvTGVld2F5VHdlZW46IFBoYXNlci5Ud2VlbnMuVHdlZW47XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYWxyZWFkeUNvbGxlY3RlZENvaW5zOiBTZXQ8UGwuYjJGaXh0dXJlPiA9IG5ldyBTZXQoKTtcclxuICBwcml2YXRlIGxhc3REaXN0YW5jZTogbnVtYmVyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwbGF5ZXJDb250cm9sbGVyOiBQbGF5ZXJDb250cm9sbGVyKSB7XHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBwbGF5ZXJDb250cm9sbGVyO1xyXG4gICAgdGhpcy5wYXJ0cyA9IHBsYXllckNvbnRyb2xsZXIucGFydHM7XHJcblxyXG4gICAgdGhpcy5iMlBoeXNpY3MgPSBwbGF5ZXJDb250cm9sbGVyLmIyUGh5c2ljcztcclxuICAgIC8vIHRoaXMuY3Jhc2hJZ25vcmVkUGFydHMgPSBbdGhpcy5wYXJ0cy5hcm1Mb3dlckxlZnQsIHRoaXMucGFydHMuYXJtTG93ZXJSaWdodCwgdGhpcy5wYXJ0cy5ib2R5XTtcclxuICAgIHRoaXMuc3RhdGUgPSBwbGF5ZXJDb250cm9sbGVyLmJvYXJkLmlzSW5BaXIoKSA/ICdpbi1haXInIDogJ2dyb3VuZGVkJztcclxuICAgIHRoaXMucmVnaXN0ZXJDb2xsaXNpb25MaXN0ZW5lcnMoKTtcclxuXHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIub24oJ2VudGVyLWluLWFpcicsICgpID0+IHRoaXMuc3RhdGUgPSAnaW4tYWlyJyk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLm9uKCdlbnRlci1ncm91bmRlZCcsICgpID0+IHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gJ2dyb3VuZGVkJztcclxuICAgICAgICB0aGlzLnRpbWVHcm91bmRlZCA9IHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5nYW1lLmdldFRpbWUoKTtcclxuICAgICAgICB0aGlzLmxhbmRlZEZyb250RmxpcHMgKz0gdGhpcy5wZW5kaW5nRnJvbnRGbGlwcztcclxuICAgICAgICB0aGlzLmxhbmRlZEJhY2tGbGlwcyArPSB0aGlzLnBlbmRpbmdCYWNrRmxpcHM7XHJcblxyXG4gICAgICAgIGNvbnN0IG51bUZsaXBzID0gdGhpcy5wZW5kaW5nQmFja0ZsaXBzICsgdGhpcy5wZW5kaW5nRnJvbnRGbGlwcztcclxuICAgICAgICBpZiAobnVtRmxpcHMgPj0gMSkge1xyXG4gICAgICAgICAgY29uc3QgdHJpY2tTY29yZSA9IG51bUZsaXBzICogbnVtRmxpcHMgKiB0aGlzLkJBU0VfVFJJQ0tfUE9JTlRTO1xyXG4gICAgICAgICAgdGhpcy50b3RhbFRyaWNrU2NvcmUgKz0gdHJpY2tTY29yZTtcclxuXHJcbiAgICAgICAgICB0aGlzLmNvbWJvQWNjdW11bGF0ZWRTY29yZSArPSB0cmlja1Njb3JlICogMC4xO1xyXG4gICAgICAgICAgdGhpcy5jb21ib011bHRpcGxpZXIrKztcclxuICAgICAgICAgIC8vIHRoaXMuZ2FpbkJvb3N0KDEsIG51bUZsaXBzICogNSk7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnY29tYm8tY2hhbmdlJywgdGhpcy5jb21ib0FjY3VtdWxhdGVkU2NvcmUsIHRoaXMuY29tYm9NdWx0aXBsaWVyKTtcclxuICAgICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdzY29yZS1jaGFuZ2UnLCB0aGlzLnRvdGFsVHJpY2tTY29yZSk7XHJcbiAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnYm9vc3QtY2hhbmdlJywgdGhpcy5hdmFpbGFibGVCb29zdCwgdGhpcy5tYXhCb29zdCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5jb21ib0xlZXdheVR3ZWVuLnJlc2V0VHdlZW5EYXRhKHRydWUpO1xyXG4gICAgICAgICAgdGhpcy5jb21ib0xlZXdheVR3ZWVuLnBsYXkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG90YWxSb3RhdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RmxpcFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLnBlbmRpbmdCYWNrRmxpcHMgPSAwO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0Zyb250RmxpcHMgPSAwO1xyXG4gICAgICB9LFxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIub24oJ2VudGVyLWNyYXNoZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RhdGUgPSAnY3Jhc2hlZCc7XHJcbiAgICAgIGlmICh0aGlzLmNvbWJvTGVld2F5VHdlZW4uaXNQbGF5aW5nKCkgfHwgdGhpcy5jb21ib0xlZXdheVR3ZWVuLmlzUGF1c2VkKCkpIHtcclxuICAgICAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4uc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4gPSB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUudHdlZW5zLmFkZENvdW50ZXIoe1xyXG4gICAgICBwYXVzZWQ6IHRydWUsXHJcbiAgICAgIGZyb206IE1hdGguUEkgKiAtMC41LFxyXG4gICAgICB0bzogTWF0aC5QSSAqIDEuNSxcclxuICAgICAgZHVyYXRpb246IDIwMDAsXHJcbiAgICAgIG9uVXBkYXRlOiAodHdlZW4pID0+IHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdjb21iby1sZWV3YXktdXBkYXRlJywgdHdlZW4uZ2V0VmFsdWUoKSksXHJcbiAgICAgIG9uQ29tcGxldGU6IHR3ZWVuID0+IHtcclxuICAgICAgICB0aGlzLnRvdGFsVHJpY2tTY29yZSArPSB0aGlzLmNvbWJvQWNjdW11bGF0ZWRTY29yZSAqIHRoaXMuY29tYm9NdWx0aXBsaWVyO1xyXG4gICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdzY29yZS1jaGFuZ2UnLCB0aGlzLnRvdGFsVHJpY2tTY29yZSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2NvbWJvLWNoYW5nZScsIDAsIDApO1xyXG4gICAgICAgIHRoaXMucHJvdG9Ucmlja1Njb3JlID0gMDtcclxuICAgICAgICB0aGlzLmNvbWJvQWNjdW11bGF0ZWRTY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5jb21ib011bHRpcGxpZXIgPSAwO1xyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBnZXRTdGF0ZSgpOiAnZ3JvdW5kZWQnIHwgJ2luLWFpcicgfCAnY3Jhc2hlZCcge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XHJcbiAgfVxyXG5cclxuICBnZXRUcmF2ZWxEaXN0YW5jZU1ldGVycygpOiBudW1iZXIge1xyXG4gICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLnBhcnRzLmJvZHkuR2V0UG9zaXRpb24oKS5MZW5ndGgoKTtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKGRpc3RhbmNlIC8gNTApICogNTA7XHJcbiAgfVxyXG5cclxuICBnYWluQm9vc3QoZGVsdGE6IG51bWJlciwgYm9vc3RVbml0czogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGJvb3N0ID0gTWF0aC5taW4odGhpcy5tYXhCb29zdCwgKHRoaXMuQkFTRV9CT09TVF9GTE9XICogYm9vc3RVbml0cyAqIGRlbHRhKSArIHRoaXMuYXZhaWxhYmxlQm9vc3QpO1xyXG4gICAgdGhpcy5hdmFpbGFibGVCb29zdCA9IGJvb3N0O1xyXG4gICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2Jvb3N0LWNoYW5nZScsIHRoaXMuYXZhaWxhYmxlQm9vc3QsIHRoaXMubWF4Qm9vc3QpO1xyXG4gICAgcmV0dXJuIGJvb3N0O1xyXG4gIH1cclxuXHJcbiAgY29uc3VtZUJvb3N0KGRlbHRhOiBudW1iZXIsIGJvb3N0VW5pdHM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICBpZiAodGhpcy5hdmFpbGFibGVCb29zdCA8PSAwKSByZXR1cm4gMDtcclxuICAgIGNvbnN0IGJvb3N0ID0gTWF0aC5taW4odGhpcy5hdmFpbGFibGVCb29zdCwgdGhpcy5CQVNFX0JPT1NUX0ZMT1cgKiBib29zdFVuaXRzICogZGVsdGEpO1xyXG4gICAgdGhpcy5hdmFpbGFibGVCb29zdCAtPSBib29zdCAqIChib29zdFVuaXRzID4gMSA/IDEuNSA6IDEpO1xyXG4gICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2Jvb3N0LWNoYW5nZScsIHRoaXMuYXZhaWxhYmxlQm9vc3QsIHRoaXMubWF4Qm9vc3QpO1xyXG4gICAgcmV0dXJuIGJvb3N0O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZWdpc3RlckNvbGxpc2lvbkxpc3RlbmVycygpIHtcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5iMlBoeXNpY3Mub24oJ3Bvc3Qtc29sdmUnLCAoY29udGFjdDogUGwuYjJDb250YWN0LCBpbXB1bHNlOiBQbC5iMkNvbnRhY3RJbXB1bHNlKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmlzQ3Jhc2hlZCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBib2R5QSA9IGNvbnRhY3QuR2V0Rml4dHVyZUEoKS5HZXRCb2R5KCk7XHJcbiAgICAgIGNvbnN0IGJvZHlCID0gY29udGFjdC5HZXRGaXh0dXJlQigpLkdldEJvZHkoKTtcclxuICAgICAgaWYgKGJvZHlBID09PSBib2R5QikgcmV0dXJuO1xyXG4gICAgICB0aGlzLmlzQ3Jhc2hlZCA9IChib2R5QSA9PT0gdGhpcy5wYXJ0cy5oZWFkIHx8IGJvZHlCID09PSB0aGlzLnBhcnRzLmhlYWQpICYmIE1hdGgubWF4KC4uLmltcHVsc2Uubm9ybWFsSW1wdWxzZXMpID4gODtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5iMlBoeXNpY3Mub24oJ2JlZ2luLWNvbnRhY3QnLCAoY29udGFjdDogUGwuYjJDb250YWN0KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpeHR1cmVBOiBQbC5iMkZpeHR1cmUgJiBSdWJlRW50aXR5ID0gY29udGFjdC5HZXRGaXh0dXJlQSgpO1xyXG4gICAgICBjb25zdCBmaXh0dXJlQjogUGwuYjJGaXh0dXJlICYgUnViZUVudGl0eSA9IGNvbnRhY3QuR2V0Rml4dHVyZUIoKTtcclxuICAgICAgY29uc3QgYm9keUEgPSBmaXh0dXJlQS5HZXRCb2R5KCk7XHJcbiAgICAgIGNvbnN0IGJvZHlCID0gZml4dHVyZUIuR2V0Qm9keSgpO1xyXG5cclxuICAgICAgaWYgKGZpeHR1cmVBLklzU2Vuc29yKCkgJiYgIXRoaXMucGlja3Vwc1RvUHJvY2Vzcy5oYXMoYm9keUEpICYmIGZpeHR1cmVBLmN1c3RvbVByb3BlcnRpZXNNYXA/LnBoYXNlclNlbnNvclR5cGUgPT09ICdwaWNrdXBfcHJlc2VudCcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLXBpY2t1cCBBJywgZml4dHVyZUEubmFtZSk7XHJcbiAgICAgICAgdGhpcy5waWNrdXBzVG9Qcm9jZXNzLmFkZChib2R5QSk7XHJcbiAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiBib2R5QS5TZXRFbmFibGVkKGZhbHNlKSk7IC8vIGNhbm5vdCBjaGFuZ2UgYm9kaWVzIHdpdGhpbiBjb250YWN0IGxpc3RlbmVyc1xyXG4gICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUJvZHkoYm9keUEpKTtcclxuICAgICAgfSBlbHNlIGlmIChmaXh0dXJlQi5Jc1NlbnNvcigpICYmICF0aGlzLnBpY2t1cHNUb1Byb2Nlc3MuaGFzKGJvZHlCKSAmJiBmaXh0dXJlQi5jdXN0b21Qcm9wZXJ0aWVzTWFwPy5waGFzZXJTZW5zb3JUeXBlID09PSAncGlja3VwX3ByZXNlbnQnKSB7XHJcbiAgICAgICAgdGhpcy5waWNrdXBzVG9Qcm9jZXNzLmFkZChib2R5Qik7XHJcbiAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS1waWNrdXAgQicsIGZpeHR1cmVCLm5hbWUpO1xyXG4gICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4gYm9keUIuU2V0RW5hYmxlZChmYWxzZSkpOyAvLyBjYW5ub3QgY2hhbmdlIGJvZGllcyB3aXRoaW4gY29udGFjdCBsaXN0ZW5lcnNcclxuICAgICAgICAvLyBzZXRUaW1lb3V0KCgpID0+IHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lCb2R5KGJvZHlCKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIChmaXh0dXJlQS5Jc1NlbnNvcigpICYmIGJvZHlBLklzRW5hYmxlZCgpICYmICF0aGlzLmlnbm9yZWRTZW5zb3JCb2RpZXMuaGFzKGJvZHlBKSkge1xyXG4gICAgICAvLyAgIHRoaXMuaWdub3JlZFNlbnNvckJvZGllcy5hZGQoYm9keUEpO1xyXG4gICAgICAvLyAgIHRoaXMudG90YWxUcmlja1Njb3JlICs9IDI1O1xyXG4gICAgICAvLyAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdjb2xsZWN0ZWQtY29pbicsIGJvZHlBKTtcclxuICAgICAgLy8gICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnc2NvcmUtY2hhbmdlJywgdGhpcy50b3RhbFRyaWNrU2NvcmUpO1xyXG4gICAgICAvLyAgIHNldFRpbWVvdXQoKCkgPT4gYm9keUEuU2V0RW5hYmxlZChmYWxzZSkpOyAvLyBjYW5ub3QgY2hhbmdlIGJvZGllcyB3aXRoaW4gY29udGFjdCBsaXN0ZW5lcnNcclxuICAgICAgLy9cclxuICAgICAgLy8gfSBlbHNlIGlmIChmaXh0dXJlQi5Jc1NlbnNvcigpICYmIGJvZHlCLklzRW5hYmxlZCgpICYmICF0aGlzLmlnbm9yZWRTZW5zb3JCb2RpZXMuaGFzKGJvZHlCKSkge1xyXG4gICAgICAvLyAgIHRoaXMuaWdub3JlZFNlbnNvckJvZGllcy5hZGQoYm9keUIpO1xyXG4gICAgICAvLyAgIC8vIHRoaXMuZ2FpbkJvb3N0KDEsIDAuMjUpO1xyXG4gICAgICAvLyAgIHRoaXMudG90YWxUcmlja1Njb3JlICs9IDI1O1xyXG4gICAgICAvLyAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdjb2xsZWN0ZWQtY29pbicsIGJvZHlCKTtcclxuICAgICAgLy8gICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnc2NvcmUtY2hhbmdlJywgdGhpcy50b3RhbFRyaWNrU2NvcmUpO1xyXG4gICAgICAvLyAgIHNldFRpbWVvdXQoKCkgPT4gYm9keUIuU2V0RW5hYmxlZChmYWxzZSkpOyAvLyBjYW5ub3QgY2hhbmdlIGJvZGllcyB3aXRoaW4gY29udGFjdCBsaXN0ZW5lcnNcclxuICAgICAgLy8gfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoZGVsdGE6IG51bWJlcik6IHZvaWQge1xyXG4gICAgdGhpcy5waWNrdXBzVG9Qcm9jZXNzLnNpemUgJiYgY29uc29sZS5sb2coJ3BpY2t1cHMnLCB0aGlzLnBpY2t1cHNUb1Byb2Nlc3Muc2l6ZSk7XHJcblxyXG4gICAgZm9yIChjb25zdCBib2R5IG9mIHRoaXMucGlja3Vwc1RvUHJvY2Vzcykge1xyXG4gICAgICBjb25zdCBpbWc6IFBoLkdhbWVPYmplY3RzLkltYWdlID0gYm9keS5HZXRVc2VyRGF0YSgpO1xyXG4gICAgICB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Qm9keShib2R5KTtcclxuICAgICAgaW1nLmRlc3Ryb3koKTtcclxuICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ3BpY2t1cF9wcmVzZW50Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5waWNrdXBzVG9Qcm9jZXNzLmNsZWFyKCk7XHJcbiAgICBjb25zdCBpc0luQWlyID0gdGhpcy5wbGF5ZXJDb250cm9sbGVyLmJvYXJkLmlzSW5BaXIoKTtcclxuICAgIGlmICh0aGlzLnN0YXRlICE9PSAnY3Jhc2hlZCcgJiYgdGhpcy5pc0NyYXNoZWQpIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdlbnRlci1jcmFzaGVkJyk7XHJcbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ2dyb3VuZGVkJyAmJiBpc0luQWlyICYmICF0aGlzLmlzQ3Jhc2hlZCkgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2VudGVyLWluLWFpcicpO1xyXG4gICAgZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gJ2luLWFpcicgJiYgIWlzSW5BaXIgJiYgIXRoaXMuaXNDcmFzaGVkKSB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnZW50ZXItZ3JvdW5kZWQnKTtcclxuICAgIHRoaXMudXBkYXRlVHJpY2tDb3VudGVyKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUNvbWJvTGVld2F5KCk7XHJcbiAgICB0aGlzLnVwZGF0ZURpc3RhbmNlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZVRyaWNrQ291bnRlcigpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKCctLS0tLXN0YXRlJywgdGhpcy5zdGF0ZSk7XHJcbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ2luLWFpcicpIHtcclxuICAgICAgY29uc3QgY3VycmVudEFuZ2xlID0gUGguTWF0aC5BbmdsZS5Ob3JtYWxpemUodGhpcy5wYXJ0cy5ib2R5LkdldEFuZ2xlKCkpO1xyXG5cclxuICAgICAgY29uc3QgZGlmZiA9IHRoaXMuY2FsY3VsYXRlRGlmZmVyZW5jZUJldHdlZW5BbmdsZXModGhpcy5hbmdsZVByZXZpb3VzVXBkYXRlLCBjdXJyZW50QW5nbGUpO1xyXG4gICAgICB0aGlzLnRvdGFsUm90YXRpb24gKz0gZGlmZjtcclxuICAgICAgdGhpcy5jdXJyZW50RmxpcFJvdGF0aW9uICs9IGRpZmY7XHJcbiAgICAgIHRoaXMuYW5nbGVQcmV2aW91c1VwZGF0ZSA9IGN1cnJlbnRBbmdsZTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRGbGlwUm90YXRpb24gPj0gTWF0aC5QSSAqICh0aGlzLnBlbmRpbmdGcm9udEZsaXBzID09PSAwID8gMS4yNSA6IDIpKSB7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nRnJvbnRGbGlwcysrO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZsaXBSb3RhdGlvbiA9IDA7XHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50RmxpcFJvdGF0aW9uIDw9IE1hdGguUEkgKiAtKHRoaXMucGVuZGluZ0JhY2tGbGlwcyA9PT0gMCA/IDEuMjUgOiAyKSkge1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0JhY2tGbGlwcysrO1xyXG4gICAgICAgIHRoaXMuY3VycmVudEZsaXBSb3RhdGlvbiA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlQ29tYm9MZWV3YXkoKSB7XHJcbiAgICBpZiAodGhpcy5jb21ib0xlZXdheVR3ZWVuLmlzUGxheWluZygpIHx8IHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5pc1BhdXNlZCgpKSB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSAnaW4tYWlyJyB8fCAhdGhpcy5wbGF5ZXJDb250cm9sbGVyLmJvYXJkLmlzQ2VudGVyR3JvdW5kZWQpIHtcclxuICAgICAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4ucGF1c2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4ucmVzdW1lKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIGJhc2VkIG9uOiBodHRwczovL3d3dy5jb25zdHJ1Y3QubmV0L2VuL2ZvcnVtL2NvbnN0cnVjdC0yL2hvdy1kby1pLTE4L2NvdW50LXJvdGF0aW9ucy00NjY3NFxyXG4gIC8vIGh0dHA6Ly9ibG9nLmxleGlxdWUtZHUtbmV0LmNvbS9pbmRleC5waHA/cG9zdC9DYWxjdWxhdGUtdGhlLXJlYWwtZGlmZmVyZW5jZS1iZXR3ZWVuLXR3by1hbmdsZXMta2VlcGluZy10aGUtc2lnblxyXG4gIHByaXZhdGUgY2FsY3VsYXRlRGlmZmVyZW5jZUJldHdlZW5BbmdsZXMoZmlyc3RBbmdsZTogbnVtYmVyLCBzZWNvbmRBbmdsZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGxldCBkaWZmZXJlbmNlID0gc2Vjb25kQW5nbGUgLSBmaXJzdEFuZ2xlO1xyXG4gICAgaWYgKGRpZmZlcmVuY2UgPCAtTWF0aC5QSSkgZGlmZmVyZW5jZSArPSBNYXRoLlBJICogMjtcclxuICAgIGVsc2UgaWYgKGRpZmZlcmVuY2UgPiBNYXRoLlBJKSBkaWZmZXJlbmNlIC09IE1hdGguUEkgKiAyO1xyXG4gICAgcmV0dXJuIGRpZmZlcmVuY2U7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZURpc3RhbmNlKCkge1xyXG4gICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmdldFRyYXZlbERpc3RhbmNlTWV0ZXJzKCk7XHJcbiAgICBpZiAoZGlzdGFuY2UgIT09IHRoaXMubGFzdERpc3RhbmNlKSB7XHJcbiAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdkaXN0YW5jZS1jaGFuZ2UnLCBkaXN0YW5jZSk7XHJcbiAgICAgIHRoaXMubGFzdERpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIFBoIGZyb20gJ3BoYXNlcic7XHJcbmltcG9ydCAqIGFzIFBsIGZyb20gJ0Bib3gyZC9jb3JlJztcclxuaW1wb3J0IHtQaHlzaWNzfSBmcm9tICcuL1BoeXNpY3MnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVycmFpbiB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0ZXJyYWluQm9keTogUGwuYjJCb2R5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2h1bmtzOiBQaC5HYW1lT2JqZWN0cy5HcmFwaGljc1tdO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGIyUGh5c2ljczogUGh5c2ljcztcclxuICBwcml2YXRlIHJlYWRvbmx5IHNjZW5lOiBHYW1lU2NlbmU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsYXllcnMgPSBbXHJcbiAgICB7IGNvbG9yOiAweEM4RTFFQiwgd2lkdGg6IDUgfSwgLy8gdG9wIGxheWVyIG9mIHNub3dcclxuICAgIHsgY29sb3I6IDB4NWM4ZGM5LCB3aWR0aDogMjIgfSxcclxuICAgIHsgY29sb3I6IDB4MjIzQjdCLCB3aWR0aDogMTAgfSxcclxuICAgIHsgY29sb3I6IDB4MmQyYzJjLCB3aWR0aDogNSB9LFxyXG4gICAgeyBjb2xvcjogMHgzYTMyMzIsIHdpZHRoOiAyNTAgfSxcclxuICBdO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHBvaW50c1Bvb2w6IFBsLlhZW10gPSBbXTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHZlYzJQb29sOiBQbC5iMlZlYzJbXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCBwaHlzaWNzOiBQaHlzaWNzKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmIyUGh5c2ljcyA9IHBoeXNpY3M7XHJcblxyXG4gICAgY29uc3QgcG9vbFNpemUgPSAyNTAwO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sU2l6ZTsgaSsrKSB0aGlzLnBvaW50c1Bvb2wucHVzaCh7eDogMCwgeTogMH0pO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb29sU2l6ZTsgaSsrKSB0aGlzLnZlYzJQb29sLnB1c2gobmV3IFBsLmIyVmVjMigwLCAwKSk7XHJcblxyXG4gICAgdGhpcy5jaHVua3MgPSBbXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgICAgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKS5zZXREZXB0aCgxMCksXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgICAgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKS5zZXREZXB0aCgxMCksXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy50ZXJyYWluQm9keSA9IHRoaXMuYjJQaHlzaWNzLndvcmxkLkNyZWF0ZUJvZHkoKTtcclxuICAgIGNvbnN0IHBvcyA9IHRoaXMudGVycmFpbkJvZHkuR2V0UG9zaXRpb24oKTtcclxuXHJcbiAgICBjb25zdCBwID0gdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KCdib29sJywgJ3BoYXNlclRlcnJhaW4nLCB0cnVlKVswXTtcclxuICAgIGNvbnN0IGZpeCA9IHAuR2V0Rml4dHVyZUxpc3QoKT8uR2V0U2hhcGUoKSBhcyBQbC5iMkNoYWluU2hhcGU7XHJcbiAgICB0aGlzLmRyYXdUZXJyYWluKGZpeC5tX3ZlcnRpY2VzLm1hcCh2ID0+ICh7eDogKHYueCArIHBvcy54KSAqIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIHk6IC0odi55ICsgcG9zLnkpICogdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZX0pKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdUZXJyYWluKHBvaW50czogUGwuWFlbXSk6IHZvaWQge1xyXG4gICAgY29uc3QgY2h1bmsgPSB0aGlzLmNodW5rcy5zaGlmdCgpO1xyXG4gICAgaWYgKCFjaHVuaykgcmV0dXJuO1xyXG4gICAgdGhpcy5jaHVua3MucHVzaChjaHVuayk7XHJcbiAgICBjaHVuay5jbGVhcigpO1xyXG5cclxuICAgIGNvbnN0IGxhc3RJbmRleCA9IHBvaW50cy5sZW5ndGggLSAxO1xyXG4gICAgY29uc3QgZW5kID0gTWF0aC5tYXgocG9pbnRzWzBdLnksIHBvaW50c1tsYXN0SW5kZXhdLnkpICsgdGhpcy5zY2VuZS5jYW1lcmFzLm1haW4uaGVpZ2h0ICogMjtcclxuICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgcG9pbnRzLnB1c2goe3g6IHBvaW50c1tsYXN0SW5kZXhdLngsIHk6IGVuZH0sIHt4OiBwb2ludHNbMF0ueCwgeTogZW5kfSk7XHJcbiAgICBmb3IgKGNvbnN0IHtjb2xvciwgd2lkdGh9IG9mIHRoaXMubGF5ZXJzKSB7XHJcbiAgICAgIGNodW5rLnRyYW5zbGF0ZUNhbnZhcygwLCBvZmZzZXQpO1xyXG4gICAgICBjaHVuay5maWxsU3R5bGUoY29sb3IpO1xyXG4gICAgICBjaHVuay5maWxsUG9pbnRzKHBvaW50cywgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgIGNodW5rLnRyYW5zbGF0ZUNhbnZhcygwLCAwKTtcclxuICAgICAgb2Zmc2V0ID0gd2lkdGggKiAwLjU7XHJcbiAgICB9XHJcblxyXG4gICAgcG9pbnRzLmxlbmd0aCAtPSAyO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgUHJlbG9hZFNjZW5lIGZyb20gJy4vc2NlbmVzL1ByZWxvYWRTY2VuZSc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi9zY2VuZXMvR2FtZVNjZW5lJztcclxuaW1wb3J0IEdhbWVTdGF0cyBmcm9tICdnYW1lc3RhdHMuanMnO1xyXG5pbXBvcnQgR2FtZVVJU2NlbmUgZnJvbSAnLi9zY2VuZXMvR2FtZVVJU2NlbmUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfV0lEVEggPSAxMjgwO1xyXG5leHBvcnQgY29uc3QgREVGQVVMVF9IRUlHSFQgPSA3MjA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1pPT00gPSAxO1xyXG5leHBvcnQgY29uc3QgUkVTT0xVVElPTl9TQ0FMRSA9IDE7XHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IGdhbWVDb25maWc6IFBoLlR5cGVzLkNvcmUuR2FtZUNvbmZpZyA9IHtcclxuICB0aXRsZTogJ1Nub3dib2FyZGluZyBHYW1lJyxcclxuICB2ZXJzaW9uOiAnMS4wLjAnLFxyXG4gIHR5cGU6IFBoLldFQkdMLFxyXG4gIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gIGRpc2FibGVDb250ZXh0TWVudTogdHJ1ZSxcclxuICBmcHM6IHtcclxuICAgIG1pbjogNTAsXHJcbiAgICB0YXJnZXQ6IDYwLFxyXG4gICAgc21vb3RoU3RlcDogdHJ1ZSxcclxuICB9LFxyXG4gIC8vIHJvdW5kUGl4ZWxzOiB0cnVlLFxyXG4gIC8vIHBpeGVsQXJ0OiB0cnVlLFxyXG4gIHNjYWxlOiB7XHJcbiAgICBwYXJlbnQ6ICdwaGFzZXItd3JhcHBlcicsXHJcbiAgICBtb2RlOiBQaC5TY2FsZS5GSVQsXHJcbiAgICBhdXRvQ2VudGVyOiBQaC5TY2FsZS5DRU5URVJfQk9USCxcclxuICAgIHdpZHRoOiBERUZBVUxUX1dJRFRIICogUkVTT0xVVElPTl9TQ0FMRSxcclxuICAgIGhlaWdodDogREVGQVVMVF9IRUlHSFQgKiBSRVNPTFVUSU9OX1NDQUxFLFxyXG4gIH0sXHJcbiAgc2NlbmU6IFtQcmVsb2FkU2NlbmUsIEdhbWVTY2VuZSwgR2FtZVVJU2NlbmVdLFxyXG59O1xyXG5cclxuY29uc3QgY29uZmlnID0ge1xyXG4gIGF1dG9QbGFjZTogdHJ1ZSwgLyogYXV0byBwbGFjZSBpbiB0aGUgZG9tICovXHJcbiAgdGFyZ2V0RlBTOiA2MCwgLyogdGhlIHRhcmdldCBtYXggRlBTICovXHJcbiAgcmVkcmF3SW50ZXJ2YWw6IDIwMCwgLyogdGhlIGludGVydmFsIGluIE1TIGZvciByZWRyYXdpbmcgdGhlIEZQUyBncmFwaCAqL1xyXG4gIG1heGltdW1IaXN0b3J5OiAyMDAsIC8qIHRoZSBsZW5ndGggb2YgdGhlIHZpc3VhbCBncmFwaCBoaXN0b3J5IGluIGZyYW1lcyAqL1xyXG4gIHNjYWxlOiAxLCAvKiB0aGUgc2NhbGUgb2YgdGhlIGNhbnZhcyAqL1xyXG4gIG1lbW9yeVVwZGF0ZUludGVydmFsOiAxMDAsIC8qIHRoZSBpbnRlcnZhbCBmb3IgbWVhc3VyaW5nIHRoZSBtZW1vcnkgKi9cclxuICBtZW1vcnlNYXhIaXN0b3J5OiA2MCAqIDEwLCAvKiB0aGUgbWF4IGFtb3VudCBvZiBtZW1vcnkgbWVhc3VyZXMgKi9cclxuXHJcbiAgLy8gU3R5bGluZyBwcm9wc1xyXG4gIEZPTlRfRkFNSUxZOiAnQXJpYWwnLFxyXG4gIENPTE9SX0ZQU19CQVI6ICcjMzRjZmEyJyxcclxuICBDT0xPUl9GUFNfQVZHOiAnI0ZGRicsXHJcbiAgQ09MT1JfVEVYVF9MQUJFTDogJyNGRkYnLFxyXG4gIENPTE9SX1RFWFRfVE9fTE9XOiAnI2VlZTIwNycsXHJcbiAgQ09MT1JfVEVYVF9CQUQ6ICcjZDM0NjQ2JyxcclxuICBDT0xPUl9URVhUX1RBUkdFVDogJyNkMjQ5ZGQnLFxyXG4gIENPTE9SX0JHOiAnIzMzMzMzMycsXHJcbn07XHJcblxyXG5leHBvcnQgbGV0IHN0YXRzOiBHYW1lU3RhdHM7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gIGNvbnN0IGdhbWUgPSBuZXcgUGguR2FtZShnYW1lQ29uZmlnKTtcclxuICBzdGF0cyA9IG5ldyBHYW1lU3RhdHMoY29uZmlnKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0YXRzLmRvbSk7XHJcbn0pO1xyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCBUZXJyYWluIGZyb20gJy4uL2NvbXBvbmVudHMvVGVycmFpbic7XHJcbmltcG9ydCB7UGh5c2ljc30gZnJvbSAnLi4vY29tcG9uZW50cy9QaHlzaWNzJztcclxuaW1wb3J0IHtERUZBVUxUX1dJRFRILCBERUZBVUxUX1pPT00sIHN0YXRzfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCBHYW1lVUlTY2VuZSBmcm9tICcuL0dhbWVVSVNjZW5lJztcclxuaW1wb3J0IHtCYWNrZHJvcH0gZnJvbSAnLi4vY29tcG9uZW50cy9CYWNrZHJvcCc7XHJcbmltcG9ydCB7UGxheWVyQ29udHJvbGxlcn0gZnJvbSAnLi4vY29tcG9uZW50cy9QbGF5ZXJDb250cm9sbGVyJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lU2NlbmUgZXh0ZW5kcyBQaC5TY2VuZSB7XHJcbiAgcmVhZG9ubHkgb2JzZXJ2ZXI6IFBoYXNlci5FdmVudHMuRXZlbnRFbWl0dGVyID0gbmV3IFBoLkV2ZW50cy5FdmVudEVtaXR0ZXIoKTtcclxuICBwcml2YXRlIGIyUGh5c2ljczogUGh5c2ljcztcclxuICBwcml2YXRlIHRlcnJhaW46IFRlcnJhaW47XHJcbiAgcHJpdmF0ZSBwbGF5ZXJDb250cm9sbGVyOiBQbGF5ZXJDb250cm9sbGVyO1xyXG4gIHByaXZhdGUgYmFja2Ryb3A6IEJhY2tkcm9wO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKHtrZXk6ICdHYW1lU2NlbmUnfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZSgpIHtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnNldERlYWR6b25lKDUwLCAxMjUpO1xyXG4gICAgdGhpcy5jYW1lcmFzLm1haW4uc2V0QmFja2dyb3VuZENvbG9yKDB4NTU1NTU1KTtcclxuICAgIGNvbnN0IHJlc29sdXRpb25Nb2QgPSB0aGlzLmNhbWVyYXMubWFpbi53aWR0aCAvIERFRkFVTFRfV0lEVEg7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zZXRab29tKERFRkFVTFRfWk9PTSAqIHJlc29sdXRpb25Nb2QpO1xyXG4gICAgdGhpcy5jYW1lcmFzLm1haW4uc2Nyb2xsWCAtPSB0aGlzLmNhbWVyYXMubWFpbi53aWR0aCAvIDI7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zY3JvbGxZIC09IHRoaXMuY2FtZXJhcy5tYWluLmhlaWdodCAvIDI7XHJcblxyXG4gICAgdGhpcy5iMlBoeXNpY3MgPSBuZXcgUGh5c2ljcyh0aGlzLCA0MCwgbmV3IFBsLmIyVmVjMigwLCAtMTApKTtcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlciA9IG5ldyBQbGF5ZXJDb250cm9sbGVyKHRoaXMsIHRoaXMuYjJQaHlzaWNzKTtcclxuICAgIHRoaXMudGVycmFpbiA9IG5ldyBUZXJyYWluKHRoaXMsIHRoaXMuYjJQaHlzaWNzKTtcclxuXHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zdGFydEZvbGxvdyh0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkoJ2Jvb2wnLCAncGhhc2VyQ2FtZXJhRm9sbG93JywgdHJ1ZSlbMF0uR2V0VXNlckRhdGEoKSBhcyBQaGFzZXIuR2FtZU9iamVjdHMuSW1hZ2UsIGZhbHNlLCAwLjgsIDAuMjUpO1xyXG4gICAgdGhpcy5jYW1lcmFzLm1haW4uZm9sbG93T2Zmc2V0LnNldCgtMzc1LCAwKTtcclxuXHJcbiAgICB0aGlzLnNjZW5lLmxhdW5jaChHYW1lVUlTY2VuZS5uYW1lLCBbdGhpcy5vYnNlcnZlciwgKCkgPT4gdGhpcy5zY2VuZS5yZXN0YXJ0KCldKTtcclxuXHJcbiAgICB0aGlzLmJhY2tkcm9wID0gbmV3IEJhY2tkcm9wKHRoaXMpO1xyXG5cclxuICAgIGNvbnN0IGdyYXBoaWNzID0gdGhpcy5hZGQuZ3JhcGhpY3MoKTtcclxuICAgIGdyYXBoaWNzLmxpbmVTdHlsZSg1LCAweDA0ODcwOCwgMS4wKTtcclxuICAgIGdyYXBoaWNzLmJlZ2luUGF0aCgpO1xyXG4gICAgZ3JhcGhpY3MubW92ZVRvKDAsIDApO1xyXG4gICAgZ3JhcGhpY3MubGluZVRvKDQwLCAwKTtcclxuICAgIGdyYXBoaWNzLmNsb3NlUGF0aCgpO1xyXG4gICAgZ3JhcGhpY3Muc2V0RGVwdGgoMTAwMCk7XHJcbiAgICBncmFwaGljcy5zdHJva2VQYXRoKCk7XHJcblxyXG4gICAgZ3JhcGhpY3MubGluZVN0eWxlKDUsIDB4YmEwYjI4LCAxLjApO1xyXG4gICAgZ3JhcGhpY3MuYmVnaW5QYXRoKCk7XHJcbiAgICBncmFwaGljcy5tb3ZlVG8oMCwgMCk7XHJcbiAgICBncmFwaGljcy5saW5lVG8oMCwgNDApO1xyXG4gICAgZ3JhcGhpY3MuY2xvc2VQYXRoKCk7XHJcbiAgICBncmFwaGljcy5zZXREZXB0aCgxMDAwKTtcclxuICAgIGdyYXBoaWNzLnN0cm9rZVBhdGgoKTtcclxuXHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCdlbnRlci1jcmFzaGVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmNhbWVyYXMubWFpbi5zaGFrZSgyMDAsIDAuMDEpO1xyXG4gICAgICB0aGlzLmIyUGh5c2ljcy5lbnRlckJ1bGxldFRpbWUoLTEsIDAuNCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIHN0YXRzLmJlZ2luKCk7XHJcbiAgICBjb25zdCBkZWx0YSA9IHRoaXMuZ2FtZS5sb29wLmRlbHRhIC8gMTAwMDtcclxuICAgIHRoaXMuYjJQaHlzaWNzLnVwZGF0ZSgpOyAvLyBuZWVkcyB0byBoYXBwZW4gYmVmb3JlIHVwZGF0ZSBvZiBzbm93bWFuIG90aGVyd2lzZSBiMkJvZHkuR2V0UG9zaXRpb24oKSBpbmFjY3VyYXRlXHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIudXBkYXRlKGRlbHRhKTtcclxuICAgIHRoaXMuYmFja2Ryb3AudXBkYXRlKCk7XHJcbiAgICBzdGF0cy5lbmQoKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0IHtERUZBVUxUX1dJRFRIfSBmcm9tICcuLi9pbmRleCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lVUlTY2VuZSBleHRlbmRzIFBoLlNjZW5lIHtcclxuICBwcml2YXRlIG9ic2VydmVyOiBQaGFzZXIuRXZlbnRzLkV2ZW50RW1pdHRlcjtcclxuICBwcml2YXRlIHJlc3RhcnRHYW1lOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwcml2YXRlIHBsYXlBZ2FpbkJ1dHRvbjogUGhhc2VyLkdhbWVPYmplY3RzLkJpdG1hcFRleHQ7XHJcbiAgcHJpdmF0ZSBtdXNpYzogUGhhc2VyLlNvdW5kLkJhc2VTb3VuZDtcclxuICBwcml2YXRlIHNmeF9qdW1wX3N0YXJ0OiBQaGFzZXIuU291bmQuQmFzZVNvdW5kO1xyXG4gIHByaXZhdGUgc2Z4X3BpY2t1cF9wcmVzZW50OiBQaGFzZXIuU291bmQuQmFzZVNvdW5kO1xyXG5cclxuICBwcml2YXRlIHRleHREaXN0YW5jZTogUGhhc2VyLkdhbWVPYmplY3RzLkJpdG1hcFRleHQ7XHJcbiAgcHJpdmF0ZSB0ZXh0Q29tYm86IFBoYXNlci5HYW1lT2JqZWN0cy5CaXRtYXBUZXh0O1xyXG4gIHByaXZhdGUgdGV4dFNjb3JlOiBQaGFzZXIuR2FtZU9iamVjdHMuQml0bWFwVGV4dDtcclxuICBwcml2YXRlIGNvbWJvTGVld2F5Q2hhcnQ6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKHtrZXk6ICdHYW1lVUlTY2VuZSd9KTtcclxuICB9XHJcblxyXG4gIGluaXQoW29ic2VydmVyLCByZXN0YXJ0R2FtZUNCXTogW1BoLkV2ZW50cy5FdmVudEVtaXR0ZXIsICgpID0+IHZvaWRdKSB7XHJcbiAgICB0aGlzLm9ic2VydmVyID0gb2JzZXJ2ZXI7XHJcbiAgICB0aGlzLnJlc3RhcnRHYW1lID0gcmVzdGFydEdhbWVDQjtcclxuICB9XHJcblxyXG4gIGNyZWF0ZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLXVpIHNjZW5lIGNyZWF0ZScpO1xyXG4gICAgZGVidWdnZXI7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zZXRSb3VuZFBpeGVscyh0cnVlKTtcclxuICAgIGNvbnN0IHJlc29sdXRpb25Nb2QgPSB0aGlzLmdhbWUuY2FudmFzLndpZHRoIC8gREVGQVVMVF9XSURUSDtcclxuXHJcbiAgICAvLyBjb25zdCByZXNvbHV0aW9uTW9kaWZpZXIgPSB0aGlzLmdhbWUuY2FudmFzLndpZHRoID09PSBERUZBVUxUX1dJRFRIID8gMSA6IDAuNTtcclxuICAgIGNvbnN0IEZPTlRTSVpFX1RJVExFID0gMjAgKiByZXNvbHV0aW9uTW9kO1xyXG4gICAgY29uc3QgRk9OVFNJWkVfVkFMVUUgPSAxOCAqIHJlc29sdXRpb25Nb2Q7XHJcbiAgICBjb25zdCBGT05UU0laRV9CVVRUT04gPSAyNCAqIHJlc29sdXRpb25Nb2Q7XHJcbiAgICBjb25zdCBQQURESU5HID0gNCAqIHJlc29sdXRpb25Nb2Q7XHJcblxyXG4gICAgLy8gdGhpcy5tdXNpYyA9IHRoaXMuc291bmQuYWRkKCd4bWFzX3N5bnRoJywge2xvb3A6IHRydWUsIHZvbHVtZTogMC4yLCByYXRlOiAwLjg1LCBkZWxheTogMSwgZGV0dW5lOiAtMTAwfSk7XHJcbiAgICB0aGlzLm11c2ljID0gdGhpcy5zb3VuZC5hZGQoJ3JpdmVyc2lkZV9yaWRlJywge2xvb3A6IHRydWUsIHZvbHVtZTogMC4yLCByYXRlOiAwLjk1LCBkZWxheTogMSwgZGV0dW5lOiAwfSk7XHJcbiAgICB0aGlzLm11c2ljLnBsYXkoKTtcclxuXHJcbiAgICB0aGlzLnNmeF9qdW1wX3N0YXJ0ID0gdGhpcy5zb3VuZC5hZGQoJ2JvaW5rJywge2RldHVuZTogLTIwMH0pO1xyXG4gICAgdGhpcy5zZnhfcGlja3VwX3ByZXNlbnQgPSB0aGlzLnNvdW5kLmFkZCgncGlja3VwX3ByZXNlbnQnLCB7ZGV0dW5lOiAxMDAsIHJhdGU6IDEuMX0pO1xyXG5cclxuICAgIGNvbnN0IHNjcmVlbkNlbnRlclggPSB0aGlzLmNhbWVyYXMubWFpbi53b3JsZFZpZXcueCArIHRoaXMuY2FtZXJhcy5tYWluLndpZHRoIC8gMjtcclxuICAgIGNvbnN0IHNjcmVlbkNlbnRlclkgPSB0aGlzLmNhbWVyYXMubWFpbi53b3JsZFZpZXcueSArIHRoaXMuY2FtZXJhcy5tYWluLmhlaWdodCAvIDI7XHJcblxyXG4gICAgLy8gdGhpcy5ib29zdEJhciA9IG5ldyBCb29zdEJhcih0aGlzLCB0aGlzLm9ic2VydmVyLCAxMCwgMTAwKTtcclxuXHJcbiAgICB0aGlzLnBsYXlBZ2FpbkJ1dHRvbiA9IHRoaXMuYWRkLmJpdG1hcFRleHQoc2NyZWVuQ2VudGVyWCwgc2NyZWVuQ2VudGVyWSAqIDEuNSwgJ2F0YXJpLWNsYXNzaWMnLCAnUExBWSBBR0FJTj8nKVxyXG4gICAgLnNldFNjcm9sbEZhY3RvcigwKVxyXG4gICAgLnNldEZvbnRTaXplKEZPTlRTSVpFX0JVVFRPTilcclxuICAgIC5zZXRPcmlnaW4oMC41KVxyXG4gICAgLnNldERyb3BTaGFkb3coMSwgMiwgMHgyMjIyMjIpXHJcbiAgICAuc2V0QWxwaGEoMClcclxuICAgIC5zZXRJbnRlcmFjdGl2ZSh7dXNlSGFuZEN1cnNvcjogdHJ1ZX0pXHJcbiAgICAub24oJ3BvaW50ZXJkb3duJywgKCkgPT4gdGhpcy5wbGF5QWdhaW4oKSlcclxuICAgIC5vbigncG9pbnRlcm92ZXInLCAoKSA9PiB0aGlzLnBsYXlBZ2FpbkJ1dHRvbi5zZXRDaGFyYWN0ZXJUaW50KDAsIC0xLCB0cnVlLCAxMCwgMTAsIDEwLCAxMCkpXHJcbiAgICAub24oJ3BvaW50ZXJvdXQnLCAoKSA9PiB0aGlzLnBsYXlBZ2FpbkJ1dHRvbi5zZXRDaGFyYWN0ZXJUaW50KDAsIC0xLCBmYWxzZSwgLTEwLCAtMTAsIC0xMCwgLTEwKSk7XHJcbiAgICAvLyBjb25zdCBib3VuZHMxID0gdGhpcy5wbGF5QWdhaW5CdXR0b24uZ2V0VGV4dEJvdW5kcygpO1xyXG4gICAgLy8gdGhpcy5ncmFwaGljcy5maWxsUmVjdChib3VuZHMxLmdsb2JhbC54LCBib3VuZHMxLmdsb2JhbC55LCBib3VuZHMxLmdsb2JhbC53aWR0aCwgYm91bmRzMS5nbG9iYWwuaGVpZ2h0KTtcclxuXHJcbiAgICB0aGlzLmFkZC5iaXRtYXBUZXh0KDQsIDQsICdhdGFyaS1jbGFzc2ljJywgJ0RJU1RBTkNFJykuc2V0U2Nyb2xsRmFjdG9yKDAsIDApLnNldEZvbnRTaXplKEZPTlRTSVpFX1RJVExFKTtcclxuICAgIHRoaXMudGV4dERpc3RhbmNlID0gdGhpcy5hZGQuYml0bWFwVGV4dChQQURESU5HICogMS41LCBGT05UU0laRV9USVRMRSArIChQQURESU5HICogMiksICdhdGFyaS1jbGFzc2ljJywgJ0Rpc3RhbmNlOiAwbScpLnNldFNjcm9sbEZhY3RvcigwLCAwKS5zZXRGb250U2l6ZShGT05UU0laRV9WQUxVRSk7XHJcblxyXG4gICAgdGhpcy5hZGQuYml0bWFwVGV4dChzY3JlZW5DZW50ZXJYLCBQQURESU5HLCAnYXRhcmktY2xhc3NpYycsICdDT01CTycpLnNldFNjcm9sbEZhY3RvcigwLCAwKS5zZXRPcmlnaW4oMC41LCAwKS5zZXRGb250U2l6ZShGT05UU0laRV9USVRMRSk7XHJcbiAgICB0aGlzLnRleHRDb21ibyA9IHRoaXMuYWRkLmJpdG1hcFRleHQoc2NyZWVuQ2VudGVyWCwgRk9OVFNJWkVfVElUTEUgKyAoUEFERElORyAqIDIpLCAnYXRhcmktY2xhc3NpYycsICctJykuc2V0U2Nyb2xsRmFjdG9yKDAsIDApLnNldEZvbnRTaXplKEZPTlRTSVpFX1ZBTFVFKS5zZXRPcmlnaW4oMC41LCAwKTtcclxuXHJcbiAgICB0aGlzLmFkZC5iaXRtYXBUZXh0KHNjcmVlbkNlbnRlclggKiAyIC0gUEFERElORywgUEFERElORywgJ2F0YXJpLWNsYXNzaWMnLCAnU0NPUkUnKS5zZXRTY3JvbGxGYWN0b3IoMCwgMCkuc2V0T3JpZ2luKDEsIDApLnNldEZvbnRTaXplKEZPTlRTSVpFX1RJVExFKTtcclxuICAgIHRoaXMudGV4dFNjb3JlID0gdGhpcy5hZGQuYml0bWFwVGV4dChzY3JlZW5DZW50ZXJYICogMiAtIFBBRERJTkcsIEZPTlRTSVpFX1RJVExFICsgKFBBRERJTkcgKiAyKSwgJ2F0YXJpLWNsYXNzaWMnLCAnMCcpLnNldFNjcm9sbEZhY3RvcigwLCAwKS5zZXRGb250U2l6ZShGT05UU0laRV9WQUxVRSkuc2V0T3JpZ2luKDEsIDApO1xyXG5cclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ2p1bXBfc3RhcnQnLCAoKSA9PiB0aGlzLnNmeF9qdW1wX3N0YXJ0LnBsYXkoe2RlbGF5OiAwLjF9KSk7XHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCdwaWNrdXBfcHJlc2VudCcsICgpID0+IHRoaXMuc2Z4X3BpY2t1cF9wcmVzZW50LnBsYXkoKSk7XHJcblxyXG4gICAgdGhpcy5vYnNlcnZlci5vbignY29tYm8tY2hhbmdlJywgKGFjY3VtdWxhdGVkLCBtdWx0aXBsaWVyKSA9PiB0aGlzLnRleHRDb21iby5zZXRUZXh0KGFjY3VtdWxhdGVkID8gKGFjY3VtdWxhdGVkICsgJ3gnICsgbXVsdGlwbGllcikgOiAnLScpKTtcclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ3Njb3JlLWNoYW5nZScsIHNjb3JlID0+IHRoaXMudGV4dFNjb3JlLnNldFRleHQoc2NvcmUpKTtcclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ2Rpc3RhbmNlLWNoYW5nZScsIGRpc3RhbmNlID0+IHRoaXMudGV4dERpc3RhbmNlLnNldFRleHQoU3RyaW5nKGRpc3RhbmNlKSArICdtJykpO1xyXG5cclxuICAgIHRoaXMuY29tYm9MZWV3YXlDaGFydCA9IHRoaXMuYWRkLmdyYXBoaWNzKCk7XHJcblxyXG4gICAgdGhpcy5vYnNlcnZlci5vbignY29tYm8tbGVld2F5LXVwZGF0ZScsICh2YWx1ZSkgPT4ge1xyXG4gICAgICB0aGlzLmNvbWJvTGVld2F5Q2hhcnRcclxuICAgICAgLmNsZWFyKClcclxuICAgICAgLmZpbGxTdHlsZSgweGZmZmZmZilcclxuICAgICAgLnNsaWNlKHNjcmVlbkNlbnRlclgsIDcyICogcmVzb2x1dGlvbk1vZCwgMTIgKiByZXNvbHV0aW9uTW9kLCB2YWx1ZSwgTWF0aC5QSSAqIDEuNSlcclxuICAgICAgLmZpbGxQYXRoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCdlbnRlci1jcmFzaGVkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnBsYXlBZ2FpbkJ1dHRvbi5zZXRBbHBoYSgxKTtcclxuICAgICAgdGhpcy50d2VlbnMuYWRkKHtcclxuICAgICAgICB0YXJnZXRzOiB0aGlzLm11c2ljLFxyXG4gICAgICAgIHZvbHVtZTogMC4wLFxyXG4gICAgICAgIGRldHVuZTogLTUwMCxcclxuICAgICAgICByYXRlOiAwLjUsXHJcbiAgICAgICAgZHVyYXRpb246IDMwMDAsXHJcbiAgICAgICAgb25Db21wbGV0ZTogdHdlZW4gPT4gdGhpcy5tdXNpYy5zdG9wKCksXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBsYXlBZ2FpbigpIHtcclxuICAgIHRoaXMubXVzaWMuc3RvcCgpO1xyXG4gICAgdGhpcy5yZXN0YXJ0R2FtZSgpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge0RFRkFVTFRfSEVJR0hULCBERUZBVUxUX1dJRFRILCBSRVNPTFVUSU9OX1NDQUxFfSBmcm9tICcuLi9pbmRleCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVsb2FkU2NlbmUgZXh0ZW5kcyBQaGFzZXIuU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoe2tleTogJ1ByZWxvYWRTY2VuZSd9KTtcclxuICB9XHJcblxyXG4gIHByZWxvYWQoKSB7XHJcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ3JpdmVyc2lkZV9yaWRlJywgW1xyXG4gICAgICAnYXNzZXRzL2F1ZGlvL3JpdmVyc2lkZV9yaWRlL3JpdmVyc2lkZV9yaWRlLm9nZycsXHJcbiAgICAgICdhc3NldHMvYXVkaW8vcml2ZXJzaWRlX3JpZGUvcml2ZXJzaWRlX3JpZGUubXAzJyxcclxuICAgIF0pO1xyXG5cclxuICAgIC8vIFRPRE8gY29udmVydCB3YXYgdG8gb2dnLCBtcDMgYW5kIGFhY1xyXG4gICAgdGhpcy5sb2FkLmF1ZGlvKCdib2luaycsIFtcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9zZngvYm9pbmsud2F2JyxcclxuICAgIF0pO1xyXG5cclxuICAgICAgICB0aGlzLmxvYWQuYXVkaW8oJ3BpY2t1cF9wcmVzZW50JywgW1xyXG4gICAgICAnYXNzZXRzL2F1ZGlvL3NmeC9waWNrdXBnZW0ud2F2JyxcclxuICAgIF0pO1xyXG5cclxuICAgIHRoaXMubG9hZC5qc29uKCdzYW50YScsICdhc3NldHMvc2FudGEtdjAxLmpzb24nKTtcclxuXHJcbiAgICBjb25zdCBzaXplID0gYCR7REVGQVVMVF9XSURUSCAqIFJFU09MVVRJT05fU0NBTEV9eCR7REVGQVVMVF9IRUlHSFQgKiBSRVNPTFVUSU9OX1NDQUxFfWA7XHJcbiAgICB0aGlzLmxvYWQuYXRsYXMoJ2JnX3NwYWNlX3BhY2snLCBgYXNzZXRzL2ltZy9wYWNrZWQvYmdfc3BhY2VfJHtzaXplfS5wbmdgLCBgYXNzZXRzL2ltZy9wYWNrZWQvYmdfc3BhY2VfJHtzaXplfS5qc29uYCk7XHJcblxyXG4gICAgLy8gVE9ETyBjcmVhdGUgcGFja2VkIGZvciBldmVyeXRoaW5nIG5lZWRlZFxyXG4gICAgdGhpcy5sb2FkLmltYWdlKCdpY2Vfc3Bpa2VzJywgJ2Fzc2V0cy9pbWcvb2JzdGFjbGVzL2ljZV9zcGlrZXMucG5nJyk7XHJcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3Nub3d5X3JvY2snLCAnYXNzZXRzL2ltZy9vYnN0YWNsZXMvc25vd3lfcm9jay5wbmcnKTtcclxuICAgIHRoaXMubG9hZC5pbWFnZSgncHJlc2VudF90ZW1wJywgJ2Fzc2V0cy9pbWcvcHJlc2VudF90ZW1wLnBuZycpO1xyXG4gICAgdGhpcy5sb2FkLmltYWdlKCd0cmVlXzAxLnBuZycsICdhc3NldHMvaW1nL3N2Z3NpbGgvdHJlZV8wMS5wbmcnKTtcclxuICAgIHRoaXMubG9hZC5pbWFnZSgnY290dGFnZTIucG5nJywgJ2Fzc2V0cy9pbWcvc3Znc2lsaC9jb3R0YWdlMi5wbmcnKTtcclxuICAgIHRoaXMubG9hZC5pbWFnZSgnc2FudGEtYm9hcmQucG5nJywgJ2Fzc2V0cy9pbWcvc2FudGFfcGFydHNfdjAxL3NhbnRhLWJvYXJkLnBuZycpO1xyXG5cclxuICAgIHRoaXMubG9hZC5hdGxhcygnYXRsYXMtc2FudGEnLCBgYXNzZXRzL2ltZy9wYWNrZWQvY2hhcmFjdGVyLXNhbnRhLnBuZ2AsIGBhc3NldHMvaW1nL3BhY2tlZC9jaGFyYWN0ZXItc2FudGEuanNvbmApO1xyXG4gICAgdGhpcy5sb2FkLmJpdG1hcEZvbnQoJ2F0YXJpLWNsYXNzaWMnLCAnYXNzZXRzL2ZvbnRzL2JpdG1hcC9hdGFyaS1jbGFzc2ljLnBuZycsICdhc3NldHMvZm9udHMvYml0bWFwL2F0YXJpLWNsYXNzaWMueG1sJyk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGUoKSB7XHJcbiAgICB0aGlzLnNjZW5lLnN0YXJ0KCdHYW1lU2NlbmUnKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHtQaHlzaWNzfSBmcm9tICcuLi9jb21wb25lbnRzL1BoeXNpY3MnO1xyXG5pbXBvcnQgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0ICogYXMgUGwgZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQge2IyQm9keVR5cGV9IGZyb20gJ0Bib3gyZC9jb3JlJztcclxuaW1wb3J0IEdhbWVTY2VuZSBmcm9tICcuLi9zY2VuZXMvR2FtZVNjZW5lJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRGVidWdNb3VzZUpvaW50IHtcclxuICBwcml2YXRlIG1vdXNlSm9pbnQ6IFBsLmIyTW91c2VKb2ludCB8IG51bGw7XHJcblxyXG4gIHByaXZhdGUgc2NlbmU6IEdhbWVTY2VuZTtcclxuICBwcml2YXRlIGIyUGh5c2ljczogUGh5c2ljcztcclxuXHJcbiAgY29uc3RydWN0b3Ioc2NlbmU6IEdhbWVTY2VuZSwgYjJQaHlzaWNzOiBQaHlzaWNzKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmIyUGh5c2ljcyA9IGIyUGh5c2ljcztcclxuXHJcbiAgICB0aGlzLnNjZW5lLmlucHV0Lm9uKCdwb2ludGVyZG93bicsIChwb2ludGVyOiBQaC5JbnB1dC5Qb2ludGVyKSA9PiB0aGlzLk1vdXNlRG93bih7eDogcG9pbnRlci53b3JsZFggLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlLCB5OiAtcG9pbnRlci53b3JsZFkgLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlfSkpO1xyXG4gICAgdGhpcy5zY2VuZS5pbnB1dC5vbigncG9pbnRlcnVwJywgKHBvaW50ZXI6IFBoLklucHV0LlBvaW50ZXIpID0+IHRoaXMuTW91c2VVcCh7eDogcG9pbnRlci53b3JsZFggLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlLCB5OiAtcG9pbnRlci53b3JsZFkgLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlfSkpO1xyXG4gICAgdGhpcy5zY2VuZS5pbnB1dC5vbigncG9pbnRlcm1vdmUnLCAocG9pbnRlcjogUGguSW5wdXQuUG9pbnRlcikgPT4gdGhpcy5Nb3VzZU1vdmUoe3g6IHBvaW50ZXIud29ybGRYIC8gdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZSwgeTogLXBvaW50ZXIud29ybGRZIC8gdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZX0sIHRydWUpKTtcclxuXHJcbiAgfVxyXG5cclxuICBNb3VzZU1vdmUocDogUGwuWFksIGxlZnREcmFnOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBpZiAobGVmdERyYWcgJiYgdGhpcy5tb3VzZUpvaW50KSB7XHJcbiAgICAgIHRoaXMubW91c2VKb2ludC5TZXRUYXJnZXQocCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNb3VzZVVwKHA6IFBsLlhZKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5tb3VzZUpvaW50KSB7XHJcbiAgICAgIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLm1vdXNlSm9pbnQpO1xyXG4gICAgICB0aGlzLm1vdXNlSm9pbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTW91c2VEb3duKHA6IFBsLlhZKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5tb3VzZUpvaW50KSB7XHJcbiAgICAgIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLm1vdXNlSm9pbnQpO1xyXG4gICAgICB0aGlzLm1vdXNlSm9pbnQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFF1ZXJ5IHRoZSB3b3JsZCBmb3Igb3ZlcmxhcHBpbmcgc2hhcGVzLlxyXG4gICAgbGV0IGhpdF9maXh0dXJlOiBQbC5iMkZpeHR1cmUgfCB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmIyUGh5c2ljcy53b3JsZC5RdWVyeVBvaW50QUFCQihwLCAoZml4dHVyZSkgPT4ge1xyXG4gICAgICBjb25zdCBib2R5ID0gZml4dHVyZS5HZXRCb2R5KCk7XHJcbiAgICAgIGlmIChib2R5LkdldFR5cGUoKSA9PT0gYjJCb2R5VHlwZS5iMl9keW5hbWljQm9keSAmJiBmaXh0dXJlLlRlc3RQb2ludChwKSkge1xyXG4gICAgICAgIGhpdF9maXh0dXJlID0gZml4dHVyZTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFdlIGFyZSBkb25lLCB0ZXJtaW5hdGUgdGhlIHF1ZXJ5LlxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlOyAvLyBDb250aW51ZSB0aGUgcXVlcnkuXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoaGl0X2ZpeHR1cmUpIHtcclxuICAgICAgY29uc3QgZnJlcXVlbmN5SHogPSA1O1xyXG4gICAgICBjb25zdCBkYW1waW5nUmF0aW8gPSAwLjU7XHJcblxyXG4gICAgICBjb25zdCBib2R5ID0gaGl0X2ZpeHR1cmUuR2V0Qm9keSgpO1xyXG4gICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMk1vdXNlSm9pbnREZWYoKTtcclxuICAgICAgamQuY29sbGlkZUNvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAgIGpkLmRhbXBpbmcgPSAwLjE7XHJcbiAgICAgIGpkLmJvZHlBID0gdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KCdib29sJywgJ3BoYXNlclRlcnJhaW4nLCB0cnVlKVswXTtcclxuICAgICAgamQuYm9keUIgPSBib2R5O1xyXG4gICAgICBqZC50YXJnZXQuQ29weShwKTtcclxuICAgICAgamQubWF4Rm9yY2UgPSA3MDAgKiBib2R5LkdldE1hc3MoKTtcclxuICAgICAgUGwuYjJMaW5lYXJTdGlmZm5lc3MoamQsIGZyZXF1ZW5jeUh6LCBkYW1waW5nUmF0aW8sIGpkLmJvZHlBLCBqZC5ib2R5Qik7XHJcblxyXG4gICAgICB0aGlzLm1vdXNlSm9pbnQgPSB0aGlzLmIyUGh5c2ljcy53b3JsZC5DcmVhdGVKb2ludChqZCkgYXMgUGwuYjJNb3VzZUpvaW50O1xyXG4gICAgICBib2R5LlNldEF3YWtlKHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCIvKlxyXG4qICBSLlUuQi5FLiBTY2VuZSBMb2FkZXIgZm9yIFBoYXNlcjMgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9sdXNpdG8vYm94MmQudHMuXHJcbiogQmFzZWQgb24gcHJvdmlkZWQgZXhhbXBsZSBieSBDaHJpcyBDYW1wYmVsbDogaHR0cHM6Ly93d3cuaWZvcmNlMmQubmV0L3J1YmUvbG9hZGVycy9ydWJlLXBoYXNlci1zYW1wbGUuemlwXHJcbiovXHJcblxyXG5pbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7UnViZUJvZHksIFJ1YmVGaXh0dXJlLCBSdWJlRW50aXR5LCBSdWJlU2NlbmUsIFJ1YmVKb2ludCwgUnViZUN1c3RvbVByb3BlcnR5VHlwZXMsIFJ1YmVJbWFnZSwgUnViZVZlY3RvciwgUnViZUN1c3RvbVByb3BlcnR5fSBmcm9tICcuL1J1YmVMb2FkZXJJbnRlcmZhY2VzJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgUnViZUxvYWRlciB7XHJcbiAgcHJpdmF0ZSB3b3JsZDogUGwuYjJXb3JsZDtcclxuICBwcml2YXRlIGRlYnVnR3JhcGhpY3M6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzO1xyXG4gIHByaXZhdGUgc2NlbmU6IFBoLlNjZW5lO1xyXG4gIHByaXZhdGUgd29ybGRTaXplOiBudW1iZXI7XHJcblxyXG4gIGxvYWRlZEJvZGllczogKFBsLmIyQm9keSB8IG51bGwpW107XHJcbiAgbG9hZGVkSm9pbnRzOiAoUGwuYjJKb2ludCB8IG51bGwpW107XHJcbiAgbG9hZGVkSW1hZ2VzOiAoKFBoLkdhbWVPYmplY3RzLkltYWdlICYgUnViZUVudGl0eSkgfCBudWxsKVtdO1xyXG5cclxuICBjb25zdHJ1Y3Rvcih3b3JsZDogUGwuYjJXb3JsZCwgZGVidWdHcmFwaGljczogUGguR2FtZU9iamVjdHMuR3JhcGhpY3MsIHNjZW5lOiBQaC5TY2VuZSwgd29ybGRTaXplOiBudW1iZXIpIHtcclxuICAgIHRoaXMud29ybGQgPSB3b3JsZDtcclxuICAgIHRoaXMuZGVidWdHcmFwaGljcyA9IGRlYnVnR3JhcGhpY3M7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLndvcmxkU2l6ZSA9IHdvcmxkU2l6ZTtcclxuICB9XHJcblxyXG4gIGxvYWRTY2VuZShzY2VuZTogUnViZVNjZW5lKTogYm9vbGVhbiB7XHJcbiAgICB0aGlzLmxvYWRlZEJvZGllcyA9IHNjZW5lLmJvZHkgPyBzY2VuZS5ib2R5Lm1hcChib2R5SnNvbiA9PiB0aGlzLmxvYWRCb2R5KGJvZHlKc29uKSkgOiBbXTtcclxuICAgIHRoaXMubG9hZGVkSm9pbnRzID0gc2NlbmUuam9pbnQgPyBzY2VuZS5qb2ludC5tYXAoam9pbnRKc29uID0+IHRoaXMubG9hZEpvaW50KGpvaW50SnNvbikpIDogW107XHJcbiAgICB0aGlzLmxvYWRlZEltYWdlcyA9IHNjZW5lLmltYWdlID8gc2NlbmUuaW1hZ2UubWFwKGltYWdlSnNvbiA9PiB0aGlzLmxvYWRJbWFnZShpbWFnZUpzb24pKSA6IFtdO1xyXG5cclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSB0aGlzLmxvYWRlZEJvZGllcy5ldmVyeShiID0+IGIpICYmIHRoaXMubG9hZGVkSm9pbnRzLmV2ZXJ5KGogPT4gaikgJiYgdGhpcy5sb2FkZWRJbWFnZXMuZXZlcnkoaSA9PiBpKTtcclxuICAgIHN1Y2Nlc3NcclxuICAgICAgPyBjb25zb2xlLmxvZyhgUi5VLkIuRS4gc2NlbmUgbG9hZGVkIHN1Y2Nlc3NmdWxseWAsIHRoaXMubG9hZGVkQm9kaWVzLCB0aGlzLmxvYWRlZEpvaW50cywgdGhpcy5sb2FkZWRJbWFnZXMpXHJcbiAgICAgIDogY29uc29sZS5lcnJvcihgUi5VLkIuRS4gc2NlbmUgZmFpbGVkIHRvIGxvYWQgZnVsbHlgLCB0aGlzLmxvYWRlZEJvZGllcywgdGhpcy5sb2FkZWRKb2ludHMsIHRoaXMubG9hZGVkSW1hZ2VzKTtcclxuICAgIHJldHVybiBzdWNjZXNzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2FkQm9keShib2R5SnNvbjogUnViZUJvZHkpOiBQbC5iMkJvZHkgfCBudWxsIHtcclxuICAgIGNvbnN0IGJkOiBQbC5iMkJvZHlEZWYgPSB7fTtcclxuICAgIGJkLnR5cGUgPSBNYXRoLm1pbihNYXRoLm1heChib2R5SnNvbi50eXBlIHx8IDAsIDApLCAyKTsgLy8gY2xhbXAgYmV0d2VlbiAwLTIuXHJcbiAgICBiZC5hbmdsZSA9IGJvZHlKc29uLmFuZ2xlIHx8IDA7XHJcbiAgICBiZC5hbmd1bGFyVmVsb2NpdHkgPSBib2R5SnNvbi5hbmd1bGFyVmVsb2NpdHkgfHwgMDtcclxuICAgIGJkLmF3YWtlID0gQm9vbGVhbihib2R5SnNvbi5hd2FrZSk7XHJcbiAgICBiZC5lbmFibGVkID0gYm9keUpzb24uaGFzT3duUHJvcGVydHkoJ2FjdGl2ZScpID8gYm9keUpzb24uYWN0aXZlIDogdHJ1ZTtcclxuICAgIGJkLmZpeGVkUm90YXRpb24gPSBCb29sZWFuKGJvZHlKc29uLmZpeGVkUm90YXRpb24pO1xyXG4gICAgYmQubGluZWFyVmVsb2NpdHkgPSB0aGlzLnJ1YmVUb1hZKGJvZHlKc29uLmxpbmVhclZlbG9jaXR5KTtcclxuICAgIGJkLmxpbmVhckRhbXBpbmcgPSBib2R5SnNvbi5saW5lYXJEYW1waW5nIHx8IDA7XHJcbiAgICBiZC5hbmd1bGFyRGFtcGluZyA9IGJvZHlKc29uLmFuZ3VsYXJEYW1waW5nIHx8IDA7XHJcbiAgICBiZC5wb3NpdGlvbiA9IHRoaXMucnViZVRvWFkoYm9keUpzb24ucG9zaXRpb24pO1xyXG5cclxuICAgIGNvbnN0IGJvZHk6IFBsLmIyQm9keSAmIFJ1YmVFbnRpdHkgPSB0aGlzLndvcmxkLkNyZWF0ZUJvZHkoYmQpO1xyXG4gICAgYm9keS5TZXRNYXNzRGF0YSh7XHJcbiAgICAgIG1hc3M6IGJvZHlKc29uWydtYXNzRGF0YS1tYXNzJ10gfHwgMSxcclxuICAgICAgY2VudGVyOiB0aGlzLnJ1YmVUb1ZlYzIoYm9keUpzb25bJ21hc3NEYXRhLWNlbnRlciddKSxcclxuICAgICAgSTogYm9keUpzb25bJ21hc3NEYXRhLUknXSB8fCAxLFxyXG4gICAgfSk7XHJcblxyXG4gICAgYm9keS5uYW1lID0gYm9keUpzb24ubmFtZSB8fCAnJztcclxuICAgIGJvZHkuY3VzdG9tUHJvcGVydGllcyA9IGJvZHlKc29uLmN1c3RvbVByb3BlcnRpZXMgfHwgW107XHJcbiAgICBib2R5LmN1c3RvbVByb3BlcnRpZXNNYXAgPSB0aGlzLmN1c3RvbVByb3BlcnRpZXNBcnJheVRvTWFwKGJvZHkuY3VzdG9tUHJvcGVydGllcyB8fCBbXSk7XHJcblxyXG4gICAgKGJvZHlKc29uLmZpeHR1cmUgfHwgW10pLm1hcChmaXh0dXJlSnNvbiA9PiB0aGlzLmxvYWRGaXh0dXJlKGJvZHksIGZpeHR1cmVKc29uKSk7XHJcbiAgICByZXR1cm4gYm9keTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZEZpeHR1cmUoYm9keTogUGwuYjJCb2R5LCBmaXh0dXJlSnNvOiBSdWJlRml4dHVyZSk6IFBsLmIyRml4dHVyZSB7XHJcbiAgICBjb25zdCBmZDogUGwuYjJGaXh0dXJlRGVmID0gdGhpcy5nZXRGaXh0dXJlRGVmV2l0aFNoYXBlKGZpeHR1cmVKc28sIGJvZHkpO1xyXG4gICAgZmQuZnJpY3Rpb24gPSBmaXh0dXJlSnNvLmZyaWN0aW9uIHx8IDA7XHJcbiAgICBmZC5kZW5zaXR5ID0gZml4dHVyZUpzby5kZW5zaXR5IHx8IDA7XHJcbiAgICBmZC5yZXN0aXR1dGlvbiA9IGZpeHR1cmVKc28ucmVzdGl0dXRpb24gfHwgMDtcclxuICAgIGZkLmlzU2Vuc29yID0gQm9vbGVhbihmaXh0dXJlSnNvLnNlbnNvcik7XHJcbiAgICBmZC5maWx0ZXIgPSB7XHJcbiAgICAgIGNhdGVnb3J5Qml0czogZml4dHVyZUpzb1snZmlsdGVyLWNhdGVnb3J5Qml0cyddLFxyXG4gICAgICBtYXNrQml0czogZml4dHVyZUpzb1snZmlsdGVyLW1hc2tCaXRzJ10gfHwgMSxcclxuICAgICAgZ3JvdXBJbmRleDogZml4dHVyZUpzb1snZmlsdGVyLWdyb3VwSW5kZXgnXSB8fCA2NTUzNSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZml4dHVyZTogUGwuYjJGaXh0dXJlICYgUnViZUVudGl0eSA9IGJvZHkuQ3JlYXRlRml4dHVyZShmZCk7XHJcbiAgICBmaXh0dXJlLm5hbWUgPSBmaXh0dXJlSnNvLm5hbWUgfHwgJyc7XHJcbiAgICBmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXMgPSBmaXh0dXJlSnNvLmN1c3RvbVByb3BlcnRpZXMgfHwgW107XHJcbiAgICBmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXNNYXAgPSB0aGlzLmN1c3RvbVByb3BlcnRpZXNBcnJheVRvTWFwKGZpeHR1cmUuY3VzdG9tUHJvcGVydGllcyk7XHJcblxyXG4gICAgcmV0dXJuIGZpeHR1cmU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxvYWRKb2ludChqb2ludEpzb246IFJ1YmVKb2ludCk6IFBsLmIySm9pbnQgfCBudWxsIHtcclxuICAgIGlmIChqb2ludEpzb24uYm9keUEgPj0gdGhpcy5sb2FkZWRCb2RpZXMubGVuZ3RoKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0luZGV4IGZvciBib2R5QSBpcyBpbnZhbGlkOiAnICsgam9pbnRKc29uKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBpZiAoam9pbnRKc29uLmJvZHlCID49IHRoaXMubG9hZGVkQm9kaWVzLmxlbmd0aCkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdJbmRleCBmb3IgYm9keUIgaXMgaW52YWxpZDogJyArIGpvaW50SnNvbik7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJvZHlBID0gdGhpcy5sb2FkZWRCb2RpZXNbam9pbnRKc29uLmJvZHlBXTtcclxuICAgIGNvbnN0IGJvZHlCID0gdGhpcy5sb2FkZWRCb2RpZXNbam9pbnRKc29uLmJvZHlCXTtcclxuICAgIGlmICghYm9keUEgfHwgIWJvZHlCKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2JvZHlBIG9yIGJvZHlCIGFyZSBpbnZhbGlkJywgYm9keUEsIGJvZHlCLCB0aGlzLmxvYWRlZEJvZGllcyk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBqb2ludDogUGwuYjJKb2ludCAmIFJ1YmVFbnRpdHk7XHJcbiAgICBzd2l0Y2ggKGpvaW50SnNvbi50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ3Jldm9sdXRlJzoge1xyXG4gICAgICAgIGNvbnN0IGpkID0gbmV3IFBsLmIyUmV2b2x1dGVKb2ludERlZigpO1xyXG4gICAgICAgIC8vIGNvbnN0IHt4LCB5fSA9IGJvZHlBLkdldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShib2R5QSwgYm9keUIsIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQSkuUm90YXRlKGJvZHlBLkdldEFuZ2xlKCkpLkFkZChib2R5QS5HZXRQb3NpdGlvbigpKSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coam9pbnRKc29uLmFuY2hvckEsIHgsIHkpXHJcbiAgICAgICAgLy8gamQuSW5pdGlhbGl6ZShib2R5QSwgYm9keUIsIHt4OiAwLjE5MDg3NSwgeTogLTEuMzE0NDV9KTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQucmVmZXJlbmNlQW5nbGUgPSBqb2ludEpzb24ucmVmQW5nbGUgfHwgMDtcclxuICAgICAgICBqZC5lbmFibGVMaW1pdCA9IEJvb2xlYW4oam9pbnRKc29uLmVuYWJsZUxpbWl0KTtcclxuICAgICAgICBqZC5sb3dlckFuZ2xlID0gam9pbnRKc29uLmxvd2VyTGltaXQgfHwgMDtcclxuICAgICAgICBqZC51cHBlckFuZ2xlID0gam9pbnRKc29uLnVwcGVyTGltaXQgfHwgMDtcclxuICAgICAgICBqZC5lbmFibGVNb3RvciA9IEJvb2xlYW4oam9pbnRKc29uLmVuYWJsZU1vdG9yKTtcclxuICAgICAgICBqZC5tYXhNb3RvclRvcnF1ZSA9IGpvaW50SnNvbi5tYXhNb3RvclRvcnF1ZSB8fCAwO1xyXG4gICAgICAgIGpkLm1vdG9yU3BlZWQgPSBqb2ludEpzb24ubW90b3JTcGVlZCB8fCAwO1xyXG4gICAgICAgIGpvaW50ID0gdGhpcy53b3JsZC5DcmVhdGVKb2ludChqZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgLy8gY2FzZSAncm9wZSc6IHtcclxuICAgICAgLy8gICAvLyB0aHJvdyBuZXcgRXJyb3IoJ1JvcGUgam9pbnQgbm90IGltcGxlbWVudGVkJyk7XHJcbiAgICAgIC8vIH1cclxuICAgICAgY2FzZSAnZGlzdGFuY2UnOiB7XHJcbiAgICAgICAgY29uc3QgamQgPSBuZXcgUGwuYjJEaXN0YW5jZUpvaW50RGVmKCk7XHJcbiAgICAgICAgamQubGVuZ3RoID0gKGpvaW50SnNvbi5sZW5ndGggfHwgMCk7XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShcclxuICAgICAgICAgIGJvZHlBLFxyXG4gICAgICAgICAgYm9keUIsXHJcbiAgICAgICAgICB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmFuY2hvckEpLlJvdGF0ZShib2R5QS5HZXRBbmdsZSgpKS5BZGQoYm9keUEuR2V0UG9zaXRpb24oKSksXHJcbiAgICAgICAgICB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmFuY2hvckIpLlJvdGF0ZShib2R5Qi5HZXRBbmdsZSgpKS5BZGQoYm9keUIuR2V0UG9zaXRpb24oKSksXHJcbiAgICAgICAgKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQubGVuZ3RoID0gam9pbnRKc29uLmxlbmd0aCB8fCAwO1xyXG4gICAgICAgIC8vIE5vdCBzdXJlIHdoYXQgdGhlIHByb3BlciB3YXkgaXMsIGJ1dCB3aXRob3V0IHNldHRpbmcgbWluIGFuZCBtYXggbGVuZ3RoIGV4cGxpY2l0bHksIGl0IHJlbWFpbnMgc3RpZmYuXHJcbiAgICAgICAgamQubWluTGVuZ3RoID0gMDtcclxuICAgICAgICBqZC5tYXhMZW5ndGggPSBqZC5sZW5ndGggKiAyO1xyXG4gICAgICAgIFBsLmIyTGluZWFyU3RpZmZuZXNzKGpkLCBqb2ludEpzb24uZnJlcXVlbmN5IHx8IDAsIGpvaW50SnNvbi5kYW1waW5nUmF0aW8gfHwgMCwgamQuYm9keUEsIGpkLmJvZHlCKTtcclxuICAgICAgICBqb2ludCA9IHRoaXMud29ybGQuQ3JlYXRlSm9pbnQoamQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdkIGpvaW50Jywgam9pbnQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ3ByaXNtYXRpYyc6IHtcclxuICAgICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMlByaXNtYXRpY0pvaW50RGVmKCk7XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShib2R5QSwgYm9keUIsIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQSkuUm90YXRlKGJvZHlBLkdldEFuZ2xlKCkpLkFkZChib2R5QS5HZXRQb3NpdGlvbigpKSwgdGhpcy5ydWJlVG9YWShqb2ludEpzb24ubG9jYWxBeGlzQSkpO1xyXG4gICAgICAgIGpkLmNvbGxpZGVDb25uZWN0ZWQgPSBCb29sZWFuKGpvaW50SnNvbi5jb2xsaWRlQ29ubmVjdGVkKTtcclxuICAgICAgICBqZC5yZWZlcmVuY2VBbmdsZSA9IGpvaW50SnNvbi5yZWZBbmdsZSB8fCAwO1xyXG4gICAgICAgIGpkLmVuYWJsZUxpbWl0ID0gQm9vbGVhbihqb2ludEpzb24uZW5hYmxlTGltaXQpO1xyXG4gICAgICAgIGpkLmxvd2VyVHJhbnNsYXRpb24gPSBqb2ludEpzb24ubG93ZXJMaW1pdCB8fCAwO1xyXG4gICAgICAgIGpkLnVwcGVyVHJhbnNsYXRpb24gPSBqb2ludEpzb24udXBwZXJMaW1pdCB8fCAwO1xyXG4gICAgICAgIGpkLmVuYWJsZU1vdG9yID0gQm9vbGVhbihqb2ludEpzb24uZW5hYmxlTW90b3IpO1xyXG4gICAgICAgIGpkLm1heE1vdG9yRm9yY2UgPSBqb2ludEpzb24ubWF4TW90b3JGb3JjZSB8fCAwO1xyXG4gICAgICAgIGpkLm1vdG9yU3BlZWQgPSBqb2ludEpzb24ubW90b3JTcGVlZCB8fCAwO1xyXG4gICAgICAgIGpvaW50ID0gdGhpcy53b3JsZC5DcmVhdGVKb2ludChqZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnd2hlZWwnOiB7XHJcbiAgICAgICAgY29uc3QgamQgPSBuZXcgUGwuYjJXaGVlbEpvaW50RGVmKCk7XHJcbiAgICAgICAgLy8gVE9ETyBhbmNob3JBIGlzIDAgYW5kIEIgaXMgWFkgaW4gd29ybGQgc3BhY2UsIHdoaWNoIHNob3VsZCBiZSB1c2VkP1xyXG4gICAgICAgIGpkLkluaXRpYWxpemUoYm9keUEsIGJvZHlCLCB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmFuY2hvckIpLCB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmxvY2FsQXhpc0EpKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQuZW5hYmxlTW90b3IgPSBCb29sZWFuKGpvaW50SnNvbi5lbmFibGVNb3Rvcik7XHJcbiAgICAgICAgamQubWF4TW90b3JUb3JxdWUgPSBqb2ludEpzb24ubWF4TW90b3JUb3JxdWUgfHwgMDtcclxuICAgICAgICBqZC5tb3RvclNwZWVkID0gam9pbnRKc29uLm1vdG9yU3BlZWQgfHwgMDtcclxuICAgICAgICBQbC5iMkxpbmVhclN0aWZmbmVzcyhqZCwgam9pbnRKc29uLnNwcmluZ0ZyZXF1ZW5jeSB8fCAwLCBqb2ludEpzb24uc3ByaW5nRGFtcGluZ1JhdGlvIHx8IDAsIGpkLmJvZHlBLCBqZC5ib2R5Qik7XHJcbiAgICAgICAgam9pbnQgPSB0aGlzLndvcmxkLkNyZWF0ZUpvaW50KGpkKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdmcmljdGlvbic6IHtcclxuICAgICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMkZyaWN0aW9uSm9pbnREZWYoKTtcclxuICAgICAgICBqZC5Jbml0aWFsaXplKGJvZHlBLCBib2R5QiwgdGhpcy5ydWJlVG9WZWMyKGpvaW50SnNvbi5hbmNob3JBKS5Sb3RhdGUoYm9keUEuR2V0QW5nbGUoKSkuQWRkKGJvZHlBLkdldFBvc2l0aW9uKCkpKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQubWF4Rm9yY2UgPSBqb2ludEpzb24ubWF4Rm9yY2UgfHwgMDtcclxuICAgICAgICBqZC5tYXhUb3JxdWUgPSBqb2ludEpzb24ubWF4VG9ycXVlIHx8IDA7XHJcbiAgICAgICAgam9pbnQgPSB0aGlzLndvcmxkLkNyZWF0ZUpvaW50KGpkKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd3ZWxkJzoge1xyXG4gICAgICAgIGNvbnN0IGpkID0gbmV3IFBsLmIyV2VsZEpvaW50RGVmKCk7XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShib2R5QSwgYm9keUIsIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQSkuUm90YXRlKGJvZHlBLkdldEFuZ2xlKCkpLkFkZChib2R5QS5HZXRQb3NpdGlvbigpKSk7XHJcbiAgICAgICAgamQuY29sbGlkZUNvbm5lY3RlZCA9IEJvb2xlYW4oam9pbnRKc29uLmNvbGxpZGVDb25uZWN0ZWQpO1xyXG4gICAgICAgIGpkLnJlZmVyZW5jZUFuZ2xlID0gam9pbnRKc29uLnJlZkFuZ2xlIHx8IDA7XHJcbiAgICAgICAgUGwuYjJBbmd1bGFyU3RpZmZuZXNzKGpkLCBqb2ludEpzb24uZnJlcXVlbmN5IHx8IDAsIGpvaW50SnNvbi5kYW1waW5nUmF0aW8gfHwgMCwgamQuYm9keUEsIGpkLmJvZHlCKTtcclxuICAgICAgICBqb2ludCA9IHRoaXMud29ybGQuQ3JlYXRlSm9pbnQoamQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBqb2ludCB0eXBlOiAnICsgam9pbnRKc29uLnR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGpvaW50Lm5hbWUgPSBqb2ludEpzb24ubmFtZTtcclxuICAgIGpvaW50LmN1c3RvbVByb3BlcnRpZXMgPSBqb2ludEpzb24uY3VzdG9tUHJvcGVydGllcyB8fCBbXTtcclxuICAgIGpvaW50LmN1c3RvbVByb3BlcnRpZXNNYXAgPSB0aGlzLmN1c3RvbVByb3BlcnRpZXNBcnJheVRvTWFwKGpvaW50LmN1c3RvbVByb3BlcnRpZXMpO1xyXG5cclxuICAgIHJldHVybiBqb2ludDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZEltYWdlKGltYWdlSnNvbjogUnViZUltYWdlKTogKFBoLkdhbWVPYmplY3RzLkltYWdlICYgUnViZUVudGl0eSkgfCBudWxsIHtcclxuICAgIGNvbnN0IHtmaWxlLCBib2R5LCBjZW50ZXIsIGN1c3RvbVByb3BlcnRpZXMsIGFuZ2xlLCBhc3BlY3RTY2FsZSwgc2NhbGUsIGZsaXAsIHJlbmRlck9yZGVyfSA9IGltYWdlSnNvbjtcclxuICAgIGNvbnN0IGJvZHlPYmogPSB0aGlzLmxvYWRlZEJvZGllc1tib2R5XTtcclxuICAgIGNvbnN0IHBvcyA9IGJvZHlPYmogPyBib2R5T2JqLkdldFBvc2l0aW9uKCkuQWRkKHRoaXMucnViZVRvWFkoY2VudGVyKSkgOiB0aGlzLnJ1YmVUb1hZKGNlbnRlcik7XHJcblxyXG4gICAgaWYgKCFwb3MpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IHRleHR1cmUgPSB0aGlzLmdldEN1c3RvbVByb3BlcnR5KGltYWdlSnNvbiwgJ3N0cmluZycsICdwaGFzZXJUZXh0dXJlJywgJycpO1xyXG4gICAgY29uc3QgdGV4dHVyZUZhbGxiYWNrID0gKGZpbGUgfHwgJycpLnNwbGl0KFwiL1wiKS5yZXZlcnNlKClbMF07XHJcbiAgICBjb25zdCB0ZXh0dXJlRnJhbWUgPSB0aGlzLmdldEN1c3RvbVByb3BlcnR5KGltYWdlSnNvbiwgJ3N0cmluZycsICdwaGFzZXJUZXh0dXJlRnJhbWUnLCB1bmRlZmluZWQpO1xyXG4gICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0gdGV4dHVyZScsIHRleHR1cmUsIHRleHR1cmVGcmFtZSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZygndGV4dHVyZUZhbGxiYWNrJywgdGV4dHVyZUZhbGxiYWNrKTtcclxuICAgIGNvbnN0IGltZzogUGguR2FtZU9iamVjdHMuSW1hZ2UgJiBSdWJlRW50aXR5ID0gdGhpcy5zY2VuZS5hZGQuaW1hZ2UocG9zLnggKiB0aGlzLndvcmxkU2l6ZSwgcG9zLnkgKiAtdGhpcy53b3JsZFNpemUsIHRleHR1cmUgfHwgdGV4dHVyZUZhbGxiYWNrLCB0ZXh0dXJlRnJhbWUpO1xyXG4gICAgaW1nLnJvdGF0aW9uID0gYm9keU9iaiA/IC1ib2R5T2JqLkdldEFuZ2xlKCkgKyAtKGFuZ2xlIHx8IDApIDogLShhbmdsZSB8fCAwKTtcclxuICAgIGltZy5zY2FsZVkgPSAodGhpcy53b3JsZFNpemUgLyBpbWcuaGVpZ2h0KSAqIHNjYWxlO1xyXG4gICAgaW1nLnNjYWxlWCA9IGltZy5zY2FsZVkgKiBhc3BlY3RTY2FsZTtcclxuICAgIGltZy5mbGlwWCA9IGZsaXA7XHJcbiAgICBpbWcuc2V0RGVwdGgocmVuZGVyT3JkZXIpO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgaW1nLmN1c3RvbV9vcmlnaW5fYW5nbGUgPSAtKGFuZ2xlIHx8IDApO1xyXG4gICAgaW1nLmN1c3RvbVByb3BlcnRpZXMgPSBjdXN0b21Qcm9wZXJ0aWVzIHx8IFtdO1xyXG4gICAgaW1nLmN1c3RvbVByb3BlcnRpZXNNYXAgPSB0aGlzLmN1c3RvbVByb3BlcnRpZXNBcnJheVRvTWFwKGltZy5jdXN0b21Qcm9wZXJ0aWVzKTtcclxuICAgIGJvZHlPYmogJiYgYm9keU9iai5TZXRVc2VyRGF0YShpbWcpO1xyXG4gICAgcmV0dXJuIGltZztcclxuICB9XHJcblxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gIHJ1YmVUb1hZKHZhbD86IFJ1YmVWZWN0b3IsIG9mZnNldDogUGwuWFkgPSB7eDogMCwgeTogMH0pOiBQbC5YWSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1hZKHZhbCkgPyB7eDogdmFsLnggKyBvZmZzZXQueCwgeTogdmFsLnkgKyBvZmZzZXQueX0gOiBvZmZzZXQ7XHJcbiAgfVxyXG5cclxuICBydWJlVG9WZWMyKHZhbD86IFJ1YmVWZWN0b3IpOiBQbC5iMlZlYzIge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNYWSh2YWwpID8gbmV3IFBsLmIyVmVjMih2YWwueCwgdmFsLnkpIDogbmV3IFBsLmIyVmVjMigwLCAwKTtcclxuICB9XHJcblxyXG4gIGdldEJvZGllc0J5TmFtZShuYW1lKSB7XHJcbiAgICBjb25zdCBib2RpZXM6IFBsLmIyQm9keVtdID0gW107XHJcbiAgICBmb3IgKGxldCBib2R5ID0gdGhpcy53b3JsZC5HZXRCb2R5TGlzdCgpOyBib2R5OyBib2R5ID0gYm9keS5HZXROZXh0KCkpIHtcclxuICAgICAgaWYgKCFib2R5KSBjb250aW51ZTtcclxuICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICBpZiAoYm9keS5uYW1lID09PSBuYW1lKSBib2RpZXMucHVzaChib2R5KTtcclxuICAgIH1cclxuICAgIHJldHVybiBib2RpZXM7XHJcbiAgfVxyXG5cclxuICBnZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KHByb3BlcnR5VHlwZTogUnViZUN1c3RvbVByb3BlcnR5VHlwZXMsIHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZVRvTWF0Y2g6IHVua25vd24pOiBQbC5iMkJvZHlbXSB7XHJcbiAgICBjb25zdCBib2RpZXM6IFBsLmIyQm9keVtdID0gW107XHJcbiAgICB0eXBlIGIgPSBQbC5iMkJvZHkgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICAgIGZvciAobGV0IGJvZHk6IGIgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBpZiAoIWJvZHkgfHwgIWJvZHkuY3VzdG9tUHJvcGVydGllcykgY29udGludWU7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9keS5jdXN0b21Qcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFib2R5LmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkoJ25hbWUnKSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmICghYm9keS5jdXN0b21Qcm9wZXJ0aWVzW2ldLmhhc093blByb3BlcnR5KHByb3BlcnR5VHlwZSkpXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICBpZiAoYm9keS5jdXN0b21Qcm9wZXJ0aWVzW2ldLm5hbWUgPT0gcHJvcGVydHlOYW1lICYmXHJcbiAgICAgICAgICBib2R5LmN1c3RvbVByb3BlcnRpZXNbaV1bcHJvcGVydHlUeXBlXSA9PSB2YWx1ZVRvTWF0Y2gpIC8vIFRPRE8gcmVmYWN0b3IgdG8gc3RyaWN0IGVxdWFsc1xyXG4gICAgICAgICAgYm9kaWVzLnB1c2goYm9keSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBib2RpZXM7XHJcbiAgfVxyXG5cclxuICBnZXRGaXh0dXJlc0J5Q3VzdG9tUHJvcGVydHkocHJvcGVydHlUeXBlOiBSdWJlQ3VzdG9tUHJvcGVydHlUeXBlcywgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlVG9NYXRjaDogdW5rbm93bik6IFBsLmIyRml4dHVyZVtdIHtcclxuICAgIGNvbnN0IGZpeHR1cmVzOiBQbC5iMkZpeHR1cmVbXSA9IFtdO1xyXG4gICAgdHlwZSBmID0gUGwuYjJGaXh0dXJlICYgUnViZUVudGl0eSB8IG51bGw7XHJcbiAgICBmb3IgKGxldCBib2R5ID0gdGhpcy53b3JsZC5HZXRCb2R5TGlzdCgpOyBib2R5OyBib2R5ID0gYm9keS5HZXROZXh0KCkpIHtcclxuICAgICAgZm9yIChsZXQgZml4dHVyZTogZiA9IGJvZHkuR2V0Rml4dHVyZUxpc3QoKTsgZml4dHVyZTsgZml4dHVyZSA9IGZpeHR1cmUuR2V0TmV4dCgpKSB7XHJcbiAgICAgICAgaWYgKCFmaXh0dXJlIHx8ICFmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXMpIGNvbnRpbnVlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoIWZpeHR1cmUuY3VzdG9tUHJvcGVydGllc1tpXS5oYXNPd25Qcm9wZXJ0eSgnbmFtZScpKSBjb250aW51ZTtcclxuICAgICAgICAgIGlmICghZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzW2ldLmhhc093blByb3BlcnR5KHByb3BlcnR5VHlwZSkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgaWYgKGZpeHR1cmUuY3VzdG9tUHJvcGVydGllc1tpXS5uYW1lID09IHByb3BlcnR5TmFtZSAmJlxyXG4gICAgICAgICAgICBmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXNbaV1bcHJvcGVydHlUeXBlXSA9PSB2YWx1ZVRvTWF0Y2gpIC8vIFRPRE8gcmVmYWN0b3IgdG8gc3RyaWN0IGVxdWFsc1xyXG4gICAgICAgICAgICBmaXh0dXJlcy5wdXNoKGZpeHR1cmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpeHR1cmVzO1xyXG4gIH1cclxuXHJcbiAgZ2V0Sm9pbnRzQnlDdXN0b21Qcm9wZXJ0eShwcm9wZXJ0eVR5cGU6IFJ1YmVDdXN0b21Qcm9wZXJ0eVR5cGVzLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWVUb01hdGNoOiB1bmtub3duKTogUGwuYjJKb2ludFtdIHtcclxuICAgIGNvbnN0IGpvaW50czogUGwuYjJKb2ludFtdID0gW107XHJcbiAgICB0eXBlIGogPSBQbC5iMkpvaW50ICYgUnViZUVudGl0eSB8IG51bGw7XHJcbiAgICBmb3IgKGxldCBqb2ludDogaiA9IHRoaXMud29ybGQuR2V0Sm9pbnRMaXN0KCk7IGpvaW50OyBqb2ludCA9IGpvaW50LkdldE5leHQoKSkge1xyXG4gICAgICBpZiAoIWpvaW50IHx8ICFqb2ludC5jdXN0b21Qcm9wZXJ0aWVzKSBjb250aW51ZTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqb2ludC5jdXN0b21Qcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFqb2ludC5jdXN0b21Qcm9wZXJ0aWVzW2ldLmhhc093blByb3BlcnR5KCduYW1lJykpXHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICBpZiAoIWpvaW50LmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkocHJvcGVydHlUeXBlKSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmIChqb2ludC5jdXN0b21Qcm9wZXJ0aWVzW2ldLm5hbWUgPT0gcHJvcGVydHlOYW1lICYmXHJcbiAgICAgICAgICBqb2ludC5jdXN0b21Qcm9wZXJ0aWVzW2ldW3Byb3BlcnR5VHlwZV0gPT0gdmFsdWVUb01hdGNoKSAvLyBUT0RPIHJlZmFjdG9yIHRvIHN0cmljdCBlcXVhbHNcclxuICAgICAgICAgIGpvaW50cy5wdXNoKGpvaW50KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGpvaW50cztcclxuICB9XHJcblxyXG4gIC8vIFRPRE8gdHVybiBpbnRvIG1hcCBpbnN0ZWFkIG9mIGhhdmluZyB0byBpdGVyYXRlIG92ZXIgY3VzdG9tIHByb3BzXHJcbiAgZ2V0Q3VzdG9tUHJvcGVydHk8VCA9IHVua25vd24+KGVudGl0eTogUnViZUVudGl0eSwgcHJvcGVydHlUeXBlOiBSdWJlQ3VzdG9tUHJvcGVydHlUeXBlcywgcHJvcGVydHlOYW1lOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogVCk6IFQge1xyXG4gICAgaWYgKCFlbnRpdHkuY3VzdG9tUHJvcGVydGllcykgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgIGZvciAoY29uc3QgcHJvcCBvZiBlbnRpdHkuY3VzdG9tUHJvcGVydGllcykge1xyXG4gICAgICBpZiAoIXByb3AubmFtZSB8fCAhcHJvcC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eVR5cGUpKSBjb250aW51ZTtcclxuICAgICAgaWYgKHByb3AubmFtZSA9PT0gcHJvcGVydHlOYW1lKSByZXR1cm4gcHJvcFtwcm9wZXJ0eVR5cGVdIGFzIHVua25vd24gYXMgVDtcclxuICAgIH1cclxuICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGN1c3RvbVByb3BlcnRpZXNBcnJheVRvTWFwKGN1c3RvbVByb3BlcnRpZXM6IFJ1YmVDdXN0b21Qcm9wZXJ0eVtdKTogeyBba2V5OiBzdHJpbmddOiB1bmtub3duIH0ge1xyXG4gICAgcmV0dXJuIGN1c3RvbVByb3BlcnRpZXMucmVkdWNlKChvYmosIGN1cikgPT4ge1xyXG4gICAgICBpZiAoY3VyLmhhc093blByb3BlcnR5KCdpbnQnKSkgb2JqW2N1ci5uYW1lXSA9IGN1ci5pbnQ7XHJcbiAgICAgIGVsc2UgaWYgKGN1ci5oYXNPd25Qcm9wZXJ0eSgnZmxvYXQnKSkgb2JqW2N1ci5uYW1lXSA9IGN1ci5mbG9hdDtcclxuICAgICAgZWxzZSBpZiAoY3VyLmhhc093blByb3BlcnR5KCdzdHJpbmcnKSkgb2JqW2N1ci5uYW1lXSA9IGN1ci5zdHJpbmc7XHJcbiAgICAgIGVsc2UgaWYgKGN1ci5oYXNPd25Qcm9wZXJ0eSgnY29sb3InKSkgb2JqW2N1ci5uYW1lXSA9IGN1ci5jb2xvcjtcclxuICAgICAgZWxzZSBpZiAoY3VyLmhhc093blByb3BlcnR5KCdib29sJykpIG9ialtjdXIubmFtZV0gPSBjdXIuYm9vbDtcclxuICAgICAgZWxzZSBpZiAoY3VyLmhhc093blByb3BlcnR5KCd2ZWMyJykpIG9ialtjdXIubmFtZV0gPSB0aGlzLnJ1YmVUb1hZKGN1ci52ZWMyKTtcclxuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgb3IgbWlzc2luZyBjdXN0b20gcHJvcGVydHkgdHlwZScpO1xyXG4gICAgICByZXR1cm4gb2JqO1xyXG4gICAgfSwge30pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRGaXh0dXJlRGVmV2l0aFNoYXBlKGZpeHR1cmVKc286IFJ1YmVGaXh0dXJlLCBib2R5OiBQbC5iMkJvZHkpOiBQbC5iMkZpeHR1cmVEZWYge1xyXG4gICAgaWYgKGZpeHR1cmVKc28uaGFzT3duUHJvcGVydHkoJ2NpcmNsZScpICYmIGZpeHR1cmVKc28uY2lyY2xlKSB7XHJcbiAgICAgIGNvbnN0IHNoYXBlID0gbmV3IFBsLmIyQ2lyY2xlU2hhcGUoKTtcclxuICAgICAgc2hhcGUuU2V0KHRoaXMucnViZVRvWFkoZml4dHVyZUpzby5jaXJjbGUuY2VudGVyKSwgZml4dHVyZUpzby5jaXJjbGUucmFkaXVzKTtcclxuICAgICAgY29uc3QgYm9keVBvcyA9IGJvZHkuR2V0UG9zaXRpb24oKS5DbG9uZSgpLkFkZChzaGFwZS5tX3ApLlNjYWxlKHRoaXMud29ybGRTaXplKTtcclxuICAgICAgLy8gdGhpcy5kZWJ1Z0dyYXBoaWNzLnN0cm9rZUNpcmNsZShib2R5UG9zLngsIC1ib2R5UG9zLnksIGZpeHR1cmVKc28uY2lyY2xlLnJhZGl1cyAqIHRoaXMud29ybGRTaXplKTtcclxuICAgICAgcmV0dXJuIHtzaGFwZX07XHJcbiAgICB9IGVsc2UgaWYgKGZpeHR1cmVKc28uaGFzT3duUHJvcGVydHkoJ3BvbHlnb24nKSAmJiBmaXh0dXJlSnNvLnBvbHlnb24pIHtcclxuICAgICAgY29uc3QgdmVydHMgPSB0aGlzLnBvaW50c0Zyb21TZXBhcmF0ZWRWZXJ0aWNlcyhmaXh0dXJlSnNvLnBvbHlnb24udmVydGljZXMpLnJldmVyc2UoKTtcclxuICAgICAgY29uc3QgYm9keVBvcyA9IGJvZHkuR2V0UG9zaXRpb24oKTtcclxuICAgICAgY29uc3QgcHhWZXJ0cyA9IHZlcnRzXHJcbiAgICAgIC5tYXAocCA9PiBib2R5UG9zLkNsb25lKCkuQWRkKG5ldyBQbC5iMlZlYzIocC54LCBwLnkpLlJvdGF0ZShib2R5LkdldEFuZ2xlKCkpKS5TY2FsZSh0aGlzLndvcmxkU2l6ZSkpXHJcbiAgICAgIC5tYXAoKHt4LCB5fSkgPT4gKHt4OiB4LCB5OiAteX0pKTtcclxuXHJcbiAgICAgIC8vIHRoaXMuZGVidWdHcmFwaGljcy5zdHJva2VQb2ludHMocHhWZXJ0cywgdHJ1ZSkuc2V0RGVwdGgoMTAwKTtcclxuICAgICAgcmV0dXJuIHtzaGFwZTogbmV3IFBsLmIyUG9seWdvblNoYXBlKCkuU2V0KHZlcnRzLCB2ZXJ0cy5sZW5ndGgpfTtcclxuICAgIH0gZWxzZSBpZiAoZml4dHVyZUpzby5oYXNPd25Qcm9wZXJ0eSgnY2hhaW4nKSAmJiBmaXh0dXJlSnNvLmNoYWluKSB7XHJcbiAgICAgIGNvbnN0IHZlcnRzID0gdGhpcy5wb2ludHNGcm9tU2VwYXJhdGVkVmVydGljZXMoZml4dHVyZUpzby5jaGFpbi52ZXJ0aWNlcykucmV2ZXJzZSgpO1xyXG4gICAgICBjb25zdCBib2R5UG9zID0gYm9keS5HZXRQb3NpdGlvbigpO1xyXG4gICAgICBjb25zdCBweFZlcnRzID0gdmVydHNcclxuICAgICAgLm1hcChwID0+IGJvZHlQb3MuQ2xvbmUoKS5BZGQobmV3IFBsLmIyVmVjMihwLngsIHAueSkuUm90YXRlKGJvZHkuR2V0QW5nbGUoKSkpLlNjYWxlKHRoaXMud29ybGRTaXplKSlcclxuICAgICAgLm1hcCgoe3gsIHl9KSA9PiAoe3g6IHgsIHk6IC15fSkpO1xyXG4gICAgICAvLyB0aGlzLmRlYnVnR3JhcGhpY3Muc3Ryb2tlUG9pbnRzKHB4VmVydHMpLnNldERlcHRoKDEwMCk7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLWRyYXcnLCB2ZXJ0cywgcHhWZXJ0cyk7XHJcblxyXG4gICAgICBjb25zdCBpc0xvb3AgPSBmaXh0dXJlSnNvLmNoYWluLmhhc05leHRWZXJ0ZXggJiYgZml4dHVyZUpzby5jaGFpbi5oYXNQcmV2VmVydGV4ICYmIGZpeHR1cmVKc28uY2hhaW4ubmV4dFZlcnRleCAmJiBmaXh0dXJlSnNvLmNoYWluLnByZXZWZXJ0ZXg7XHJcbiAgICAgIC8vIFRPRE8gc2hvdWxkIHBvbHlnb24gY3JlYXRlIGxvb3AgY2hhaW4gaW5zdGVhZCB0byBhdm9pZCBnaG9zdCBjb2xsaXNpb25zPyBodHRwczovL2JveDJkLm9yZy9wb3N0cy8yMDIwLzA2L2dob3N0LWNvbGxpc2lvbnMvXHJcbiAgICAgIGNvbnN0IHNoYXBlID0gaXNMb29wXHJcbiAgICAgICAgPyBuZXcgUGwuYjJDaGFpblNoYXBlKCkuQ3JlYXRlTG9vcCh2ZXJ0cywgdmVydHMubGVuZ3RoKVxyXG4gICAgICAgIDogbmV3IFBsLmIyQ2hhaW5TaGFwZSgpLkNyZWF0ZUNoYWluKHZlcnRzLCB2ZXJ0cy5sZW5ndGgsIHRoaXMucnViZVRvWFkoZml4dHVyZUpzby5jaGFpbi5wcmV2VmVydGV4KSwgdGhpcy5ydWJlVG9YWShmaXh0dXJlSnNvLmNoYWluLm5leHRWZXJ0ZXgpKTtcclxuICAgICAgcmV0dXJuIHtzaGFwZX07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygnQ291bGQgbm90IGZpbmQgc2hhcGUgdHlwZSBmb3IgZml4dHVyZScpO1xyXG4gICAgICB0aHJvdyBFcnJvcignQ291bGQgbm90IGZpbmQgc2hhcGUgdHlwZSBmb3IgZml4dHVyZScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwb2ludHNGcm9tU2VwYXJhdGVkVmVydGljZXModmVydGljZXM6IHsgeDogbnVtYmVyW10sIHk6IG51bWJlcltdIH0pIHtcclxuICAgIGNvbnN0IHZlcnRzOiBQbC5YWVtdID0gW107XHJcbiAgICBmb3IgKGxldCB2ID0gMDsgdiA8IHZlcnRpY2VzLngubGVuZ3RoOyB2KyspXHJcbiAgICAgIC8vIEluIFJVQkUgRWRpdG9yIHRoZSBZIGNvb3JkaW5hdGVzIGFyZSB1cHNpZGUgZG93biB3aGVuIGNvbXBhcmVkIHRvIFBoYXNlcjNcclxuICAgICAgdmVydHMucHVzaChuZXcgUGwuYjJWZWMyKHZlcnRpY2VzLnhbdl0sIHZlcnRpY2VzLnlbdl0pKTtcclxuICAgIHJldHVybiB2ZXJ0cztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNYWSh2YWw6IHVua25vd24pOiB2YWwgaXMgUGwuWFkge1xyXG4gICAgcmV0dXJuIEJvb2xlYW4odmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmIHZhbC5oYXNPd25Qcm9wZXJ0eSgneCcpICYmIHZhbC5oYXNPd25Qcm9wZXJ0eSgneScpKTtcclxuICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIi8vIFRoZSBjaHVuayBsb2FkaW5nIGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIGNodW5rc1xuLy8gU2luY2UgYWxsIHJlZmVyZW5jZWQgY2h1bmtzIGFyZSBhbHJlYWR5IGluY2x1ZGVkXG4vLyBpbiB0aGlzIGZpbGUsIHRoaXMgZnVuY3Rpb24gaXMgZW1wdHkgaGVyZS5cbl9fd2VicGFja19yZXF1aXJlX18uZSA9ICgpID0+IChQcm9taXNlLnJlc29sdmUoKSk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rc25vd2JvYXJkaW5nX2dhbWVcIl0gPSBzZWxmW1wid2VicGFja0NodW5rc25vd2JvYXJkaW5nX2dhbWVcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvcnNcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvc3JjL2luZGV4LnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=