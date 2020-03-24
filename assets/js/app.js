let scene, camera, renderer, controls;
 
let keyboard = {};
let player = { height: 12, speed: 0.2, turnSpeed: Math.PI*0.02 };
let USE_WIREFRAME = false;

let textureBackground, textureWood, textureBrick;
let materialCabin, materialChimney, materialWindowDecor;
let model;

let pn = new Perlin('rnd' + new Date().getTime());
 
function init(){
   scene = new THREE.Scene();
   scene.fog = new THREE.FogExp2(0x22304c, 0.006, 1000);

   camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.position.set(70, 0, -70);

   renderer = new THREE.WebGLRenderer();
   renderer.setSize(window.innerWidth, window.innerHeight);
   document.body.appendChild(renderer.domElement);

   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.BasicShadowMap;

   controls = new THREE.OrbitControls (camera, renderer.domElement);
   controls.maxDistance = 100;

   //================================== TEXTURES =================================
   textureBackground = new THREE.TextureLoader().load('assets/textures/bg.png');
   scene.background = textureBackground;
   
   textureGrass = new THREE.TextureLoader().load('assets/textures/grass.jpg');

   textureWood = new THREE.TextureLoader().load('assets/textures/wood.jpg');
   textureWood.wrapS = THREE.RepeatWrapping;
   textureWood.wrapT = THREE.RepeatWrapping;
   textureWood.repeat.set(1.5, 1);

   textureBrick = new THREE.TextureLoader().load('assets/textures/brick.jpg');
   textureBrick.wrapS = THREE.RepeatWrapping;
   textureBrick.wrapT = THREE.RepeatWrapping;
   textureBrick.repeat.set(0.25, 1.25);

   //================================== MATERIALS ================================
   materialCabin = new THREE.MeshLambertMaterial({map: textureWood, fog: false});
   materialChimney= new THREE.MeshLambertMaterial({map: textureBrick, fog: false});
   materialWindowDecor = new THREE.MeshLambertMaterial({color: 0x000000});
   materialGrass = new THREE.MeshLambertMaterial({map: textureGrass});

   //================================== OBJECTS ==================================
   // PLANE
   let plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 300, 300), materialGrass);
   plane.rotation.x -= Math.PI / 2;
   plane.receiveShadow = true;
   plane.castShadow = true;
   plane.position.y = -38;
   for(index = 0; index < plane.geometry.vertices.length; index++){
      plane.geometry.vertices[index].z = pn.noise(plane.geometry.vertices[index].x/25, plane.geometry.vertices[index].y/15, 0) * 5;
   }
   plane.geometry.computeFaceNormals();
   plane.geometry.computeVertexNormals();
   scene.add(plane);

   // RISE
   let rise = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 200, 200), materialGrass);
   rise.rotation.x -= Math.PI / 2;
   rise.receiveShadow = true;
   rise.castShadow = true;
   rise.position.set(35, -18, -30);
   for(index = 0; index < rise.geometry.vertices.length; index++){
      rise.geometry.vertices[index].z = pn.noise(rise.geometry.vertices[index].x/25, rise.geometry.vertices[index].y/15, 0) * 5;
   }
   rise.geometry.computeFaceNormals();
   rise.geometry.computeVertexNormals();
   scene.add(rise);

   // RISE CUBE
   let riseCube = new THREE.Mesh(new THREE.BoxGeometry(200, 22, 200), materialGrass);
   riseCube.position.set(35, -27, -30);
   scene.add(riseCube);

   // CABIN WALL FRONT
   let cabinWallFront = new THREE.Mesh(new THREE.BoxGeometry(30, 40, 0.5));
   cabinWallFront.position.set(0, 2, -1);
   let cabinWallFrontBSP = new ThreeBSP(cabinWallFront);

   // CABIN TRIANGLE FRONT CUT RIGHT
   let cabinTriangleFrontCutRight = new THREE.Mesh(new THREE.BoxGeometry(40, 20, 1));
   cabinTriangleFrontCutRight.position.set(-15.5, 18, -1);
   cabinTriangleFrontCutRight.rotation.z = 0.925;
   let cabinTriangleFrontCutRightBSP = new ThreeBSP(cabinTriangleFrontCutRight);

   // CABIN TRIANGLE FRONT CUT LEFT
   let cabinTriangleFrontCutLeft = cabinTriangleFrontCutRight.clone();
   cabinTriangleFrontCutLeft.position.x = 15.5;
   cabinTriangleFrontCutLeft.rotation.z = -0.925;
   let cabinTriangleFrontCutLeftBSP = new ThreeBSP(cabinTriangleFrontCutLeft);

   // DOOR CUBE
   let doorCube = new THREE.Mesh(new THREE.BoxGeometry(10, 17, 4));
   doorCube.position.set(0, -10, -15);
   let doorCubeBSP = new ThreeBSP(doorCube);

   // DOOR SPHERE
   let doorSphere = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 8));
   doorSphere.position.set(0, -7, -15);
   let doorSphereBSP = new ThreeBSP(doorSphere);

   // DOOR CUT BACK
   let doorCutBack = new THREE.Mesh(new THREE.BoxGeometry(15, 25, 6));
   doorCutBack.position.set(0, -6, -10);
   let doorCutBackBSP = new ThreeBSP(doorCutBack);

   // DOOR CUT FRONT
   let doorCutFront = doorCutBack.clone();
   doorCutFront.position.z = -20;
   let doorCutFrontBSP = new ThreeBSP(doorCutFront);

   // DOOR CUT RIGHT
   let doorCutRight = new THREE.Mesh(new THREE.BoxGeometry(5.5, 25, 8));
   doorCutRight.position.set(-7.25, -6, -15);
   let doorCutRightBSP = new ThreeBSP(doorCutRight);

   // DOOR CUT LEFT
   let doorCutLeft = doorCutRight.clone();
   doorCutLeft.position.x = 7.25;
   let doorCutLeftBSP = new ThreeBSP(doorCutLeft);

   // DOOR
   let doorResult = ((((doorCubeBSP.union(doorSphereBSP)).subtract(doorCutBackBSP)).subtract(doorCutFrontBSP)).subtract(doorCutRightBSP)).subtract(doorCutLeftBSP);
   let door = doorResult.toMesh();
   door.position.z = 0;
   let doorBSP = new ThreeBSP(door);

   // DOOR TEXTURE
   let doorTexture = new THREE.Mesh(new THREE.BoxGeometry(21, 20, 2), materialCabin);
   doorTexture.position.set(-4, -8, 1.75);
   scene.add(doorTexture);

   // WINDOW CUBE
   let windowCube = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 4));
   windowCube.position.set(0, -8, -15);
   let windowCubeBSP = new ThreeBSP(windowCube);

   // WINDOW SPHERE
   let windowSphere = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 8));
   windowSphere.position.set(0, -6, -15);
   let windowSphereBSP = new ThreeBSP(windowSphere);

   // WINDOW CUT BACK
   let windowCutBack = new THREE.Mesh(new THREE.BoxGeometry(15, 25, 6));
   windowCutBack.position.set(0, -6, -11);
   let windowCutBackBSP = new ThreeBSP(windowCutBack);

   // WINDOW CUT FRONT
   let windowCutFront = windowCutBack.clone();
   windowCutFront.position.z = -19;
   let windowCutFrontBSP = new ThreeBSP(windowCutFront);

   // WINDOW CUT RIGHT
   let windowCutRight = new THREE.Mesh(new THREE.BoxGeometry(3.5, 25, 8));
   windowCutRight.position.set(-3, -6, -15);
   let windowCutRightBSP = new ThreeBSP(windowCutRight);

   // WINDOW CUT LEFT
   let windowCutLeft = windowCutRight.clone();
   windowCutLeft.position.x = 3;
   let windowCutLeftBSP = new ThreeBSP(windowCutLeft);

   // WINDOW FRONT CENTER
   let windowResult = ((((windowCubeBSP.union(windowSphereBSP)).subtract(windowCutBackBSP)).subtract(windowCutFrontBSP)).subtract(windowCutRightBSP)).subtract(windowCutLeftBSP);
   let windowFrontCenter = windowResult.toMesh();
   windowFrontCenter.position.set(0, 8, -1);
   let windowFrontCenterBSP = new ThreeBSP(windowFrontCenter);

   // WINDOW FRONT SIDE
   let windowFrontSide = windowFrontCenter.clone();
   windowFrontSide.position.set(9.5, -5, -1);
   let windowFrontSideBSP = new ThreeBSP(windowFrontSide);

   // WINDOW SIDE LEFT
   let windowSideLeft = windowFrontCenter.clone();
   windowSideLeft.position.set(15, -8, 20);
   windowSideLeft.rotateY(1.55);
   let windowSideLeftBSP = new ThreeBSP(windowSideLeft);

   // WINDOW SIDE RIGHT
   let windowSideRight = windowSideLeft.clone();
   windowSideRight.position.z = 13;
   let windowSideRightBSP = new ThreeBSP(windowSideRight);

   // CABIN FRONT
   let cabinBackResult = cabinWallFrontBSP.subtract(cabinTriangleFrontCutRightBSP.union(cabinTriangleFrontCutLeftBSP));
   let cabinFrontResult = ((cabinBackResult.subtract(doorBSP)).subtract(windowFrontCenterBSP)).subtract(windowFrontSideBSP);
   let cabinFront = cabinFrontResult.toMesh(materialCabin);
   cabinFront.receiveShadow = true;
   cabinFront.castShadow = true;
   scene.add(cabinFront);

   // CABIN BACK
   let cabinBack = cabinBackResult.toMesh(materialCabin);
   cabinBack.receiveShadow = true;
   cabinBack.castShadow = true;
   cabinBack.position.z = 29;
   scene.add(cabinBack);

   // CABIN WALL LEFT ORIG
   let cabinWallLeftOrig = new THREE.Mesh(new THREE.BoxGeometry(0.5, 20, 30));
   cabinWallLeftOrig.position.set(14.75, -8, 14);
   let cabinWallLeftOrigBSP = new ThreeBSP(cabinWallLeftOrig);

   // CABIN WALL LEFT
   let cabinWallLeftResult = (cabinWallLeftOrigBSP.subtract(windowSideLeftBSP)).subtract(windowSideRightBSP);
   let cabinWallLeft = cabinWallLeftResult.toMesh(materialCabin);
   cabinWallLeft.receiveShadow = true;
   cabinWallLeft.castShadow = true;
   scene.add(cabinWallLeft);

   // CABIN WALL RIGHT
   let cabinWallRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 20, 30), materialCabin);
   cabinWallRight.position.set(-14.75, -8, 14);
   cabinWallRight.receiveShadow = true;
   cabinWallRight.castShadow = true;
   scene.add(cabinWallRight);

   createParticles();
   createModels();
   createWindow();
   createRoof();
   createRoofStand();
   createChimney();
   createLights();
   animate();
}

