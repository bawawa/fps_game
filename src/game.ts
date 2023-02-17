import * as THREE from '../library/three.module'

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
    container: HTMLElement;
    //渲染器
    renderer: any;
    //重力
    readonly GRAVITY: number;
    /**
     * TODO: 使用方法
     * */
    readonly NUM_SPHERES: number;
    /**
     * TODO：使用方法
     * */
    readonly SPHERE_RADIUS: number;
    /**
     * TODO：使用方法
     * */
    readonly STEPS_PER_FRAME: number;
    readonly sphereGeometry: THREE.IcosahedronGeometry;
    readonly sphereMaterial: THREE.MeshLambertMaterial;
    spheres: bulletAttr[];
    sphereIdx: number;



    constructor() {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.fillLight1 = new THREE.HemisphereLight( 0x4488bb, 0x002244, 0.5 );
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.container = document.getElementById("container");
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.GRAVITY = 30;
        this.NUM_SPHERES = 100;
        this.SPHERE_RADIUS = 0.2;
        this.STEPS_PER_FRAME = 5;
        this.sphereGeometry = new THREE.IcosahedronGeometry( this.SPHERE_RADIUS, 5 );
        this.sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xbbbb44 } );
        this.spheres = [];
        this.sphereIdx = 0;




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
        this.container.appendChild( this.renderer.domElement );

        for ( let i = 0; i < this.NUM_SPHERES; i ++ ) {

            const sphere = new THREE.Mesh( this.sphereGeometry, this.sphereMaterial );
            sphere.castShadow = true;
            sphere.receiveShadow = true;

            this.scene.add( sphere );

            this.spheres.push( {
                mesh: sphere,
                collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), this.SPHERE_RADIUS ),
                velocity: new THREE.Vector3()
            } );

        }
    }

}
