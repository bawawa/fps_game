import * as THREE from 'three'

import Player from "./player";
import Controller from "./Controller";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Octree} from 'three/examples/jsm/math/Octree'
import {Group} from "three";

interface bulletAttr{
    mesh: THREE.Mesh;
    collider: THREE.Sphere;
    velocity: THREE.Vector3
}
class Game{
    //时钟
    clock: THREE.Clock;
    //场景
    scene: THREE.Scene;
    //相机
    camera: any;
    //光照
    fillLight1: any;
    //方向光
    directionalLight: any;
    //容器
    container: HTMLElement | null;
    //渲染器
    renderer: any;
    //重力
    readonly GRAVITY: number;
    /**
     * TODO: 使用方法
     * */
    /**
     * TODO：使用方法
     * */
    readonly SPHERE_RADIUS: number;
    /**
     * TODO：使用方法
     * */
    readonly worldOctree: Octree;
    readonly gltfLoader: GLTFLoader;
    readonly SCENE_MODEL: string
    readonly STEPS_PER_FRAME: number;
    readonly sphereGeometry: THREE.IcosahedronGeometry;
    readonly sphereMaterial: THREE.MeshLambertMaterial;
    keyStates: any;
    onResizeFun: ()=>void;
    player: Player;
    controler: Controller;
    animateFunc: ()=>void


    constructor() {
        this.worldOctree = new Octree();
        this.gltfLoader = new GLTFLoader();
        this.SCENE_MODEL = "https://storage.360buyimg.com/hair-mp/collision-world.glb";
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.fillLight1 = new THREE.HemisphereLight( 0x4488bb, 0x002244, 0.5 );
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.container = document.getElementById("container");
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.GRAVITY = 30;
        this.STEPS_PER_FRAME = 5;
        this.SPHERE_RADIUS = 0.2;
        this.sphereGeometry = new THREE.IcosahedronGeometry( this.SPHERE_RADIUS, 5 );
        this.sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xbbbb44 } );
        this.keyStates = {};
        this.player = new Player(this.scene, this.camera, this.worldOctree);
        this.controler = new Controller(this.player,this.camera);
        this.onResizeFun = this.onWindowResize.bind(this);
        this.animateFunc = this.animate.bind(this);


        this.init();
    }

    init(){
        this.scene.background = new THREE.Color(0x88ccee);
        this.scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );
        this.camera.rotation.order = 'YXZ';
        this.fillLight1.position.set( 2, 1, 1 );
        this.scene.add(this.fillLight1);

        this.directionalLight.position.set( - 5, 25, - 1 );
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.camera.near = 0.01;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.right = 30;
        this.directionalLight.shadow.camera.left = - 30;
        this.directionalLight.shadow.camera.top	= 30;
        this.directionalLight.shadow.camera.bottom = - 30;
        this.directionalLight.shadow.mapSize.width = 1024;
        this.directionalLight.shadow.mapSize.height = 1024;
        this.directionalLight.shadow.radius = 4;
        this.directionalLight.shadow.bias = - 0.00006;
        this.scene.add( this.directionalLight );

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container?.appendChild( this.renderer.domElement );
        this.gltfLoader.load(this.SCENE_MODEL,(gltf:GLTF)=>{
            this.scene.add(gltf.scene);
            this.worldOctree.fromGraphNode( gltf.scene );
        })

        window.addEventListener('resize', this.onResizeFun)

        this.animate();
    }

    destroy(){
        window.removeEventListener('resize', this.onResizeFun);
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    animate() {

        const deltaTime = Math.min( 0.05, this.clock.getDelta() ) / this.STEPS_PER_FRAME;

        // we look for collisions in substeps to mitigate the risk of
        // an object traversing another too quickly for detection.

        for ( let i = 0; i < this.STEPS_PER_FRAME; i ++ ) {

            this.controler.walk(deltaTime);

            this.player.updatePlayer(deltaTime);

            this.player.updateSpheres(deltaTime);

            this.player.teleportPlayerIfOob();

        }

        this.renderer.render( this.scene, this.camera );


        requestAnimationFrame( this.animateFunc );

    }

}

export default Game;