function createParticles(){
   //================================== TEXTURES =================================
   let textureStar = new THREE.TextureLoader().load('assets/textures/star.png');
   let textureSmoke = new THREE.TextureLoader().load('assets/textures/smoke.png');
   let textureFog = new THREE.TextureLoader().load('assets/textures/fog.png');
   let textureFirefly = new THREE.TextureLoader().load('assets/textures/firefly.png');

   //================================== MATERIALS ================================
   let materialStar = new THREE.ParticleBasicMaterial({
      size: 2, 
      map: textureStar,
      transparent: true, 
      depthWrite: false,
      fog: false
   });
   let materialSmoke = new THREE.ParticleBasicMaterial({
      size: 10,
      map: textureSmoke,
      transparent: true, 
      fog: false,
      depthWrite: false
   });
   let materialFog = new THREE.ParticleBasicMaterial({
      size: 50,
      map: textureFog,
      transparent: true, 
      fog: false,
      depthWrite: false
   });
   let materialFirefly = new THREE.PointsMaterial({
      size: 0.8, 
      map: textureFirefly,
      transparent: true, 
      fog: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false
   });
   let materialFireflyWhite = new THREE.PointsMaterial({
      size: 0.1, 
      map: textureStar,
      transparent: true, 
      blending: THREE.AdditiveBlending,
      fog: false
   });

   //================================== OBJECTS ==================================
   // STAR PARTICLE
   let starGeometry = new THREE.Geometry();
   for (index = 0; index < 50000; index++) {
        let vertex = new THREE.Vector3();
        let distance = 0;
        while (distance < 500*500){
            vertex.x = newmathrandom();
            vertex.y = newmathrandom();
            vertex.z = newmathrandom();
            distance = vertex.x * vertex.x + vertex.y * vertex.y + vertex.z * vertex.z
        };
        starGeometry.vertices.push(vertex);
    }

   let star = new THREE.ParticleSystem(starGeometry, materialStar);
   star.renderDepth = 0;
   scene.add(star);

   // SMOKE PARTICLE
   let smokeGeometry = new THREE.Geometry();
   for (let index=0; index < 10; index++) {
      smokes = new THREE.Vector3(
        Math.random() * 5,
        Math.random() * 20,
        Math.random() * 5
      );
      smokeGeometry.vertices.push(smokes);
    }

   let smoke = new THREE.ParticleSystem(smokeGeometry, materialSmoke);
   smoke.position.set(-3, 30, 22);
   scene.add(smoke);

   // FIREFLIES PARTICLE
   let firefliesGeometry = new THREE.Geometry();
   for (let index=0; index < 17; index++) {
      fireflies = new THREE.Vector3(
         Math.random() * 5,
         Math.random() * 5,
         Math.random() * 5
      );
      firefliesGeometry.vertices.push(fireflies);
      }

   let firefly = new THREE.Points(firefliesGeometry, materialFirefly);
   firefly.position.set(40, -10, -75);
   scene.add(firefly);

   // FIREFLIES PARTICLE LEFT
   let firefliesLeft = firefly.clone();
   firefliesLeft.position.set(70, -10, -50);
   scene.add(firefliesLeft);

   // FIREFLIES PARTICLE WHITE
   let firefliesWhiteGeometry = new THREE.Geometry();
   for (let index=0; index < 17; index++) {
      firefliesWhite = new THREE.Vector3(
         Math.random() * 5,
         Math.random() * 5,
         Math.random() * 5
      );
      firefliesWhiteGeometry.vertices.push(firefliesWhite);
      }

   let fireflyWhite = new THREE.Points(firefliesWhiteGeometry, materialFireflyWhite);
   fireflyWhite.position.set(40, -10, -75);
   scene.add(fireflyWhite);

   // FIREFLIES PARTICLE WHITE LEFT
   let firefliesWhiteLeft = fireflyWhite.clone();
   firefliesWhiteLeft.position.set(60, -10, -60);
   scene.add(firefliesWhiteLeft);

   // FOG PARTICLE
   let fogGeometry = new THREE.Geometry();
   for (let index=0; index < 11000; index++) {
      fogs = new THREE.Vector3(
         Math.random() * 300,
         Math.random() * 0.05,
         Math.random() * 300
      );
      fogGeometry.vertices.push(fogs);
      }
   let fog = new THREE.ParticleSystem(fogGeometry, materialFog);
   fog.position.set(-150, -28, -150);
   scene.add(fog);
}

