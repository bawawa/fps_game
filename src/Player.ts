import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {Octree} from 'three/examples/jsm/math/Octree';
import {Capsule} from 'three/examples/jsm/math/Capsule'
import {AnimationAction, AnimationClip, AnimationMixer, Group, Object3D} from "three";

const GRAVITY = 40;
interface bulletAttr{
    mesh: THREE.Mesh;
    collider: THREE.Sphere;
    velocity: THREE.Vector3;
}
class Player{
    spheres: bulletAttr[];
    scene: THREE.Scene;
    playerOnFloor: boolean;
    playerVelocity: THREE.Vector3;
    playerDirection: THREE.Vector3;
    sphereIdx: number;
    mouseTime: number;
    playerModel: Group | null;
    mixer: AnimationMixer | null;
    idleAction: AnimationAction | null;
    walkAction: AnimationAction | null;
    runAction: AnimationAction | null;
    readonly PLAYER_MODEL: string;
    readonly SPHERE_RADIUS: number;
    readonly NUM_SPHERES: number;
    readonly loader: GLTFLoader;
    readonly worldOctree: Octree;
    readonly playerCollider: Capsule;
    readonly camera: any;
    readonly vector1: THREE.Vector3;
    readonly vector2: THREE.Vector3;
    readonly vector3: THREE.Vector3;


    constructor(scene: THREE.Scene, camera: any, worldOctree: Octree) {
        this.playerModel = null;
        this.spheres = [];
        this.camera = camera;
        this.NUM_SPHERES = 100;
        this.scene = scene;
        this.SPHERE_RADIUS = 0.2;
        this.playerOnFloor = true;
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();
        this.loader = new GLTFLoader();
        this.worldOctree = worldOctree;
        this.playerCollider = new Capsule(new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35);
        this.vector1 = new THREE.Vector3();
        this.vector2 = new THREE.Vector3();
        this.vector3 = new THREE.Vector3();
        this.sphereIdx = 0;
        this.mouseTime = 0;
        this.mixer = null;
        this.idleAction = null;
        this.walkAction = null;
        this.runAction = null;
        this.PLAYER_MODEL = "https://storage.360buyimg.com/hair-mp/Soldier.glb";
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

        this.load_player_model();
    }

    load_player_model(){
        this.loader.load(this.PLAYER_MODEL,(gltf:GLTF)=>{
            this.playerModel = gltf.scene;
            const animations = gltf.animations;
            this.scene.add(gltf.scene);
            this.mixer = new AnimationMixer(this.playerModel);
            this.idleAction = this.mixer.clipAction( animations[ 0 ] );
            this.walkAction = this.mixer.clipAction(animations[ 3 ]);
            this.runAction = this.mixer.clipAction(animations[ 1 ]);
            this.playerModel.traverse( ( object: any )=> {
                if ( object?.isMesh ) object.castShadow = true;
            } );
        })
    }

    updatePlayer( deltaTime: number ) {

        let damping = Math.exp( - 4 * deltaTime ) - 1;

        if ( ! this.playerOnFloor ) {

            this.playerVelocity.y -= GRAVITY * deltaTime;

            // small air resistance
            damping *= 0.1;

        }

        this.playerVelocity.addScaledVector( this.playerVelocity, damping );

        const deltaPosition = this.playerVelocity.clone().multiplyScalar( deltaTime );
        this.playerCollider.translate( deltaPosition );
        this.mixer?.update(deltaTime);

        this.playerCollisions();

        this.camera.position.copy( this.playerCollider.end );

    }

    playerCollisions() {

        const result = this.worldOctree.capsuleIntersect( this.playerCollider );

        this.playerOnFloor = false;

        if ( result ) {

            this.playerOnFloor = result.normal.y > 0;

            if ( ! this.playerOnFloor ) {

                this.playerVelocity.addScaledVector( result.normal, - result.normal.dot( this.playerVelocity ) );

            }

            this.playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

        }

    }

