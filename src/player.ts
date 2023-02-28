import * as THREE from '../library/three.module';

interface bulletAttr{
    mesh: THREE.Mesh;
    collider: THREE.Sphere;
    velocity: THREE.Vector3
}
class Player{
    spheres: bulletAttr[];
    scene: THREE.Scene;
    readonly SPHERE_RADIUS: number;
    readonly NUM_SPHERES: number;

    constructor(scene: THREE.Scene) {
        this.spheres = [];
        this.NUM_SPHERES = 100;
        this.scene = scene;
        this.SPHERE_RADIUS = 0.2
        this.init();
    }

    init(){
        for ( let i = 0; i < this.NUM_SPHERES; i ++ ) {

            // @ts-ignore
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

export default Player;