function createModels(){
   //=============================== TREE PACK FOUR ==============================
   // TREE FRONT LEFT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFour/treeFrontLeft.gltf", function(gltf){
      gltf.scene.position.set(18, -14, -5);
      gltf.scene.scale.set(1.25, 1.25, 1.25);
      scene.add(gltf.scene);
      modelTreeFrontLeft = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE FRONT RIGHT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFour/treeFrontRight.gltf", function(gltf){
      gltf.scene.position.set(-80, -20, -94);
      gltf.scene.scale.set(0.8, 0.8, 0.8);
      scene.add(gltf.scene);
      modelTreeFrontRight = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // ============================== TREE PACK ELEVEN ==============================
   // TREE MID RIGHT RIGHT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackEleven/treeMidRightRight.gltf", function(gltf){
      gltf.scene.position.set(-40, -18, -90);
      gltf.scene.scale.set(1.75, 1.75, 1.75);
      scene.add(gltf.scene);
      modelTreeMidRightRight = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE MID RIGHT LEFT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackEleven/treeMidRightLeft.gltf", function(gltf){
      gltf.scene.position.set(-40, -18, -100);
      gltf.scene.scale.set(1.5, 1.5, 1.5);
      scene.add(gltf.scene);
      modelTreeMidRightLeft = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE BEHIND MID RIGHT LEFT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackEleven/treeMidRightLeft.gltf", function(gltf){
      gltf.scene.position.set(-150, -35, -35);
      gltf.scene.scale.set(2.5, 2.5, 2.5);
      scene.add(gltf.scene);
      modelTreeBehindMidRightLeft = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE MID LEFT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackEleven/treeMidRightRight.gltf", function(gltf){
      gltf.scene.position.set(-90, -35, 110);
      gltf.scene.scale.set(3.5, 3.5, 3.5);
      gltf.scene.rotateY(1);
      scene.add(gltf.scene);
      modelTreeMidRightRight = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE LEFT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackEleven/treeMidRightRight.gltf", function(gltf){
      gltf.scene.position.set(75, -35, 180);
      gltf.scene.scale.set(3.5, 3.5, 3.5);
      gltf.scene.rotateY(2);
      scene.add(gltf.scene);
      modelTreeMLeft = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   //=============================== TREE PACK FIVE ==============================
   // TREE BEHIND HOUSE
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFive/treeBehindHouse.gltf", function(gltf){
      gltf.scene.position.set(-150, -15, -80);
      gltf.scene.scale.set(1.7, 1.7, 1.7);
      scene.add(gltf.scene);
      modelTreeBehindHouse = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE GROUP ONE RIGHT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFive/treeGroup.gltf", function(gltf){
      gltf.scene.position.set(-120, -38, 100);
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.rotateY(1.5);
      scene.add(gltf.scene);
      modelTreeGroupOneRight = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE GROUP TWO RIGHT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFive/treeGroup.gltf", function(gltf){
      gltf.scene.position.set(-120, -38, -100);
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.rotateY(-1.5);
      scene.add(gltf.scene);
      modelTreeGroupTwoRight = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE GROUP THREE RIGHT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFive/treeGroup.gltf", function(gltf){
      gltf.scene.position.set(-120, -38, 175);
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.rotateY(1.5);
      scene.add(gltf.scene);
      modelTreeGroupThreeRight = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE GROUP FOUR RIGHT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFive/treeGroup.gltf", function(gltf){
      gltf.scene.position.set(-120, -38, -175);
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.rotateY(-1.5);
      scene.add(gltf.scene);
      modelTreeGroupFourRight = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE GROUP ONE BACK
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFive/treeGroup.gltf", function(gltf){
      gltf.scene.position.set(-120, -38, 100);
      gltf.scene.scale.set(1, 1, 1);
      scene.add(gltf.scene);
      modelTreeGroupBack = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // TREE GROUP TWO BACK
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelTreePackFive/treeGroup.gltf", function(gltf){
      gltf.scene.position.set(0, -35, 100);
      gltf.scene.scale.set(0.5, 0.5, 0.5);
      scene.add(gltf.scene);
      modelTreeGroupTwoBack = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   //=================================== OTHERS ==================================
   // WEREWOLF
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelWerewolf/scene.gltf", function(gltf){
      gltf.scene.position.set(-10, -7, -50);
      gltf.scene.scale.set(2, 2, -2);
      gltf.scene.rotation.y = 275;
      scene.add(gltf.scene);
      modelWerewolf = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // BUSH
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelBush/bush.gltf", function(gltf){
      gltf.scene.position.set(-10, -8, -3);
      gltf.scene.scale.set(0.75, 0.75, 0.75);
      scene.add(gltf.scene);
      modelBush = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // BUSH LEFT
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelBush/bush.gltf", function(gltf){
      gltf.scene.position.set(16, -8, -2);
      gltf.scene.scale.set(0.75, 0.75, 0.75);
      scene.add(gltf.scene);
      modelBushLeft = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // BUSH NEAR TREE
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelBush/bunchOfBushes.gltf", function(gltf){
      gltf.scene.position.set(70, -8, -45);
      gltf.scene.scale.set(0.75, 0.75, 0.75);
      gltf.scene.rotation.y = 10;
      scene.add(gltf.scene);
      modelBushNearTree = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );
   
   // GRASS NEAR TREE
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelGrass/scene.gltf", function(gltf){
      gltf.scene.position.set(45, -15, -80);
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      scene.add(gltf.scene);
      modelGrassNearTree = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );

   // BUSH NEAR HOUSE
   model = new THREE.GLTFLoader();
   model.load("assets/models/modelBush/bunchOfBushes.gltf", function(gltf){
      gltf.scene.position.set(25, -5, 27);
      gltf.scene.scale.set(0.75, 0.75, 0.75);
      scene.add(gltf.scene);
      modelBushNearHouse = gltf.scene;
      console.log('added');
   }, undefined, function (error) {
      console.error(error);
   } );
}