    teleportPlayerIfOob() {

        if (this.camera.position.y <= -25) {

            this.playerCollider.start.set(0, 0.35, 0);
            this.playerCollider.end.set(0, 1, 0);
            this.playerCollider.radius = 0.35;
            this.camera.position.copy(this.playerCollider.end);
            this.camera.rotation.set(0, 0, 0);

        }
    }

    updateSpheres( deltaTime: number ) {

        this.spheres.forEach( sphere => {

            sphere.collider.center.addScaledVector( sphere.velocity, deltaTime );

            const result = this.worldOctree.sphereIntersect( sphere.collider );

            if ( result ) {

                sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
                sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

            } else {

                sphere.velocity.y -= GRAVITY * deltaTime;

            }

            const damping = Math.exp( - 1.5 * deltaTime ) - 1;
            sphere.velocity.addScaledVector( sphere.velocity, damping );

            this.playerSphereCollision( sphere );

        } );

        this.spheresCollisions();

        for ( const sphere of this.spheres ) {
            //@ts-ignore
            sphere.mesh.position.copy( sphere.collider.center );

        }

    }

    playerSphereCollision( sphere: bulletAttr ) {

        const center = this.vector1.addVectors( this.playerCollider.start, this.playerCollider.end ).multiplyScalar( 0.5 );

        const sphere_center = sphere.collider.center;

        const r = this.playerCollider.radius + sphere.collider.radius;
        const r2 = r * r;

        // approximation: player = 3 spheres

        for ( const point of [ this.playerCollider.start, this.playerCollider.end, center ] ) {

            const d2 = point.distanceToSquared( sphere_center );

            if ( d2 < r2 ) {

                const normal = this.vector1.subVectors( point, sphere_center ).normalize();
                const v1 = this.vector2.copy( normal ).multiplyScalar( normal.dot( this.playerVelocity ) );
                const v2 = this.vector3.copy( normal ).multiplyScalar( normal.dot( sphere.velocity ) );

                this.playerVelocity.add( v2 ).sub( v1 );
                sphere.velocity.add( v1 ).sub( v2 );

                const d = ( r - Math.sqrt( d2 ) ) / 2;
                sphere_center.addScaledVector( normal, - d );

            }

        }

    }

    spheresCollisions() {

        for ( let i = 0, length = this.spheres.length; i < length; i ++ ) {

            const s1 = this.spheres[ i ];

            for ( let j = i + 1; j < length; j ++ ) {

                const s2 = this.spheres[ j ];

                const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
                const r = s1.collider.radius + s2.collider.radius;
                const r2 = r * r;

                if ( d2 < r2 ) {

                    const normal = this.vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
                    const v1 = this.vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
                    const v2 = this.vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

                    s1.velocity.add( v2 ).sub( v1 );
                    s2.velocity.add( v1 ).sub( v2 );

                    const d = ( r - Math.sqrt( d2 ) ) / 2;

                    s1.collider.center.addScaledVector( normal, d );
                    s2.collider.center.addScaledVector( normal, - d );

                }

            }

        }

    }

    throwBall() {

        const sphere = this.spheres[ this.sphereIdx ];

        this.camera.getWorldDirection( this.playerDirection );

        sphere.collider.center.copy( this.playerCollider.end ).addScaledVector( this.playerDirection, this.playerCollider.radius * 1.5 );

        // throw the ball with more force if we hold the button longer, and if we move forward

        const impulse = 15 + 30 * ( 1 - Math.exp( ( this.mouseTime - performance.now() ) * 0.001 ) );

        sphere.velocity.copy( this.playerDirection ).multiplyScalar( impulse );
        sphere.velocity.addScaledVector( this.playerVelocity, 2 );

        this.sphereIdx = ( this.sphereIdx + 1 ) % this.spheres.length;

    }
}

export default Player;
