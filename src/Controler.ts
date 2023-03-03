import Player from "./player";
import * as THREE from 'three';

class Controler{
    player: Player;
    camera: THREE.PerspectiveCamera;
    keyStates: any;
    keyDown: Function;
    keyUp: Function;
    mouseDown: Function;
    mouseUp: Function;
    constructor(player: Player, camera: THREE.PerspectiveCamera) {
        this.player = player;
        this.keyStates = {};
        this.camera = camera;
        this.keyDown = this.handle_key_down;
        this.keyUp = this.handle_key_up;
        this.mouseDown = this.handle_mouse_down;
        this.mouseUp = this.handle_mouse_up;
    }

    init(){
        document.addEventListener("keydown", this.keyDown());
        document.addEventListener("keyup", this.keyUp());
        document.addEventListener( 'mousedown', this.mouseDown());
        document.addEventListener( 'mouseup', this.mouseUp());
    }

    handle_key_down(event: KeyboardEvent){
        this.keyStates[ event.code ] = true;
    }

    handle_key_up(event: KeyboardEvent){
        this.keyStates[ event.code ] = false;
    }

    handle_mouse_down(){

        document.body.requestPointerLock();
        this.player.mouseTime = performance.now();
    }

    handle_mouse_up(){
        if ( document.pointerLockElement !== null ) {
            this.player.throwBall();
        }
    }
    /**
     * 行走函数
     * */
    walk(deltaTime: number){
        // gives a bit of air control
        const speedDelta = deltaTime * ( this.player.playerOnFloor ? 25 : 8 );

        if ( this.keyStates[ 'KeyW' ] ) {

            this.player.playerVelocity.add( this.getForwardVector().multiplyScalar( speedDelta ) );

        }

        if ( this.keyStates[ 'KeyS' ] ) {

            this.player.playerVelocity.add( this.getForwardVector().multiplyScalar( - speedDelta ) );

        }

        if ( this.keyStates[ 'KeyA' ] ) {

            this.player.playerVelocity.add( this.getSideVector().multiplyScalar( - speedDelta ) );

        }

        if ( this.keyStates[ 'KeyD' ] ) {

            this.player.playerVelocity.add( this.getSideVector().multiplyScalar( speedDelta ) );

        }

        if ( this.player.playerOnFloor ) {

            if ( this.keyStates[ 'Space' ] ) {

                this.player.playerVelocity.y = 15;

            }

        }
    }

    getForwardVector() {

        this.camera.getWorldDirection( this.player.playerDirection );
        this.player.playerDirection.y = 0;
        this.player.playerDirection.normalize();

        return this.player.playerDirection;

    }

    getSideVector() {

        this.camera.getWorldDirection( this.player.playerDirection );
        this.player.playerDirection.y = 0;
        this.player.playerDirection.normalize();
        this.player.playerDirection.cross( this.camera.up );

        return this.player.playerDirection;

    }

    destroy(){
        document.removeEventListener("keydown", this.keyDown());
        document.removeEventListener("keyup", this.keyUp());
        document.removeEventListener( 'mousedown', this.mouseDown());
        document.removeEventListener( 'mouseup', this.mouseUp());
    }
}
export default Controler;