function createWindow(){
   // WINDOW DECOR MIDDLE TOP
   let windowDecorMiddleTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, 8.5, 0.1), materialWindowDecor);
   windowDecorMiddleTop.position.set(0.25, 9.5, -1);
   windowDecorMiddleTop.rotateZ(0.75);
   windowDecorMiddleTop.receiveShadow = true;
   windowDecorMiddleTop.castShadow = true;

   // WINDOW DECOR MIDDLE BOTTOM
   let windowDecorMiddleBottom = windowDecorMiddleTop.clone();
   windowDecorMiddleBottom.position.y = 8.5;

   // WINDOW DECOR FAR TOP
   let windowDecorFarTop = windowDecorMiddleTop.clone();
   windowDecorFarTop.position.y = 10.5;

   // WINDOW DECOR FAR BOTTOM
   let windowDecorFarBottom = windowDecorMiddleTop.clone();
   windowDecorFarBottom.position.y = 7.5;

   // WINDOW DECOR FARTHEST TOP
   let windowDecorFarthestTop = windowDecorMiddleTop.clone();
   windowDecorFarthestTop.position.y = 11.5;

   // WINDOW DECOR FARTHEST BOTTOM
   let windowDecorFarthestBottom = windowDecorMiddleTop.clone();
   windowDecorFarthestBottom.position.y = 6.5;

   // WINDOW DECOR BOTTOM RIGHT TO TOP LEFT GROUP
   let windowDecorBottomRightTopLeft = new THREE.Group();
   windowDecorBottomRightTopLeft.add(windowDecorMiddleTop, windowDecorMiddleBottom, windowDecorFarTop, windowDecorFarBottom, windowDecorFarthestTop, windowDecorFarthestBottom);

   // WINDOW DECOR TOP RIGHT TO BOTTOM LEFT GROUP
   let windowDecorTopRightBottomLeft = windowDecorBottomRightTopLeft.clone();
   windowDecorTopRightBottomLeft.scale.x = -1;

   // WINDOW DECOR GROUP FRONT CENTER
   let windowDecorGroupFrontCenter = new THREE.Group();
   windowDecorGroupFrontCenter.add(windowDecorBottomRightTopLeft, windowDecorTopRightBottomLeft);
   windowDecorGroupFrontCenter.position.y = 0.2;
   scene.add(windowDecorGroupFrontCenter);

   // WINDOW DECOR GROUP FRONT SIDE
   let windowDecorGroupFrontSide = windowDecorGroupFrontCenter.clone();
   windowDecorGroupFrontSide.position.set(9.5, -12.8, 0);
   scene.add(windowDecorGroupFrontSide);

   // WINDOW DECOR GROUP SIDE LEFT
   let windowDecorGroupSideLeft = windowDecorGroupFrontCenter.clone();
   windowDecorGroupSideLeft.position.set(15.75, -15.8, 20);
   windowDecorGroupSideLeft.rotation.y = 1.55;
   scene.add(windowDecorGroupSideLeft);

   // WINDOW DECOR GROUP SIDE RIGHT
   let windowDecorGroupSideRight = windowDecorGroupSideLeft.clone();
   windowDecorGroupSideRight.position.z = 13;
   scene.add(windowDecorGroupSideRight);
}

