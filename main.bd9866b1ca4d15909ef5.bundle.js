(()=>{"use strict";var t,e={6147:(t,e,s)=>{s.d(e,{R:()=>u,$:()=>m});var i=s(2260);class a extends Phaser.Scene{constructor(){super({key:"PreloadScene"})}preload(){this.load.audio("theme",["assets/audio/theme/theme.ogg","assets/audio/theme/theme.mp3","assets/audio/theme/theme.aac"]);const t=this.game.canvas.height===u?"960x540":"480x270";this.load.image("space-back",`assets/img/bgSpace/bg-space-back-${t}.png`),this.load.image("space-mid",`assets/img/bgSpace/bg-space-mid-${t}.png`),this.load.image("space-front",`assets/img/bgSpace/bg-space-front-${t}.png`),this.load.image("mountain-back",`assets/img/bgLandscape/mountain-back-${t}.png`),this.load.image("mountain-mid",`assets/img/bgLandscape/mountain-mid-${t}.png`),this.load.image("rock-01","assets/img/rock-01.png"),this.load.bitmapFont("atari-classic","assets/fonts/bitmap/atari-classic.png","assets/fonts/bitmap/atari-classic.xml")}create(){this.scene.start("GameScene")}}var n=s(2511);const o=[{x:2,y:82},{x:7,y:14},{x:20,y:6},{x:41,y:2},{x:89,y:11},{x:137,y:52},{x:147,y:82}],r={startTerrainHeight:.5,slopeAmplitude:200,slopeLengthRange:[375,750],gridDensity:64,layers:[{color:13165035,width:5},{color:6065609,width:22},{color:2243451,width:10},{color:2960428,width:5},{color:3813938,width:250}]};class h{constructor(t,e,s=r){this.yOffset=0,this.lastRockSpawnX=0,this.scene=t,this.b2Physics=e,this.config=s;const i=Math.floor(1.5*s.slopeLengthRange[1]);this.pointsPool=[];for(let t=0;t<i;t++)this.pointsPool.push({x:0,y:0});this.vec2Pool=[];for(let t=0;t<i;t++)this.vec2Pool.push(new n.b2Vec2(0,0));this.chunks=[this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics()],this.obstacleImagePool=[this.scene.add.image(-1e3,0,"rock-01"),this.scene.add.image(-1e3,0,"rock-01"),this.scene.add.image(-1e3,0,"rock-01"),this.scene.add.image(-1e3,0,"rock-01"),this.scene.add.image(-1e3,0,"rock-01"),this.scene.add.image(-1e3,0,"rock-01"),this.scene.add.image(-1e3,0,"rock-01"),this.scene.add.image(-1e3,0,"rock-01")],this.terrainBody=this.b2Physics.world.CreateBody(),this.slopeStart=new Phaser.Math.Vector2(0,0),this.update()}update(){const{zoom:t,width:e,worldView:s}=this.scene.cameras.main;for(;this.slopeStart.x<s.x+e+1/t*500;)this.cleanupFixtures(),this.updateChunk()}updateChunk(){const[t,e]=this.generatePoints();this.createTerrainColliders(e),this.drawTerrain(t),this.drawDecoration(t),this.drawObstacles(t)}createTerrainColliders(t,e="surface"){const s=new n.b2ChainShape;"surface"===e?s.CreateChain(t,t.length,t[0],t[t.length-1]):s.CreateLoop(t,t.length);const i={shape:s,density:0,friction:0};return this.terrainBody.CreateFixture(i)}drawTerrain(t){const e=this.chunks.shift();if(!e)return;this.chunks.push(e),e.clear();const s=t.length-1,i=Math.max(t[0].y,t[s].y)+2*this.scene.cameras.main.height;let a=0;t.push({x:t[s].x,y:i},{x:t[0].x,y:i});for(const{color:s,width:i}of this.config.layers)e.translateCanvas(0,a),e.fillStyle(s),e.fillPoints(t,!0,!0),e.translateCanvas(0,0),a=i;t.length-=2}drawDecoration(t){}drawObstacles(t){const e=t[0],s=t[t.length-1],i=this.scene.cameras.main.scrollX/(2*this.b2Physics.worldScale),a=i<750?2500:1500,n=i<3e3?.7:.4,r=s.x-e.x,h=Math.abs(e.y-s.y),c=s.x-this.lastRockSpawnX;if(h<=50&&r>=this.config.slopeLengthRange[1]*n&&Math.random()<.7&&c>a){this.lastRockSpawnX=s.x;const t=this.obstacleImagePool.shift();null==t||t.setPosition(s.x,s.y+35),this.createTerrainColliders(o.map((t=>({x:(t.x-75+s.x)/this.b2Physics.worldScale,y:(t.y-40+s.y)/this.b2Physics.worldScale}))),"obstacle").SetUserData(t)}}generatePoints(){this.slopeEnd=this.getNextSlopeEnd();const t=[],e=[],s=this.b2Physics.worldScale;let i=this.slopeStart.x,a=0;const{startTerrainHeight:n,slopeAmplitude:o}=this.config,r=this.scene.cameras.main.height*n,h=this.slopeEnd.x-this.slopeStart.x,c=this.slopeStart.x,l=this.slopeStart.y,d=this.slopeEnd.y;let g,p;for(;i<=this.slopeEnd.x;){let n=r+this.interpolate(l,d,(i-c)/h)*o;g=this.pointsPool[a],g.x=i,g.y=n,t.push(g),p=this.vec2Pool[a],p.x=g.x/s,p.y=g.y/s,e.push(p),i+=this.config.gridDensity,a++}return this.slopeStart.x=this.slopeEnd.x,this.slopeStart.y=this.slopeEnd.y,[t,e]}getNextSlopeEnd(){const{gridDensity:t,slopeLengthRange:e}=this.config;let s=Phaser.Math.Between(e[0],e[1]);s=Math.round(s/t)*t,this.yOffset+=s>.8*this.config.slopeLengthRange[1]?.3:.05;const i=(this.config.slopeLengthRange[1],.75);return 0===this.slopeStart.x?{x:Math.round(1.5*r.slopeLengthRange[1]/t)*t,y:0}:{x:this.slopeStart.x+s,y:Math.random()*i+this.yOffset}}interpolate(t,e,s){let i=.5*(1-Math.cos(s*Math.PI));return t*(1-i)+e*i}cleanupFixtures(){const t=this.b2Physics.worldScale,e=this.scene.cameras.main.scrollX-1/this.scene.cameras.main.zoom*500;for(let s=this.terrainBody.GetFixtureList();s;s=s.GetNext()){const i=s.GetShape();if(this.b2Physics.isChain(i)&&i.m_vertices[i.m_vertices.length-1].x*t<e){const t=s.GetUserData();t&&this.obstacleImagePool.push(t),this.terrainBody.DestroyFixture(s)}}}}class c extends Phaser.Events.EventEmitter{constructor(t){super(),this.comboBoost=0,this.maxComboBoost=20,this.landedFrontFlips=0,this.landedBackFlips=0,this.totalTrickScore=0,this.protoTrickScore=0,this.comboAccumulatedScore=0,this.anglePreviousUpdate=0,this.totalRotation=0,this.currentFlipRotation=0,this.pendingFrontFlips=0,this.pendingBackFlips=0,this.comboMultiplier=0,this.snowman=t,this.parts=t.parts,this.snowmanBodyImage=this.parts.body.GetUserData(),this.crashIgnoredParts=[this.parts.armLowerLeft,this.parts.armLowerRight,this.parts.body],this.state=t.isInAir()?"in-air":"grounded",this.on("enter-in-air",(()=>{this.state="in-air"})),this.on("enter-grounded",(()=>{this.state="grounded",this.landedFrontFlips+=this.pendingFrontFlips,this.landedBackFlips+=this.pendingBackFlips;const t=this.pendingBackFlips+this.pendingFrontFlips;if(t>=1){const e=t*t*100;this.totalTrickScore+=e,this.comboAccumulatedScore+=e/10,this.comboMultiplier++,this.emit("combo-change",this.comboAccumulatedScore,this.comboMultiplier),this.emit("score-change",this.totalTrickScore),this.comboLeewayTween.seek(0),this.comboLeewayTween.play(),this.comboLeewayTween.restart()}this.totalRotation=0,this.currentFlipRotation=0,this.pendingBackFlips=0,this.pendingFrontFlips=0})),this.on("enter-crashed",(()=>{this.state="crashed",(this.comboLeewayTween.isPlaying()||this.comboLeewayTween.isPaused())&&this.comboLeewayTween.stop()})),this.comboLeewayTween=this.snowman.scene.tweens.addCounter({paused:!0,from:-.5*Math.PI,to:1.5*Math.PI,duration:1e3,onUpdate:t=>this.emit("combo-leeway-update",t.getValue()),onComplete:t=>{this.totalTrickScore+=this.comboAccumulatedScore*this.comboMultiplier,this.emit("score-change",this.totalTrickScore),this.emit("combo-change",0,0),this.protoTrickScore=0,this.comboAccumulatedScore=0,this.comboMultiplier=0}})}getTravelDistanceMeters(){return Math.floor(this.parts.body.GetPosition().Length()/2)}registerCollisionListener(){this.snowman.b2Physics.on("post-solve",((t,e)=>{var s;if(this.isCrashed&&this.lostHead)return;const i=t.GetFixtureA().GetBody(),a=t.GetFixtureB().GetBody();if(this.crashIgnoredParts.includes(i)||this.crashIgnoredParts.includes(a))return;const n=this.snowman.board.nose;i===this.parts.head||a===this.parts.head?Math.max(...e.normalImpulses)>7&&(this.lostHead=!0,this.isCrashed=!0):!n||i!==n.body&&a!==n.body||Math.max(...e.normalImpulses)>7&&(null===(s=n.crashRayResult)||void 0===s?void 0:s.hit)&&(this.isCrashed=!0)}))}update(){}updateTrickCounter(){if("in-air"===this.state){const t=i.Math.Angle.Normalize(this.parts.body.GetAngle()),e=this.calculateDifferenceBetweenAngles(this.anglePreviousUpdate,t);this.totalRotation+=e,this.currentFlipRotation+=e,this.anglePreviousUpdate=t,this.currentFlipRotation>=Math.PI*(0===this.pendingFrontFlips?1.25:2)?(this.pendingFrontFlips++,this.currentFlipRotation=0):this.currentFlipRotation<=Math.PI*-(0===this.pendingBackFlips?1.25:2)&&(this.pendingBackFlips++,this.currentFlipRotation=0)}}updateComboLeeway(){(this.comboLeewayTween.isPlaying()||this.comboLeewayTween.isPaused())&&("in-air"!==this.state&&this.snowman.board.isCenterGrounded?this.comboLeewayTween.resume():this.comboLeewayTween.pause())}calculateDifferenceBetweenAngles(t,e){let s=e-t;return s<-Math.PI?s+=2*Math.PI:s>Math.PI&&(s-=2*Math.PI),s}}class l{constructor(t,e=250,s=50){this.numSegments=10,this.segmentLength=8.4,this.segmentThickness=3.375,this.segments=[],this.pointStart=new n.b2Vec2(0,0),this.pointEnd=new n.b2Vec2(0,0),this.player=t,this.scene=t.scene,this.b2Physics=t.b2Physics,this.debugGraphics=this.scene.add.graphics();const[i,a]=this.generateSegments(e,s,this.b2Physics.worldScale/2);this.leftBinding=i,this.rightBinding=a}update(){}getTimeInAir(){if(this.segments.some((t=>t.groundRayResult.hit)))return-1;const t=Math.max(...this.segments.map((t=>t.groundRayResult.lastHitTime)));return this.scene.game.getTime()-t}isInAir(){return-1!==this.getTimeInAir()}rayCallbackFactory(t){return(e,s,i,a)=>(t.hit=!0,t.point=s,t.normal=i,t.fraction=a,t.lastHitTime=this.scene.game.getTime(),a)}resetSegment(t){t.groundRayResult.hit=!1,t.groundRayResult.point=null,t.groundRayResult.normal=null,t.groundRayResult.fraction=-1,t.crashRayResult&&(t.crashRayResult.hit=!1,t.crashRayResult.point=null,t.crashRayResult.normal=null,t.crashRayResult.fraction=-1)}drawDebug(t){this.debugGraphics.lineStyle(2,t,1);const e=this.b2Physics.worldScale;this.debugGraphics.lineBetween(this.pointStart.x*e,this.pointStart.y*e,this.pointEnd.x*e,this.pointEnd.y*e)}generateSegments(t,e,s){const{numSegments:i,segmentLength:a,segmentThickness:o}=this,r={hit:!1,point:null,normal:null,fraction:-1,lastHitTime:-1};for(let i=1;i<=this.numSegments;i++){const h=this.b2Physics.createBox(t+a*i,e,0,a,o,!0,13973086),c=i===this.numSegments,l=Object.assign({},r),d=Object.assign({},r);this.segments.push({body:h,groundRayDirection:new n.b2Vec2(0,s/this.b2Physics.worldScale),groundRayResult:l,groundRayCallback:this.rayCallbackFactory(l),crashRayDirection:c?new n.b2Vec2(s/this.b2Physics.worldScale,0):void 0,crashRayResult:c?d:void 0,crashRayCallback:c?this.rayCallbackFactory(d):void 0})}this.nose=this.segments[this.segments.length-1];const h=[{dampingRatio:.5,frequencyHz:6,referenceAngle:-.35},{dampingRatio:.5,frequencyHz:6,referenceAngle:-.25},{dampingRatio:.5,frequencyHz:7,referenceAngle:-.05},{dampingRatio:.5,frequencyHz:8,referenceAngle:-.025},{dampingRatio:.5,frequencyHz:10,referenceAngle:0},{dampingRatio:.5,frequencyHz:8,referenceAngle:-.025},{dampingRatio:.5,frequencyHz:7,referenceAngle:-.05},{dampingRatio:.5,frequencyHz:6,referenceAngle:-.25},{dampingRatio:.5,frequencyHz:6,referenceAngle:-.35}];for(let s=0;s<i-1;s++){const[i,o]=this.segments.slice(s,s+2),r=new n.b2Vec2((t+a/2+a*(s+1))/this.b2Physics.worldScale,e/this.b2Physics.worldScale),{dampingRatio:c,frequencyHz:l,referenceAngle:d}=h[s],g=new n.b2WeldJointDef;g.Initialize(i.body,o.body,r),g.referenceAngle=d,n.b2AngularStiffness(g,l,c,g.bodyA,g.bodyB),this.b2Physics.world.CreateJoint(g)}return[this.segments[3].body,this.segments[6].body]}}class d{constructor(t,e){this.debug=!1,this.boostForce=1650,this.jumpForce=18e3,this.leanForce=300,this.boostVector=new n.b2Vec2(0,0),this.jumpVector=new n.b2Vec2(0,0),this.scene=t,this.b2Physics=e,this.bodyRadius=e.worldScale,this.legMinLength=this.bodyRadius,this.legMaxLength=1.6*this.legMinLength,this.cursors=this.scene.input.keyboard.createCursorKeys(),this.board=new l(this,250,50),this.parts=this.generateBodyParts(250,50),this.stateComponent=new c(this)}update(){var t;if(this.stateComponent.update(),this.stateComponent.isCrashed&&this.detachBoard(),this.stateComponent.lostHead&&this.detachHead(),this.getTimeInAir()>100&&this.resetLegs(),!this.stateComponent.isCrashed){this.board.update();const e=this.scene.game.loop.delta/1e3;if(null===(t=this.scene.input.activePointer)||void 0===t?void 0:t.isDown){const t=this.scene.input.activePointer;t.motionFactor=.2,this.scene.input.activePointer.x<this.scene.cameras.main.width/2?this.leanBackward(e):this.leanForward(e),t.velocity.y<-30&&this.scene.game.getTime()-t.moveTime<=300&&this.jump(e)}else this.scene.input.activePointer.motionFactor=.8;this.cursors.up.isDown&&this.scene.game.getTime()-this.cursors.up.timeDown<=300&&this.jump(e),this.cursors.left.isDown&&this.leanBackward(e),this.cursors.right.isDown&&this.leanForward(e),this.boost(e)}}getTimeInAir(){return this.board.getTimeInAir()}isInAir(){return this.board.isInAir()}detachBoard(){this.parts.jointBindingLeft&&this.b2Physics.world.DestroyJoint(this.parts.jointBindingLeft),this.parts.jointBindingRight&&this.b2Physics.world.DestroyJoint(this.parts.jointBindingRight),this.parts.jointDistanceLeft&&this.b2Physics.world.DestroyJoint(this.parts.jointDistanceLeft),this.parts.jointDistanceRight&&this.b2Physics.world.DestroyJoint(this.parts.jointDistanceRight),this.parts.jointDistanceRight&&this.board.segments[this.board.segments.length-1].body.SetLinearVelocity(n.b2Vec2.ZERO)}detachHead(){this.parts.jointNeck&&this.b2Physics.world.DestroyJoint(this.parts.jointNeck),this.parts.jointNeck=null}boost(t){const e=this.isInAir()?.6:.9,s=this.boostVector;s.Set(this.boostForce*t*e+this.stateComponent.comboBoost,0),this.board.segments&&this.board.segments[4].body.ApplyForceToCenter(s,!0),this.parts.body.ApplyForceToCenter(s,!0)}resetLegs(){this.setDistanceLegs(this.legMinLength,this.legMinLength)}leanBackward(t){this.isInAir(),this.parts.body.ApplyAngularImpulse(-this.leanForce*t),this.setDistanceLegs(this.legMinLength,this.legMaxLength)}leanForward(t){this.isInAir(),this.parts.body.ApplyAngularImpulse(this.leanForce*t),this.setDistanceLegs(this.legMaxLength,this.legMinLength)}leanCenter(){this.b2Physics.enterBulletTime(1e3,.5),this.parts.body.ApplyForceToCenter(new n.b2Vec2(0,10)),this.setDistanceLegs(this.legMinLength,this.legMinLength)}jump(t){this.setDistanceLegs(this.legMaxLength,this.legMaxLength);const{isTailGrounded:e,isCenterGrounded:s,isNoseGrounded:i}=this.board,a=s?.6:1,n=this.jumpForce*t,o=this.jumpVector;o.Set(0,0),o.y=-n*a,this.parts.body.ApplyForceToCenter(o,!0)}setDistanceLegs(t,e){this.parts.jointDistanceLeft&&this.b2Physics.setDistanceJointLength(this.parts.jointDistanceLeft,t,this.legMinLength,this.legMaxLength),this.parts.jointDistanceRight&&this.b2Physics.setDistanceJointLength(this.parts.jointDistanceRight,e,this.legMinLength,this.legMaxLength)}generateBodyParts(t,e){const s={},a=.7*this.bodyRadius,o=.7*this.bodyRadius,r=.3*this.bodyRadius,h=.5,c=o,l=r,d=new n.b2Vec2(t+this.board.segmentLength*(this.board.numSegments/2+h),e-2*this.bodyRadius-this.bodyRadius/2),g=new i.Math.Vector2(0,-1).multiply({x:0,y:this.bodyRadius}).add(d);s.head=this.b2Physics.createCircle(d.x,d.y-this.bodyRadius-a,0,a,{color:13165035,type:n.b2BodyType.b2_dynamicBody,linearDamping:.15,angularDamping:.15}),s.body=this.b2Physics.createCircle(d.x,d.y,0,this.bodyRadius,{color:13165035,type:n.b2BodyType.b2_dynamicBody,linearDamping:.15,angularDamping:.15}),s.jointNeck=this.b2Physics.createRevoluteJoint({bodyA:s.body,bodyB:s.head,anchor:g,lowerAngle:-.25,upperAngle:.25,enableLimit:!0});const p=this.bodyRadius+o/1.75,y=new i.Math.Vector2(0,1).rotate(h).multiply({x:p,y:p}).add(d),m=new i.Math.Vector2(0,1).rotate(h).multiply({x:this.bodyRadius,y:this.bodyRadius}).add(d),u=new i.Math.Vector2(0,1).rotate(.25).multiply({x:o,y:o}).add(y),b=new i.Math.Vector2(u.x,u.y).add({x:0,y:-o/2}),w=new i.Math.Vector2(u).add({x:0,y:o/2});s.legUpperLeft=this.b2Physics.createBox(y.x,y.y,h,r,o,!0),s.legLowerLeft=this.b2Physics.createBox(u.x,u.y,0,r,o,!0),s.jointHipLeft=this.b2Physics.createRevoluteJoint({bodyA:s.body,bodyB:s.legUpperLeft,anchor:m,lowerAngle:-.2,upperAngle:1,enableLimit:!0}),s.jointKneeLeft=this.b2Physics.createRevoluteJoint({bodyA:s.legUpperLeft,bodyB:s.legLowerLeft,anchor:b,lowerAngle:-1.5,upperAngle:.375,enableLimit:!0}),s.jointBindingLeft=this.b2Physics.createRevoluteJoint({bodyA:s.legLowerLeft,bodyB:this.board.leftBinding,anchor:w});const x=this.bodyRadius+o/1.75,S=new i.Math.Vector2(0,1).rotate(-.5).multiply({x,y:x}).add(d),f=new i.Math.Vector2(0,1).rotate(-.5).multiply({x:this.bodyRadius,y:this.bodyRadius}).add(d),R=new i.Math.Vector2(0,1).rotate(-.25).multiply({x:o,y:o}).add(S),L=new i.Math.Vector2(R.x,R.y).add({x:0,y:-o/2}),P=new i.Math.Vector2(R).add({x:0,y:o/2});s.legUpperRight=this.b2Physics.createBox(S.x,S.y,-.5,r,o,!0),s.legLowerRight=this.b2Physics.createBox(R.x,R.y,0,r,o,!0),s.jointHipRight=this.b2Physics.createRevoluteJoint({bodyA:s.body,bodyB:s.legUpperRight,anchor:f,lowerAngle:-1,upperAngle:.2,enableLimit:!0}),s.jointKneeRight=this.b2Physics.createRevoluteJoint({bodyA:s.legUpperRight,bodyB:s.legLowerRight,anchor:L,lowerAngle:-.375,upperAngle:1.5,enableLimit:!0}),s.jointBindingRight=this.b2Physics.createRevoluteJoint({bodyA:s.legLowerRight,bodyB:this.board.rightBinding,anchor:P});const A={length:this.legMinLength,minLength:this.legMinLength,maxLength:this.legMaxLength,frequencyHz:8,dampingRatio:5};s.jointDistanceLeft=this.b2Physics.createDistanceJoint(s.body,this.board.rightBinding,m,w,A),s.jointDistanceRight=this.b2Physics.createDistanceJoint(s.body,this.board.leftBinding,f,P,A);const B=Math.PI/180*90,C=.5,T=this.bodyRadius+c/1.75,M=new i.Math.Vector2(-1,0).rotate(C).multiply({x:T,y:T}).add(d),v=new i.Math.Vector2(-1,0).rotate(C).multiply({x:this.bodyRadius,y:this.bodyRadius}).add(d),D=new i.Math.Vector2(-1,0).rotate(C).multiply({x:c,y:c}).add(M),F=new i.Math.Vector2(D).add(new i.Math.Vector2(c/2,0).rotate(C));s.armUpperLeft=this.b2Physics.createBox(M.x,M.y,B+C,l,c,!0),s.armLowerLeft=this.b2Physics.createBox(D.x,D.y,B+C,l,c,!0),s.jointShoulderLeft=this.b2Physics.createRevoluteJoint({bodyA:s.body,bodyB:s.armUpperLeft,anchor:v,lowerAngle:-1.25,upperAngle:.75,enableLimit:!0}),s.jointElbowLeft=this.b2Physics.createRevoluteJoint({bodyA:s.armUpperLeft,bodyB:s.armLowerLeft,anchor:F,lowerAngle:-.75,upperAngle:.75,enableLimit:!0});const k=-B,V=-.5,I=T,G=new i.Math.Vector2(1,0).rotate(V).multiply({x:I,y:I}).add(d),j=new i.Math.Vector2(1,0).rotate(V).multiply({x:this.bodyRadius,y:this.bodyRadius}).add(d),E=new i.Math.Vector2(1,0).rotate(V).multiply({x:c,y:c}).add(G),O=new i.Math.Vector2(E).add(new i.Math.Vector2(-c/2,0).rotate(V));return s.armUpperRight=this.b2Physics.createBox(G.x,G.y,k+V,l,c,!0),s.jointShoulderRight=this.b2Physics.createRevoluteJoint({bodyA:s.body,bodyB:s.armUpperRight,anchor:j,lowerAngle:-.75,upperAngle:1.25,enableLimit:!0}),s.armLowerRight=this.b2Physics.createBox(E.x,E.y,k+V,l,c,!0),s.jointElbowRight=this.b2Physics.createRevoluteJoint({bodyA:s.armUpperRight,bodyB:s.armLowerRight,anchor:O,lowerAngle:-.75,upperAngle:.75,enableLimit:!0}),s}}class g extends Phaser.Events.EventEmitter{constructor(t,e,s){super(),this.textureKeys=new Set,this.ZERO=new n.b2Vec2(0,0),this.bulletTime={rate:1},this.scene=t,this.worldScale=e,this.world=n.b2World.Create(s),this.world.SetContactListener({BeginContact:this.BeginContact.bind(this),EndContact:this.EndContact.bind(this),PreSolve:this.PreSolve.bind(this),PostSolve:this.PostSolve.bind(this)}),this.world.SetAllowSleeping(!1),this.world.SetWarmStarting(!0),this.userDataGraphics=t.add.graphics()}enterBulletTime(t,e){this.bulletTime.rate=e,-1!==t&&setTimeout((()=>this.bulletTime.rate=1),t)}createBox(t,e,s,i,a,o,r=11962192){const h=new n.b2PolygonShape;h.SetAsBox(i/2/this.worldScale,a/2/this.worldScale);const c={shape:h,density:.1,friction:.001,restitution:.005},l=this.world.CreateBody({awake:!0,position:{x:t/this.worldScale,y:e/this.worldScale},angle:s,linearDamping:.15,angularDamping:.1,type:o?n.b2BodyType.b2_dynamicBody:n.b2BodyType.b2_staticBody});l.CreateFixture(c),l.SetMassData({mass:.5,center:new n.b2Vec2,I:1});let d=this.scene.add.graphics();d.fillStyle(r),d.fillRect(-i/2,-a/2,2*i,2*a);const g=`box-${i}-${a}-${r}`;this.textureKeys.has(g)||(this.textureKeys.add(g),d.generateTexture(g,i,a));const p=this.scene.add.image(t,e,g);return l.SetUserData(p),l}createCircle(t,e,s,i,a={}){const o=new n.b2CircleShape;o.m_radius=i/this.worldScale;const r={shape:o,density:1,friction:.001,restitution:.005},h=this.world.CreateBody({position:{x:t/this.worldScale,y:e/this.worldScale},angle:s,linearDamping:a.linearDamping,angularDamping:a.angularDamping,type:a.type});h.CreateFixture(r),h.SetMassData({mass:1,center:this.ZERO,I:1}),this.userDataGraphics.clear(),this.userDataGraphics.fillStyle(a.color||3355443),this.userDataGraphics.fillCircle(i,i,i);const c=`circle-${i}-${a.color||3355443}`;this.textureKeys.has(c)||(this.textureKeys.add(c),this.userDataGraphics.generateTexture(c,2*i,2*i));const l=this.scene.add.image(t,e,c);return h.SetUserData(l),h}createRevoluteJoint(t){const e=new n.b2RevoluteJointDef,s=new n.b2Vec2(t.anchor.x/this.worldScale,t.anchor.y/this.worldScale);return e.Initialize(t.bodyA,t.bodyB,s),e.collideConnected=!1,t.lowerAngle&&(e.lowerAngle=t.lowerAngle),t.upperAngle&&(e.upperAngle=t.upperAngle),t.enableLimit&&(e.enableLimit=t.enableLimit),this.world.CreateJoint(e)}createDistanceJoint(t,e,s,i,a={}){const o=new n.b2DistanceJointDef,r=this.worldScale;o.Initialize(t,e,{x:s.x/r,y:s.y/r},{x:i.x/r,y:i.y/r}),o.collideConnected=!0;const h=a.length?a.length/this.worldScale:0;return o.length=h,o.minLength=h,o.maxLength=h,n.b2AngularStiffness(o,a.frequencyHz||15,a.dampingRatio||10,o.bodyA,o.bodyB),this.world.CreateJoint(o)}setDistanceJointLength(t,e,s,i){t&&(t.SetMinLength(s?s/this.worldScale:t.GetMinLength()),t.SetMaxLength(i?i/this.worldScale:t.GetMaxLength()),t.SetLength(e/this.worldScale))}update(){const t=Math.floor(Math.max(this.scene.game.loop.actualFps/3,2));this.world.Step(1/38.4,{positionIterations:t,velocityIterations:t}),this.world.ClearForces();const e=this.worldScale;for(let t=this.world.GetBodyList();t;t=t.GetNext()){if(!t)continue;let s=t.GetUserData();if(s){let{x:i,y:a}=t.GetPosition();s.x=i*e,s.y=a*e,s.rotation=t.GetAngle()}}}isEdge(t){return t.GetType()===n.b2ShapeType.e_edge}isChain(t){return t.GetType()===n.b2ShapeType.e_chain}isPolygon(t){return t.GetType()===n.b2ShapeType.e_polygon}isCircle(t){return t.GetType()===n.b2ShapeType.e_circle}BeginContact(t){this.emit("begin-contact",t)}EndContact(t){this.emit("end-contact",t)}PreSolve(t,e){this.emit("pre-solve",t,e)}PostSolve(t,e){this.emit("post-solve",t,e)}}class p extends i.Scene{constructor(){super({key:"GameScene"})}create(){this.cameras.main.setDeadzone(50,125),this.cameras.main.setBackgroundColor(0);const t=this.game.canvas.width===m?1:.5;this.cameras.main.setZoom(.85*t,.85*t),this.b2Physics=new g(this,15,new n.b2Vec2(0,9.8)),this.terrainSimple=new h(this,this.b2Physics),this.wickedSnowman=new d(this,this.b2Physics),this.cameras.main.startFollow(this.wickedSnowman.parts.body.GetUserData(),!1,.8,.25),this.cameras.main.followOffset.set(-375,0);const e=this.cameras.main.worldView.x+this.cameras.main.width/2,s=this.cameras.main.worldView.y+this.cameras.main.height/2;this.add.bitmapText(e+50,s-200,"atari-classic","WICKED SNOWMAN").setScrollFactor(.35).setFontSize(40).setOrigin(.5),this.add.bitmapText(e+50,s-100,"atari-classic","Don't lose your head").setScrollFactor(.35).setFontSize(25).setOrigin(.5),this.wickedSnowman.stateComponent.on("enter-crashed",(()=>{this.cameras.main.shake(200,.01),this.b2Physics.enterBulletTime(-1,.4)}))}restartGame(){this.scene.restart()}update(){this.b2Physics.update(),this.wickedSnowman.update(),this.terrainSimple.update()}}class y extends i.Scene{constructor(){super({key:"UIScene"})}init([t,e]){this.state=t,this.restartGame=e}create(){this.cameras.main.setRoundPixels(!0);const t=this.game.canvas.width===m?1:.5,e=20*t,s=18*t,i=24*t,a=4*t;this.music=this.sound.add("theme"),this.music.play({loop:!0,volume:.2,rate:.9,delay:1.25});const n=this.cameras.main.worldView.x+this.cameras.main.width/2,o=this.cameras.main.worldView.y+this.cameras.main.height/2;this.playAgainButton=this.add.bitmapText(n,1.5*o,"atari-classic","PLAY AGAIN?").setScrollFactor(0).setFontSize(i).setOrigin(.5).setDropShadow(1,2,2236962).setAlpha(0).setInteractive({useHandCursor:!0}).on("pointerdown",(()=>this.playAgain())).on("pointerover",(()=>this.playAgainButton.setCharacterTint(0,-1,!0,10,10,10,10))).on("pointerout",(()=>this.playAgainButton.setCharacterTint(0,-1,!1,-10,-10,-10,-10))),this.add.bitmapText(4,4,"atari-classic","DISTANCE").setScrollFactor(0,0).setFontSize(e),this.textDistance=this.add.bitmapText(1.5*a,e+2*a,"atari-classic","Distance: 0m").setScrollFactor(0,0).setFontSize(s),this.add.bitmapText(n,a,"atari-classic","COMBO").setScrollFactor(0,0).setOrigin(.5,0).setFontSize(e),this.textCombo=this.add.bitmapText(n,e+2*a,"atari-classic","-").setScrollFactor(0,0).setFontSize(s).setOrigin(.5,0),this.add.bitmapText(2*n-a,a,"atari-classic","SCORE").setScrollFactor(0,0).setOrigin(1,0).setFontSize(e),this.textScore=this.add.bitmapText(2*n-a,e+2*a,"atari-classic","0").setScrollFactor(0,0).setFontSize(s).setOrigin(1,0),this.state.on("combo-change",((t,e)=>this.textCombo.setText(t?t+"x"+e:"-"))),this.state.on("score-change",(t=>this.textScore.setText(t))),this.comboLeewayChart=this.add.graphics(),this.state.on("combo-leeway-update",(e=>{this.comboLeewayChart.clear().fillStyle(16777215).slice(n,72*t,12*t,e,1.5*Math.PI).fillPath()})),this.state.on("enter-crashed",(()=>{this.playAgainButton.setAlpha(1),this.tweens.add({targets:this.music,volume:0,detune:-500,rate:.5,duration:3e3,onComplete:t=>this.music.stop()})}))}update(){this.state.isCrashed||this.textDistance.setText(String(this.state.getTravelDistanceMeters())+"m")}playAgain(){this.music.stop(),this.restartGame()}}const m=960,u=540,b={title:"Wicked Snowman",version:"0.3.1",type:i.WEBGL,backgroundColor:"#ffffff",disableContextMenu:!0,fps:{min:55,target:60,smoothStep:!0},scale:{parent:"phaser-wrapper",mode:i.Scale.FIT,autoCenter:i.Scale.CENTER_BOTH,width:m/2,height:u/2},scene:[a,p,y]};window.addEventListener("load",(()=>{new i.Game(b)}))}},s={};function i(t){var a=s[t];if(void 0!==a)return a.exports;var n=s[t]={exports:{}};return e[t].call(n.exports,n,n.exports,i),n.exports}i.m=e,t=[],i.O=(e,s,a,n)=>{if(!s){var o=1/0;for(l=0;l<t.length;l++){for(var[s,a,n]=t[l],r=!0,h=0;h<s.length;h++)(!1&n||o>=n)&&Object.keys(i.O).every((t=>i.O[t](s[h])))?s.splice(h--,1):(r=!1,n<o&&(o=n));if(r){t.splice(l--,1);var c=a();void 0!==c&&(e=c)}}return e}n=n||0;for(var l=t.length;l>0&&t[l-1][2]>n;l--)t[l]=t[l-1];t[l]=[s,a,n]},i.d=(t,e)=>{for(var s in e)i.o(e,s)&&!i.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:e[s]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{var t={179:0};i.O.j=e=>0===t[e];var e=(e,s)=>{var a,n,[o,r,h]=s,c=0;if(o.some((e=>0!==t[e]))){for(a in r)i.o(r,a)&&(i.m[a]=r[a]);if(h)var l=h(i)}for(e&&e(s);c<o.length;c++)n=o[c],i.o(t,n)&&t[n]&&t[n][0](),t[n]=0;return i.O(l)},s=self.webpackChunkwicked_snowman=self.webpackChunkwicked_snowman||[];s.forEach(e.bind(null,0)),s.push=e.bind(null,s.push.bind(s))})();var a=i.O(void 0,[216],(()=>i(6147)));a=i.O(a)})();