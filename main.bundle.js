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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1lBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3RFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSwrQ0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNFLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7U0FDdkMsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFB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Q0EsK0JBQStCLHdDQUF3QztXQUN2RTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlCQUFpQixxQkFBcUI7V0FDdEM7V0FDQTtXQUNBLGtCQUFrQixxQkFBcUI7V0FDdkM7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDSEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vbm9kZV9tb2R1bGVzL2dhbWVzdGF0cy5qcy9idWlsZC8gbGF6eSBeXFwuXFwvZ2FtZXN0YXRzXFwtLipcXC5tb2R1bGVcXC5qcyQgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvY29tcG9uZW50cy9CYWNrZHJvcC50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS8uL3NyYy9zcmMvY29tcG9uZW50cy9QaHlzaWNzLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL1BsYXllckNvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL2NvbXBvbmVudHMvU25vd2JvYXJkLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL1N0YXRlLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9jb21wb25lbnRzL1RlcnJhaW4udHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL2luZGV4LnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9zY2VuZXMvR2FtZVNjZW5lLnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy9zY2VuZXMvR2FtZVVJU2NlbmUudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL3NjZW5lcy9QcmVsb2FkU2NlbmUudHMiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvLi9zcmMvc3JjL3V0aWwvRGVidWdNb3VzZUpvaW50LnRzIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lLy4vc3JjL3NyYy91dGlsL1JVQkUvUnViZUxvYWRlci50cyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvZW5zdXJlIGNodW5rIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vc25vd2JvYXJkaW5nLWdhbWUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3Nub3dib2FyZGluZy1nYW1lL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9zbm93Ym9hcmRpbmctZ2FtZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIG1hcCA9IHtcblx0XCIuL2dhbWVzdGF0cy1waXhpLm1vZHVsZS5qc1wiOiBbXG5cdFx0XCIuL25vZGVfbW9kdWxlcy9nYW1lc3RhdHMuanMvYnVpbGQvZ2FtZXN0YXRzLXBpeGkubW9kdWxlLmpzXCIsXG5cdFx0XCJ2ZW5kb3JzXCJcblx0XVxufTtcbmZ1bmN0aW9uIHdlYnBhY2tBc3luY0NvbnRleHQocmVxKSB7XG5cdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8obWFwLCByZXEpKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgcmVxICsgXCInXCIpO1xuXHRcdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9KTtcblx0fVxuXG5cdHZhciBpZHMgPSBtYXBbcmVxXSwgaWQgPSBpZHNbMF07XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLmUoaWRzWzFdKS50aGVuKCgpID0+IHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhpZCk7XG5cdH0pO1xufVxud2VicGFja0FzeW5jQ29udGV4dC5rZXlzID0gKCkgPT4gKE9iamVjdC5rZXlzKG1hcCkpO1xud2VicGFja0FzeW5jQ29udGV4dC5pZCA9IFwiLi9ub2RlX21vZHVsZXMvZ2FtZXN0YXRzLmpzL2J1aWxkIGxhenkgcmVjdXJzaXZlIF5cXFxcLlxcXFwvZ2FtZXN0YXRzXFxcXC0uKlxcXFwubW9kdWxlXFxcXC5qcyRcIjtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0FzeW5jQ29udGV4dDsiLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQge3N0YXRzfSBmcm9tICcuLi9pbmRleCc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi4vc2NlbmVzL0dhbWVTY2VuZSc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEJhY2tkcm9wIHtcclxuICBwcml2YXRlIHNjZW5lOiBHYW1lU2NlbmU7XHJcblxyXG4gIHByaXZhdGUgYmdTcGFjZUJhY2s6IFBoYXNlci5HYW1lT2JqZWN0cy5UaWxlU3ByaXRlO1xyXG4gIHByaXZhdGUgYmdTcGFjZU1pZDogUGhhc2VyLkdhbWVPYmplY3RzLlRpbGVTcHJpdGU7XHJcbiAgcHJpdmF0ZSBiZ1NwYWNlRnJvbnQ6IFBoYXNlci5HYW1lT2JqZWN0cy5UaWxlU3ByaXRlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLmJnU3BhY2VCYWNrID0gdGhpcy5yZWdpc3RlckxheWVyKCdiZ19zcGFjZV9iYWNrLnBuZycpO1xyXG4gICAgdGhpcy5iZ1NwYWNlTWlkID0gdGhpcy5yZWdpc3RlckxheWVyKCdiZ19zcGFjZV9taWQucG5nJyk7XHJcbiAgICB0aGlzLmJnU3BhY2VGcm9udCA9IHRoaXMucmVnaXN0ZXJMYXllcignYmdfc3BhY2VfZnJvbnQucG5nJyk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGUoKSB7XHJcbiAgICBzdGF0cy5iZWdpbignYmFja2Ryb3AnKTtcclxuICAgIGNvbnN0IHtzY3JvbGxYLCBzY3JvbGxZfSA9IHRoaXMuc2NlbmUuY2FtZXJhcy5tYWluO1xyXG4gICAgdGhpcy5iZ1NwYWNlQmFjay5zZXRUaWxlUG9zaXRpb24oc2Nyb2xsWCAqIDAuMDA1LCBzY3JvbGxZICogMC4wMDUpO1xyXG4gICAgdGhpcy5iZ1NwYWNlTWlkLnNldFRpbGVQb3NpdGlvbihzY3JvbGxYICogMC4wMSwgc2Nyb2xsWSAqIDAuMDEpO1xyXG4gICAgdGhpcy5iZ1NwYWNlRnJvbnQuc2V0VGlsZVBvc2l0aW9uKHNjcm9sbFggKiAwLjAyNSwgc2Nyb2xsWSAqIDAuMDI1KTtcclxuICAgIHN0YXRzLmVuZCgnYmFja2Ryb3AnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVnaXN0ZXJMYXllcihrZXk6IHN0cmluZywgc2NhbGVYOiBudW1iZXIgPSAxLCBzY2FsZVk6IG51bWJlciA9IDEpOiBQaC5HYW1lT2JqZWN0cy5UaWxlU3ByaXRlIHtcclxuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCB6b29tWCwgem9vbVksIHdvcmxkVmlld30gPSB0aGlzLnNjZW5lLmNhbWVyYXMubWFpbjtcclxuICAgIHJldHVybiB0aGlzLnNjZW5lLmFkZC50aWxlU3ByaXRlKHdvcmxkVmlldy54ICsgd2lkdGggLyAyLCB3b3JsZFZpZXcueSArIGhlaWdodCAvIDIsIHdpZHRoLCBoZWlnaHQsICdiZ19zcGFjZV9wYWNrJywga2V5KVxyXG4gICAgLnNldE9yaWdpbigwLjUsIDAuNSlcclxuICAgIC5zZXRTY3JvbGxGYWN0b3IoMCwgMClcclxuICAgIC5zZXRTY2FsZShzY2FsZVggKiAoMSAvIHpvb21YKSwgc2NhbGVZICogKDEgLyB6b29tWSkpXHJcbiAgICAuc2V0RGVwdGgoLTIwMCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIFBoIGZyb20gJ3BoYXNlcic7XHJcbmltcG9ydCAqIGFzIFBsIGZyb20gJ0Bib3gyZC9jb3JlJztcclxuaW1wb3J0IHtzdGF0c30gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5pbXBvcnQge1J1YmVTY2VuZX0gZnJvbSAnLi4vdXRpbC9SVUJFL1J1YmVMb2FkZXJJbnRlcmZhY2VzJztcclxuaW1wb3J0IHtSdWJlTG9hZGVyfSBmcm9tICcuLi91dGlsL1JVQkUvUnViZUxvYWRlcic7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFBoeXNpY3MgZXh0ZW5kcyBQaGFzZXIuRXZlbnRzLkV2ZW50RW1pdHRlciB7XHJcbiAgcHJpdmF0ZSBzY2VuZTogR2FtZVNjZW5lO1xyXG4gIHdvcmxkU2NhbGU6IG51bWJlcjtcclxuICB3b3JsZDogUGwuYjJXb3JsZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IHVzZXJEYXRhR3JhcGhpY3M6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdGV4dHVyZUtleXM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgWkVSTzogUGwuYjJWZWMyID0gbmV3IFBsLmIyVmVjMigwLCAwKTtcclxuICBwcml2YXRlIGJ1bGxldFRpbWU6IHsgcmF0ZTogbnVtYmVyIH0gPSB7cmF0ZTogMX07XHJcbiAgZGVidWdEcmF3OiBQaC5HYW1lT2JqZWN0cy5HcmFwaGljcztcclxuICBydWJlTG9hZGVyOiBSdWJlTG9hZGVyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCB3b3JsZFNjYWxlOiBudW1iZXIsIGdyYXZpdHk6IFBsLmIyVmVjMikge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuZGVidWdEcmF3ID0gc2NlbmUuYWRkLmdyYXBoaWNzKCk7XHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcbiAgICB0aGlzLndvcmxkU2NhbGUgPSB3b3JsZFNjYWxlO1xyXG4gICAgdGhpcy53b3JsZCA9IFBsLmIyV29ybGQuQ3JlYXRlKGdyYXZpdHkpO1xyXG4gICAgdGhpcy53b3JsZC5TZXRDb250YWN0TGlzdGVuZXIoe1xyXG4gICAgICBCZWdpbkNvbnRhY3Q6IGNvbnRhY3QgPT4gdGhpcy5lbWl0KCdiZWdpbi1jb250YWN0JywgY29udGFjdCksXHJcbiAgICAgIEVuZENvbnRhY3Q6ICgpID0+IG51bGwsXHJcbiAgICAgIFByZVNvbHZlOiAoKSA9PiBudWxsLFxyXG4gICAgICBQb3N0U29sdmU6IChjb250YWN0LCBpbXB1bHNlKSA9PiB0aGlzLmVtaXQoJ3Bvc3Qtc29sdmUnLCBjb250YWN0LCBpbXB1bHNlKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMud29ybGQuU2V0QWxsb3dTbGVlcGluZyhmYWxzZSk7XHJcbiAgICB0aGlzLndvcmxkLlNldFdhcm1TdGFydGluZyh0cnVlKTtcclxuICAgIHRoaXMudXNlckRhdGFHcmFwaGljcyA9IHNjZW5lLmFkZC5ncmFwaGljcygpO1xyXG5cclxuICAgIGNvbnN0IHNjZW5lSnNvOiBSdWJlU2NlbmUgPSB0aGlzLnNjZW5lLmNhY2hlLmpzb24uZ2V0KCdzYW50YScpO1xyXG4gICAgdGhpcy5ydWJlTG9hZGVyID0gbmV3IFJ1YmVMb2FkZXIodGhpcy53b3JsZCwgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKSwgdGhpcy5zY2VuZSwgdGhpcy53b3JsZFNjYWxlKTtcclxuXHJcbiAgICBpZiAodGhpcy5ydWJlTG9hZGVyLmxvYWRTY2VuZShzY2VuZUpzbykpXHJcbiAgICAgIGNvbnNvbGUubG9nKCdSVUJFIHNjZW5lIGxvYWRlZCBzdWNjZXNzZnVsbHkuJyk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgUlVCRSBzY2VuZScpO1xyXG4gICAgdGhpcy51cGRhdGUoKTsgLy8gbmVlZHMgdG8gaGFwcGVuIGJlZm9yZSB1cGRhdGUgb2Ygc25vd21hbiBvdGhlcndpc2UgYjJCb2R5LkdldFBvc2l0aW9uKCkgaW5hY2N1cmF0ZVxyXG5cclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICAgIHN0YXRzLmJlZ2luKCdwaHlzaWNzJyk7XHJcblxyXG4gICAgLy8gY29uc3QgaXRlcmF0aW9ucyA9IE1hdGguZmxvb3IoTWF0aC5tYXgodGhpcy5zY2VuZS5nYW1lLmxvb3AuYWN0dWFsRnBzIC8gMywgOSkpO1xyXG4gICAgdGhpcy53b3JsZC5TdGVwKDEgLyA2MCwge3Bvc2l0aW9uSXRlcmF0aW9uczogMTIsIHZlbG9jaXR5SXRlcmF0aW9uczogMTJ9KTtcclxuICAgIHRoaXMud29ybGQuQ2xlYXJGb3JjZXMoKTsgLy8gcmVjb21tZW5kZWQgYWZ0ZXIgZWFjaCB0aW1lIHN0ZXBcclxuXHJcbiAgICAvLyBpdGVyYXRlIHRocm91Z2ggYWxsIGJvZGllc1xyXG4gICAgY29uc3Qgd29ybGRTY2FsZSA9IHRoaXMud29ybGRTY2FsZTtcclxuICAgIGZvciAobGV0IGJvZHkgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlO1xyXG4gICAgICBsZXQgYm9keVJlcHJlc2VudGF0aW9uID0gYm9keS5HZXRVc2VyRGF0YSgpIGFzIFBoLkdhbWVPYmplY3RzLkltYWdlO1xyXG4gICAgICBpZiAoIWJvZHlSZXByZXNlbnRhdGlvbikgY29udGludWU7XHJcblxyXG4gICAgICBpZiAoYm9keVJlcHJlc2VudGF0aW9uKSB7XHJcbiAgICAgICAgaWYgKGJvZHkuSXNFbmFibGVkKCkpIHtcclxuICAgICAgICAgIC8vIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICBsZXQge3gsIHl9ID0gYm9keS5HZXRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgIWJvZHlSZXByZXNlbnRhdGlvbi52aXNpYmxlICYmIGJvZHlSZXByZXNlbnRhdGlvbi5zZXRWaXNpYmxlKHRydWUpO1xyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnggPSB4ICogd29ybGRTY2FsZTtcclxuICAgICAgICAgIGJvZHlSZXByZXNlbnRhdGlvbi55ID0geSAqIC13b3JsZFNjYWxlO1xyXG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnJvdGF0aW9uID0gLWJvZHkuR2V0QW5nbGUoKSArIChib2R5UmVwcmVzZW50YXRpb24uY3VzdG9tX29yaWdpbl9hbmdsZSB8fCAwKTsgLy8gaW4gcmFkaWFucztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9keVJlcHJlc2VudGF0aW9uLnNldFZpc2libGUoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGltYWdlJywgYm9keS5HZXRQb3NpdGlvbigpLCBib2R5Lm5hbWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzdGF0cy5lbmQoJ3BoeXNpY3MnKTtcclxuICB9XHJcblxyXG4gIGVudGVyQnVsbGV0VGltZShkdXJhdGlvbjogbnVtYmVyLCByYXRlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIHRoaXMuYnVsbGV0VGltZS5yYXRlID0gcmF0ZTtcclxuICAgIHRoaXMuc2NlbmUudHdlZW5zLmFkZCh7XHJcbiAgICAgIGRlbGF5OiBkdXJhdGlvbixcclxuICAgICAgdGFyZ2V0czogW3RoaXMuYnVsbGV0VGltZV0sXHJcbiAgICAgIHJhdGU6IDAuOSxcclxuICAgICAgZHVyYXRpb246IDUwMCxcclxuICAgICAgLy8gb25Db21wbGV0ZTogdHdlZW4gPT4gY29uc29sZS5sb2coJ2RvbmUgdHdlZW4nKSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7UGh5c2ljc30gZnJvbSAnLi9QaHlzaWNzJztcclxuaW1wb3J0IHtzdGF0c30gZnJvbSAnLi4vaW5kZXgnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5pbXBvcnQge1dpY2tlZFNub3dib2FyZH0gZnJvbSAnLi9Tbm93Ym9hcmQnO1xyXG5pbXBvcnQge1N0YXRlfSBmcm9tICcuL1N0YXRlJztcclxuaW1wb3J0IHtSdWJlRW50aXR5fSBmcm9tICcuLi91dGlsL1JVQkUvUnViZUxvYWRlckludGVyZmFjZXMnO1xyXG5pbXBvcnQge0RlYnVnTW91c2VKb2ludH0gZnJvbSAnLi4vdXRpbC9EZWJ1Z01vdXNlSm9pbnQnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXJDb250cm9sbGVyIHtcclxuICByZWFkb25seSBzY2VuZTogR2FtZVNjZW5lO1xyXG4gIHJlYWRvbmx5IGIyUGh5c2ljczogUGh5c2ljcztcclxuICBwcml2YXRlIHJlYWRvbmx5IGN1cnNvcnM6IFBoLlR5cGVzLklucHV0LktleWJvYXJkLkN1cnNvcktleXM7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkZWJ1Z0N1cnNvcnM6IFBoLlR5cGVzLklucHV0LktleWJvYXJkLkN1cnNvcktleXM7XHJcblxyXG4gIHBhcnRzOiBJQm9keVBhcnRzO1xyXG4gIGJvYXJkOiBXaWNrZWRTbm93Ym9hcmQ7XHJcbiAgc3RhdGU6IFN0YXRlO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGp1bXBGb3JjZTogbnVtYmVyID0gNjUwICogNjA7XHJcbiAgcHJpdmF0ZSBsZWFuRm9yY2U6IG51bWJlciA9IDIuNSAqIDYwO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkganVtcFZlY3RvcjogUGwuYjJWZWMyID0gbmV3IFBsLmIyVmVjMigwLCAwKTtcclxuICBkZWJ1ZyA9IHRydWU7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjZW5lOiBHYW1lU2NlbmUsIGIyUGh5c2ljczogUGh5c2ljcykge1xyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgdGhpcy5iMlBoeXNpY3MgPSBiMlBoeXNpY3M7XHJcbiAgICB0aGlzLmN1cnNvcnMgPSB0aGlzLnNjZW5lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHJcbiAgICB0aGlzLmN1cnNvcnMudXAub24oJ2Rvd24nLCAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCd1cCBkb3duJyk7XHJcbiAgICAgIHRoaXMuc3RhdGUuZ2V0U3RhdGUoKSA9PT0gJ2dyb3VuZGVkJyAmJiB0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpIC0gdGhpcy5jdXJzb3JzLnVwLnRpbWVEb3duIDw9IDI1MCAmJiB0aGlzLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2p1bXBfc3RhcnQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuaW5pdEJvZHlQYXJ0cygpO1xyXG4gICAgdGhpcy5ib2FyZCA9IG5ldyBXaWNrZWRTbm93Ym9hcmQodGhpcyk7XHJcbiAgICB0aGlzLnN0YXRlID0gbmV3IFN0YXRlKHRoaXMpO1xyXG4gICAgdGhpcy5kZWJ1ZyAmJiBuZXcgRGVidWdNb3VzZUpvaW50KHNjZW5lLCBiMlBoeXNpY3MpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIHN0YXRzLmJlZ2luKCdzbm93bWFuJyk7XHJcblxyXG4gICAgdGhpcy5zdGF0ZS51cGRhdGUoZGVsdGEpO1xyXG4gICAgdGhpcy5zdGF0ZS5pc0NyYXNoZWQgJiYgdGhpcy5kZXRhY2hCb2FyZCgpOyAvLyBqb2ludHMgY2Fubm90IGJlIGRlc3Ryb3llZCB3aXRoaW4gcG9zdC1zb2x2ZSBjYWxsYmFja1xyXG4gICAgICAgIHRoaXMuYm9hcmQuZ2V0VGltZUluQWlyKCkgPiAxMDAgJiYgdGhpcy5yZXNldExlZ3MoKTtcclxuXHJcblxyXG4gICAgLy8gRGVidWcgaW5wdXRcclxuICAgIC8vIHRoaXMuY3Vyc29ycy51cC5pc0Rvd24gJiYgKHRoaXMuc2NlbmUuY2FtZXJhcy5tYWluLnNjcm9sbFkgLT0gMTUpO1xyXG4gICAgLy8gdGhpcy5jdXJzb3JzLmxlZnQuaXNEb3duICYmICh0aGlzLnNjZW5lLmNhbWVyYXMubWFpbi5zY3JvbGxYIC09IDE1KTtcclxuICAgIC8vIHRoaXMuY3Vyc29ycy5yaWdodC5pc0Rvd24gJiYgKHRoaXMuc2NlbmUuY2FtZXJhcy5tYWluLnNjcm9sbFggKz0gMTUpO1xyXG4gICAgLy8gdGhpcy5jdXJzb3JzLmRvd24uaXNEb3duICYmICh0aGlzLnNjZW5lLmNhbWVyYXMubWFpbi5zY3JvbGxZICs9IDE1KTtcclxuXHJcbiAgICBpZiAoIXRoaXMuc3RhdGUuaXNDcmFzaGVkKSB7XHJcbiAgICAgIHRoaXMuYm9hcmQudXBkYXRlKGRlbHRhKTtcclxuICAgICAgLy8gVG91Y2gvTW91c2UgaW5wdXRcclxuICAgICAgaWYgKHRoaXMuc2NlbmUuaW5wdXQuYWN0aXZlUG9pbnRlcj8uaXNEb3duICYmIHRoaXMuc2NlbmUuaW5wdXQuYWN0aXZlUG9pbnRlci53YXNUb3VjaCkge1xyXG4gICAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLnNjZW5lLmlucHV0LmFjdGl2ZVBvaW50ZXI7IC8vIGFjdGl2ZVBvaW50ZXIgdW5kZWZpbmVkIHVudGlsIGFmdGVyIGZpcnN0IHRvdWNoIGlucHV0XHJcbiAgICAgICAgcG9pbnRlci5tb3Rpb25GYWN0b3IgPSAwLjI7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5pbnB1dC5hY3RpdmVQb2ludGVyLnggPCB0aGlzLnNjZW5lLmNhbWVyYXMubWFpbi53aWR0aCAvIDIgPyB0aGlzLmxlYW5CYWNrd2FyZChkZWx0YSkgOiB0aGlzLmxlYW5Gb3J3YXJkKGRlbHRhKTtcclxuICAgICAgICBwb2ludGVyLnZlbG9jaXR5LnkgPCAtMzAgJiYgdGhpcy5zY2VuZS5nYW1lLmdldFRpbWUoKSAtIHBvaW50ZXIubW92ZVRpbWUgPD0gMjUwICYmIHRoaXMuanVtcChkZWx0YSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zY2VuZS5pbnB1dC5hY3RpdmVQb2ludGVyLm1vdGlvbkZhY3RvciA9IDAuODtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gS2V5Ym9hcmQgaW5wdXRcclxuICAgICAgdGhpcy5jdXJzb3JzLnVwLmlzRG93biAmJiB0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpIC0gdGhpcy5jdXJzb3JzLnVwLnRpbWVEb3duIDw9IDI1MCAmJiB0aGlzLmp1bXAoZGVsdGEpO1xyXG4gICAgICB0aGlzLmN1cnNvcnMubGVmdC5pc0Rvd24gJiYgdGhpcy5sZWFuQmFja3dhcmQoZGVsdGEpO1xyXG4gICAgICB0aGlzLmN1cnNvcnMucmlnaHQuaXNEb3duICYmIHRoaXMubGVhbkZvcndhcmQoZGVsdGEpO1xyXG4gICAgICB0aGlzLmN1cnNvcnMuZG93bi5pc0Rvd24gJiYgdGhpcy5sZWFuQ2VudGVyKGRlbHRhKTtcclxuICAgIH1cclxuICAgIHN0YXRzLmVuZCgnc25vd21hbicpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkZXRhY2hCb2FyZCgpIHtcclxuICAgIHRoaXMucGFydHMuYmluZGluZ0xlZnQgJiYgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMucGFydHMuYmluZGluZ0xlZnQpO1xyXG4gICAgdGhpcy5wYXJ0cy5iaW5kaW5nUmlnaHQgJiYgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMucGFydHMuYmluZGluZ1JpZ2h0KTtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0ICYmIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lKb2ludCh0aGlzLnBhcnRzLmRpc3RhbmNlTGVnTGVmdCk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQgJiYgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMucGFydHMuZGlzdGFuY2VMZWdSaWdodCk7XHJcbiAgICB0aGlzLnBhcnRzLndlbGRDZW50ZXIgJiYgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMucGFydHMud2VsZENlbnRlcik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGp1bXAoZGVsdGE6IG51bWJlcikge1xyXG4gICAgLy8gcHJldmVudHMgcGxheWVyIGZyb20ganVtcGluZyB0b28gcXVpY2tseSBhZnRlciBhIGxhbmRpbmdcclxuICAgIGlmICh0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpIC0gdGhpcy5zdGF0ZS50aW1lR3JvdW5kZWQgPCAxMDApIHJldHVybjsgLy8gVE9ETyBjaGFuZ2UgdG8gbnVtU3RlcHNHcm91bmRlZFxyXG5cclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC44KTtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdSaWdodD8uU2V0TGVuZ3RoKDAuOCk7XHJcblxyXG4gICAgY29uc3Qge2lzVGFpbEdyb3VuZGVkLCBpc0NlbnRlckdyb3VuZGVkLCBpc05vc2VHcm91bmRlZH0gPSB0aGlzLmJvYXJkO1xyXG4gICAgaWYgKGlzQ2VudGVyR3JvdW5kZWQgfHwgaXNUYWlsR3JvdW5kZWQgfHwgaXNOb3NlR3JvdW5kZWQpIHtcclxuICAgICAgY29uc3QgZm9yY2UgPSB0aGlzLmp1bXBGb3JjZSAqIGRlbHRhO1xyXG4gICAgICBjb25zdCBqdW1wVmVjdG9yID0gdGhpcy5qdW1wVmVjdG9yLlNldCgwLCAwKTtcclxuICAgICAgaXNDZW50ZXJHcm91bmRlZFxyXG4gICAgICAgID8gdGhpcy5wYXJ0cy5ib2R5LkdldFdvcmxkVmVjdG9yKHt4OiAwLCB5OiBmb3JjZSAqIDAuM30sIGp1bXBWZWN0b3IpLkFkZCh7eDogMCwgeTogZm9yY2UgKiAxLjI1fSlcclxuICAgICAgICA6IHRoaXMucGFydHMuYm9keS5HZXRXb3JsZFZlY3Rvcih7eDogMCwgeTogZm9yY2UgKiAwLjV9LCBqdW1wVmVjdG9yKS5BZGQoe3g6IDAsIHk6IGZvcmNlICogMC44NX0pO1xyXG4gICAgICB0aGlzLnBhcnRzLmJvZHkuQXBwbHlGb3JjZVRvQ2VudGVyKGp1bXBWZWN0b3IsIHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgICBwcml2YXRlIHJlc2V0TGVncygpIHtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC42NSk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQ/LlNldExlbmd0aCgwLjY1KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbGVhbkJhY2t3YXJkKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC41NSk7XHJcbiAgICB0aGlzLnBhcnRzLmRpc3RhbmNlTGVnUmlnaHQ/LlNldExlbmd0aCgwLjgpO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgdGhpcy5wYXJ0cy53ZWxkQ2VudGVyLm1fcmVmZXJlbmNlQW5nbGUgPSBNYXRoLlBJIC8gMTgwICogLTEwO1xyXG4gICAgdGhpcy5wYXJ0cy5ib2R5LkFwcGx5QW5ndWxhckltcHVsc2UodGhpcy5sZWFuRm9yY2UgKiBkZWx0YSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxlYW5Gb3J3YXJkKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdMZWZ0Py5TZXRMZW5ndGgoMC44KTtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdSaWdodD8uU2V0TGVuZ3RoKDAuNTUpO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgdGhpcy5wYXJ0cy53ZWxkQ2VudGVyLm1fcmVmZXJlbmNlQW5nbGUgPSBNYXRoLlBJIC8gMTgwICogMTA7XHJcbiAgICB0aGlzLnBhcnRzLmJvZHkuQXBwbHlBbmd1bGFySW1wdWxzZSgtdGhpcy5sZWFuRm9yY2UgKiBkZWx0YSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxlYW5DZW50ZXIoZGVsdGE6IG51bWJlcikge1xyXG4gICAgdGhpcy5wYXJ0cy5kaXN0YW5jZUxlZ0xlZnQ/LlNldExlbmd0aCgwLjU1KTtcclxuICAgIHRoaXMucGFydHMuZGlzdGFuY2VMZWdSaWdodD8uU2V0TGVuZ3RoKDAuNTUpO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgdGhpcy5wYXJ0cy53ZWxkQ2VudGVyLm1fcmVmZXJlbmNlQW5nbGUgPSAwO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0Qm9keVBhcnRzKCkge1xyXG4gICAgdGhpcy5wYXJ0cyA9IHtcclxuICAgICAgaGVhZDogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRCb2RpZXNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyUGFydCcsICdoZWFkJylbMF0sXHJcbiAgICAgIGJvZHk6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Qm9kaWVzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclBhcnQnLCAnYm9keScpWzBdLFxyXG4gICAgICBib2FyZFNlZ21lbnRzOiB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkoJ3N0cmluZycsICdwaGFzZXJQbGF5ZXJDaGFyYWN0ZXJQYXJ0JywgJ2JvYXJkU2VnbWVudCcpLFxyXG5cclxuICAgICAgYm9hcmRFZGdlczogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRGaXh0dXJlc0J5Q3VzdG9tUHJvcGVydHkoJ2Jvb2wnLCAncGhhc2VyQm9hcmRFZGdlJywgdHJ1ZSksXHJcblxyXG4gICAgICBiaW5kaW5nTGVmdDogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRKb2ludHNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyU3ByaW5nJywgJ2JpbmRpbmdMZWZ0JylbMF0gYXMgUGwuYjJSZXZvbHV0ZUpvaW50LFxyXG4gICAgICBiaW5kaW5nUmlnaHQ6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Sm9pbnRzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclNwcmluZycsICdiaW5kaW5nUmlnaHQnKVswXSBhcyBQbC5iMlJldm9sdXRlSm9pbnQsXHJcbiAgICAgIGRpc3RhbmNlTGVnTGVmdDogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRKb2ludHNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyU3ByaW5nJywgJ2Rpc3RhbmNlTGVnTGVmdCcpWzBdIGFzIFBsLmIyRGlzdGFuY2VKb2ludCxcclxuICAgICAgZGlzdGFuY2VMZWdSaWdodDogdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRKb2ludHNCeUN1c3RvbVByb3BlcnR5KCdzdHJpbmcnLCAncGhhc2VyUGxheWVyQ2hhcmFjdGVyU3ByaW5nJywgJ2Rpc3RhbmNlTGVnUmlnaHQnKVswXSBhcyBQbC5iMkRpc3RhbmNlSm9pbnQsXHJcbiAgICAgIHdlbGRDZW50ZXI6IHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Sm9pbnRzQnlDdXN0b21Qcm9wZXJ0eSgnc3RyaW5nJywgJ3BoYXNlclBsYXllckNoYXJhY3RlclNwcmluZycsICd3ZWxkQ2VudGVyJylbMF0gYXMgUGwuYjJXZWxkSm9pbnQsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCdpbml0Qm9keVBhcnRzJywgdGhpcy5wYXJ0cyk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUJvZHlQYXJ0cyB7XHJcbiAgaGVhZDogUGwuYjJCb2R5ICYgUnViZUVudGl0eTtcclxuICBib2R5OiBQbC5iMkJvZHkgJiBSdWJlRW50aXR5O1xyXG4gIGJvYXJkU2VnbWVudHM6IChQbC5iMkJvZHkgJiBSdWJlRW50aXR5KVtdO1xyXG4gIGJvYXJkRWRnZXM6IChQbC5iMkZpeHR1cmUgJiBSdWJlRW50aXR5KVtdOyAvLyB0YWlsIGFuZCBub3NlIGVkZ2VzIHdoZW4gaGl0IHRyaWdnZXIgY3Jhc2g7XHJcblxyXG4gIGJpbmRpbmdMZWZ0OiBQbC5iMlJldm9sdXRlSm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICBiaW5kaW5nUmlnaHQ6IFBsLmIyUmV2b2x1dGVKb2ludCAmIFJ1YmVFbnRpdHkgfCBudWxsO1xyXG4gIGRpc3RhbmNlTGVnTGVmdDogUGwuYjJEaXN0YW5jZUpvaW50ICYgUnViZUVudGl0eSB8IG51bGw7XHJcbiAgZGlzdGFuY2VMZWdSaWdodDogUGwuYjJEaXN0YW5jZUpvaW50ICYgUnViZUVudGl0eSB8IG51bGw7XHJcbiAgd2VsZENlbnRlcjogUGwuYjJXZWxkSm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7UGh5c2ljc30gZnJvbSAnLi9QaHlzaWNzJztcclxuaW1wb3J0IEdhbWVTY2VuZSBmcm9tICcuLi9zY2VuZXMvR2FtZVNjZW5lJztcclxuaW1wb3J0IHtQbGF5ZXJDb250cm9sbGVyfSBmcm9tICcuL1BsYXllckNvbnRyb2xsZXInO1xyXG5cclxuXHJcbmludGVyZmFjZSBJUmF5Q2FzdFJlc3VsdCB7XHJcbiAgaGl0OiBib29sZWFuO1xyXG4gIHBvaW50OiBQbC5iMlZlYzIgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG4gIG5vcm1hbDogUGwuYjJWZWMyIHwgbnVsbCB8IHVuZGVmaW5lZDtcclxuICBmcmFjdGlvbjogbnVtYmVyO1xyXG4gIGxhc3RIaXRUaW1lOiBudW1iZXI7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTZWdtZW50IHtcclxuICBib2R5OiBQbC5iMkJvZHk7XHJcblxyXG4gIGdyb3VuZFJheURpcmVjdGlvbjogUGwuYjJWZWMyO1xyXG4gIGdyb3VuZFJheVJlc3VsdDogSVJheUNhc3RSZXN1bHQ7XHJcbiAgZ3JvdW5kUmF5Q2FsbGJhY2s6IFBsLmIyUmF5Q2FzdENhbGxiYWNrO1xyXG5cclxuICBjcmFzaFJheURpcmVjdGlvbj86IFBsLmIyVmVjMjtcclxuICBjcmFzaFJheVJlc3VsdD86IElSYXlDYXN0UmVzdWx0O1xyXG4gIGNyYXNoUmF5Q2FsbGJhY2s/OiBQbC5iMlJheUNhc3RDYWxsYmFjaztcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBXaWNrZWRTbm93Ym9hcmQge1xyXG4gIG5vc2U/OiBJU2VnbWVudDtcclxuXHJcbiAgaXNUYWlsR3JvdW5kZWQ6IGJvb2xlYW47XHJcbiAgaXNOb3NlR3JvdW5kZWQ6IGJvb2xlYW47XHJcbiAgaXNDZW50ZXJHcm91bmRlZDogYm9vbGVhbjtcclxuXHJcbiAgcmVhZG9ubHkgc2VnbWVudHM6IElTZWdtZW50W10gPSBbXTtcclxuXHJcbiAgcHJpdmF0ZSBwb2ludFN0YXJ0OiBQbC5iMlZlYzIgPSBuZXcgUGwuYjJWZWMyKDAsIDApO1xyXG4gIHByaXZhdGUgcG9pbnRFbmQ6IFBsLmIyVmVjMiA9IG5ldyBQbC5iMlZlYzIoMCwgMCk7XHJcbiAgcHJpdmF0ZSBkZWJ1Z0dyYXBoaWNzOiBQaC5HYW1lT2JqZWN0cy5HcmFwaGljcztcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBwbGF5ZXI6IFBsYXllckNvbnRyb2xsZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzY2VuZTogR2FtZVNjZW5lO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllckNvbnRyb2xsZXIpIHtcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgdGhpcy5zY2VuZSA9IHBsYXllci5zY2VuZTtcclxuICAgIHRoaXMuYjJQaHlzaWNzID0gcGxheWVyLmIyUGh5c2ljcztcclxuXHJcbiAgICB0aGlzLmRlYnVnR3JhcGhpY3MgPSB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpO1xyXG4gICAgdGhpcy5pbml0UmF5cyh0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlIC8gNCk7XHJcblxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKGRlbHRhOiBudW1iZXIpIHtcclxuICAgIHRoaXMucGxheWVyLmRlYnVnICYmIHRoaXMuZGVidWdHcmFwaGljcy5jbGVhcigpO1xyXG4gICAgY29uc3Qgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzO1xyXG5cclxuICAgIGZvciAoY29uc3Qgc2VnbWVudCBvZiB0aGlzLnNlZ21lbnRzKSB7XHJcbiAgICAgIHRoaXMucmVzZXRTZWdtZW50KHNlZ21lbnQpO1xyXG4gICAgICBzZWdtZW50LmJvZHkuR2V0V29ybGRQb2ludChQbC5iMlZlYzIuWkVSTywgdGhpcy5wb2ludFN0YXJ0KTtcclxuICAgICAgc2VnbWVudC5ib2R5LkdldFdvcmxkUG9pbnQoc2VnbWVudC5ncm91bmRSYXlEaXJlY3Rpb24sIHRoaXMucG9pbnRFbmQpO1xyXG4gICAgICB0aGlzLmIyUGh5c2ljcy53b3JsZC5SYXlDYXN0KHRoaXMucG9pbnRTdGFydCwgdGhpcy5wb2ludEVuZCwgc2VnbWVudC5ncm91bmRSYXlDYWxsYmFjayk7XHJcbiAgICAgIHRoaXMucGxheWVyLmRlYnVnICYmIHRoaXMuZHJhd0RlYnVnKHNlZ21lbnQuZ3JvdW5kUmF5UmVzdWx0LmhpdCA/IDB4MDAwMGZmIDogMHgwMGZmMDApO1xyXG5cclxuICAgICAgaWYgKHNlZ21lbnQuY3Jhc2hSYXlSZXN1bHQgJiYgc2VnbWVudC5jcmFzaFJheUNhbGxiYWNrICYmIHNlZ21lbnQuY3Jhc2hSYXlEaXJlY3Rpb24pIHtcclxuICAgICAgICBzZWdtZW50LmJvZHkuR2V0V29ybGRQb2ludChQbC5iMlZlYzIuWkVSTywgdGhpcy5wb2ludFN0YXJ0KTtcclxuICAgICAgICBzZWdtZW50LmJvZHkuR2V0V29ybGRQb2ludChzZWdtZW50LmNyYXNoUmF5RGlyZWN0aW9uLCB0aGlzLnBvaW50RW5kKTtcclxuICAgICAgICB0aGlzLmIyUGh5c2ljcy53b3JsZC5SYXlDYXN0KHRoaXMucG9pbnRTdGFydCwgdGhpcy5wb2ludEVuZCwgc2VnbWVudC5jcmFzaFJheUNhbGxiYWNrKTtcclxuICAgICAgICB0aGlzLnBsYXllci5kZWJ1ZyAmJiB0aGlzLmRyYXdEZWJ1ZyhzZWdtZW50LmNyYXNoUmF5UmVzdWx0LmhpdCA/IDB4MDAwMGZmIDogMHgwMGZmMDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc1RhaWxHcm91bmRlZCA9IHNlZ21lbnRzWzBdLmdyb3VuZFJheVJlc3VsdC5oaXQ7XHJcbiAgICB0aGlzLmlzTm9zZUdyb3VuZGVkID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0uZ3JvdW5kUmF5UmVzdWx0LmhpdDtcclxuICAgIHRoaXMuaXNDZW50ZXJHcm91bmRlZCA9IHNlZ21lbnRzWzJdLmdyb3VuZFJheVJlc3VsdC5oaXQgfHwgc2VnbWVudHNbM10uZ3JvdW5kUmF5UmVzdWx0LmhpdCB8fCBzZWdtZW50c1s0XS5ncm91bmRSYXlSZXN1bHQuaGl0O1xyXG4gIH1cclxuXHJcbiAgZ2V0VGltZUluQWlyKCk6IG51bWJlciB7XHJcbiAgICBpZiAodGhpcy5zZWdtZW50cy5zb21lKHMgPT4gcy5ncm91bmRSYXlSZXN1bHQuaGl0KSkgcmV0dXJuIC0xO1xyXG4gICAgY29uc3QgbW9zdFJlY2VudEhpdCA9IE1hdGgubWF4KC4uLnRoaXMuc2VnbWVudHMubWFwKHMgPT4gcy5ncm91bmRSYXlSZXN1bHQubGFzdEhpdFRpbWUpKTtcclxuICAgIHJldHVybiB0aGlzLnNjZW5lLmdhbWUuZ2V0VGltZSgpIC0gbW9zdFJlY2VudEhpdDtcclxuICB9XHJcblxyXG4gIGlzSW5BaXIoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUaW1lSW5BaXIoKSAhPT0gLTE7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJheUNhbGxiYWNrRmFjdG9yeShoaXRSZXN1bHQ6IElSYXlDYXN0UmVzdWx0KSB7XHJcbiAgICByZXR1cm4gKGZpeHR1cmUsIHBvaW50LCBub3JtYWwsIGZyYWN0aW9uKSA9PiB7XHJcbiAgICAgIHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Q3VzdG9tUHJvcGVydHkoZml4dHVyZSwgJ2Jvb2wnLCAncGhhc2VyQ3Jhc2hTZW5zb3JJZ25vcmUnLCBmYWxzZSk7XHJcbiAgICAgIGhpdFJlc3VsdC5oaXQgPSB0cnVlO1xyXG4gICAgICBoaXRSZXN1bHQucG9pbnQgPSBwb2ludDtcclxuICAgICAgaGl0UmVzdWx0Lm5vcm1hbCA9IG5vcm1hbDtcclxuICAgICAgaGl0UmVzdWx0LmZyYWN0aW9uID0gZnJhY3Rpb247XHJcbiAgICAgIGhpdFJlc3VsdC5sYXN0SGl0VGltZSA9IHRoaXMuc2NlbmUuZ2FtZS5nZXRUaW1lKCk7XHJcbiAgICAgIHJldHVybiBmcmFjdGlvbjtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlc2V0U2VnbWVudChzZWdtZW50OiBJU2VnbWVudCkge1xyXG4gICAgc2VnbWVudC5ncm91bmRSYXlSZXN1bHQuaGl0ID0gZmFsc2U7XHJcbiAgICBzZWdtZW50Lmdyb3VuZFJheVJlc3VsdC5wb2ludCA9IG51bGw7XHJcbiAgICBzZWdtZW50Lmdyb3VuZFJheVJlc3VsdC5ub3JtYWwgPSBudWxsO1xyXG4gICAgc2VnbWVudC5ncm91bmRSYXlSZXN1bHQuZnJhY3Rpb24gPSAtMTtcclxuXHJcbiAgICBpZiAoc2VnbWVudC5jcmFzaFJheVJlc3VsdCkge1xyXG4gICAgICBzZWdtZW50LmNyYXNoUmF5UmVzdWx0LmhpdCA9IGZhbHNlO1xyXG4gICAgICBzZWdtZW50LmNyYXNoUmF5UmVzdWx0LnBvaW50ID0gbnVsbDtcclxuICAgICAgc2VnbWVudC5jcmFzaFJheVJlc3VsdC5ub3JtYWwgPSBudWxsO1xyXG4gICAgICBzZWdtZW50LmNyYXNoUmF5UmVzdWx0LmZyYWN0aW9uID0gLTE7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdEZWJ1Zyhjb2xvcjogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmRlYnVnR3JhcGhpY3MubGluZVN0eWxlKDIsIGNvbG9yLCAxKTtcclxuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZTtcclxuICAgIHRoaXMuZGVidWdHcmFwaGljcy5saW5lQmV0d2VlbihcclxuICAgICAgdGhpcy5wb2ludFN0YXJ0LnggKiBzY2FsZSxcclxuICAgICAgLXRoaXMucG9pbnRTdGFydC55ICogc2NhbGUsXHJcbiAgICAgIHRoaXMucG9pbnRFbmQueCAqIHNjYWxlLFxyXG4gICAgICAtdGhpcy5wb2ludEVuZC55ICogc2NhbGUsXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0UmF5cyhyYXlMZW5ndGg6IG51bWJlcikge1xyXG4gICAgY29uc3QgdGVtcDogSVJheUNhc3RSZXN1bHQgPSB7aGl0OiBmYWxzZSwgcG9pbnQ6IG51bGwsIG5vcm1hbDogbnVsbCwgZnJhY3Rpb246IC0xLCBsYXN0SGl0VGltZTogLTF9O1xyXG4gICAgZm9yIChjb25zdCBzZWdtZW50IG9mIHRoaXMucGxheWVyLnBhcnRzLmJvYXJkU2VnbWVudHMpIHtcclxuICAgICAgY29uc3Qgc2VnbWVudEluZGV4ID0gdGhpcy5iMlBoeXNpY3MucnViZUxvYWRlci5nZXRDdXN0b21Qcm9wZXJ0eShzZWdtZW50LCAnaW50JywgJ3BoYXNlckJvYXJkU2VnbWVudEluZGV4JywgLTEpO1xyXG4gICAgICBjb25zdCBpc05vc2UgPSBzZWdtZW50SW5kZXggPT09IHRoaXMucGxheWVyLnBhcnRzLmJvYXJkU2VnbWVudHMubGVuZ3RoIC0gMTtcclxuICAgICAgY29uc3QgZ3JvdW5kSGl0UmVzdWx0ID0gey4uLnRlbXB9O1xyXG4gICAgICBjb25zdCBjcmFzaEhpdFJlc3VsdCA9IHsuLi50ZW1wfTtcclxuICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHtcclxuICAgICAgICBib2R5OiBzZWdtZW50LFxyXG4gICAgICAgIGdyb3VuZFJheURpcmVjdGlvbjogbmV3IFBsLmIyVmVjMigwLCAtcmF5TGVuZ3RoIC8gdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZSksXHJcbiAgICAgICAgZ3JvdW5kUmF5UmVzdWx0OiBncm91bmRIaXRSZXN1bHQsXHJcbiAgICAgICAgZ3JvdW5kUmF5Q2FsbGJhY2s6IHRoaXMucmF5Q2FsbGJhY2tGYWN0b3J5KGdyb3VuZEhpdFJlc3VsdCksXHJcbiAgICAgICAgY3Jhc2hSYXlEaXJlY3Rpb246IGlzTm9zZSA/IG5ldyBQbC5iMlZlYzIoKGlzTm9zZSA/IHJheUxlbmd0aCAqIDIgOiByYXlMZW5ndGgpIC8gdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZSwgMCkgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgY3Jhc2hSYXlSZXN1bHQ6IGlzTm9zZSA/IGNyYXNoSGl0UmVzdWx0IDogdW5kZWZpbmVkLFxyXG4gICAgICAgIGNyYXNoUmF5Q2FsbGJhY2s6IGlzTm9zZSA/IHRoaXMucmF5Q2FsbGJhY2tGYWN0b3J5KGNyYXNoSGl0UmVzdWx0KSA6IHVuZGVmaW5lZCxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaXNOb3NlKSB0aGlzLm5vc2UgPSB0aGlzLnNlZ21lbnRzW3RoaXMuc2VnbWVudHMubGVuZ3RoIC0gMV07XHJcbiAgICB9XHJcblxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7UGh5c2ljc30gZnJvbSAnLi9QaHlzaWNzJztcclxuaW1wb3J0IHtSdWJlRW50aXR5fSBmcm9tICcuLi91dGlsL1JVQkUvUnViZUxvYWRlckludGVyZmFjZXMnO1xyXG5pbXBvcnQge0lCb2R5UGFydHMsIFBsYXllckNvbnRyb2xsZXJ9IGZyb20gJy4vUGxheWVyQ29udHJvbGxlcic7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFN0YXRlIHtcclxuICAvLyBUT0RPIGFkZCBwYXJ0aWNsZSBlZmZlY3Qgd2hlbiBib29zdCBlbmFibGVkXHJcbiAgcHJpdmF0ZSByZWFkb25seSBCQVNFX0JPT1NUX0ZMT1c6IG51bWJlciA9IDIyLjUgKiA2MDtcclxuICBwcml2YXRlIHJlYWRvbmx5IEJBU0VfVFJJQ0tfUE9JTlRTOiBudW1iZXIgPSAyMDA7XHJcbiAgbWF4Qm9vc3Q6IG51bWJlciA9IHRoaXMuQkFTRV9CT09TVF9GTE9XICogMjU7IC8vIDI1IHNlY29uZHMgd29ydGggb2YgYm9vc3RcclxuICBhdmFpbGFibGVCb29zdDogbnVtYmVyID0gdGhpcy5tYXhCb29zdDtcclxuXHJcbiAgbG9zdEhlYWQ6IEJvb2xlYW47XHJcbiAgaXNDcmFzaGVkOiBib29sZWFuO1xyXG4gIGxhbmRlZEZyb250RmxpcHMgPSAwO1xyXG4gIGxhbmRlZEJhY2tGbGlwcyA9IDA7XHJcbiAgdGltZUdyb3VuZGVkOiBudW1iZXIgPSAwO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGIyUGh5c2ljczogUGh5c2ljcztcclxuICBwcml2YXRlIHBsYXllckNvbnRyb2xsZXI6IFBsYXllckNvbnRyb2xsZXI7XHJcbiAgcHJpdmF0ZSBzdGF0ZTogJ2luLWFpcicgfCAnZ3JvdW5kZWQnIHwgJ2NyYXNoZWQnO1xyXG5cclxuICBwcml2YXRlIHRvdGFsVHJpY2tTY29yZTogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIHByb3RvVHJpY2tTY29yZTogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIGNvbWJvQWNjdW11bGF0ZWRTY29yZTogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIGFuZ2xlUHJldmlvdXNVcGRhdGU6IG51bWJlciA9IDA7XHJcblxyXG4gIHByaXZhdGUgdG90YWxSb3RhdGlvbjogbnVtYmVyID0gMDsgLy8gdG90YWwgcm90YXRpb24gd2hpbGUgaW4gYWlyIHdpdGhvdXQgdG91Y2hpbmcgdGhlIGdyb3VuZFxyXG4gIHByaXZhdGUgY3VycmVudEZsaXBSb3RhdGlvbjogbnVtYmVyID0gMDsgLy8gc2V0IHRvIDAgYWZ0ZXIgZWFjaCBmbGlwXHJcblxyXG4gIHByaXZhdGUgcGVuZGluZ0Zyb250RmxpcHM6IG51bWJlciA9IDA7XHJcbiAgcHJpdmF0ZSBwZW5kaW5nQmFja0ZsaXBzOiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGFydHM6IElCb2R5UGFydHM7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGlja3Vwc1RvUHJvY2VzczogU2V0PFBsLmIyQm9keSAmIFJ1YmVFbnRpdHk+ID0gbmV3IFNldCgpO1xyXG4gIHByaXZhdGUgY29tYm9NdWx0aXBsaWVyOiBudW1iZXIgPSAwO1xyXG4gIHByaXZhdGUgY29tYm9MZWV3YXlUd2VlbjogUGhhc2VyLlR3ZWVucy5Ud2VlbjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBhbHJlYWR5Q29sbGVjdGVkQ29pbnM6IFNldDxQbC5iMkZpeHR1cmU+ID0gbmV3IFNldCgpO1xyXG4gIHByaXZhdGUgbGFzdERpc3RhbmNlOiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHBsYXllckNvbnRyb2xsZXI6IFBsYXllckNvbnRyb2xsZXIpIHtcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlciA9IHBsYXllckNvbnRyb2xsZXI7XHJcbiAgICB0aGlzLnBhcnRzID0gcGxheWVyQ29udHJvbGxlci5wYXJ0cztcclxuXHJcbiAgICB0aGlzLmIyUGh5c2ljcyA9IHBsYXllckNvbnRyb2xsZXIuYjJQaHlzaWNzO1xyXG4gICAgLy8gdGhpcy5jcmFzaElnbm9yZWRQYXJ0cyA9IFt0aGlzLnBhcnRzLmFybUxvd2VyTGVmdCwgdGhpcy5wYXJ0cy5hcm1Mb3dlclJpZ2h0LCB0aGlzLnBhcnRzLmJvZHldO1xyXG4gICAgdGhpcy5zdGF0ZSA9IHBsYXllckNvbnRyb2xsZXIuYm9hcmQuaXNJbkFpcigpID8gJ2luLWFpcicgOiAnZ3JvdW5kZWQnO1xyXG4gICAgdGhpcy5yZWdpc3RlckNvbGxpc2lvbkxpc3RlbmVycygpO1xyXG5cclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5vbignZW50ZXItaW4tYWlyJywgKCkgPT4gdGhpcy5zdGF0ZSA9ICdpbi1haXInKTtcclxuXHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIub24oJ2VudGVyLWdyb3VuZGVkJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSAnZ3JvdW5kZWQnO1xyXG4gICAgICAgIHRoaXMudGltZUdyb3VuZGVkID0gdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLmdhbWUuZ2V0VGltZSgpO1xyXG4gICAgICAgIHRoaXMubGFuZGVkRnJvbnRGbGlwcyArPSB0aGlzLnBlbmRpbmdGcm9udEZsaXBzO1xyXG4gICAgICAgIHRoaXMubGFuZGVkQmFja0ZsaXBzICs9IHRoaXMucGVuZGluZ0JhY2tGbGlwcztcclxuXHJcbiAgICAgICAgY29uc3QgbnVtRmxpcHMgPSB0aGlzLnBlbmRpbmdCYWNrRmxpcHMgKyB0aGlzLnBlbmRpbmdGcm9udEZsaXBzO1xyXG4gICAgICAgIGlmIChudW1GbGlwcyA+PSAxKSB7XHJcbiAgICAgICAgICBjb25zdCB0cmlja1Njb3JlID0gbnVtRmxpcHMgKiBudW1GbGlwcyAqIHRoaXMuQkFTRV9UUklDS19QT0lOVFM7XHJcbiAgICAgICAgICB0aGlzLnRvdGFsVHJpY2tTY29yZSArPSB0cmlja1Njb3JlO1xyXG5cclxuICAgICAgICAgIHRoaXMuY29tYm9BY2N1bXVsYXRlZFNjb3JlICs9IHRyaWNrU2NvcmUgKiAwLjE7XHJcbiAgICAgICAgICB0aGlzLmNvbWJvTXVsdGlwbGllcisrO1xyXG4gICAgICAgICAgLy8gdGhpcy5nYWluQm9vc3QoMSwgbnVtRmxpcHMgKiA1KTtcclxuICAgICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdjb21iby1jaGFuZ2UnLCB0aGlzLmNvbWJvQWNjdW11bGF0ZWRTY29yZSwgdGhpcy5jb21ib011bHRpcGxpZXIpO1xyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ3Njb3JlLWNoYW5nZScsIHRoaXMudG90YWxUcmlja1Njb3JlKTtcclxuICAgICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdib29zdC1jaGFuZ2UnLCB0aGlzLmF2YWlsYWJsZUJvb3N0LCB0aGlzLm1heEJvb3N0KTtcclxuXHJcbiAgICAgICAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4ucmVzZXRUd2VlbkRhdGEodHJ1ZSk7XHJcbiAgICAgICAgICB0aGlzLmNvbWJvTGVld2F5VHdlZW4ucGxheSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50b3RhbFJvdGF0aW9uID0gMDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRGbGlwUm90YXRpb24gPSAwO1xyXG4gICAgICAgIHRoaXMucGVuZGluZ0JhY2tGbGlwcyA9IDA7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nRnJvbnRGbGlwcyA9IDA7XHJcbiAgICAgIH0sXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5vbignZW50ZXItY3Jhc2hlZCcsICgpID0+IHtcclxuICAgICAgdGhpcy5zdGF0ZSA9ICdjcmFzaGVkJztcclxuICAgICAgaWYgKHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5pc1BsYXlpbmcoKSB8fCB0aGlzLmNvbWJvTGVld2F5VHdlZW4uaXNQYXVzZWQoKSkge1xyXG4gICAgICAgIHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY29tYm9MZWV3YXlUd2VlbiA9IHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS50d2VlbnMuYWRkQ291bnRlcih7XHJcbiAgICAgIHBhdXNlZDogdHJ1ZSxcclxuICAgICAgZnJvbTogTWF0aC5QSSAqIC0wLjUsXHJcbiAgICAgIHRvOiBNYXRoLlBJICogMS41LFxyXG4gICAgICBkdXJhdGlvbjogMjAwMCxcclxuICAgICAgb25VcGRhdGU6ICh0d2VlbikgPT4gdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2NvbWJvLWxlZXdheS11cGRhdGUnLCB0d2Vlbi5nZXRWYWx1ZSgpKSxcclxuICAgICAgb25Db21wbGV0ZTogdHdlZW4gPT4ge1xyXG4gICAgICAgIHRoaXMudG90YWxUcmlja1Njb3JlICs9IHRoaXMuY29tYm9BY2N1bXVsYXRlZFNjb3JlICogdGhpcy5jb21ib011bHRpcGxpZXI7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ3Njb3JlLWNoYW5nZScsIHRoaXMudG90YWxUcmlja1Njb3JlKTtcclxuICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnY29tYm8tY2hhbmdlJywgMCwgMCk7XHJcbiAgICAgICAgdGhpcy5wcm90b1RyaWNrU2NvcmUgPSAwO1xyXG4gICAgICAgIHRoaXMuY29tYm9BY2N1bXVsYXRlZFNjb3JlID0gMDtcclxuICAgICAgICB0aGlzLmNvbWJvTXVsdGlwbGllciA9IDA7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGdldFN0YXRlKCk6ICdncm91bmRlZCcgfCAnaW4tYWlyJyB8ICdjcmFzaGVkJyB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcclxuICB9XHJcblxyXG4gIGdldFRyYXZlbERpc3RhbmNlTWV0ZXJzKCk6IG51bWJlciB7XHJcbiAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMucGFydHMuYm9keS5HZXRQb3NpdGlvbigpLkxlbmd0aCgpO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoZGlzdGFuY2UgLyA1MCkgKiA1MDtcclxuICB9XHJcblxyXG4gIGdhaW5Cb29zdChkZWx0YTogbnVtYmVyLCBib29zdFVuaXRzOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgY29uc3QgYm9vc3QgPSBNYXRoLm1pbih0aGlzLm1heEJvb3N0LCAodGhpcy5CQVNFX0JPT1NUX0ZMT1cgKiBib29zdFVuaXRzICogZGVsdGEpICsgdGhpcy5hdmFpbGFibGVCb29zdCk7XHJcbiAgICB0aGlzLmF2YWlsYWJsZUJvb3N0ID0gYm9vc3Q7XHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnYm9vc3QtY2hhbmdlJywgdGhpcy5hdmFpbGFibGVCb29zdCwgdGhpcy5tYXhCb29zdCk7XHJcbiAgICByZXR1cm4gYm9vc3Q7XHJcbiAgfVxyXG5cclxuICBjb25zdW1lQm9vc3QoZGVsdGE6IG51bWJlciwgYm9vc3RVbml0czogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIGlmICh0aGlzLmF2YWlsYWJsZUJvb3N0IDw9IDApIHJldHVybiAwO1xyXG4gICAgY29uc3QgYm9vc3QgPSBNYXRoLm1pbih0aGlzLmF2YWlsYWJsZUJvb3N0LCB0aGlzLkJBU0VfQk9PU1RfRkxPVyAqIGJvb3N0VW5pdHMgKiBkZWx0YSk7XHJcbiAgICB0aGlzLmF2YWlsYWJsZUJvb3N0IC09IGJvb3N0ICogKGJvb3N0VW5pdHMgPiAxID8gMS41IDogMSk7XHJcbiAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnYm9vc3QtY2hhbmdlJywgdGhpcy5hdmFpbGFibGVCb29zdCwgdGhpcy5tYXhCb29zdCk7XHJcbiAgICByZXR1cm4gYm9vc3Q7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlZ2lzdGVyQ29sbGlzaW9uTGlzdGVuZXJzKCkge1xyXG4gICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLmIyUGh5c2ljcy5vbigncG9zdC1zb2x2ZScsIChjb250YWN0OiBQbC5iMkNvbnRhY3QsIGltcHVsc2U6IFBsLmIyQ29udGFjdEltcHVsc2UpID0+IHtcclxuICAgICAgaWYgKHRoaXMuaXNDcmFzaGVkKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGJvZHlBID0gY29udGFjdC5HZXRGaXh0dXJlQSgpLkdldEJvZHkoKTtcclxuICAgICAgY29uc3QgYm9keUIgPSBjb250YWN0LkdldEZpeHR1cmVCKCkuR2V0Qm9keSgpO1xyXG4gICAgICBpZiAoYm9keUEgPT09IGJvZHlCKSByZXR1cm47XHJcbiAgICAgIHRoaXMuaXNDcmFzaGVkID0gKGJvZHlBID09PSB0aGlzLnBhcnRzLmhlYWQgfHwgYm9keUIgPT09IHRoaXMucGFydHMuaGVhZCkgJiYgTWF0aC5tYXgoLi4uaW1wdWxzZS5ub3JtYWxJbXB1bHNlcykgPiA4O1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLmIyUGh5c2ljcy5vbignYmVnaW4tY29udGFjdCcsIChjb250YWN0OiBQbC5iMkNvbnRhY3QpID0+IHtcclxuICAgICAgY29uc3QgZml4dHVyZUE6IFBsLmIyRml4dHVyZSAmIFJ1YmVFbnRpdHkgPSBjb250YWN0LkdldEZpeHR1cmVBKCk7XHJcbiAgICAgIGNvbnN0IGZpeHR1cmVCOiBQbC5iMkZpeHR1cmUgJiBSdWJlRW50aXR5ID0gY29udGFjdC5HZXRGaXh0dXJlQigpO1xyXG4gICAgICBjb25zdCBib2R5QSA9IGZpeHR1cmVBLkdldEJvZHkoKTtcclxuICAgICAgY29uc3QgYm9keUIgPSBmaXh0dXJlQi5HZXRCb2R5KCk7XHJcblxyXG4gICAgICBpZiAoZml4dHVyZUEuSXNTZW5zb3IoKSAmJiAhdGhpcy5waWNrdXBzVG9Qcm9jZXNzLmhhcyhib2R5QSkgJiYgZml4dHVyZUEuY3VzdG9tUHJvcGVydGllc01hcD8ucGhhc2VyU2Vuc29yVHlwZSA9PT0gJ3BpY2t1cF9wcmVzZW50Jykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tcGlja3VwIEEnLCBmaXh0dXJlQS5uYW1lKTtcclxuICAgICAgICB0aGlzLnBpY2t1cHNUb1Byb2Nlc3MuYWRkKGJvZHlBKTtcclxuICAgICAgICAvLyBzZXRUaW1lb3V0KCgpID0+IGJvZHlBLlNldEVuYWJsZWQoZmFsc2UpKTsgLy8gY2Fubm90IGNoYW5nZSBib2RpZXMgd2l0aGluIGNvbnRhY3QgbGlzdGVuZXJzXHJcbiAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiB0aGlzLmIyUGh5c2ljcy53b3JsZC5EZXN0cm95Qm9keShib2R5QSkpO1xyXG4gICAgICB9IGVsc2UgaWYgKGZpeHR1cmVCLklzU2Vuc29yKCkgJiYgIXRoaXMucGlja3Vwc1RvUHJvY2Vzcy5oYXMoYm9keUIpICYmIGZpeHR1cmVCLmN1c3RvbVByb3BlcnRpZXNNYXA/LnBoYXNlclNlbnNvclR5cGUgPT09ICdwaWNrdXBfcHJlc2VudCcpIHtcclxuICAgICAgICB0aGlzLnBpY2t1cHNUb1Byb2Nlc3MuYWRkKGJvZHlCKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLXBpY2t1cCBCJywgZml4dHVyZUIubmFtZSk7XHJcbiAgICAgICAgLy8gc2V0VGltZW91dCgoKSA9PiBib2R5Qi5TZXRFbmFibGVkKGZhbHNlKSk7IC8vIGNhbm5vdCBjaGFuZ2UgYm9kaWVzIHdpdGhpbiBjb250YWN0IGxpc3RlbmVyc1xyXG4gICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUJvZHkoYm9keUIpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgKGZpeHR1cmVBLklzU2Vuc29yKCkgJiYgYm9keUEuSXNFbmFibGVkKCkgJiYgIXRoaXMuaWdub3JlZFNlbnNvckJvZGllcy5oYXMoYm9keUEpKSB7XHJcbiAgICAgIC8vICAgdGhpcy5pZ25vcmVkU2Vuc29yQm9kaWVzLmFkZChib2R5QSk7XHJcbiAgICAgIC8vICAgdGhpcy50b3RhbFRyaWNrU2NvcmUgKz0gMjU7XHJcbiAgICAgIC8vICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2NvbGxlY3RlZC1jb2luJywgYm9keUEpO1xyXG4gICAgICAvLyAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdzY29yZS1jaGFuZ2UnLCB0aGlzLnRvdGFsVHJpY2tTY29yZSk7XHJcbiAgICAgIC8vICAgc2V0VGltZW91dCgoKSA9PiBib2R5QS5TZXRFbmFibGVkKGZhbHNlKSk7IC8vIGNhbm5vdCBjaGFuZ2UgYm9kaWVzIHdpdGhpbiBjb250YWN0IGxpc3RlbmVyc1xyXG4gICAgICAvL1xyXG4gICAgICAvLyB9IGVsc2UgaWYgKGZpeHR1cmVCLklzU2Vuc29yKCkgJiYgYm9keUIuSXNFbmFibGVkKCkgJiYgIXRoaXMuaWdub3JlZFNlbnNvckJvZGllcy5oYXMoYm9keUIpKSB7XHJcbiAgICAgIC8vICAgdGhpcy5pZ25vcmVkU2Vuc29yQm9kaWVzLmFkZChib2R5Qik7XHJcbiAgICAgIC8vICAgLy8gdGhpcy5nYWluQm9vc3QoMSwgMC4yNSk7XHJcbiAgICAgIC8vICAgdGhpcy50b3RhbFRyaWNrU2NvcmUgKz0gMjU7XHJcbiAgICAgIC8vICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2NvbGxlY3RlZC1jb2luJywgYm9keUIpO1xyXG4gICAgICAvLyAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdzY29yZS1jaGFuZ2UnLCB0aGlzLnRvdGFsVHJpY2tTY29yZSk7XHJcbiAgICAgIC8vICAgc2V0VGltZW91dCgoKSA9PiBib2R5Qi5TZXRFbmFibGVkKGZhbHNlKSk7IC8vIGNhbm5vdCBjaGFuZ2UgYm9kaWVzIHdpdGhpbiBjb250YWN0IGxpc3RlbmVyc1xyXG4gICAgICAvLyB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLnBpY2t1cHNUb1Byb2Nlc3Muc2l6ZSAmJiBjb25zb2xlLmxvZygncGlja3VwcycsIHRoaXMucGlja3Vwc1RvUHJvY2Vzcy5zaXplKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGJvZHkgb2YgdGhpcy5waWNrdXBzVG9Qcm9jZXNzKSB7XHJcbiAgICAgIGNvbnN0IGltZzogUGguR2FtZU9iamVjdHMuSW1hZ2UgPSBib2R5LkdldFVzZXJEYXRhKCk7XHJcbiAgICAgIHRoaXMuYjJQaHlzaWNzLndvcmxkLkRlc3Ryb3lCb2R5KGJvZHkpO1xyXG4gICAgICBpbWcuZGVzdHJveSgpO1xyXG4gICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgncGlja3VwX3ByZXNlbnQnKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBpY2t1cHNUb1Byb2Nlc3MuY2xlYXIoKTtcclxuICAgIGNvbnN0IGlzSW5BaXIgPSB0aGlzLnBsYXllckNvbnRyb2xsZXIuYm9hcmQuaXNJbkFpcigpO1xyXG4gICAgaWYgKHRoaXMuc3RhdGUgIT09ICdjcmFzaGVkJyAmJiB0aGlzLmlzQ3Jhc2hlZCkgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2VudGVyLWNyYXNoZWQnKTtcclxuICAgIGlmICh0aGlzLnN0YXRlID09PSAnZ3JvdW5kZWQnICYmIGlzSW5BaXIgJiYgIXRoaXMuaXNDcmFzaGVkKSB0aGlzLnBsYXllckNvbnRyb2xsZXIuc2NlbmUub2JzZXJ2ZXIuZW1pdCgnZW50ZXItaW4tYWlyJyk7XHJcbiAgICBlbHNlIGlmICh0aGlzLnN0YXRlID09PSAnaW4tYWlyJyAmJiAhaXNJbkFpciAmJiAhdGhpcy5pc0NyYXNoZWQpIHRoaXMucGxheWVyQ29udHJvbGxlci5zY2VuZS5vYnNlcnZlci5lbWl0KCdlbnRlci1ncm91bmRlZCcpO1xyXG4gICAgdGhpcy51cGRhdGVUcmlja0NvdW50ZXIoKTtcclxuICAgIHRoaXMudXBkYXRlQ29tYm9MZWV3YXkoKTtcclxuICAgIHRoaXMudXBkYXRlRGlzdGFuY2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlVHJpY2tDb3VudGVyKCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coJy0tLS0tc3RhdGUnLCB0aGlzLnN0YXRlKTtcclxuICAgIGlmICh0aGlzLnN0YXRlID09PSAnaW4tYWlyJykge1xyXG4gICAgICBjb25zdCBjdXJyZW50QW5nbGUgPSBQaC5NYXRoLkFuZ2xlLk5vcm1hbGl6ZSh0aGlzLnBhcnRzLmJvZHkuR2V0QW5nbGUoKSk7XHJcblxyXG4gICAgICBjb25zdCBkaWZmID0gdGhpcy5jYWxjdWxhdGVEaWZmZXJlbmNlQmV0d2VlbkFuZ2xlcyh0aGlzLmFuZ2xlUHJldmlvdXNVcGRhdGUsIGN1cnJlbnRBbmdsZSk7XHJcbiAgICAgIHRoaXMudG90YWxSb3RhdGlvbiArPSBkaWZmO1xyXG4gICAgICB0aGlzLmN1cnJlbnRGbGlwUm90YXRpb24gKz0gZGlmZjtcclxuICAgICAgdGhpcy5hbmdsZVByZXZpb3VzVXBkYXRlID0gY3VycmVudEFuZ2xlO1xyXG5cclxuICAgICAgaWYgKHRoaXMuY3VycmVudEZsaXBSb3RhdGlvbiA+PSBNYXRoLlBJICogKHRoaXMucGVuZGluZ0Zyb250RmxpcHMgPT09IDAgPyAxLjI1IDogMikpIHtcclxuICAgICAgICB0aGlzLnBlbmRpbmdGcm9udEZsaXBzKys7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RmxpcFJvdGF0aW9uID0gMDtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmN1cnJlbnRGbGlwUm90YXRpb24gPD0gTWF0aC5QSSAqIC0odGhpcy5wZW5kaW5nQmFja0ZsaXBzID09PSAwID8gMS4yNSA6IDIpKSB7XHJcbiAgICAgICAgdGhpcy5wZW5kaW5nQmFja0ZsaXBzKys7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RmxpcFJvdGF0aW9uID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVDb21ib0xlZXdheSgpIHtcclxuICAgIGlmICh0aGlzLmNvbWJvTGVld2F5VHdlZW4uaXNQbGF5aW5nKCkgfHwgdGhpcy5jb21ib0xlZXdheVR3ZWVuLmlzUGF1c2VkKCkpIHtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUgPT09ICdpbi1haXInIHx8ICF0aGlzLnBsYXllckNvbnRyb2xsZXIuYm9hcmQuaXNDZW50ZXJHcm91bmRlZCkge1xyXG4gICAgICAgIHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY29tYm9MZWV3YXlUd2Vlbi5yZXN1bWUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gYmFzZWQgb246IGh0dHBzOi8vd3d3LmNvbnN0cnVjdC5uZXQvZW4vZm9ydW0vY29uc3RydWN0LTIvaG93LWRvLWktMTgvY291bnQtcm90YXRpb25zLTQ2Njc0XHJcbiAgLy8gaHR0cDovL2Jsb2cubGV4aXF1ZS1kdS1uZXQuY29tL2luZGV4LnBocD9wb3N0L0NhbGN1bGF0ZS10aGUtcmVhbC1kaWZmZXJlbmNlLWJldHdlZW4tdHdvLWFuZ2xlcy1rZWVwaW5nLXRoZS1zaWduXHJcbiAgcHJpdmF0ZSBjYWxjdWxhdGVEaWZmZXJlbmNlQmV0d2VlbkFuZ2xlcyhmaXJzdEFuZ2xlOiBudW1iZXIsIHNlY29uZEFuZ2xlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgbGV0IGRpZmZlcmVuY2UgPSBzZWNvbmRBbmdsZSAtIGZpcnN0QW5nbGU7XHJcbiAgICBpZiAoZGlmZmVyZW5jZSA8IC1NYXRoLlBJKSBkaWZmZXJlbmNlICs9IE1hdGguUEkgKiAyO1xyXG4gICAgZWxzZSBpZiAoZGlmZmVyZW5jZSA+IE1hdGguUEkpIGRpZmZlcmVuY2UgLT0gTWF0aC5QSSAqIDI7XHJcbiAgICByZXR1cm4gZGlmZmVyZW5jZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlRGlzdGFuY2UoKSB7XHJcbiAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuZ2V0VHJhdmVsRGlzdGFuY2VNZXRlcnMoKTtcclxuICAgIGlmIChkaXN0YW5jZSAhPT0gdGhpcy5sYXN0RGlzdGFuY2UpIHtcclxuICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyLnNjZW5lLm9ic2VydmVyLmVtaXQoJ2Rpc3RhbmNlLWNoYW5nZScsIGRpc3RhbmNlKTtcclxuICAgICAgdGhpcy5sYXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgUGggZnJvbSAncGhhc2VyJztcclxuaW1wb3J0ICogYXMgUGwgZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQge1BoeXNpY3N9IGZyb20gJy4vUGh5c2ljcyc7XHJcbmltcG9ydCBHYW1lU2NlbmUgZnJvbSAnLi4vc2NlbmVzL0dhbWVTY2VuZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXJyYWluIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHRlcnJhaW5Cb2R5OiBQbC5iMkJvZHk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjaHVua3M6IFBoLkdhbWVPYmplY3RzLkdyYXBoaWNzW107XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NlbmU6IEdhbWVTY2VuZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGxheWVycyA9IFtcclxuICAgIHsgY29sb3I6IDB4QzhFMUVCLCB3aWR0aDogNSB9LCAvLyB0b3AgbGF5ZXIgb2Ygc25vd1xyXG4gICAgeyBjb2xvcjogMHg1YzhkYzksIHdpZHRoOiAyMiB9LFxyXG4gICAgeyBjb2xvcjogMHgyMjNCN0IsIHdpZHRoOiAxMCB9LFxyXG4gICAgeyBjb2xvcjogMHgyZDJjMmMsIHdpZHRoOiA1IH0sXHJcbiAgICB7IGNvbG9yOiAweDNhMzIzMiwgd2lkdGg6IDI1MCB9LFxyXG4gIF07XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9pbnRzUG9vbDogUGwuWFlbXSA9IFtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmVjMlBvb2w6IFBsLmIyVmVjMltdID0gW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjZW5lOiBHYW1lU2NlbmUsIHBoeXNpY3M6IFBoeXNpY3MpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuYjJQaHlzaWNzID0gcGh5c2ljcztcclxuXHJcbiAgICBjb25zdCBwb29sU2l6ZSA9IDI1MDA7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvb2xTaXplOyBpKyspIHRoaXMucG9pbnRzUG9vbC5wdXNoKHt4OiAwLCB5OiAwfSk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvb2xTaXplOyBpKyspIHRoaXMudmVjMlBvb2wucHVzaChuZXcgUGwuYjJWZWMyKDAsIDApKTtcclxuXHJcbiAgICB0aGlzLmNodW5rcyA9IFtcclxuICAgICAgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKS5zZXREZXB0aCgxMCksXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgICAgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKS5zZXREZXB0aCgxMCksXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgICB0aGlzLnNjZW5lLmFkZC5ncmFwaGljcygpLnNldERlcHRoKDEwKSxcclxuICAgICAgdGhpcy5zY2VuZS5hZGQuZ3JhcGhpY3MoKS5zZXREZXB0aCgxMCksXHJcbiAgICAgIHRoaXMuc2NlbmUuYWRkLmdyYXBoaWNzKCkuc2V0RGVwdGgoMTApLFxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnRlcnJhaW5Cb2R5ID0gdGhpcy5iMlBoeXNpY3Mud29ybGQuQ3JlYXRlQm9keSgpO1xyXG4gICAgY29uc3QgcG9zID0gdGhpcy50ZXJyYWluQm9keS5HZXRQb3NpdGlvbigpO1xyXG5cclxuICAgIGNvbnN0IHAgPSB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkoJ2Jvb2wnLCAncGhhc2VyVGVycmFpbicsIHRydWUpWzBdO1xyXG4gICAgY29uc3QgZml4ID0gcC5HZXRGaXh0dXJlTGlzdCgpPy5HZXRTaGFwZSgpIGFzIFBsLmIyQ2hhaW5TaGFwZTtcclxuICAgIHRoaXMuZHJhd1RlcnJhaW4oZml4Lm1fdmVydGljZXMubWFwKHYgPT4gKHt4OiAodi54ICsgcG9zLngpICogdGhpcy5iMlBoeXNpY3Mud29ybGRTY2FsZSwgeTogLSh2LnkgKyBwb3MueSkgKiB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlfSkpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZHJhd1RlcnJhaW4ocG9pbnRzOiBQbC5YWVtdKTogdm9pZCB7XHJcbiAgICBjb25zdCBjaHVuayA9IHRoaXMuY2h1bmtzLnNoaWZ0KCk7XHJcbiAgICBpZiAoIWNodW5rKSByZXR1cm47XHJcbiAgICB0aGlzLmNodW5rcy5wdXNoKGNodW5rKTtcclxuICAgIGNodW5rLmNsZWFyKCk7XHJcblxyXG4gICAgY29uc3QgbGFzdEluZGV4ID0gcG9pbnRzLmxlbmd0aCAtIDE7XHJcbiAgICBjb25zdCBlbmQgPSBNYXRoLm1heChwb2ludHNbMF0ueSwgcG9pbnRzW2xhc3RJbmRleF0ueSkgKyB0aGlzLnNjZW5lLmNhbWVyYXMubWFpbi5oZWlnaHQgKiAyO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICBwb2ludHMucHVzaCh7eDogcG9pbnRzW2xhc3RJbmRleF0ueCwgeTogZW5kfSwge3g6IHBvaW50c1swXS54LCB5OiBlbmR9KTtcclxuICAgIGZvciAoY29uc3Qge2NvbG9yLCB3aWR0aH0gb2YgdGhpcy5sYXllcnMpIHtcclxuICAgICAgY2h1bmsudHJhbnNsYXRlQ2FudmFzKDAsIG9mZnNldCk7XHJcbiAgICAgIGNodW5rLmZpbGxTdHlsZShjb2xvcik7XHJcbiAgICAgIGNodW5rLmZpbGxQb2ludHMocG9pbnRzLCB0cnVlLCB0cnVlKTtcclxuICAgICAgY2h1bmsudHJhbnNsYXRlQ2FudmFzKDAsIDApO1xyXG4gICAgICBvZmZzZXQgPSB3aWR0aCAqIDAuNTtcclxuICAgIH1cclxuXHJcbiAgICBwb2ludHMubGVuZ3RoIC09IDI7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCAqIGFzIFBoIGZyb20gJ3BoYXNlcic7XHJcbmltcG9ydCBQcmVsb2FkU2NlbmUgZnJvbSAnLi9zY2VuZXMvUHJlbG9hZFNjZW5lJztcclxuaW1wb3J0IEdhbWVTY2VuZSBmcm9tICcuL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5pbXBvcnQgR2FtZVN0YXRzIGZyb20gJ2dhbWVzdGF0cy5qcyc7XHJcbmltcG9ydCBHYW1lVUlTY2VuZSBmcm9tICcuL3NjZW5lcy9HYW1lVUlTY2VuZSc7XHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9XSURUSCA9IDEyODA7XHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0hFSUdIVCA9IDcyMDtcclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfWk9PTSA9IDE7XHJcbmV4cG9ydCBjb25zdCBSRVNPTFVUSU9OX1NDQUxFID0gMTtcclxuXHJcblxyXG5leHBvcnQgY29uc3QgZ2FtZUNvbmZpZzogUGguVHlwZXMuQ29yZS5HYW1lQ29uZmlnID0ge1xyXG4gIHRpdGxlOiAnU25vd2JvYXJkaW5nIEdhbWUnLFxyXG4gIHZlcnNpb246ICcxLjAuMCcsXHJcbiAgdHlwZTogUGguV0VCR0wsXHJcbiAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgZGlzYWJsZUNvbnRleHRNZW51OiB0cnVlLFxyXG4gIGZwczoge1xyXG4gICAgbWluOiA1MCxcclxuICAgIHRhcmdldDogNjAsXHJcbiAgICBzbW9vdGhTdGVwOiB0cnVlLFxyXG4gIH0sXHJcbiAgLy8gcm91bmRQaXhlbHM6IHRydWUsXHJcbiAgLy8gcGl4ZWxBcnQ6IHRydWUsXHJcbiAgc2NhbGU6IHtcclxuICAgIHBhcmVudDogJ3BoYXNlci13cmFwcGVyJyxcclxuICAgIG1vZGU6IFBoLlNjYWxlLkZJVCxcclxuICAgIGF1dG9DZW50ZXI6IFBoLlNjYWxlLkNFTlRFUl9CT1RILFxyXG4gICAgd2lkdGg6IERFRkFVTFRfV0lEVEggKiBSRVNPTFVUSU9OX1NDQUxFLFxyXG4gICAgaGVpZ2h0OiBERUZBVUxUX0hFSUdIVCAqIFJFU09MVVRJT05fU0NBTEUsXHJcbiAgfSxcclxuICBzY2VuZTogW1ByZWxvYWRTY2VuZSwgR2FtZVNjZW5lLCBHYW1lVUlTY2VuZV0sXHJcbn07XHJcblxyXG5jb25zdCBjb25maWcgPSB7XHJcbiAgYXV0b1BsYWNlOiB0cnVlLCAvKiBhdXRvIHBsYWNlIGluIHRoZSBkb20gKi9cclxuICB0YXJnZXRGUFM6IDYwLCAvKiB0aGUgdGFyZ2V0IG1heCBGUFMgKi9cclxuICByZWRyYXdJbnRlcnZhbDogMjAwLCAvKiB0aGUgaW50ZXJ2YWwgaW4gTVMgZm9yIHJlZHJhd2luZyB0aGUgRlBTIGdyYXBoICovXHJcbiAgbWF4aW11bUhpc3Rvcnk6IDIwMCwgLyogdGhlIGxlbmd0aCBvZiB0aGUgdmlzdWFsIGdyYXBoIGhpc3RvcnkgaW4gZnJhbWVzICovXHJcbiAgc2NhbGU6IDEsIC8qIHRoZSBzY2FsZSBvZiB0aGUgY2FudmFzICovXHJcbiAgbWVtb3J5VXBkYXRlSW50ZXJ2YWw6IDEwMCwgLyogdGhlIGludGVydmFsIGZvciBtZWFzdXJpbmcgdGhlIG1lbW9yeSAqL1xyXG4gIG1lbW9yeU1heEhpc3Rvcnk6IDYwICogMTAsIC8qIHRoZSBtYXggYW1vdW50IG9mIG1lbW9yeSBtZWFzdXJlcyAqL1xyXG5cclxuICAvLyBTdHlsaW5nIHByb3BzXHJcbiAgRk9OVF9GQU1JTFk6ICdBcmlhbCcsXHJcbiAgQ09MT1JfRlBTX0JBUjogJyMzNGNmYTInLFxyXG4gIENPTE9SX0ZQU19BVkc6ICcjRkZGJyxcclxuICBDT0xPUl9URVhUX0xBQkVMOiAnI0ZGRicsXHJcbiAgQ09MT1JfVEVYVF9UT19MT1c6ICcjZWVlMjA3JyxcclxuICBDT0xPUl9URVhUX0JBRDogJyNkMzQ2NDYnLFxyXG4gIENPTE9SX1RFWFRfVEFSR0VUOiAnI2QyNDlkZCcsXHJcbiAgQ09MT1JfQkc6ICcjMzMzMzMzJyxcclxufTtcclxuXHJcbmV4cG9ydCBsZXQgc3RhdHM6IEdhbWVTdGF0cztcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgY29uc3QgZ2FtZSA9IG5ldyBQaC5HYW1lKGdhbWVDb25maWcpO1xyXG4gIHN0YXRzID0gbmV3IEdhbWVTdGF0cyhjb25maWcpO1xyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3RhdHMuZG9tKTtcclxufSk7XHJcbiIsImltcG9ydCAqIGFzIFBoIGZyb20gJ3BoYXNlcic7XHJcbmltcG9ydCAqIGFzIFBsIGZyb20gJ0Bib3gyZC9jb3JlJztcclxuaW1wb3J0IFRlcnJhaW4gZnJvbSAnLi4vY29tcG9uZW50cy9UZXJyYWluJztcclxuaW1wb3J0IHtQaHlzaWNzfSBmcm9tICcuLi9jb21wb25lbnRzL1BoeXNpY3MnO1xyXG5pbXBvcnQge0RFRkFVTFRfV0lEVEgsIERFRkFVTFRfWk9PTSwgc3RhdHN9IGZyb20gJy4uL2luZGV4JztcclxuaW1wb3J0IEdhbWVVSVNjZW5lIGZyb20gJy4vR2FtZVVJU2NlbmUnO1xyXG5pbXBvcnQge0JhY2tkcm9wfSBmcm9tICcuLi9jb21wb25lbnRzL0JhY2tkcm9wJztcclxuaW1wb3J0IHtQbGF5ZXJDb250cm9sbGVyfSBmcm9tICcuLi9jb21wb25lbnRzL1BsYXllckNvbnRyb2xsZXInO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVTY2VuZSBleHRlbmRzIFBoLlNjZW5lIHtcclxuICByZWFkb25seSBvYnNlcnZlcjogUGhhc2VyLkV2ZW50cy5FdmVudEVtaXR0ZXIgPSBuZXcgUGguRXZlbnRzLkV2ZW50RW1pdHRlcigpO1xyXG4gIHByaXZhdGUgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG4gIHByaXZhdGUgdGVycmFpbjogVGVycmFpbjtcclxuICBwcml2YXRlIHBsYXllckNvbnRyb2xsZXI6IFBsYXllckNvbnRyb2xsZXI7XHJcbiAgcHJpdmF0ZSBiYWNrZHJvcDogQmFja2Ryb3A7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoe2tleTogJ0dhbWVTY2VuZSd9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlKCkge1xyXG4gICAgdGhpcy5jYW1lcmFzLm1haW4uc2V0RGVhZHpvbmUoNTAsIDEyNSk7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zZXRCYWNrZ3JvdW5kQ29sb3IoMHg1NTU1NTUpO1xyXG4gICAgY29uc3QgcmVzb2x1dGlvbk1vZCA9IHRoaXMuY2FtZXJhcy5tYWluLndpZHRoIC8gREVGQVVMVF9XSURUSDtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnNldFpvb20oREVGQVVMVF9aT09NICogcmVzb2x1dGlvbk1vZCk7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5zY3JvbGxYIC09IHRoaXMuY2FtZXJhcy5tYWluLndpZHRoIC8gMjtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnNjcm9sbFkgLT0gdGhpcy5jYW1lcmFzLm1haW4uaGVpZ2h0IC8gMjtcclxuXHJcbiAgICB0aGlzLmIyUGh5c2ljcyA9IG5ldyBQaHlzaWNzKHRoaXMsIDQwLCBuZXcgUGwuYjJWZWMyKDAsIC0xMCkpO1xyXG4gICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyID0gbmV3IFBsYXllckNvbnRyb2xsZXIodGhpcywgdGhpcy5iMlBoeXNpY3MpO1xyXG4gICAgdGhpcy50ZXJyYWluID0gbmV3IFRlcnJhaW4odGhpcywgdGhpcy5iMlBoeXNpY3MpO1xyXG5cclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnN0YXJ0Rm9sbG93KHRoaXMuYjJQaHlzaWNzLnJ1YmVMb2FkZXIuZ2V0Qm9kaWVzQnlDdXN0b21Qcm9wZXJ0eSgnYm9vbCcsICdwaGFzZXJDYW1lcmFGb2xsb3cnLCB0cnVlKVswXS5HZXRVc2VyRGF0YSgpIGFzIFBoYXNlci5HYW1lT2JqZWN0cy5JbWFnZSwgZmFsc2UsIDAuOCwgMC4yNSk7XHJcbiAgICB0aGlzLmNhbWVyYXMubWFpbi5mb2xsb3dPZmZzZXQuc2V0KC0zNzUsIDApO1xyXG5cclxuICAgIHRoaXMuc2NlbmUubGF1bmNoKEdhbWVVSVNjZW5lLm5hbWUsIFt0aGlzLm9ic2VydmVyLCAoKSA9PiB0aGlzLnNjZW5lLnJlc3RhcnQoKV0pO1xyXG5cclxuICAgIHRoaXMuYmFja2Ryb3AgPSBuZXcgQmFja2Ryb3AodGhpcyk7XHJcblxyXG4gICAgY29uc3QgZ3JhcGhpY3MgPSB0aGlzLmFkZC5ncmFwaGljcygpO1xyXG4gICAgZ3JhcGhpY3MubGluZVN0eWxlKDUsIDB4MDQ4NzA4LCAxLjApO1xyXG4gICAgZ3JhcGhpY3MuYmVnaW5QYXRoKCk7XHJcbiAgICBncmFwaGljcy5tb3ZlVG8oMCwgMCk7XHJcbiAgICBncmFwaGljcy5saW5lVG8oNDAsIDApO1xyXG4gICAgZ3JhcGhpY3MuY2xvc2VQYXRoKCk7XHJcbiAgICBncmFwaGljcy5zZXREZXB0aCgxMDAwKTtcclxuICAgIGdyYXBoaWNzLnN0cm9rZVBhdGgoKTtcclxuXHJcbiAgICBncmFwaGljcy5saW5lU3R5bGUoNSwgMHhiYTBiMjgsIDEuMCk7XHJcbiAgICBncmFwaGljcy5iZWdpblBhdGgoKTtcclxuICAgIGdyYXBoaWNzLm1vdmVUbygwLCAwKTtcclxuICAgIGdyYXBoaWNzLmxpbmVUbygwLCA0MCk7XHJcbiAgICBncmFwaGljcy5jbG9zZVBhdGgoKTtcclxuICAgIGdyYXBoaWNzLnNldERlcHRoKDEwMDApO1xyXG4gICAgZ3JhcGhpY3Muc3Ryb2tlUGF0aCgpO1xyXG5cclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ2VudGVyLWNyYXNoZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuY2FtZXJhcy5tYWluLnNoYWtlKDIwMCwgMC4wMSk7XHJcbiAgICAgIHRoaXMuYjJQaHlzaWNzLmVudGVyQnVsbGV0VGltZSgtMSwgMC40KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgc3RhdHMuYmVnaW4oKTtcclxuICAgIGNvbnN0IGRlbHRhID0gdGhpcy5nYW1lLmxvb3AuZGVsdGEgLyAxMDAwO1xyXG4gICAgdGhpcy5iMlBoeXNpY3MudXBkYXRlKCk7IC8vIG5lZWRzIHRvIGhhcHBlbiBiZWZvcmUgdXBkYXRlIG9mIHNub3dtYW4gb3RoZXJ3aXNlIGIyQm9keS5HZXRQb3NpdGlvbigpIGluYWNjdXJhdGVcclxuICAgIHRoaXMucGxheWVyQ29udHJvbGxlci51cGRhdGUoZGVsdGEpO1xyXG4gICAgdGhpcy5iYWNrZHJvcC51cGRhdGUoKTtcclxuICAgIHN0YXRzLmVuZCgpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgKiBhcyBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQge0RFRkFVTFRfV0lEVEh9IGZyb20gJy4uL2luZGV4JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVVSVNjZW5lIGV4dGVuZHMgUGguU2NlbmUge1xyXG4gIHByaXZhdGUgb2JzZXJ2ZXI6IFBoYXNlci5FdmVudHMuRXZlbnRFbWl0dGVyO1xyXG4gIHByaXZhdGUgcmVzdGFydEdhbWU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHByaXZhdGUgcGxheUFnYWluQnV0dG9uOiBQaGFzZXIuR2FtZU9iamVjdHMuQml0bWFwVGV4dDtcclxuICBwcml2YXRlIG11c2ljOiBQaGFzZXIuU291bmQuQmFzZVNvdW5kO1xyXG4gIHByaXZhdGUgc2Z4X2p1bXBfc3RhcnQ6IFBoYXNlci5Tb3VuZC5CYXNlU291bmQ7XHJcbiAgcHJpdmF0ZSBzZnhfcGlja3VwX3ByZXNlbnQ6IFBoYXNlci5Tb3VuZC5CYXNlU291bmQ7XHJcblxyXG4gIHByaXZhdGUgdGV4dERpc3RhbmNlOiBQaGFzZXIuR2FtZU9iamVjdHMuQml0bWFwVGV4dDtcclxuICBwcml2YXRlIHRleHRDb21ibzogUGhhc2VyLkdhbWVPYmplY3RzLkJpdG1hcFRleHQ7XHJcbiAgcHJpdmF0ZSB0ZXh0U2NvcmU6IFBoYXNlci5HYW1lT2JqZWN0cy5CaXRtYXBUZXh0O1xyXG4gIHByaXZhdGUgY29tYm9MZWV3YXlDaGFydDogUGguR2FtZU9iamVjdHMuR3JhcGhpY3M7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoe2tleTogJ0dhbWVVSVNjZW5lJ30pO1xyXG4gIH1cclxuXHJcbiAgaW5pdChbb2JzZXJ2ZXIsIHJlc3RhcnRHYW1lQ0JdOiBbUGguRXZlbnRzLkV2ZW50RW1pdHRlciwgKCkgPT4gdm9pZF0pIHtcclxuICAgIHRoaXMub2JzZXJ2ZXIgPSBvYnNlcnZlcjtcclxuICAgIHRoaXMucmVzdGFydEdhbWUgPSByZXN0YXJ0R2FtZUNCO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlKCkge1xyXG4gICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tdWkgc2NlbmUgY3JlYXRlJyk7XHJcbiAgICBkZWJ1Z2dlcjtcclxuICAgIHRoaXMuY2FtZXJhcy5tYWluLnNldFJvdW5kUGl4ZWxzKHRydWUpO1xyXG4gICAgY29uc3QgcmVzb2x1dGlvbk1vZCA9IHRoaXMuZ2FtZS5jYW52YXMud2lkdGggLyBERUZBVUxUX1dJRFRIO1xyXG5cclxuICAgIC8vIGNvbnN0IHJlc29sdXRpb25Nb2RpZmllciA9IHRoaXMuZ2FtZS5jYW52YXMud2lkdGggPT09IERFRkFVTFRfV0lEVEggPyAxIDogMC41O1xyXG4gICAgY29uc3QgRk9OVFNJWkVfVElUTEUgPSAyMCAqIHJlc29sdXRpb25Nb2Q7XHJcbiAgICBjb25zdCBGT05UU0laRV9WQUxVRSA9IDE4ICogcmVzb2x1dGlvbk1vZDtcclxuICAgIGNvbnN0IEZPTlRTSVpFX0JVVFRPTiA9IDI0ICogcmVzb2x1dGlvbk1vZDtcclxuICAgIGNvbnN0IFBBRERJTkcgPSA0ICogcmVzb2x1dGlvbk1vZDtcclxuXHJcbiAgICAvLyB0aGlzLm11c2ljID0gdGhpcy5zb3VuZC5hZGQoJ3htYXNfc3ludGgnLCB7bG9vcDogdHJ1ZSwgdm9sdW1lOiAwLjIsIHJhdGU6IDAuODUsIGRlbGF5OiAxLCBkZXR1bmU6IC0xMDB9KTtcclxuICAgIHRoaXMubXVzaWMgPSB0aGlzLnNvdW5kLmFkZCgncml2ZXJzaWRlX3JpZGUnLCB7bG9vcDogdHJ1ZSwgdm9sdW1lOiAwLjIsIHJhdGU6IDAuOTUsIGRlbGF5OiAxLCBkZXR1bmU6IDB9KTtcclxuICAgIHRoaXMubXVzaWMucGxheSgpO1xyXG5cclxuICAgIHRoaXMuc2Z4X2p1bXBfc3RhcnQgPSB0aGlzLnNvdW5kLmFkZCgnYm9pbmsnLCB7ZGV0dW5lOiAtMjAwfSk7XHJcbiAgICB0aGlzLnNmeF9waWNrdXBfcHJlc2VudCA9IHRoaXMuc291bmQuYWRkKCdwaWNrdXBfcHJlc2VudCcsIHtkZXR1bmU6IDEwMCwgcmF0ZTogMS4xfSk7XHJcblxyXG4gICAgY29uc3Qgc2NyZWVuQ2VudGVyWCA9IHRoaXMuY2FtZXJhcy5tYWluLndvcmxkVmlldy54ICsgdGhpcy5jYW1lcmFzLm1haW4ud2lkdGggLyAyO1xyXG4gICAgY29uc3Qgc2NyZWVuQ2VudGVyWSA9IHRoaXMuY2FtZXJhcy5tYWluLndvcmxkVmlldy55ICsgdGhpcy5jYW1lcmFzLm1haW4uaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAvLyB0aGlzLmJvb3N0QmFyID0gbmV3IEJvb3N0QmFyKHRoaXMsIHRoaXMub2JzZXJ2ZXIsIDEwLCAxMDApO1xyXG5cclxuICAgIHRoaXMucGxheUFnYWluQnV0dG9uID0gdGhpcy5hZGQuYml0bWFwVGV4dChzY3JlZW5DZW50ZXJYLCBzY3JlZW5DZW50ZXJZICogMS41LCAnYXRhcmktY2xhc3NpYycsICdQTEFZIEFHQUlOPycpXHJcbiAgICAuc2V0U2Nyb2xsRmFjdG9yKDApXHJcbiAgICAuc2V0Rm9udFNpemUoRk9OVFNJWkVfQlVUVE9OKVxyXG4gICAgLnNldE9yaWdpbigwLjUpXHJcbiAgICAuc2V0RHJvcFNoYWRvdygxLCAyLCAweDIyMjIyMilcclxuICAgIC5zZXRBbHBoYSgwKVxyXG4gICAgLnNldEludGVyYWN0aXZlKHt1c2VIYW5kQ3Vyc29yOiB0cnVlfSlcclxuICAgIC5vbigncG9pbnRlcmRvd24nLCAoKSA9PiB0aGlzLnBsYXlBZ2FpbigpKVxyXG4gICAgLm9uKCdwb2ludGVyb3ZlcicsICgpID0+IHRoaXMucGxheUFnYWluQnV0dG9uLnNldENoYXJhY3RlclRpbnQoMCwgLTEsIHRydWUsIDEwLCAxMCwgMTAsIDEwKSlcclxuICAgIC5vbigncG9pbnRlcm91dCcsICgpID0+IHRoaXMucGxheUFnYWluQnV0dG9uLnNldENoYXJhY3RlclRpbnQoMCwgLTEsIGZhbHNlLCAtMTAsIC0xMCwgLTEwLCAtMTApKTtcclxuICAgIC8vIGNvbnN0IGJvdW5kczEgPSB0aGlzLnBsYXlBZ2FpbkJ1dHRvbi5nZXRUZXh0Qm91bmRzKCk7XHJcbiAgICAvLyB0aGlzLmdyYXBoaWNzLmZpbGxSZWN0KGJvdW5kczEuZ2xvYmFsLngsIGJvdW5kczEuZ2xvYmFsLnksIGJvdW5kczEuZ2xvYmFsLndpZHRoLCBib3VuZHMxLmdsb2JhbC5oZWlnaHQpO1xyXG5cclxuICAgIHRoaXMuYWRkLmJpdG1hcFRleHQoNCwgNCwgJ2F0YXJpLWNsYXNzaWMnLCAnRElTVEFOQ0UnKS5zZXRTY3JvbGxGYWN0b3IoMCwgMCkuc2V0Rm9udFNpemUoRk9OVFNJWkVfVElUTEUpO1xyXG4gICAgdGhpcy50ZXh0RGlzdGFuY2UgPSB0aGlzLmFkZC5iaXRtYXBUZXh0KFBBRERJTkcgKiAxLjUsIEZPTlRTSVpFX1RJVExFICsgKFBBRERJTkcgKiAyKSwgJ2F0YXJpLWNsYXNzaWMnLCAnRGlzdGFuY2U6IDBtJykuc2V0U2Nyb2xsRmFjdG9yKDAsIDApLnNldEZvbnRTaXplKEZPTlRTSVpFX1ZBTFVFKTtcclxuXHJcbiAgICB0aGlzLmFkZC5iaXRtYXBUZXh0KHNjcmVlbkNlbnRlclgsIFBBRERJTkcsICdhdGFyaS1jbGFzc2ljJywgJ0NPTUJPJykuc2V0U2Nyb2xsRmFjdG9yKDAsIDApLnNldE9yaWdpbigwLjUsIDApLnNldEZvbnRTaXplKEZPTlRTSVpFX1RJVExFKTtcclxuICAgIHRoaXMudGV4dENvbWJvID0gdGhpcy5hZGQuYml0bWFwVGV4dChzY3JlZW5DZW50ZXJYLCBGT05UU0laRV9USVRMRSArIChQQURESU5HICogMiksICdhdGFyaS1jbGFzc2ljJywgJy0nKS5zZXRTY3JvbGxGYWN0b3IoMCwgMCkuc2V0Rm9udFNpemUoRk9OVFNJWkVfVkFMVUUpLnNldE9yaWdpbigwLjUsIDApO1xyXG5cclxuICAgIHRoaXMuYWRkLmJpdG1hcFRleHQoc2NyZWVuQ2VudGVyWCAqIDIgLSBQQURESU5HLCBQQURESU5HLCAnYXRhcmktY2xhc3NpYycsICdTQ09SRScpLnNldFNjcm9sbEZhY3RvcigwLCAwKS5zZXRPcmlnaW4oMSwgMCkuc2V0Rm9udFNpemUoRk9OVFNJWkVfVElUTEUpO1xyXG4gICAgdGhpcy50ZXh0U2NvcmUgPSB0aGlzLmFkZC5iaXRtYXBUZXh0KHNjcmVlbkNlbnRlclggKiAyIC0gUEFERElORywgRk9OVFNJWkVfVElUTEUgKyAoUEFERElORyAqIDIpLCAnYXRhcmktY2xhc3NpYycsICcwJykuc2V0U2Nyb2xsRmFjdG9yKDAsIDApLnNldEZvbnRTaXplKEZPTlRTSVpFX1ZBTFVFKS5zZXRPcmlnaW4oMSwgMCk7XHJcblxyXG4gICAgdGhpcy5vYnNlcnZlci5vbignanVtcF9zdGFydCcsICgpID0+IHRoaXMuc2Z4X2p1bXBfc3RhcnQucGxheSh7ZGVsYXk6IDAuMX0pKTtcclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ3BpY2t1cF9wcmVzZW50JywgKCkgPT4gdGhpcy5zZnhfcGlja3VwX3ByZXNlbnQucGxheSgpKTtcclxuXHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCdjb21iby1jaGFuZ2UnLCAoYWNjdW11bGF0ZWQsIG11bHRpcGxpZXIpID0+IHRoaXMudGV4dENvbWJvLnNldFRleHQoYWNjdW11bGF0ZWQgPyAoYWNjdW11bGF0ZWQgKyAneCcgKyBtdWx0aXBsaWVyKSA6ICctJykpO1xyXG4gICAgdGhpcy5vYnNlcnZlci5vbignc2NvcmUtY2hhbmdlJywgc2NvcmUgPT4gdGhpcy50ZXh0U2NvcmUuc2V0VGV4dChzY29yZSkpO1xyXG4gICAgdGhpcy5vYnNlcnZlci5vbignZGlzdGFuY2UtY2hhbmdlJywgZGlzdGFuY2UgPT4gdGhpcy50ZXh0RGlzdGFuY2Uuc2V0VGV4dChTdHJpbmcoZGlzdGFuY2UpICsgJ20nKSk7XHJcblxyXG4gICAgdGhpcy5jb21ib0xlZXdheUNoYXJ0ID0gdGhpcy5hZGQuZ3JhcGhpY3MoKTtcclxuXHJcbiAgICB0aGlzLm9ic2VydmVyLm9uKCdjb21iby1sZWV3YXktdXBkYXRlJywgKHZhbHVlKSA9PiB7XHJcbiAgICAgIHRoaXMuY29tYm9MZWV3YXlDaGFydFxyXG4gICAgICAuY2xlYXIoKVxyXG4gICAgICAuZmlsbFN0eWxlKDB4ZmZmZmZmKVxyXG4gICAgICAuc2xpY2Uoc2NyZWVuQ2VudGVyWCwgNzIgKiByZXNvbHV0aW9uTW9kLCAxMiAqIHJlc29sdXRpb25Nb2QsIHZhbHVlLCBNYXRoLlBJICogMS41KVxyXG4gICAgICAuZmlsbFBhdGgoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMub2JzZXJ2ZXIub24oJ2VudGVyLWNyYXNoZWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucGxheUFnYWluQnV0dG9uLnNldEFscGhhKDEpO1xyXG4gICAgICB0aGlzLnR3ZWVucy5hZGQoe1xyXG4gICAgICAgIHRhcmdldHM6IHRoaXMubXVzaWMsXHJcbiAgICAgICAgdm9sdW1lOiAwLjAsXHJcbiAgICAgICAgZGV0dW5lOiAtNTAwLFxyXG4gICAgICAgIHJhdGU6IDAuNSxcclxuICAgICAgICBkdXJhdGlvbjogMzAwMCxcclxuICAgICAgICBvbkNvbXBsZXRlOiB0d2VlbiA9PiB0aGlzLm11c2ljLnN0b3AoKSxcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZSgpIHtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGxheUFnYWluKCkge1xyXG4gICAgdGhpcy5tdXNpYy5zdG9wKCk7XHJcbiAgICB0aGlzLnJlc3RhcnRHYW1lKCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7REVGQVVMVF9IRUlHSFQsIERFRkFVTFRfV0lEVEgsIFJFU09MVVRJT05fU0NBTEV9IGZyb20gJy4uL2luZGV4JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByZWxvYWRTY2VuZSBleHRlbmRzIFBoYXNlci5TY2VuZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcih7a2V5OiAnUHJlbG9hZFNjZW5lJ30pO1xyXG4gIH1cclxuXHJcbiAgcHJlbG9hZCgpIHtcclxuICAgIHRoaXMubG9hZC5hdWRpbygncml2ZXJzaWRlX3JpZGUnLCBbXHJcbiAgICAgICdhc3NldHMvYXVkaW8vcml2ZXJzaWRlX3JpZGUvcml2ZXJzaWRlX3JpZGUub2dnJyxcclxuICAgICAgJ2Fzc2V0cy9hdWRpby9yaXZlcnNpZGVfcmlkZS9yaXZlcnNpZGVfcmlkZS5tcDMnLFxyXG4gICAgXSk7XHJcblxyXG4gICAgLy8gVE9ETyBjb252ZXJ0IHdhdiB0byBvZ2csIG1wMyBhbmQgYWFjXHJcbiAgICB0aGlzLmxvYWQuYXVkaW8oJ2JvaW5rJywgW1xyXG4gICAgICAnYXNzZXRzL2F1ZGlvL3NmeC9ib2luay53YXYnLFxyXG4gICAgXSk7XHJcblxyXG4gICAgICAgIHRoaXMubG9hZC5hdWRpbygncGlja3VwX3ByZXNlbnQnLCBbXHJcbiAgICAgICdhc3NldHMvYXVkaW8vc2Z4L3BpY2t1cGdlbS53YXYnLFxyXG4gICAgXSk7XHJcblxyXG4gICAgdGhpcy5sb2FkLmpzb24oJ3NhbnRhJywgJ2Fzc2V0cy9zYW50YS12MDEuanNvbicpO1xyXG5cclxuICAgIGNvbnN0IHNpemUgPSBgJHtERUZBVUxUX1dJRFRIICogUkVTT0xVVElPTl9TQ0FMRX14JHtERUZBVUxUX0hFSUdIVCAqIFJFU09MVVRJT05fU0NBTEV9YDtcclxuICAgIHRoaXMubG9hZC5hdGxhcygnYmdfc3BhY2VfcGFjaycsIGBhc3NldHMvaW1nL3BhY2tlZC9iZ19zcGFjZV8ke3NpemV9LnBuZ2AsIGBhc3NldHMvaW1nL3BhY2tlZC9iZ19zcGFjZV8ke3NpemV9Lmpzb25gKTtcclxuXHJcbiAgICAvLyBUT0RPIGNyZWF0ZSBwYWNrZWQgZm9yIGV2ZXJ5dGhpbmcgbmVlZGVkXHJcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ2ljZV9zcGlrZXMnLCAnYXNzZXRzL2ltZy9vYnN0YWNsZXMvaWNlX3NwaWtlcy5wbmcnKTtcclxuICAgIHRoaXMubG9hZC5pbWFnZSgnc25vd3lfcm9jaycsICdhc3NldHMvaW1nL29ic3RhY2xlcy9zbm93eV9yb2NrLnBuZycpO1xyXG4gICAgdGhpcy5sb2FkLmltYWdlKCdwcmVzZW50X3RlbXAnLCAnYXNzZXRzL2ltZy9wcmVzZW50X3RlbXAucG5nJyk7XHJcbiAgICB0aGlzLmxvYWQuaW1hZ2UoJ3RyZWVfMDEucG5nJywgJ2Fzc2V0cy9pbWcvc3Znc2lsaC90cmVlXzAxLnBuZycpO1xyXG4gICAgdGhpcy5sb2FkLmltYWdlKCdjb3R0YWdlMi5wbmcnLCAnYXNzZXRzL2ltZy9zdmdzaWxoL2NvdHRhZ2UyLnBuZycpO1xyXG4gICAgdGhpcy5sb2FkLmltYWdlKCdzYW50YS1ib2FyZC5wbmcnLCAnYXNzZXRzL2ltZy9zYW50YV9wYXJ0c192MDEvc2FudGEtYm9hcmQucG5nJyk7XHJcblxyXG4gICAgdGhpcy5sb2FkLmF0bGFzKCdhdGxhcy1zYW50YScsIGBhc3NldHMvaW1nL3BhY2tlZC9jaGFyYWN0ZXItc2FudGEucG5nYCwgYGFzc2V0cy9pbWcvcGFja2VkL2NoYXJhY3Rlci1zYW50YS5qc29uYCk7XHJcbiAgICB0aGlzLmxvYWQuYml0bWFwRm9udCgnYXRhcmktY2xhc3NpYycsICdhc3NldHMvZm9udHMvYml0bWFwL2F0YXJpLWNsYXNzaWMucG5nJywgJ2Fzc2V0cy9mb250cy9iaXRtYXAvYXRhcmktY2xhc3NpYy54bWwnKTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZSgpIHtcclxuICAgIHRoaXMuc2NlbmUuc3RhcnQoJ0dhbWVTY2VuZScpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQge1BoeXNpY3N9IGZyb20gJy4uL2NvbXBvbmVudHMvUGh5c2ljcyc7XHJcbmltcG9ydCBQaCBmcm9tICdwaGFzZXInO1xyXG5pbXBvcnQgKiBhcyBQbCBmcm9tICdAYm94MmQvY29yZSc7XHJcbmltcG9ydCB7YjJCb2R5VHlwZX0gZnJvbSAnQGJveDJkL2NvcmUnO1xyXG5pbXBvcnQgR2FtZVNjZW5lIGZyb20gJy4uL3NjZW5lcy9HYW1lU2NlbmUnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEZWJ1Z01vdXNlSm9pbnQge1xyXG4gIHByaXZhdGUgbW91c2VKb2ludDogUGwuYjJNb3VzZUpvaW50IHwgbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSBzY2VuZTogR2FtZVNjZW5lO1xyXG4gIHByaXZhdGUgYjJQaHlzaWNzOiBQaHlzaWNzO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY2VuZTogR2FtZVNjZW5lLCBiMlBoeXNpY3M6IFBoeXNpY3MpIHtcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMuYjJQaHlzaWNzID0gYjJQaHlzaWNzO1xyXG5cclxuICAgIHRoaXMuc2NlbmUuaW5wdXQub24oJ3BvaW50ZXJkb3duJywgKHBvaW50ZXI6IFBoLklucHV0LlBvaW50ZXIpID0+IHRoaXMuTW91c2VEb3duKHt4OiBwb2ludGVyLndvcmxkWCAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIHk6IC1wb2ludGVyLndvcmxkWSAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGV9KSk7XHJcbiAgICB0aGlzLnNjZW5lLmlucHV0Lm9uKCdwb2ludGVydXAnLCAocG9pbnRlcjogUGguSW5wdXQuUG9pbnRlcikgPT4gdGhpcy5Nb3VzZVVwKHt4OiBwb2ludGVyLndvcmxkWCAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGUsIHk6IC1wb2ludGVyLndvcmxkWSAvIHRoaXMuYjJQaHlzaWNzLndvcmxkU2NhbGV9KSk7XHJcbiAgICB0aGlzLnNjZW5lLmlucHV0Lm9uKCdwb2ludGVybW92ZScsIChwb2ludGVyOiBQaC5JbnB1dC5Qb2ludGVyKSA9PiB0aGlzLk1vdXNlTW92ZSh7eDogcG9pbnRlci53b3JsZFggLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlLCB5OiAtcG9pbnRlci53b3JsZFkgLyB0aGlzLmIyUGh5c2ljcy53b3JsZFNjYWxlfSwgdHJ1ZSkpO1xyXG5cclxuICB9XHJcblxyXG4gIE1vdXNlTW92ZShwOiBQbC5YWSwgbGVmdERyYWc6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGlmIChsZWZ0RHJhZyAmJiB0aGlzLm1vdXNlSm9pbnQpIHtcclxuICAgICAgdGhpcy5tb3VzZUpvaW50LlNldFRhcmdldChwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE1vdXNlVXAocDogUGwuWFkpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm1vdXNlSm9pbnQpIHtcclxuICAgICAgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMubW91c2VKb2ludCk7XHJcbiAgICAgIHRoaXMubW91c2VKb2ludCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNb3VzZURvd24ocDogUGwuWFkpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm1vdXNlSm9pbnQpIHtcclxuICAgICAgdGhpcy5iMlBoeXNpY3Mud29ybGQuRGVzdHJveUpvaW50KHRoaXMubW91c2VKb2ludCk7XHJcbiAgICAgIHRoaXMubW91c2VKb2ludCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUXVlcnkgdGhlIHdvcmxkIGZvciBvdmVybGFwcGluZyBzaGFwZXMuXHJcbiAgICBsZXQgaGl0X2ZpeHR1cmU6IFBsLmIyRml4dHVyZSB8IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuYjJQaHlzaWNzLndvcmxkLlF1ZXJ5UG9pbnRBQUJCKHAsIChmaXh0dXJlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSBmaXh0dXJlLkdldEJvZHkoKTtcclxuICAgICAgaWYgKGJvZHkuR2V0VHlwZSgpID09PSBiMkJvZHlUeXBlLmIyX2R5bmFtaWNCb2R5ICYmIGZpeHR1cmUuVGVzdFBvaW50KHApKSB7XHJcbiAgICAgICAgaGl0X2ZpeHR1cmUgPSBmaXh0dXJlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gV2UgYXJlIGRvbmUsIHRlcm1pbmF0ZSB0aGUgcXVlcnkuXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7IC8vIENvbnRpbnVlIHRoZSBxdWVyeS5cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChoaXRfZml4dHVyZSkge1xyXG4gICAgICBjb25zdCBmcmVxdWVuY3lIeiA9IDU7XHJcbiAgICAgIGNvbnN0IGRhbXBpbmdSYXRpbyA9IDAuNTtcclxuXHJcbiAgICAgIGNvbnN0IGJvZHkgPSBoaXRfZml4dHVyZS5HZXRCb2R5KCk7XHJcbiAgICAgIGNvbnN0IGpkID0gbmV3IFBsLmIyTW91c2VKb2ludERlZigpO1xyXG4gICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gdHJ1ZTtcclxuICAgICAgamQuZGFtcGluZyA9IDAuMTtcclxuICAgICAgamQuYm9keUEgPSB0aGlzLmIyUGh5c2ljcy5ydWJlTG9hZGVyLmdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkoJ2Jvb2wnLCAncGhhc2VyVGVycmFpbicsIHRydWUpWzBdO1xyXG4gICAgICBqZC5ib2R5QiA9IGJvZHk7XHJcbiAgICAgIGpkLnRhcmdldC5Db3B5KHApO1xyXG4gICAgICBqZC5tYXhGb3JjZSA9IDcwMCAqIGJvZHkuR2V0TWFzcygpO1xyXG4gICAgICBQbC5iMkxpbmVhclN0aWZmbmVzcyhqZCwgZnJlcXVlbmN5SHosIGRhbXBpbmdSYXRpbywgamQuYm9keUEsIGpkLmJvZHlCKTtcclxuXHJcbiAgICAgIHRoaXMubW91c2VKb2ludCA9IHRoaXMuYjJQaHlzaWNzLndvcmxkLkNyZWF0ZUpvaW50KGpkKSBhcyBQbC5iMk1vdXNlSm9pbnQ7XHJcbiAgICAgIGJvZHkuU2V0QXdha2UodHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIi8qXHJcbiogIFIuVS5CLkUuIFNjZW5lIExvYWRlciBmb3IgUGhhc2VyMyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL2x1c2l0by9ib3gyZC50cy5cclxuKiBCYXNlZCBvbiBwcm92aWRlZCBleGFtcGxlIGJ5IENocmlzIENhbXBiZWxsOiBodHRwczovL3d3dy5pZm9yY2UyZC5uZXQvcnViZS9sb2FkZXJzL3J1YmUtcGhhc2VyLXNhbXBsZS56aXBcclxuKi9cclxuXHJcbmltcG9ydCAqIGFzIFBoIGZyb20gJ3BoYXNlcic7XHJcbmltcG9ydCAqIGFzIFBsIGZyb20gJ0Bib3gyZC9jb3JlJztcclxuaW1wb3J0IHtSdWJlQm9keSwgUnViZUZpeHR1cmUsIFJ1YmVFbnRpdHksIFJ1YmVTY2VuZSwgUnViZUpvaW50LCBSdWJlQ3VzdG9tUHJvcGVydHlUeXBlcywgUnViZUltYWdlLCBSdWJlVmVjdG9yLCBSdWJlQ3VzdG9tUHJvcGVydHl9IGZyb20gJy4vUnViZUxvYWRlckludGVyZmFjZXMnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBSdWJlTG9hZGVyIHtcclxuICBwcml2YXRlIHdvcmxkOiBQbC5iMldvcmxkO1xyXG4gIHByaXZhdGUgZGVidWdHcmFwaGljczogUGguR2FtZU9iamVjdHMuR3JhcGhpY3M7XHJcbiAgcHJpdmF0ZSBzY2VuZTogUGguU2NlbmU7XHJcbiAgcHJpdmF0ZSB3b3JsZFNpemU6IG51bWJlcjtcclxuXHJcbiAgbG9hZGVkQm9kaWVzOiAoUGwuYjJCb2R5IHwgbnVsbClbXTtcclxuICBsb2FkZWRKb2ludHM6IChQbC5iMkpvaW50IHwgbnVsbClbXTtcclxuICBsb2FkZWRJbWFnZXM6ICgoUGguR2FtZU9iamVjdHMuSW1hZ2UgJiBSdWJlRW50aXR5KSB8IG51bGwpW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKHdvcmxkOiBQbC5iMldvcmxkLCBkZWJ1Z0dyYXBoaWNzOiBQaC5HYW1lT2JqZWN0cy5HcmFwaGljcywgc2NlbmU6IFBoLlNjZW5lLCB3b3JsZFNpemU6IG51bWJlcikge1xyXG4gICAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG4gICAgdGhpcy5kZWJ1Z0dyYXBoaWNzID0gZGVidWdHcmFwaGljcztcclxuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcclxuICAgIHRoaXMud29ybGRTaXplID0gd29ybGRTaXplO1xyXG4gIH1cclxuXHJcbiAgbG9hZFNjZW5lKHNjZW5lOiBSdWJlU2NlbmUpOiBib29sZWFuIHtcclxuICAgIHRoaXMubG9hZGVkQm9kaWVzID0gc2NlbmUuYm9keSA/IHNjZW5lLmJvZHkubWFwKGJvZHlKc29uID0+IHRoaXMubG9hZEJvZHkoYm9keUpzb24pKSA6IFtdO1xyXG4gICAgdGhpcy5sb2FkZWRKb2ludHMgPSBzY2VuZS5qb2ludCA/IHNjZW5lLmpvaW50Lm1hcChqb2ludEpzb24gPT4gdGhpcy5sb2FkSm9pbnQoam9pbnRKc29uKSkgOiBbXTtcclxuICAgIHRoaXMubG9hZGVkSW1hZ2VzID0gc2NlbmUuaW1hZ2UgPyBzY2VuZS5pbWFnZS5tYXAoaW1hZ2VKc29uID0+IHRoaXMubG9hZEltYWdlKGltYWdlSnNvbikpIDogW107XHJcblxyXG4gICAgY29uc3Qgc3VjY2VzcyA9IHRoaXMubG9hZGVkQm9kaWVzLmV2ZXJ5KGIgPT4gYikgJiYgdGhpcy5sb2FkZWRKb2ludHMuZXZlcnkoaiA9PiBqKSAmJiB0aGlzLmxvYWRlZEltYWdlcy5ldmVyeShpID0+IGkpO1xyXG4gICAgc3VjY2Vzc1xyXG4gICAgICA/IGNvbnNvbGUubG9nKGBSLlUuQi5FLiBzY2VuZSBsb2FkZWQgc3VjY2Vzc2Z1bGx5YCwgdGhpcy5sb2FkZWRCb2RpZXMsIHRoaXMubG9hZGVkSm9pbnRzLCB0aGlzLmxvYWRlZEltYWdlcylcclxuICAgICAgOiBjb25zb2xlLmVycm9yKGBSLlUuQi5FLiBzY2VuZSBmYWlsZWQgdG8gbG9hZCBmdWxseWAsIHRoaXMubG9hZGVkQm9kaWVzLCB0aGlzLmxvYWRlZEpvaW50cywgdGhpcy5sb2FkZWRJbWFnZXMpO1xyXG4gICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxvYWRCb2R5KGJvZHlKc29uOiBSdWJlQm9keSk6IFBsLmIyQm9keSB8IG51bGwge1xyXG4gICAgY29uc3QgYmQ6IFBsLmIyQm9keURlZiA9IHt9O1xyXG4gICAgYmQudHlwZSA9IE1hdGgubWluKE1hdGgubWF4KGJvZHlKc29uLnR5cGUgfHwgMCwgMCksIDIpOyAvLyBjbGFtcCBiZXR3ZWVuIDAtMi5cclxuICAgIGJkLmFuZ2xlID0gYm9keUpzb24uYW5nbGUgfHwgMDtcclxuICAgIGJkLmFuZ3VsYXJWZWxvY2l0eSA9IGJvZHlKc29uLmFuZ3VsYXJWZWxvY2l0eSB8fCAwO1xyXG4gICAgYmQuYXdha2UgPSBCb29sZWFuKGJvZHlKc29uLmF3YWtlKTtcclxuICAgIGJkLmVuYWJsZWQgPSBib2R5SnNvbi5oYXNPd25Qcm9wZXJ0eSgnYWN0aXZlJykgPyBib2R5SnNvbi5hY3RpdmUgOiB0cnVlO1xyXG4gICAgYmQuZml4ZWRSb3RhdGlvbiA9IEJvb2xlYW4oYm9keUpzb24uZml4ZWRSb3RhdGlvbik7XHJcbiAgICBiZC5saW5lYXJWZWxvY2l0eSA9IHRoaXMucnViZVRvWFkoYm9keUpzb24ubGluZWFyVmVsb2NpdHkpO1xyXG4gICAgYmQubGluZWFyRGFtcGluZyA9IGJvZHlKc29uLmxpbmVhckRhbXBpbmcgfHwgMDtcclxuICAgIGJkLmFuZ3VsYXJEYW1waW5nID0gYm9keUpzb24uYW5ndWxhckRhbXBpbmcgfHwgMDtcclxuICAgIGJkLnBvc2l0aW9uID0gdGhpcy5ydWJlVG9YWShib2R5SnNvbi5wb3NpdGlvbik7XHJcblxyXG4gICAgY29uc3QgYm9keTogUGwuYjJCb2R5ICYgUnViZUVudGl0eSA9IHRoaXMud29ybGQuQ3JlYXRlQm9keShiZCk7XHJcbiAgICBib2R5LlNldE1hc3NEYXRhKHtcclxuICAgICAgbWFzczogYm9keUpzb25bJ21hc3NEYXRhLW1hc3MnXSB8fCAxLFxyXG4gICAgICBjZW50ZXI6IHRoaXMucnViZVRvVmVjMihib2R5SnNvblsnbWFzc0RhdGEtY2VudGVyJ10pLFxyXG4gICAgICBJOiBib2R5SnNvblsnbWFzc0RhdGEtSSddIHx8IDEsXHJcbiAgICB9KTtcclxuXHJcbiAgICBib2R5Lm5hbWUgPSBib2R5SnNvbi5uYW1lIHx8ICcnO1xyXG4gICAgYm9keS5jdXN0b21Qcm9wZXJ0aWVzID0gYm9keUpzb24uY3VzdG9tUHJvcGVydGllcyB8fCBbXTtcclxuICAgIGJvZHkuY3VzdG9tUHJvcGVydGllc01hcCA9IHRoaXMuY3VzdG9tUHJvcGVydGllc0FycmF5VG9NYXAoYm9keS5jdXN0b21Qcm9wZXJ0aWVzIHx8IFtdKTtcclxuXHJcbiAgICAoYm9keUpzb24uZml4dHVyZSB8fCBbXSkubWFwKGZpeHR1cmVKc29uID0+IHRoaXMubG9hZEZpeHR1cmUoYm9keSwgZml4dHVyZUpzb24pKTtcclxuICAgIHJldHVybiBib2R5O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2FkRml4dHVyZShib2R5OiBQbC5iMkJvZHksIGZpeHR1cmVKc286IFJ1YmVGaXh0dXJlKTogUGwuYjJGaXh0dXJlIHtcclxuICAgIGNvbnN0IGZkOiBQbC5iMkZpeHR1cmVEZWYgPSB0aGlzLmdldEZpeHR1cmVEZWZXaXRoU2hhcGUoZml4dHVyZUpzbywgYm9keSk7XHJcbiAgICBmZC5mcmljdGlvbiA9IGZpeHR1cmVKc28uZnJpY3Rpb24gfHwgMDtcclxuICAgIGZkLmRlbnNpdHkgPSBmaXh0dXJlSnNvLmRlbnNpdHkgfHwgMDtcclxuICAgIGZkLnJlc3RpdHV0aW9uID0gZml4dHVyZUpzby5yZXN0aXR1dGlvbiB8fCAwO1xyXG4gICAgZmQuaXNTZW5zb3IgPSBCb29sZWFuKGZpeHR1cmVKc28uc2Vuc29yKTtcclxuICAgIGZkLmZpbHRlciA9IHtcclxuICAgICAgY2F0ZWdvcnlCaXRzOiBmaXh0dXJlSnNvWydmaWx0ZXItY2F0ZWdvcnlCaXRzJ10sXHJcbiAgICAgIG1hc2tCaXRzOiBmaXh0dXJlSnNvWydmaWx0ZXItbWFza0JpdHMnXSB8fCAxLFxyXG4gICAgICBncm91cEluZGV4OiBmaXh0dXJlSnNvWydmaWx0ZXItZ3JvdXBJbmRleCddIHx8IDY1NTM1LFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBmaXh0dXJlOiBQbC5iMkZpeHR1cmUgJiBSdWJlRW50aXR5ID0gYm9keS5DcmVhdGVGaXh0dXJlKGZkKTtcclxuICAgIGZpeHR1cmUubmFtZSA9IGZpeHR1cmVKc28ubmFtZSB8fCAnJztcclxuICAgIGZpeHR1cmUuY3VzdG9tUHJvcGVydGllcyA9IGZpeHR1cmVKc28uY3VzdG9tUHJvcGVydGllcyB8fCBbXTtcclxuICAgIGZpeHR1cmUuY3VzdG9tUHJvcGVydGllc01hcCA9IHRoaXMuY3VzdG9tUHJvcGVydGllc0FycmF5VG9NYXAoZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzKTtcclxuXHJcbiAgICByZXR1cm4gZml4dHVyZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZEpvaW50KGpvaW50SnNvbjogUnViZUpvaW50KTogUGwuYjJKb2ludCB8IG51bGwge1xyXG4gICAgaWYgKGpvaW50SnNvbi5ib2R5QSA+PSB0aGlzLmxvYWRlZEJvZGllcy5sZW5ndGgpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignSW5kZXggZm9yIGJvZHlBIGlzIGludmFsaWQ6ICcgKyBqb2ludEpzb24pO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGlmIChqb2ludEpzb24uYm9keUIgPj0gdGhpcy5sb2FkZWRCb2RpZXMubGVuZ3RoKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0luZGV4IGZvciBib2R5QiBpcyBpbnZhbGlkOiAnICsgam9pbnRKc29uKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYm9keUEgPSB0aGlzLmxvYWRlZEJvZGllc1tqb2ludEpzb24uYm9keUFdO1xyXG4gICAgY29uc3QgYm9keUIgPSB0aGlzLmxvYWRlZEJvZGllc1tqb2ludEpzb24uYm9keUJdO1xyXG4gICAgaWYgKCFib2R5QSB8fCAhYm9keUIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignYm9keUEgb3IgYm9keUIgYXJlIGludmFsaWQnLCBib2R5QSwgYm9keUIsIHRoaXMubG9hZGVkQm9kaWVzKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGpvaW50OiBQbC5iMkpvaW50ICYgUnViZUVudGl0eTtcclxuICAgIHN3aXRjaCAoam9pbnRKc29uLnR5cGUpIHtcclxuICAgICAgY2FzZSAncmV2b2x1dGUnOiB7XHJcbiAgICAgICAgY29uc3QgamQgPSBuZXcgUGwuYjJSZXZvbHV0ZUpvaW50RGVmKCk7XHJcbiAgICAgICAgLy8gY29uc3Qge3gsIHl9ID0gYm9keUEuR2V0UG9zaXRpb24oKTtcclxuICAgICAgICBqZC5Jbml0aWFsaXplKGJvZHlBLCBib2R5QiwgdGhpcy5ydWJlVG9WZWMyKGpvaW50SnNvbi5hbmNob3JBKS5Sb3RhdGUoYm9keUEuR2V0QW5nbGUoKSkuQWRkKGJvZHlBLkdldFBvc2l0aW9uKCkpKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhqb2ludEpzb24uYW5jaG9yQSwgeCwgeSlcclxuICAgICAgICAvLyBqZC5Jbml0aWFsaXplKGJvZHlBLCBib2R5Qiwge3g6IDAuMTkwODc1LCB5OiAtMS4zMTQ0NX0pO1xyXG4gICAgICAgIGpkLmNvbGxpZGVDb25uZWN0ZWQgPSBCb29sZWFuKGpvaW50SnNvbi5jb2xsaWRlQ29ubmVjdGVkKTtcclxuICAgICAgICBqZC5yZWZlcmVuY2VBbmdsZSA9IGpvaW50SnNvbi5yZWZBbmdsZSB8fCAwO1xyXG4gICAgICAgIGpkLmVuYWJsZUxpbWl0ID0gQm9vbGVhbihqb2ludEpzb24uZW5hYmxlTGltaXQpO1xyXG4gICAgICAgIGpkLmxvd2VyQW5nbGUgPSBqb2ludEpzb24ubG93ZXJMaW1pdCB8fCAwO1xyXG4gICAgICAgIGpkLnVwcGVyQW5nbGUgPSBqb2ludEpzb24udXBwZXJMaW1pdCB8fCAwO1xyXG4gICAgICAgIGpkLmVuYWJsZU1vdG9yID0gQm9vbGVhbihqb2ludEpzb24uZW5hYmxlTW90b3IpO1xyXG4gICAgICAgIGpkLm1heE1vdG9yVG9ycXVlID0gam9pbnRKc29uLm1heE1vdG9yVG9ycXVlIHx8IDA7XHJcbiAgICAgICAgamQubW90b3JTcGVlZCA9IGpvaW50SnNvbi5tb3RvclNwZWVkIHx8IDA7XHJcbiAgICAgICAgam9pbnQgPSB0aGlzLndvcmxkLkNyZWF0ZUpvaW50KGpkKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICAvLyBjYXNlICdyb3BlJzoge1xyXG4gICAgICAvLyAgIC8vIHRocm93IG5ldyBFcnJvcignUm9wZSBqb2ludCBub3QgaW1wbGVtZW50ZWQnKTtcclxuICAgICAgLy8gfVxyXG4gICAgICBjYXNlICdkaXN0YW5jZSc6IHtcclxuICAgICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMkRpc3RhbmNlSm9pbnREZWYoKTtcclxuICAgICAgICBqZC5sZW5ndGggPSAoam9pbnRKc29uLmxlbmd0aCB8fCAwKTtcclxuICAgICAgICBqZC5Jbml0aWFsaXplKFxyXG4gICAgICAgICAgYm9keUEsXHJcbiAgICAgICAgICBib2R5QixcclxuICAgICAgICAgIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQSkuUm90YXRlKGJvZHlBLkdldEFuZ2xlKCkpLkFkZChib2R5QS5HZXRQb3NpdGlvbigpKSxcclxuICAgICAgICAgIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQikuUm90YXRlKGJvZHlCLkdldEFuZ2xlKCkpLkFkZChib2R5Qi5HZXRQb3NpdGlvbigpKSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGpkLmNvbGxpZGVDb25uZWN0ZWQgPSBCb29sZWFuKGpvaW50SnNvbi5jb2xsaWRlQ29ubmVjdGVkKTtcclxuICAgICAgICBqZC5sZW5ndGggPSBqb2ludEpzb24ubGVuZ3RoIHx8IDA7XHJcbiAgICAgICAgLy8gTm90IHN1cmUgd2hhdCB0aGUgcHJvcGVyIHdheSBpcywgYnV0IHdpdGhvdXQgc2V0dGluZyBtaW4gYW5kIG1heCBsZW5ndGggZXhwbGljaXRseSwgaXQgcmVtYWlucyBzdGlmZi5cclxuICAgICAgICBqZC5taW5MZW5ndGggPSAwO1xyXG4gICAgICAgIGpkLm1heExlbmd0aCA9IGpkLmxlbmd0aCAqIDI7XHJcbiAgICAgICAgUGwuYjJMaW5lYXJTdGlmZm5lc3MoamQsIGpvaW50SnNvbi5mcmVxdWVuY3kgfHwgMCwgam9pbnRKc29uLmRhbXBpbmdSYXRpbyB8fCAwLCBqZC5ib2R5QSwgamQuYm9keUIpO1xyXG4gICAgICAgIGpvaW50ID0gdGhpcy53b3JsZC5DcmVhdGVKb2ludChqZCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2Qgam9pbnQnLCBqb2ludCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAncHJpc21hdGljJzoge1xyXG4gICAgICAgIGNvbnN0IGpkID0gbmV3IFBsLmIyUHJpc21hdGljSm9pbnREZWYoKTtcclxuICAgICAgICBqZC5Jbml0aWFsaXplKGJvZHlBLCBib2R5QiwgdGhpcy5ydWJlVG9WZWMyKGpvaW50SnNvbi5hbmNob3JBKS5Sb3RhdGUoYm9keUEuR2V0QW5nbGUoKSkuQWRkKGJvZHlBLkdldFBvc2l0aW9uKCkpLCB0aGlzLnJ1YmVUb1hZKGpvaW50SnNvbi5sb2NhbEF4aXNBKSk7XHJcbiAgICAgICAgamQuY29sbGlkZUNvbm5lY3RlZCA9IEJvb2xlYW4oam9pbnRKc29uLmNvbGxpZGVDb25uZWN0ZWQpO1xyXG4gICAgICAgIGpkLnJlZmVyZW5jZUFuZ2xlID0gam9pbnRKc29uLnJlZkFuZ2xlIHx8IDA7XHJcbiAgICAgICAgamQuZW5hYmxlTGltaXQgPSBCb29sZWFuKGpvaW50SnNvbi5lbmFibGVMaW1pdCk7XHJcbiAgICAgICAgamQubG93ZXJUcmFuc2xhdGlvbiA9IGpvaW50SnNvbi5sb3dlckxpbWl0IHx8IDA7XHJcbiAgICAgICAgamQudXBwZXJUcmFuc2xhdGlvbiA9IGpvaW50SnNvbi51cHBlckxpbWl0IHx8IDA7XHJcbiAgICAgICAgamQuZW5hYmxlTW90b3IgPSBCb29sZWFuKGpvaW50SnNvbi5lbmFibGVNb3Rvcik7XHJcbiAgICAgICAgamQubWF4TW90b3JGb3JjZSA9IGpvaW50SnNvbi5tYXhNb3RvckZvcmNlIHx8IDA7XHJcbiAgICAgICAgamQubW90b3JTcGVlZCA9IGpvaW50SnNvbi5tb3RvclNwZWVkIHx8IDA7XHJcbiAgICAgICAgam9pbnQgPSB0aGlzLndvcmxkLkNyZWF0ZUpvaW50KGpkKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd3aGVlbCc6IHtcclxuICAgICAgICBjb25zdCBqZCA9IG5ldyBQbC5iMldoZWVsSm9pbnREZWYoKTtcclxuICAgICAgICAvLyBUT0RPIGFuY2hvckEgaXMgMCBhbmQgQiBpcyBYWSBpbiB3b3JsZCBzcGFjZSwgd2hpY2ggc2hvdWxkIGJlIHVzZWQ/XHJcbiAgICAgICAgamQuSW5pdGlhbGl6ZShib2R5QSwgYm9keUIsIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24uYW5jaG9yQiksIHRoaXMucnViZVRvVmVjMihqb2ludEpzb24ubG9jYWxBeGlzQSkpO1xyXG4gICAgICAgIGpkLmNvbGxpZGVDb25uZWN0ZWQgPSBCb29sZWFuKGpvaW50SnNvbi5jb2xsaWRlQ29ubmVjdGVkKTtcclxuICAgICAgICBqZC5lbmFibGVNb3RvciA9IEJvb2xlYW4oam9pbnRKc29uLmVuYWJsZU1vdG9yKTtcclxuICAgICAgICBqZC5tYXhNb3RvclRvcnF1ZSA9IGpvaW50SnNvbi5tYXhNb3RvclRvcnF1ZSB8fCAwO1xyXG4gICAgICAgIGpkLm1vdG9yU3BlZWQgPSBqb2ludEpzb24ubW90b3JTcGVlZCB8fCAwO1xyXG4gICAgICAgIFBsLmIyTGluZWFyU3RpZmZuZXNzKGpkLCBqb2ludEpzb24uc3ByaW5nRnJlcXVlbmN5IHx8IDAsIGpvaW50SnNvbi5zcHJpbmdEYW1waW5nUmF0aW8gfHwgMCwgamQuYm9keUEsIGpkLmJvZHlCKTtcclxuICAgICAgICBqb2ludCA9IHRoaXMud29ybGQuQ3JlYXRlSm9pbnQoamQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ2ZyaWN0aW9uJzoge1xyXG4gICAgICAgIGNvbnN0IGpkID0gbmV3IFBsLmIyRnJpY3Rpb25Kb2ludERlZigpO1xyXG4gICAgICAgIGpkLkluaXRpYWxpemUoYm9keUEsIGJvZHlCLCB0aGlzLnJ1YmVUb1ZlYzIoam9pbnRKc29uLmFuY2hvckEpLlJvdGF0ZShib2R5QS5HZXRBbmdsZSgpKS5BZGQoYm9keUEuR2V0UG9zaXRpb24oKSkpO1xyXG4gICAgICAgIGpkLmNvbGxpZGVDb25uZWN0ZWQgPSBCb29sZWFuKGpvaW50SnNvbi5jb2xsaWRlQ29ubmVjdGVkKTtcclxuICAgICAgICBqZC5tYXhGb3JjZSA9IGpvaW50SnNvbi5tYXhGb3JjZSB8fCAwO1xyXG4gICAgICAgIGpkLm1heFRvcnF1ZSA9IGpvaW50SnNvbi5tYXhUb3JxdWUgfHwgMDtcclxuICAgICAgICBqb2ludCA9IHRoaXMud29ybGQuQ3JlYXRlSm9pbnQoamQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ3dlbGQnOiB7XHJcbiAgICAgICAgY29uc3QgamQgPSBuZXcgUGwuYjJXZWxkSm9pbnREZWYoKTtcclxuICAgICAgICBqZC5Jbml0aWFsaXplKGJvZHlBLCBib2R5QiwgdGhpcy5ydWJlVG9WZWMyKGpvaW50SnNvbi5hbmNob3JBKS5Sb3RhdGUoYm9keUEuR2V0QW5nbGUoKSkuQWRkKGJvZHlBLkdldFBvc2l0aW9uKCkpKTtcclxuICAgICAgICBqZC5jb2xsaWRlQ29ubmVjdGVkID0gQm9vbGVhbihqb2ludEpzb24uY29sbGlkZUNvbm5lY3RlZCk7XHJcbiAgICAgICAgamQucmVmZXJlbmNlQW5nbGUgPSBqb2ludEpzb24ucmVmQW5nbGUgfHwgMDtcclxuICAgICAgICBQbC5iMkFuZ3VsYXJTdGlmZm5lc3MoamQsIGpvaW50SnNvbi5mcmVxdWVuY3kgfHwgMCwgam9pbnRKc29uLmRhbXBpbmdSYXRpbyB8fCAwLCBqZC5ib2R5QSwgamQuYm9keUIpO1xyXG4gICAgICAgIGpvaW50ID0gdGhpcy53b3JsZC5DcmVhdGVKb2ludChqZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGpvaW50IHR5cGU6ICcgKyBqb2ludEpzb24udHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgam9pbnQubmFtZSA9IGpvaW50SnNvbi5uYW1lO1xyXG4gICAgam9pbnQuY3VzdG9tUHJvcGVydGllcyA9IGpvaW50SnNvbi5jdXN0b21Qcm9wZXJ0aWVzIHx8IFtdO1xyXG4gICAgam9pbnQuY3VzdG9tUHJvcGVydGllc01hcCA9IHRoaXMuY3VzdG9tUHJvcGVydGllc0FycmF5VG9NYXAoam9pbnQuY3VzdG9tUHJvcGVydGllcyk7XHJcblxyXG4gICAgcmV0dXJuIGpvaW50O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2FkSW1hZ2UoaW1hZ2VKc29uOiBSdWJlSW1hZ2UpOiAoUGguR2FtZU9iamVjdHMuSW1hZ2UgJiBSdWJlRW50aXR5KSB8IG51bGwge1xyXG4gICAgY29uc3Qge2ZpbGUsIGJvZHksIGNlbnRlciwgY3VzdG9tUHJvcGVydGllcywgYW5nbGUsIGFzcGVjdFNjYWxlLCBzY2FsZSwgZmxpcCwgcmVuZGVyT3JkZXJ9ID0gaW1hZ2VKc29uO1xyXG4gICAgY29uc3QgYm9keU9iaiA9IHRoaXMubG9hZGVkQm9kaWVzW2JvZHldO1xyXG4gICAgY29uc3QgcG9zID0gYm9keU9iaiA/IGJvZHlPYmouR2V0UG9zaXRpb24oKS5BZGQodGhpcy5ydWJlVG9YWShjZW50ZXIpKSA6IHRoaXMucnViZVRvWFkoY2VudGVyKTtcclxuXHJcbiAgICBpZiAoIXBvcykgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3QgdGV4dHVyZSA9IHRoaXMuZ2V0Q3VzdG9tUHJvcGVydHkoaW1hZ2VKc29uLCAnc3RyaW5nJywgJ3BoYXNlclRleHR1cmUnLCAnJyk7XHJcbiAgICBjb25zdCB0ZXh0dXJlRmFsbGJhY2sgPSAoZmlsZSB8fCAnJykuc3BsaXQoXCIvXCIpLnJldmVyc2UoKVswXTtcclxuICAgIGNvbnN0IHRleHR1cmVGcmFtZSA9IHRoaXMuZ2V0Q3VzdG9tUHJvcGVydHkoaW1hZ2VKc29uLCAnc3RyaW5nJywgJ3BoYXNlclRleHR1cmVGcmFtZScsIHVuZGVmaW5lZCk7XHJcbiAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLSB0ZXh0dXJlJywgdGV4dHVyZSwgdGV4dHVyZUZyYW1lKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKCd0ZXh0dXJlRmFsbGJhY2snLCB0ZXh0dXJlRmFsbGJhY2spO1xyXG4gICAgY29uc3QgaW1nOiBQaC5HYW1lT2JqZWN0cy5JbWFnZSAmIFJ1YmVFbnRpdHkgPSB0aGlzLnNjZW5lLmFkZC5pbWFnZShwb3MueCAqIHRoaXMud29ybGRTaXplLCBwb3MueSAqIC10aGlzLndvcmxkU2l6ZSwgdGV4dHVyZSB8fCB0ZXh0dXJlRmFsbGJhY2ssIHRleHR1cmVGcmFtZSk7XHJcbiAgICBpbWcucm90YXRpb24gPSBib2R5T2JqID8gLWJvZHlPYmouR2V0QW5nbGUoKSArIC0oYW5nbGUgfHwgMCkgOiAtKGFuZ2xlIHx8IDApO1xyXG4gICAgaW1nLnNjYWxlWSA9ICh0aGlzLndvcmxkU2l6ZSAvIGltZy5oZWlnaHQpICogc2NhbGU7XHJcbiAgICBpbWcuc2NhbGVYID0gaW1nLnNjYWxlWSAqIGFzcGVjdFNjYWxlO1xyXG4gICAgaW1nLmZsaXBYID0gZmxpcDtcclxuICAgIGltZy5zZXREZXB0aChyZW5kZXJPcmRlcik7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBpbWcuY3VzdG9tX29yaWdpbl9hbmdsZSA9IC0oYW5nbGUgfHwgMCk7XHJcbiAgICBpbWcuY3VzdG9tUHJvcGVydGllcyA9IGN1c3RvbVByb3BlcnRpZXMgfHwgW107XHJcbiAgICBpbWcuY3VzdG9tUHJvcGVydGllc01hcCA9IHRoaXMuY3VzdG9tUHJvcGVydGllc0FycmF5VG9NYXAoaW1nLmN1c3RvbVByb3BlcnRpZXMpO1xyXG4gICAgYm9keU9iaiAmJiBib2R5T2JqLlNldFVzZXJEYXRhKGltZyk7XHJcbiAgICByZXR1cm4gaW1nO1xyXG4gIH1cclxuXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbiAgcnViZVRvWFkodmFsPzogUnViZVZlY3Rvciwgb2Zmc2V0OiBQbC5YWSA9IHt4OiAwLCB5OiAwfSk6IFBsLlhZIHtcclxuICAgIHJldHVybiB0aGlzLmlzWFkodmFsKSA/IHt4OiB2YWwueCArIG9mZnNldC54LCB5OiB2YWwueSArIG9mZnNldC55fSA6IG9mZnNldDtcclxuICB9XHJcblxyXG4gIHJ1YmVUb1ZlYzIodmFsPzogUnViZVZlY3Rvcik6IFBsLmIyVmVjMiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1hZKHZhbCkgPyBuZXcgUGwuYjJWZWMyKHZhbC54LCB2YWwueSkgOiBuZXcgUGwuYjJWZWMyKDAsIDApO1xyXG4gIH1cclxuXHJcbiAgZ2V0Qm9kaWVzQnlOYW1lKG5hbWUpIHtcclxuICAgIGNvbnN0IGJvZGllczogUGwuYjJCb2R5W10gPSBbXTtcclxuICAgIGZvciAobGV0IGJvZHkgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBpZiAoIWJvZHkpIGNvbnRpbnVlO1xyXG4gICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgIGlmIChib2R5Lm5hbWUgPT09IG5hbWUpIGJvZGllcy5wdXNoKGJvZHkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJvZGllcztcclxuICB9XHJcblxyXG4gIGdldEJvZGllc0J5Q3VzdG9tUHJvcGVydHkocHJvcGVydHlUeXBlOiBSdWJlQ3VzdG9tUHJvcGVydHlUeXBlcywgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlVG9NYXRjaDogdW5rbm93bik6IFBsLmIyQm9keVtdIHtcclxuICAgIGNvbnN0IGJvZGllczogUGwuYjJCb2R5W10gPSBbXTtcclxuICAgIHR5cGUgYiA9IFBsLmIyQm9keSAmIFJ1YmVFbnRpdHkgfCBudWxsO1xyXG4gICAgZm9yIChsZXQgYm9keTogYiA9IHRoaXMud29ybGQuR2V0Qm9keUxpc3QoKTsgYm9keTsgYm9keSA9IGJvZHkuR2V0TmV4dCgpKSB7XHJcbiAgICAgIGlmICghYm9keSB8fCAhYm9keS5jdXN0b21Qcm9wZXJ0aWVzKSBjb250aW51ZTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2R5LmN1c3RvbVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoIWJvZHkuY3VzdG9tUHJvcGVydGllc1tpXS5oYXNPd25Qcm9wZXJ0eSgnbmFtZScpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKCFib2R5LmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkocHJvcGVydHlUeXBlKSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmIChib2R5LmN1c3RvbVByb3BlcnRpZXNbaV0ubmFtZSA9PSBwcm9wZXJ0eU5hbWUgJiZcclxuICAgICAgICAgIGJvZHkuY3VzdG9tUHJvcGVydGllc1tpXVtwcm9wZXJ0eVR5cGVdID09IHZhbHVlVG9NYXRjaCkgLy8gVE9ETyByZWZhY3RvciB0byBzdHJpY3QgZXF1YWxzXHJcbiAgICAgICAgICBib2RpZXMucHVzaChib2R5KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJvZGllcztcclxuICB9XHJcblxyXG4gIGdldEZpeHR1cmVzQnlDdXN0b21Qcm9wZXJ0eShwcm9wZXJ0eVR5cGU6IFJ1YmVDdXN0b21Qcm9wZXJ0eVR5cGVzLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWVUb01hdGNoOiB1bmtub3duKTogUGwuYjJGaXh0dXJlW10ge1xyXG4gICAgY29uc3QgZml4dHVyZXM6IFBsLmIyRml4dHVyZVtdID0gW107XHJcbiAgICB0eXBlIGYgPSBQbC5iMkZpeHR1cmUgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICAgIGZvciAobGV0IGJvZHkgPSB0aGlzLndvcmxkLkdldEJvZHlMaXN0KCk7IGJvZHk7IGJvZHkgPSBib2R5LkdldE5leHQoKSkge1xyXG4gICAgICBmb3IgKGxldCBmaXh0dXJlOiBmID0gYm9keS5HZXRGaXh0dXJlTGlzdCgpOyBmaXh0dXJlOyBmaXh0dXJlID0gZml4dHVyZS5HZXROZXh0KCkpIHtcclxuICAgICAgICBpZiAoIWZpeHR1cmUgfHwgIWZpeHR1cmUuY3VzdG9tUHJvcGVydGllcykgY29udGludWU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmICghZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzW2ldLmhhc093blByb3BlcnR5KCduYW1lJykpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgaWYgKCFmaXh0dXJlLmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkocHJvcGVydHlUeXBlKSkgY29udGludWU7XHJcbiAgICAgICAgICBpZiAoZml4dHVyZS5jdXN0b21Qcm9wZXJ0aWVzW2ldLm5hbWUgPT0gcHJvcGVydHlOYW1lICYmXHJcbiAgICAgICAgICAgIGZpeHR1cmUuY3VzdG9tUHJvcGVydGllc1tpXVtwcm9wZXJ0eVR5cGVdID09IHZhbHVlVG9NYXRjaCkgLy8gVE9ETyByZWZhY3RvciB0byBzdHJpY3QgZXF1YWxzXHJcbiAgICAgICAgICAgIGZpeHR1cmVzLnB1c2goZml4dHVyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZml4dHVyZXM7XHJcbiAgfVxyXG5cclxuICBnZXRKb2ludHNCeUN1c3RvbVByb3BlcnR5KHByb3BlcnR5VHlwZTogUnViZUN1c3RvbVByb3BlcnR5VHlwZXMsIHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZVRvTWF0Y2g6IHVua25vd24pOiBQbC5iMkpvaW50W10ge1xyXG4gICAgY29uc3Qgam9pbnRzOiBQbC5iMkpvaW50W10gPSBbXTtcclxuICAgIHR5cGUgaiA9IFBsLmIySm9pbnQgJiBSdWJlRW50aXR5IHwgbnVsbDtcclxuICAgIGZvciAobGV0IGpvaW50OiBqID0gdGhpcy53b3JsZC5HZXRKb2ludExpc3QoKTsgam9pbnQ7IGpvaW50ID0gam9pbnQuR2V0TmV4dCgpKSB7XHJcbiAgICAgIGlmICgham9pbnQgfHwgIWpvaW50LmN1c3RvbVByb3BlcnRpZXMpIGNvbnRpbnVlO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpvaW50LmN1c3RvbVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoIWpvaW50LmN1c3RvbVByb3BlcnRpZXNbaV0uaGFzT3duUHJvcGVydHkoJ25hbWUnKSlcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmICgham9pbnQuY3VzdG9tUHJvcGVydGllc1tpXS5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eVR5cGUpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKGpvaW50LmN1c3RvbVByb3BlcnRpZXNbaV0ubmFtZSA9PSBwcm9wZXJ0eU5hbWUgJiZcclxuICAgICAgICAgIGpvaW50LmN1c3RvbVByb3BlcnRpZXNbaV1bcHJvcGVydHlUeXBlXSA9PSB2YWx1ZVRvTWF0Y2gpIC8vIFRPRE8gcmVmYWN0b3IgdG8gc3RyaWN0IGVxdWFsc1xyXG4gICAgICAgICAgam9pbnRzLnB1c2goam9pbnQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gam9pbnRzO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETyB0dXJuIGludG8gbWFwIGluc3RlYWQgb2YgaGF2aW5nIHRvIGl0ZXJhdGUgb3ZlciBjdXN0b20gcHJvcHNcclxuICBnZXRDdXN0b21Qcm9wZXJ0eTxUID0gdW5rbm93bj4oZW50aXR5OiBSdWJlRW50aXR5LCBwcm9wZXJ0eVR5cGU6IFJ1YmVDdXN0b21Qcm9wZXJ0eVR5cGVzLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBUKTogVCB7XHJcbiAgICBpZiAoIWVudGl0eS5jdXN0b21Qcm9wZXJ0aWVzKSByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgZm9yIChjb25zdCBwcm9wIG9mIGVudGl0eS5jdXN0b21Qcm9wZXJ0aWVzKSB7XHJcbiAgICAgIGlmICghcHJvcC5uYW1lIHx8ICFwcm9wLmhhc093blByb3BlcnR5KHByb3BlcnR5VHlwZSkpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAocHJvcC5uYW1lID09PSBwcm9wZXJ0eU5hbWUpIHJldHVybiBwcm9wW3Byb3BlcnR5VHlwZV0gYXMgdW5rbm93biBhcyBUO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3VzdG9tUHJvcGVydGllc0FycmF5VG9NYXAoY3VzdG9tUHJvcGVydGllczogUnViZUN1c3RvbVByb3BlcnR5W10pOiB7IFtrZXk6IHN0cmluZ106IHVua25vd24gfSB7XHJcbiAgICByZXR1cm4gY3VzdG9tUHJvcGVydGllcy5yZWR1Y2UoKG9iaiwgY3VyKSA9PiB7XHJcbiAgICAgIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ2ludCcpKSBvYmpbY3VyLm5hbWVdID0gY3VyLmludDtcclxuICAgICAgZWxzZSBpZiAoY3VyLmhhc093blByb3BlcnR5KCdmbG9hdCcpKSBvYmpbY3VyLm5hbWVdID0gY3VyLmZsb2F0O1xyXG4gICAgICBlbHNlIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ3N0cmluZycpKSBvYmpbY3VyLm5hbWVdID0gY3VyLnN0cmluZztcclxuICAgICAgZWxzZSBpZiAoY3VyLmhhc093blByb3BlcnR5KCdjb2xvcicpKSBvYmpbY3VyLm5hbWVdID0gY3VyLmNvbG9yO1xyXG4gICAgICBlbHNlIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ2Jvb2wnKSkgb2JqW2N1ci5uYW1lXSA9IGN1ci5ib29sO1xyXG4gICAgICBlbHNlIGlmIChjdXIuaGFzT3duUHJvcGVydHkoJ3ZlYzInKSkgb2JqW2N1ci5uYW1lXSA9IHRoaXMucnViZVRvWFkoY3VyLnZlYzIpO1xyXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBvciBtaXNzaW5nIGN1c3RvbSBwcm9wZXJ0eSB0eXBlJyk7XHJcbiAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9LCB7fSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEZpeHR1cmVEZWZXaXRoU2hhcGUoZml4dHVyZUpzbzogUnViZUZpeHR1cmUsIGJvZHk6IFBsLmIyQm9keSk6IFBsLmIyRml4dHVyZURlZiB7XHJcbiAgICBpZiAoZml4dHVyZUpzby5oYXNPd25Qcm9wZXJ0eSgnY2lyY2xlJykgJiYgZml4dHVyZUpzby5jaXJjbGUpIHtcclxuICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgUGwuYjJDaXJjbGVTaGFwZSgpO1xyXG4gICAgICBzaGFwZS5TZXQodGhpcy5ydWJlVG9YWShmaXh0dXJlSnNvLmNpcmNsZS5jZW50ZXIpLCBmaXh0dXJlSnNvLmNpcmNsZS5yYWRpdXMpO1xyXG4gICAgICBjb25zdCBib2R5UG9zID0gYm9keS5HZXRQb3NpdGlvbigpLkNsb25lKCkuQWRkKHNoYXBlLm1fcCkuU2NhbGUodGhpcy53b3JsZFNpemUpO1xyXG4gICAgICAvLyB0aGlzLmRlYnVnR3JhcGhpY3Muc3Ryb2tlQ2lyY2xlKGJvZHlQb3MueCwgLWJvZHlQb3MueSwgZml4dHVyZUpzby5jaXJjbGUucmFkaXVzICogdGhpcy53b3JsZFNpemUpO1xyXG4gICAgICByZXR1cm4ge3NoYXBlfTtcclxuICAgIH0gZWxzZSBpZiAoZml4dHVyZUpzby5oYXNPd25Qcm9wZXJ0eSgncG9seWdvbicpICYmIGZpeHR1cmVKc28ucG9seWdvbikge1xyXG4gICAgICBjb25zdCB2ZXJ0cyA9IHRoaXMucG9pbnRzRnJvbVNlcGFyYXRlZFZlcnRpY2VzKGZpeHR1cmVKc28ucG9seWdvbi52ZXJ0aWNlcykucmV2ZXJzZSgpO1xyXG4gICAgICBjb25zdCBib2R5UG9zID0gYm9keS5HZXRQb3NpdGlvbigpO1xyXG4gICAgICBjb25zdCBweFZlcnRzID0gdmVydHNcclxuICAgICAgLm1hcChwID0+IGJvZHlQb3MuQ2xvbmUoKS5BZGQobmV3IFBsLmIyVmVjMihwLngsIHAueSkuUm90YXRlKGJvZHkuR2V0QW5nbGUoKSkpLlNjYWxlKHRoaXMud29ybGRTaXplKSlcclxuICAgICAgLm1hcCgoe3gsIHl9KSA9PiAoe3g6IHgsIHk6IC15fSkpO1xyXG5cclxuICAgICAgLy8gdGhpcy5kZWJ1Z0dyYXBoaWNzLnN0cm9rZVBvaW50cyhweFZlcnRzLCB0cnVlKS5zZXREZXB0aCgxMDApO1xyXG4gICAgICByZXR1cm4ge3NoYXBlOiBuZXcgUGwuYjJQb2x5Z29uU2hhcGUoKS5TZXQodmVydHMsIHZlcnRzLmxlbmd0aCl9O1xyXG4gICAgfSBlbHNlIGlmIChmaXh0dXJlSnNvLmhhc093blByb3BlcnR5KCdjaGFpbicpICYmIGZpeHR1cmVKc28uY2hhaW4pIHtcclxuICAgICAgY29uc3QgdmVydHMgPSB0aGlzLnBvaW50c0Zyb21TZXBhcmF0ZWRWZXJ0aWNlcyhmaXh0dXJlSnNvLmNoYWluLnZlcnRpY2VzKS5yZXZlcnNlKCk7XHJcbiAgICAgIGNvbnN0IGJvZHlQb3MgPSBib2R5LkdldFBvc2l0aW9uKCk7XHJcbiAgICAgIGNvbnN0IHB4VmVydHMgPSB2ZXJ0c1xyXG4gICAgICAubWFwKHAgPT4gYm9keVBvcy5DbG9uZSgpLkFkZChuZXcgUGwuYjJWZWMyKHAueCwgcC55KS5Sb3RhdGUoYm9keS5HZXRBbmdsZSgpKSkuU2NhbGUodGhpcy53b3JsZFNpemUpKVxyXG4gICAgICAubWFwKCh7eCwgeX0pID0+ICh7eDogeCwgeTogLXl9KSk7XHJcbiAgICAgIC8vIHRoaXMuZGVidWdHcmFwaGljcy5zdHJva2VQb2ludHMocHhWZXJ0cykuc2V0RGVwdGgoMTAwKTtcclxuICAgICAgLy8gY29uc29sZS5sb2coJy0tLS0tLS0tLS0tZHJhdycsIHZlcnRzLCBweFZlcnRzKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzTG9vcCA9IGZpeHR1cmVKc28uY2hhaW4uaGFzTmV4dFZlcnRleCAmJiBmaXh0dXJlSnNvLmNoYWluLmhhc1ByZXZWZXJ0ZXggJiYgZml4dHVyZUpzby5jaGFpbi5uZXh0VmVydGV4ICYmIGZpeHR1cmVKc28uY2hhaW4ucHJldlZlcnRleDtcclxuICAgICAgLy8gVE9ETyBzaG91bGQgcG9seWdvbiBjcmVhdGUgbG9vcCBjaGFpbiBpbnN0ZWFkIHRvIGF2b2lkIGdob3N0IGNvbGxpc2lvbnM/IGh0dHBzOi8vYm94MmQub3JnL3Bvc3RzLzIwMjAvMDYvZ2hvc3QtY29sbGlzaW9ucy9cclxuICAgICAgY29uc3Qgc2hhcGUgPSBpc0xvb3BcclxuICAgICAgICA/IG5ldyBQbC5iMkNoYWluU2hhcGUoKS5DcmVhdGVMb29wKHZlcnRzLCB2ZXJ0cy5sZW5ndGgpXHJcbiAgICAgICAgOiBuZXcgUGwuYjJDaGFpblNoYXBlKCkuQ3JlYXRlQ2hhaW4odmVydHMsIHZlcnRzLmxlbmd0aCwgdGhpcy5ydWJlVG9YWShmaXh0dXJlSnNvLmNoYWluLnByZXZWZXJ0ZXgpLCB0aGlzLnJ1YmVUb1hZKGZpeHR1cmVKc28uY2hhaW4ubmV4dFZlcnRleCkpO1xyXG4gICAgICByZXR1cm4ge3NoYXBlfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdDb3VsZCBub3QgZmluZCBzaGFwZSB0eXBlIGZvciBmaXh0dXJlJyk7XHJcbiAgICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCBzaGFwZSB0eXBlIGZvciBmaXh0dXJlJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBvaW50c0Zyb21TZXBhcmF0ZWRWZXJ0aWNlcyh2ZXJ0aWNlczogeyB4OiBudW1iZXJbXSwgeTogbnVtYmVyW10gfSkge1xyXG4gICAgY29uc3QgdmVydHM6IFBsLlhZW10gPSBbXTtcclxuICAgIGZvciAobGV0IHYgPSAwOyB2IDwgdmVydGljZXMueC5sZW5ndGg7IHYrKylcclxuICAgICAgLy8gSW4gUlVCRSBFZGl0b3IgdGhlIFkgY29vcmRpbmF0ZXMgYXJlIHVwc2lkZSBkb3duIHdoZW4gY29tcGFyZWQgdG8gUGhhc2VyM1xyXG4gICAgICB2ZXJ0cy5wdXNoKG5ldyBQbC5iMlZlYzIodmVydGljZXMueFt2XSwgdmVydGljZXMueVt2XSkpO1xyXG4gICAgcmV0dXJuIHZlcnRzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpc1hZKHZhbDogdW5rbm93bik6IHZhbCBpcyBQbC5YWSB7XHJcbiAgICByZXR1cm4gQm9vbGVhbih2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdmFsLmhhc093blByb3BlcnR5KCd4JykgJiYgdmFsLmhhc093blByb3BlcnR5KCd5JykpO1xyXG4gIH1cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiLy8gVGhlIGNodW5rIGxvYWRpbmcgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgY2h1bmtzXG4vLyBTaW5jZSBhbGwgcmVmZXJlbmNlZCBjaHVua3MgYXJlIGFscmVhZHkgaW5jbHVkZWRcbi8vIGluIHRoaXMgZmlsZSwgdGhpcyBmdW5jdGlvbiBpcyBlbXB0eSBoZXJlLlxuX193ZWJwYWNrX3JlcXVpcmVfXy5lID0gKCkgPT4gKFByb21pc2UucmVzb2x2ZSgpKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwibWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtzbm93Ym9hcmRpbmdfZ2FtZVwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtzbm93Ym9hcmRpbmdfZ2FtZVwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9yc1wiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9zcmMvaW5kZXgudHNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==