function createRoof(){
   // CABIN ROOF LEFT
   let cabinRoofLeft = new THREE.Mesh(new THREE.BoxGeometry(1.05, 25.2, 33), materialCabin);
   cabinRoofLeft.position.set(7.6, 12, 14);
   cabinRoofLeft.rotation.z = 0.68;
   scene.add(cabinRoofLeft);

   // CABIN ROOF RIGHT
   let cabinRoofRight = cabinRoofLeft.clone();
   cabinRoofRight.position.x = -7.6;
   cabinRoofRight.rotation.z = -0.68;
   cabinRoofRight.scale.x = -1;
   scene.add(cabinRoofRight);

   // CABIN ROOF LEFT FLAP
   let cabinRoofLeftFlap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 5, 33), materialCabin);
   cabinRoofLeftFlap.position.set(17.28, 1.25, 14);
   cabinRoofLeftFlap.rotation.z = 0.99;
   scene.add(cabinRoofLeftFlap);

   // CABIN ROOF RIGHT FLAP
   let cabinRoofRightFlap = cabinRoofLeftFlap.clone();
   cabinRoofRightFlap.position.x = -17.28;
   cabinRoofRightFlap.rotation.z = -0.99;
   scene.add(cabinRoofRightFlap);

   // ROOF DECOR TOP
   let roofDecorTop = new THREE.Mesh(createBoxWithRoundedEdges(0.5, 1.1, 35, 0.25, 0.5), materialCabin);
   roofDecorTop.position.set(0, 21, 13.75);
   roofDecorTop.receiveShadow = true;
   roofDecorTop.castShadow = true;
   scene.add(roofDecorTop);

   // ROOF DECOR TOP SECOND
   let roofDecorTopSecond = roofDecorTop.clone();
   roofDecorTopSecond.position.set(-4.5, 16.75, 13.75);
   roofDecorTopSecond.rotation.z = -0.7;
   scene.add(roofDecorTopSecond);

   // ROOF DECOR MIDDLE
   let roofDecorMiddle = roofDecorTopSecond.clone();
   roofDecorMiddle.position.set(-8, 12.5, 13.75);
   scene.add(roofDecorMiddle);
   
   // ROOF DECOR BOTTOM SECOND
   let roofDecorBottomSecond = roofDecorTopSecond.clone();
   roofDecorBottomSecond.position.set(-11.5, 8.25, 13.75);
   scene.add(roofDecorBottomSecond);

   // ROOF DECOR BOTTOM
   let roofDecorBottom = roofDecorTopSecond.clone();
   roofDecorBottom.position.set(-15, 4, 13.75);
   scene.add(roofDecorBottom);
}

