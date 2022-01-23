(()=>{"use strict";var t,e={2812:(t,e,s)=>{s.d(e,{u:()=>u});var i=s(2260),o=s(3875),a=s(6479),n=s.n(a);const r={startTerrainHeight:.5,slopeAmplitude:200,slopeLengthRange:[375,750],worldScale:15,layers:[{color:6065609,width:0},{color:2243451,width:22},{color:2960428,width:32},{color:3813938,width:37},{color:2960428,width:250}]};class l{constructor(t,e,s=r){this.scene=t,this.world=e,this.config=s;const i=Math.floor(2*s.slopeLengthRange[1]);this.pointsPool=[];for(let t=0;t<i;t++)this.pointsPool.push({x:0,y:0});this.chunks=[this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics(),this.scene.add.graphics()],this.terrainBody=this.world.createBody(),this.slopeStart=new Phaser.Math.Vector2(0,0),this.generateTerrain()}update(){this.cleanupTerrainFixtures(),this.generateTerrain()}interpolate(t,e,s){let i=.5*(1-Math.cos(s*Math.PI));return t*(1-i)+e*i}generateTerrain(){for(;this.slopeStart.x<this.scene.cameras.main.worldView.x+this.scene.cameras.main.width+500;)console.time("TerrainSimple#generateSlope()"),this.generateSlope(),console.timeEnd("TerrainSimple#generateSlope()")}generateSlope(){let t=[],e=new Phaser.Math.Vector2(0,this.slopeStart.y),s=Phaser.Math.Between(r.slopeLengthRange[0],r.slopeLengthRange[1]);s=200*Math.floor(s/200),s=Math.min(Math.max(s,this.config.slopeLengthRange[0]),this.config.slopeLengthRange[1]);const i=(this.config.slopeLengthRange[1],.75);let a,l=0===this.slopeStart.x?{x:e.x+1.5*r.slopeLengthRange[1],y:0}:{x:e.x+s,y:Math.random()*i},h=0,c=0;const{startTerrainHeight:d,slopeAmplitude:g}=this.config,m=u.scale.height*d,p=l.x-e.x;for(;h<=l.x;){let s=m+this.interpolate(e.y,l.y,(h-e.x)/p)*g;a=this.pointsPool[c],a.x=h,a.y=s,t.push(a),h+=1,c++}this.slopePoints=n()(t,1,!1),t.length=0;const y={density:0,friction:1},w=this.config.worldScale,S=o.Vec2(0,0),f=o.Vec2(0,0),b=this.slopeStart.x;for(let t=1;t<this.slopePoints.length;t++)S.x=(this.slopePoints[t-1].x+b)/w,S.y=this.slopePoints[t-1].y/w,f.x=(this.slopePoints[t].x+b)/w,f.y=this.slopePoints[t].y/w,this.terrainBody.createFixture(o.Edge(S,f),y);const x=this.chunks.shift();if(!x)return;this.chunks.push(x),x.clear();const C=this.slopePoints.length,R=2*u.scale.height;for(const{color:t,width:e}of this.config.layers){x.moveTo(b,R),x.fillStyle(t),x.beginPath();for(let t=0;t<C;t++){const s=this.slopePoints[t];x.lineTo(s.x+b,s.y+e)}x.lineTo(this.slopePoints[C-1].x+b,R),x.lineTo(b,R),x.closePath(),x.fillPath()}x.lineStyle(5,13165035),x.beginPath();for(let t=0;t<C;t++){const e=this.slopePoints[t];x.lineTo(e.x+b,e.y)}x.strokePath(),this.slopeStart.x+=h-1,this.slopeStart.y=l.y}isEdge(t){return Boolean(t.m_vertex1)}cleanupTerrainFixtures(){const t=this.scene.cameras.main.scrollX-450,e=this.config.worldScale;for(let s=this.world.getBodyList();s;s=s.getNext())for(let i=s.getFixtureList();i;i=i.getNext()){const o=i.getShape();this.isEdge(o)&&o.m_vertex2.x*e<t&&s.destroyFixture(i)}}}class h{constructor(t,e,s=1,i=!1){this.direction=o.Vec2(0,1),this.rayCastResult={hit:!1,point:null,normal:null,fraction:-1,lastHitTime:-1},this.body=t,this.scene=e,this.world=t.getWorld(),this.rayLength=s,i&&(this.rayCastCrashResult={hit:!1,point:null,normal:null,fraction:-1,lastHitTime:-1})}update(){this.reset();const t=o.Vec2(this.body.getWorldVector(this.direction)),e=this.body.getWorldPoint(o.Vec2()),s=o.Vec2.add(e,o.Vec2.mul(t,.5));if(this.world.rayCast(e,s,this.callback.bind(this)),this.rayCastCrashResult){const t=o.Vec2(this.body.getWorldVector(o.Vec2(1,0))),e=this.body.getWorldPoint(o.Vec2()),s=o.Vec2.add(e,o.Vec2.mul(t,.35));this.world.rayCast(e,s,this.callbackCrash.bind(this))}}callback(t,e,s,i){return this.rayCastResult.hit=!0,this.rayCastResult.point=e,this.rayCastResult.normal=s,this.rayCastResult.fraction=i,this.rayCastResult.lastHitTime=this.scene.game.getTime(),i}callbackCrash(t,e,s,i){if(this.rayCastCrashResult)return this.rayCastCrashResult.hit=!0,this.rayCastCrashResult.point=e,this.rayCastCrashResult.normal=s,this.rayCastCrashResult.fraction=i,this.rayCastCrashResult.lastHitTime=this.scene.game.getTime(),i}reset(){this.rayCastResult.hit=!1,this.rayCastResult.point=null,this.rayCastResult.normal=null,this.rayCastResult.fraction=-1,this.rayCastCrashResult&&(this.rayCastCrashResult.hit=!1,this.rayCastCrashResult.point=null,this.rayCastCrashResult.normal=null,this.rayCastCrashResult.fraction=-1)}}class c{constructor(t,e,s){this.isCrashed=!1,this.jump=140,this.boost=30,this.board={numSegments:10,segmentLength:8.5,segmentThickness:3,segments:[]},this.scene=t,this.world=e,this.worldScale=s}create(){var t,e,s,a,n,r;return s=this,a=void 0,r=function*(){this.cursors=this.scene.input.keyboard.createCursorKeys();const{numSegments:s,segmentLength:a,segmentThickness:n}=this.board;for(let s=1;s<=this.board.numSegments;s++){const i=this.createBox(250+a*s,50,0,a,n,!0,13973086);this.board.segments.push(new h(i,this.scene,.5,s===this.board.numSegments)),null===(e=null===(t=i.getFixtureList())||void 0===t?void 0:t.getNext())||void 0===e||e.setFriction(1)}this.board.leftBinding=this.board.segments[3].body,this.board.rightBinding=this.board.segments[6].body;const r=[{dampingRatio:.5,frequencyHz:5,referenceAngle:-.35},{dampingRatio:.5,frequencyHz:5,referenceAngle:-.25},{dampingRatio:.5,frequencyHz:6,referenceAngle:0},{dampingRatio:.5,frequencyHz:8,referenceAngle:0},{dampingRatio:.5,frequencyHz:12,referenceAngle:0},{dampingRatio:.5,frequencyHz:8,referenceAngle:0},{dampingRatio:.5,frequencyHz:6,referenceAngle:0},{dampingRatio:.5,frequencyHz:5,referenceAngle:-.25},{dampingRatio:.5,frequencyHz:5,referenceAngle:-.35}];for(let t=0;t<s-1;t++){const[e,s]=this.board.segments.slice(t,t+2),i=o.Vec2((250+a/2+a*(t+1))/this.worldScale,50/this.worldScale);this.world.createJoint(o.WeldJoint(r[t],e.body,s.body,i))}const l=this.worldScale,c=.7*l,d=.7*l,g=.3*l,u=.7*l,m=.3*l,p=o.Vec2(250+a*(this.board.numSegments/2+.5),50-2*l-l/2),y=this.createCircle(p.x,p.y-l-c,0,c,!0,13165035);this.body=this.createCircle(p.x,p.y,0,l,!0,13165035);const w=this.body.getWorldPoint(o.Vec2(0,-1).mul(l/this.worldScale));this.neckJoint=this.world.createJoint(o.RevoluteJoint({lowerAngle:-.25,upperAngle:.25,enableLimit:!0},this.body,y,w)),this.world.on("post-solve",((t,e)=>{this.isCrashed&&this.lostHead||t.getFixtureA().getBody()!==y&&t.getFixtureB().getBody()!==y||Math.max(...e.normalImpulses)>7&&(this.lostHead=!0,this.isCrashed=!0)}));const S=new i.Math.Vector2(0,1).rotate(.5),f=this.body.getWorldPoint(o.Vec2(S.x,S.y).mul((l+d/1.75)/this.worldScale)).mul(this.worldScale),b=this.createBox(f.x,f.y,.5,g,d,!0),x=this.body.getWorldPoint(o.Vec2(S.x,S.y).mul(l/this.worldScale));this.world.createJoint(o.RevoluteJoint({lowerAngle:-.2,upperAngle:1,enableLimit:!0},this.body,b,x));const C=new i.Math.Vector2(0,1).rotate(-.25),R=o.Vec2(b.getWorldPoint(o.Vec2(C.x,C.y).mul(d/this.worldScale))).mul(this.worldScale),V=this.createBox(R.x,R.y,0,g,d,!0),v=o.Vec2(R).add(o.Vec2(0,-d/2)).mul(1/this.worldScale);this.world.createJoint(o.RevoluteJoint({lowerAngle:-1.5,upperAngle:.375,enableLimit:!0},b,V,v));const P=o.Vec2(R).add(o.Vec2(0,d/2)).mul(1/this.worldScale);this.bindingJointLeft=this.world.createJoint(o.RevoluteJoint({},V,this.board.leftBinding,P));const L=new i.Math.Vector2(0,1).rotate(-.5),A=this.body.getWorldPoint(o.Vec2(L.x,L.y).mul((l+d/1.75)/this.worldScale)).mul(this.worldScale),F=this.createBox(A.x,A.y,-.5,g,d,!0),T=this.body.getWorldPoint(o.Vec2(L.x,L.y).mul(l/this.worldScale));this.world.createJoint(o.RevoluteJoint({lowerAngle:-1,upperAngle:.2,enableLimit:!0},this.body,F,T));const D=new i.Math.Vector2(0,1).rotate(.25),k=o.Vec2(F.getWorldPoint(o.Vec2(D.x,D.y).mul(d/this.worldScale))).mul(this.worldScale),J=this.createBox(k.x,k.y,0,g,d,!0),B=o.Vec2(k).add(o.Vec2(0,-d/2)).mul(1/this.worldScale);this.world.createJoint(o.RevoluteJoint({lowerAngle:-.375,upperAngle:1.5,enableLimit:!0},F,J,B));const M=o.Vec2(k).add(o.Vec2(0,d/2)).mul(1/this.worldScale);this.bindingJointRight=this.world.createJoint(o.RevoluteJoint({},J,this.board.rightBinding,M)),this.jointDistLeft=this.world.createJoint(o.DistanceJoint({length:1.3*this.worldScale/this.worldScale,frequencyHz:15,dampingRatio:10},this.body,this.board.rightBinding,x,P)),this.jointDistRight=this.world.createJoint(o.DistanceJoint({length:1.3*this.worldScale/this.worldScale,frequencyHz:15,dampingRatio:10},this.body,this.board.leftBinding,T,M));const H=Math.PI/180*90,O=new i.Math.Vector2(-1,0).rotate(.5),W=this.body.getWorldPoint(o.Vec2(O.x,O.y).mul((l+u/1.75)/this.worldScale)).mul(this.worldScale),_=this.createBox(W.x,W.y,H+.5,m,u,!0),j=this.body.getWorldPoint(o.Vec2(O.x,O.y).mul(l/this.worldScale));this.world.createJoint(o.RevoluteJoint({lowerAngle:-1.25,upperAngle:.75,enableLimit:!0},this.body,_,j));const z=new i.Math.Vector2(0,1).rotate(0),I=o.Vec2(_.getWorldPoint(o.Vec2(z.x,z.y).mul(u/this.worldScale))).mul(this.worldScale),q=this.createBox(I.x,I.y,H+.5,m,u,!0),E=o.Vec2(I).add(o.Vec2(u/1.75,0)).mul(1/this.worldScale);this.world.createJoint(o.RevoluteJoint({lowerAngle:-.75,upperAngle:.75,enableLimit:!0},_,q,E));const N=-Math.PI/180*90,G=-.5,X=new i.Math.Vector2(1,0).rotate(G),Y=this.body.getWorldPoint(o.Vec2(X.x,X.y).mul((l+u/1.75)/this.worldScale)).mul(this.worldScale),U=this.createBox(Y.x,Y.y,N+G,m,u,!0),Z=this.body.getWorldPoint(o.Vec2(X.x,X.y).mul(l/this.worldScale));this.world.createJoint(o.RevoluteJoint({lowerAngle:-.75,upperAngle:1.25,enableLimit:!0},this.body,U,Z));const K=new i.Math.Vector2(0,1).rotate(0),$=o.Vec2(U.getWorldPoint(o.Vec2(K.x,K.y).mul(u/this.worldScale))).mul(this.worldScale),Q=this.createBox($.x,$.y,N+G,m,u,!0),tt=o.Vec2($).add(o.Vec2(-u/1.75,0)).mul(1/this.worldScale);this.world.createJoint(o.RevoluteJoint({lowerAngle:-.75,upperAngle:.75,enableLimit:!0},U,Q,tt))},new((n=void 0)||(n=Promise))((function(t,e){function i(t){try{l(r.next(t))}catch(t){e(t)}}function o(t){try{l(r.throw(t))}catch(t){e(t)}}function l(e){var s;e.done?t(e.value):(s=e.value,s instanceof n?s:new n((function(t){t(s)}))).then(i,o)}l((r=r.apply(s,a||[])).next())}))}createBox(t,e,s,i,a,n,r=11962192){const l=this.world.createBody({angle:s,linearDamping:.15,angularDamping:.1});n&&l.setDynamic(),l.createFixture(o.Box(i/2/this.worldScale,a/2/this.worldScale),{friction:.001,restitution:.005,density:.1,isSensor:!1}),l.setPosition(o.Vec2(t/this.worldScale,e/this.worldScale)),l.setMassData({mass:.5,center:o.Vec2(),I:1});let h=this.scene.add.graphics();return h.fillStyle(r),h.fillRect(-i/2,-a/2,i,a),l.setUserData(h),l}createCircle(t,e,s,i,a,n=15981044){const r=this.world.createBody({angle:s/360*Math.PI,linearDamping:.15,angularDamping:.1});a&&r.setDynamic(),r.createFixture(o.Circle(i/this.worldScale),{friction:.5,restitution:.1,density:1}),r.setPosition(o.Vec2(t/this.worldScale,e/this.worldScale)),r.setMassData({mass:1,center:o.Vec2(),I:1});const l=this.scene.add.graphics();return l.fillStyle(n),l.fillCircle(0,0,i),r.setUserData(l),r}setDistanceLegs(t,e){var s,i,o,a,n,r;if(this.jointDistLeft&&t){const{length:e,frequencyHz:a,dampingRatio:n}=t;e&&(null===(s=this.jointDistLeft)||void 0===s||s.setLength(.6*e)),a&&(null===(i=this.jointDistLeft)||void 0===i||i.setFrequency(a)),n&&(null===(o=this.jointDistLeft)||void 0===o||o.setDampingRatio(n))}if(this.jointDistRight&&e){const{length:t,frequencyHz:s,dampingRatio:i}=e;t&&(null===(a=this.jointDistRight)||void 0===a||a.setLength(.6*t)),s&&(null===(n=this.jointDistRight)||void 0===n||n.setFrequency(s)),i&&(null===(r=this.jointDistRight)||void 0===r||r.setDampingRatio(i))}}update(){var t;this.board.segments.forEach((t=>t.update()));const e=this.board.segments[this.board.segments.length-1];if((null===(t=e.rayCastCrashResult)||void 0===t?void 0:t.hit)&&(this.bindingJointLeft&&this.world.destroyJoint(this.bindingJointLeft),this.bindingJointRight&&this.world.destroyJoint(this.bindingJointRight),this.jointDistLeft&&this.world.destroyJoint(this.jointDistLeft),this.jointDistRight&&this.world.destroyJoint(this.jointDistRight),e.body.setLinearVelocity(o.Vec2(-50,0)),this.isCrashed=!0),this.lostHead&&this.neckJoint&&(this.world.destroyJoint(this.neckJoint),this.neckJoint=null),this.getTimeInAir()>150&&this.setDistanceLegs({length:25/this.worldScale},{length:30/this.worldScale}),this.cursors.up.isDown&&this.scene.game.getTime()-this.cursors.up.timeDown<=300){this.setDistanceLegs({length:40/this.worldScale},{length:40/this.worldScale});const t=this.board.segments.map((t=>t.rayCastResult.hit)),e=t[0],s=t[t.length-1],i=t[4]||t[5]||t[6],a=i?.6:1;let n=null;e&&!s?n=o.Vec2(0,-this.jump*a):s&&!e?n=this.body.getWorldVector(o.Vec2(0,-this.jump*a)):i&&(n=o.Vec2(0,-this.jump/2.8)),n&&this.body.applyForceToCenter(n,!0)}if(this.cursors.left.isDown&&(this.body.applyAngularImpulse(this.isInAir()?-3:-4),this.setDistanceLegs({length:27.5/this.worldScale},{length:40/this.worldScale})),this.cursors.right.isDown&&(this.body.applyAngularImpulse(this.isInAir()?3:4),this.setDistanceLegs({length:40/this.worldScale},{length:27.5/this.worldScale})),!this.isCrashed){const t=this.isInAir()?.9:1;this.board.segments&&this.board.segments[4].body.applyForceToCenter(o.Vec2(this.boost*t,0),!0),this.body.applyForceToCenter(o.Vec2(this.boost*t,0),!0)}this.cursors.down.isDown&&(this.body.applyForceToCenter(o.Vec2(0,10)),this.setDistanceLegs({length:25/this.worldScale},{length:25/this.worldScale}))}getTimeInAir(){if(this.board.segments.some((t=>t.rayCastResult.hit)))return-1;const t=Math.max(...this.board.segments.map((t=>t.rayCastResult.lastHitTime)));return this.scene.game.getTime()-t}isInAir(){return-1!==this.getTimeInAir()}}class d extends i.Scene{constructor(){super({key:"GameScene"})}create(){return t=this,e=void 0,i=function*(){const{width:t,height:e}=u.scale;this.backgroundBack=this.add.tileSprite(0,0,t,e,"space-back").setOrigin(0).setScrollFactor(0,0),this.backgroundMid=this.add.tileSprite(0,0,t,e,"space-mid").setOrigin(0).setScrollFactor(0,0),this.backgroundFront=this.add.tileSprite(0,0,t,e,"space-front").setOrigin(0).setScrollFactor(0,0),this.bgLandscapeMountains=this.add.tileSprite(0,0,t,e,"bg-landscape-4-mountain").setZ(2).setScale(1.25,2).setOrigin(0,.5).setScrollFactor(0,0).setTint(30,30,30,30),this.bgLandscapeHills=this.add.tileSprite(0,0,t,e,"bg-landscape-3-trees").setScale(1.25,1.5).setOrigin(0,.25).setScrollFactor(0,0).setZ(1).setTint(50,50,50,50),this.bgLandscapeClouds=this.add.tileSprite(0,0,t,e,"bg-landscape-5-clouds").setOrigin(0,.3).setScrollFactor(0,0).setZ(1),this.textFPS=this.add.text(this.cameras.main.worldView.x+this.cameras.main.width-24,24,"").setScrollFactor(0).setFontSize(16).setOrigin(1,0),this.textFPS.setShadow(1,1,"#000000",2),setInterval((()=>this.textFPS.setText(`fps: ${this.game.loop.actualFps.toFixed(1)} (${this.game.loop.targetFps})`)),1e3),this.music=this.sound.add("nightmare"),setTimeout((()=>this.music.play({loop:!0,volume:.5,detune:0,rate:1})),1250),this.worldScale=15;let s=o.Vec2(0,9.8);this.world=o.World(s),this.terrainSimple=new l(this,this.world),this.wickedSnowman=new c(this,this.world,this.worldScale),this.wickedSnowman.create();const i=this.cameras.main.worldView.x+this.cameras.main.width/2,a=this.cameras.main.worldView.y+this.cameras.main.height/2;this.add.text(i+50,a-200,"WICKED SNOWMAN").setScrollFactor(.35).setFontSize(40).setOrigin(.5),this.add.text(i+50,a-100,"Don't lose your head").setScrollFactor(.35).setFontSize(25).setOrigin(.5),this.add.text(i-35,a-62.5," ↑  jump").setScrollFactor(.35).setFontSize(20).setOrigin(0),this.add.text(i-35,a-37.5,"← → control").setScrollFactor(.35).setFontSize(20).setOrigin(0),this.playAgainButton=this.add.text(i,a,"PLAY AGAIN?").setScrollFactor(0).setFontSize(25).setOrigin(.5).setPadding(12).setAlpha(0).setStyle({backgroundColor:"#223B7B"}).setInteractive({useHandCursor:!0}).on("pointerdown",(()=>this.restartGame())).on("pointerover",(()=>this.playAgainButton.setStyle({fill:"#5c8dc9"}))).on("pointerout",(()=>this.playAgainButton.setStyle({fill:"#FFF"}))),this.textDistance=this.add.text(12,12,"Travelled: 0m").setScrollFactor(0,0).setFontSize(16),this.textDistance.setShadow(1,1,"#000000",2),this.cameras.main.startFollow(this.wickedSnowman.body.getUserData(),!1,.8,.25),this.cameras.main.followOffset.set(-375,0),this.cameras.main.setDeadzone(50,125),this.cameras.main.setBackgroundColor(0),this.cameras.main.setZoom(1,1)},new((s=void 0)||(s=Promise))((function(o,a){function n(t){try{l(i.next(t))}catch(t){a(t)}}function r(t){try{l(i.throw(t))}catch(t){a(t)}}function l(t){var e;t.done?o(t.value):(e=t.value,e instanceof s?e:new s((function(t){t(e)}))).then(n,r)}l((i=i.apply(t,e||[])).next())}));var t,e,s,i}restartGame(){this.music.stop(),this.scene.restart()}update(){this.wickedSnowman.isCrashed&&!this.playAgainButton.alpha&&(this.playAgainButton.setAlpha(1),this.tweens.add({targets:this.music,volume:0,detune:-500,rate:.5,duration:3e3,onComplete:t=>this.music.stop()})),this.wickedSnowman.isCrashed||(this.metersTravelled=Math.floor(this.wickedSnowman.body.getPosition().length()/2),this.textDistance.setText("Travelled: "+this.metersTravelled+"m")),this.backgroundBack.setTilePosition(.001*this.cameras.main.scrollX,.001*this.cameras.main.scrollY),this.backgroundMid.setTilePosition(.0025*this.cameras.main.scrollX,.0025*this.cameras.main.scrollY),this.backgroundFront.setTilePosition(.005*this.cameras.main.scrollX,.005*this.cameras.main.scrollY),this.bgLandscapeClouds.setTilePosition(.25*this.cameras.main.scrollX,.25*this.cameras.main.scrollY),this.bgLandscapeMountains.setTilePosition(.025*this.cameras.main.scrollX,0),this.bgLandscapeHills.setTilePosition(.035*this.cameras.main.scrollX,0),this.wickedSnowman.update(),this.terrainSimple.update(),this.updatePhysics()}updatePhysics(){let t=Math.round(this.game.loop.delta)/600;this.world.step(t,15,15),this.world.clearForces();for(let t=this.world.getBodyList();t;t=t.getNext()){if(!t)continue;let e=t.getUserData();if(!e)continue;let s=t.getPosition();e.x=s.x*this.worldScale,e.y=s.y*this.worldScale,e.rotation=t.getAngle()}}}class g extends Phaser.Scene{constructor(){super({key:"PreloadScene"})}preload(){this.load.audio("nightmare",["assets/audio/nightmare/nightmarechipheavy.mp3","assets/audio/nightmare/nightmarechipheavy.ogg","assets/audio/nightmare/nightmarechipheavy.aac"]),this.load.image("space-back","assets/img/bgSpace/bg_space_seamless.png"),this.load.image("space-mid","assets/img/bgSpace/bg_space_seamless_fl1.png"),this.load.image("space-front","assets/img/bgSpace/bg_space_seamless_fl2.png"),this.load.image("bg-landscape-3-trees","assets/img/bgLandscape/landscape_0002_3_trees.png"),this.load.image("bg-landscape-4-mountain","assets/img/bgLandscape/landscape_0003_4_mountain.png"),this.load.image("bg-landscape-5-clouds","assets/img/bgLandscape/landscape_0004_5_clouds.png")}create(){this.scene.start("GameScene")}}const u={type:Phaser.WEBGL,backgroundColor:"#ffffff",disableContextMenu:!0,fps:{min:55,target:60,smoothStep:!0},scale:{parent:"phaser-wrapper",mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:960,height:540},scene:[g,d]};window.addEventListener("load",(()=>{new Phaser.Game(u)}))}},s={};function i(t){var o=s[t];if(void 0!==o)return o.exports;var a=s[t]={exports:{}};return e[t].call(a.exports,a,a.exports,i),a.exports}i.m=e,t=[],i.O=(e,s,o,a)=>{if(!s){var n=1/0;for(c=0;c<t.length;c++){for(var[s,o,a]=t[c],r=!0,l=0;l<s.length;l++)(!1&a||n>=a)&&Object.keys(i.O).every((t=>i.O[t](s[l])))?s.splice(l--,1):(r=!1,a<n&&(n=a));if(r){t.splice(c--,1);var h=o();void 0!==h&&(e=h)}}return e}a=a||0;for(var c=t.length;c>0&&t[c-1][2]>a;c--)t[c]=t[c-1];t[c]=[s,o,a]},i.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return i.d(e,{a:e}),e},i.d=(t,e)=>{for(var s in e)i.o(e,s)&&!i.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:e[s]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{var t={179:0};i.O.j=e=>0===t[e];var e=(e,s)=>{var o,a,[n,r,l]=s,h=0;if(n.some((e=>0!==t[e]))){for(o in r)i.o(r,o)&&(i.m[o]=r[o]);if(l)var c=l(i)}for(e&&e(s);h<n.length;h++)a=n[h],i.o(t,a)&&t[a]&&t[a][0](),t[n[h]]=0;return i.O(c)},s=self.webpackChunkwicked_snowman=self.webpackChunkwicked_snowman||[];s.forEach(e.bind(null,0)),s.push=e.bind(null,s.push.bind(s))})();var o=i.O(void 0,[216],(()=>i(2812)));o=i.O(o)})();