function createRoofStand(){
   // ROOF STAND RIGHT CUBE
   let roofStandRightCube = new THREE.Mesh(new THREE.BoxGeometry(1, 18.5, 1.5));
   roofStandRightCube.position.set(18, -9, 0);
   let roofStandRightCubeBSP = new ThreeBSP(roofStandRightCube);

   // ROOF STAND RIGHT FLAP
   let roofStandRightFlap = new THREE.Mesh(new THREE.BoxGeometry(1, 11, 1.5));
   roofStandRightFlap.position.set(18, -3.25, 4.25);
   roofStandRightFlap.rotation.x = 0.8;
   let roofStandRightFlapBSP = new ThreeBSP(roofStandRightFlap);

   // ROOF STAND RIGHT
   let roofStandRightResult = roofStandRightCubeBSP.union(roofStandRightFlapBSP);
   let roofStandRight = roofStandRightResult.toMesh(materialCabin);
   roofStandRight.receiveShadow = true;
   roofStandRight.castShadow = true;
   scene.add(roofStandRight);

   // ROOF STAND LEFT
   let roofStandLeft = roofStandRight.clone();
   roofStandLeft.position.z = 29;
   roofStandLeft.scale.z = -1;
   scene.add(roofStandLeft);
}

function createChimney(){
   // CHIMNEY CUBE
   let chimneyCube = new THREE.Mesh(new THREE.BoxGeometry(4, 10, 4));
   chimneyCube.position.set(0, 22, 24);
   let chimneyCubeBSP = new ThreeBSP(chimneyCube);

   // CHIMNEY HOLE
   let chimneyHole = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 3));
   chimneyHole.position.set(0, 25, 24);
   let chimneyHoleBSP = new ThreeBSP(chimneyHole);

   // CHIMNEY
   let chimneyResult = chimneyCubeBSP.subtract(chimneyHoleBSP);
   let chimney = chimneyResult.toMesh(materialChimney);
   chimney.receiveShadow = true;
   chimney.castShadow = true;
   scene.add(chimney);
}

function createLights(){
   //=============================== THREE.JS LIGHTS =============================
   // AMBIENT LIGHT
   let ambientLight = new THREE.AmbientLight(0x1f2533, 1);
   scene.add(ambientLight);

   // RECTLIGHT FRONT SIDE
   let rectLightFrontSide = new THREE.RectAreaLight(0xfcb857, 1, 29, 20);
   rectLightFrontSide.position.set(0, -8, 1);
   scene.add(rectLightFrontSide);

   // RECTLIGHT FRONT SIDE HELPER
   let rectLightFrontSideHelper = new THREE.RectAreaLightHelper(rectLightFrontSide);
   rectLightFrontSide.add(rectLightFrontSideHelper);

   // RECTLIGHT SIDE
   let rectLightSide = rectLightFrontSide.clone();
   rectLightSide.position.set(14, -8, 14);
   rectLightSide.rotateY(-1.57);
   scene.add(rectLightSide);

   // RECTLIGHT SIDE HELPER
   let rectLightSideHelper = new THREE.RectAreaLightHelper(rectLightSide);
   rectLightSide.add(rectLightSideHelper);

   // RECTLIGHT FRONT CENTER
   let rectLightFrontCenter = new THREE.RectAreaLight(0xfcb857, 1, 12, 12);
   rectLightFrontCenter.position.set(0, 8, 1);
   scene.add(rectLightFrontCenter);

   // RECTLIGHT FRONT CENTER HELPER
   let rectLightFrontCenterHelper = new THREE.RectAreaLightHelper(rectLightFrontCenter);
   rectLightFrontCenter.add(rectLightFrontCenterHelper);

   //============================ VOLUMETRIC SPOTLIGHT ===========================
   let lightRayGeometry = createBoxWithRoundedEdges(2, 4.5, 10, 1, 3);
   let lightRaySideGeometry = createBoxWithRoundedEdges(10, 4.5, 2, 1, 3);
   let lightRayMaterial = new THREEx.VolumetricSpotLightMaterial();

   let colorOrange = "#ff6903";
   let colorWhite = "#ffffff";

   // LIGHT RAY FRONT CENTER LAYER 1
   let lightRayFrontCenterOneMaterial = lightRayMaterial.clone();
   let lightRayFrontCenterOne	= new THREE.Mesh(lightRayGeometry, lightRayFrontCenterOneMaterial);
   lightRayFrontCenterOne.position.set(0, 9.5, -1);
   lightRayFrontCenterOne.lookAt(new THREE.Vector3(0, 14.5, 8));
   lightRayFrontCenterOneMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRayFrontCenterOneMaterial.uniforms.spotPosition.value = lightRayFrontCenterOne.position;
   scene.add(lightRayFrontCenterOne);

   // LIGHT RAY FRONT CENTER LAYER 2
   let lightRayFrontCenterTwoMaterial = lightRayMaterial.clone();
   let lightRayFrontCenterTwo = new THREE.Mesh(lightRayGeometry, lightRayFrontCenterTwoMaterial);
   lightRayFrontCenterTwo.position.set(0, 10, 0);
   lightRayFrontCenterTwo.lookAt(new THREE.Vector3(0, 15, 9));
   lightRayFrontCenterTwoMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRayFrontCenterTwoMaterial.uniforms.spotPosition.value = lightRayFrontCenterTwo.position;
   scene.add(lightRayFrontCenterTwo);

   // LIGHT RAY FRONT CENTER LAYER 3
   let lightRayFrontCenterThreeMaterial = lightRayMaterial.clone();
   let lightRayFrontCenterThree = new THREE.Mesh(lightRayGeometry, lightRayFrontCenterThreeMaterial);
   lightRayFrontCenterThree.position.set(0, 10.5, 1);
   lightRayFrontCenterThree.lookAt(new THREE.Vector3(0, 15.5, 10));
   lightRayFrontCenterThreeMaterial.uniforms.lightColor.value.set(colorWhite);
   lightRayFrontCenterThreeMaterial.uniforms.spotPosition.value = lightRayFrontCenterThree.position;
   scene.add(lightRayFrontCenterThree);

   // LIGHT RAY FRONT SIDE LAYER 1
   let lightRayFrontSideOneMaterial = lightRayMaterial.clone();
   let lightRayFrontSideOne = new THREE.Mesh(lightRayGeometry, lightRayFrontSideOneMaterial);
   lightRayFrontSideOne.position.set(9.5, -3.5, -1);
   lightRayFrontSideOne.lookAt(new THREE.Vector3(9.5, 1.5, 8));
   lightRayFrontSideOneMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRayFrontSideOneMaterial.uniforms.spotPosition.value = lightRayFrontSideOne.position;
   scene.add(lightRayFrontSideOne);

   // LIGHT RAY FRONT SIDE LAYER 2
   let lightRayFrontSideTwoMaterial = lightRayMaterial.clone();
   let lightRayFrontSideTwo = new THREE.Mesh(lightRayGeometry, lightRayFrontSideTwoMaterial);
   lightRayFrontSideTwo.position.set(9.5, -3, 0);
   lightRayFrontSideTwo.lookAt(new THREE.Vector3(9.5, 2, 9));
   lightRayFrontSideTwoMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRayFrontSideTwoMaterial.uniforms.spotPosition.value = lightRayFrontSideTwo.position;
   scene.add(lightRayFrontSideTwo);

   // LIGHT RAY FRONT SIDE LAYER 3
   let lightRayFrontSideThreeMaterial = lightRayMaterial.clone();
   let lightRayFrontSideThree = new THREE.Mesh(lightRayGeometry, lightRayFrontSideThreeMaterial);
   lightRayFrontSideThree.position.set(9.5, -2.5, 1);
   lightRayFrontSideThree.lookAt(new THREE.Vector3(9.5, 2.5, 10));
   lightRayFrontSideThreeMaterial.uniforms.lightColor.value.set(colorWhite);
   lightRayFrontSideThreeMaterial.uniforms.spotPosition.value = lightRayFrontSideThree.position;
   scene.add(lightRayFrontSideThree);

   // LIGHT RAY SIDE LEFT LAYER 1
   let lightRaySideLeftOneMaterial = lightRayMaterial.clone();
   let lightRaySideLeftOne = new THREE.Mesh(lightRaySideGeometry, lightRaySideLeftOneMaterial);
   lightRaySideLeftOne.position.set(13, -5.5, 20);
   lightRaySideLeftOne.rotateZ(-0.7);
   lightRaySideLeftOneMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRaySideLeftOneMaterial.uniforms.spotPosition.value = lightRaySideLeftOne.position;
   scene.add(lightRaySideLeftOne);

   // LIGHT RAY SIDE LEFT LAYER 2
   let lightRaySideLeftTwoMaterial = lightRayMaterial.clone();
   let lightRaySideLeftTwo = new THREE.Mesh(lightRaySideGeometry, lightRaySideLeftTwoMaterial);
   lightRaySideLeftTwo.position.set(12.5, -5, 20);
   lightRaySideLeftTwo.rotateZ(-0.7);
   lightRaySideLeftTwoMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRaySideLeftTwoMaterial.uniforms.spotPosition.value = lightRaySideLeftTwo.position;
   scene.add(lightRaySideLeftTwo);

   // LIGHT RAY SIDE LEFT LAYER 3
   let lightRaySideLeftThreeMaterial = lightRayMaterial.clone();
   let lightRaySideLeftThree = new THREE.Mesh(lightRaySideGeometry, lightRaySideLeftThreeMaterial);
   lightRaySideLeftThree.position.set(11.5, -4, 20);
   lightRaySideLeftThree.rotateZ(-0.7);
   lightRaySideLeftThreeMaterial.uniforms.lightColor.value.set(colorWhite);
   lightRaySideLeftThreeMaterial.uniforms.spotPosition.value = lightRaySideLeftThree.position;
   scene.add(lightRaySideLeftThree);

   // LIGHT RAY SIDE RIGHT LAYER 1
   let lightRaySideRightOneMaterial = lightRayMaterial.clone();
   let lightRaySideRightOne = new THREE.Mesh(lightRaySideGeometry, lightRaySideRightOneMaterial);
   lightRaySideRightOne.position.set(13.75, -6.25, 13);
   lightRaySideRightOne.rotateZ(-0.7);
   lightRaySideRightOneMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRaySideRightOneMaterial.uniforms.spotPosition.value = lightRaySideRightOne.position;
   scene.add(lightRaySideRightOne);

   // LIGHT RAY SIDE RIGHT LAYER 2
   let lightRaySideRightTwoMaterial = lightRayMaterial.clone();
   let lightRaySideRightTwo = new THREE.Mesh(lightRaySideGeometry, lightRaySideRightTwoMaterial);
   lightRaySideRightTwo.position.set(13.25, -5.75, 13);
   lightRaySideRightTwo.rotateZ(-0.7);
   lightRaySideRightTwoMaterial.uniforms.lightColor.value.set(colorOrange);
   lightRaySideRightTwoMaterial.uniforms.spotPosition.value = lightRaySideRightTwo.position;
   scene.add(lightRaySideRightTwo);

   // LIGHT RAY SIDE RIGHT LAYER 3
   let lightRaySideRightThreeMaterial = lightRayMaterial.clone();
   let lightRaySideRightThree = new THREE.Mesh(lightRaySideGeometry, lightRaySideRightThreeMaterial);
   lightRaySideRightThree.position.set(12.25, -4.75, 13);
   lightRaySideRightThree.rotateZ(-0.7);
   lightRaySideRightThreeMaterial.uniforms.lightColor.value.set(colorWhite);
   lightRaySideRightThreeMaterial.uniforms.spotPosition.value = lightRaySideRightThree.position;
   scene.add(lightRaySideRightThree);
}

function animate(){
   controls.update();
   requestAnimationFrame(animate);

   // W key
   if(keyboard[87]){ 
      camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
      camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
   }
   // S key
   if(keyboard[83]){ 
      camera.position.x += Math.sin(camera.rotation.y) * player.speed;
      camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
   }
   // A key
   if(keyboard[65]){ 
      camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
      camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
   }
   // D key
   if(keyboard[68]){ 
      camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
      camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
   }
   // left arrow key
   if(keyboard[37]){ 
      camera.rotation.y -= player.turnSpeed;
   }
   // right arrow key
   if(keyboard[39]){ 
      camera.rotation.y += player.turnSpeed;
   }
   renderer.render(scene, camera);
}
 
function keyDown(event){
   keyboard[event.keyCode] = true;
}
 
function keyUp(event){
   keyboard[event.keyCode] = false;
}

// CODE FROM https://discourse.threejs.org/t/round-edged-box/1402
function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
   let shape = new THREE.Shape();
   let eps = 0.00001;
   let radius = radius0 - eps;
   shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
   shape.absarc(eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true);
   shape.absarc(width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true);
   shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
   let geometry = new THREE.ExtrudeBufferGeometry( shape, {
     amount: depth - radius0 * 2,
     bevelEnabled: true,
     bevelSegments: smoothness * 2,
     steps: 1,
     bevelSize: radius,
     bevelThickness: radius0,
     curveSegments: smoothness
   });
   
   geometry.center();
   
   return geometry;
 }

 // CODE FROM http://jsfiddle.net/vuQ9R/13/
function newmathrandom(){
   let a = 1000 * Math.sin(2 * Math.random()-1);
   if(a > 0){
       return a 
   } else {
       return a
   }       
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;
