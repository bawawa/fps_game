import Player from "./Player";
import * as THREE from 'three';

class Controller{
    player: Player;
    camera: THREE.PerspectiveCamera;
    keyStates: any;
    keyDown: (event: KeyboardEvent)=>void;
    keyUp: (event: KeyboardEvent)=>void;
    mouseDown: ()=>void;
    mouseUp: ()=>void;
    mouseMove: (event: MouseEvent)=>void;
    constructor(player: Player, camera: THREE.PerspectiveCamera) {
        this.player = player;
        this.keyStates = {};
        this.camera = camera;
        this.keyDown = this.handle_key_down.bind(this);
        this.keyUp = this.handle_key_up.bind(this);
        this.mouseDown = this.handle_mouse_down.bind(this);
        this.mouseUp = this.handle_mouse_up.bind(this);
        this.mouseMove = this.handle_mouse_move.bind(this);
        this.init();
    }

    private init(){
        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);
        document.addEventListener( 'mousedown', this.mouseDown);
        document.addEventListener( 'mouseup', this.mouseUp);
        document.addEventListener("mousemove", this.mouseMove);
    }

    private judgeWalk(){
        if(this.keyStates['KeyW'] || this.keyStates['KeyS'] || this.keyStates['KeyA'] || this.keyStates['KeyD']){
            if(this.keyStates['ShiftLeft'] || this.keyStates['ShiftRight']){

                this.player.walkAction?.stop();
                this.player.idleAction?.stop();
                this.player.runAction?.play();

            }else {

                this.player.idleAction?.stop();
                this.player.runAction?.stop();
                this.player.walkAction?.play();

            }
        }else {
            this.player.walkAction?.stop();
            this.player.runAction?.stop();
            this.player.idleAction?.play();
        }
    }

    handle_key_down(event: KeyboardEvent){
        this.keyStates[ event.code ] = true;
        this.judgeWalk();
    }

    handle_key_up(event: KeyboardEvent){
        this.keyStates[ event.code ] = false;
        this.judgeWalk()
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

    handle_mouse_move( event: MouseEvent ){

    if ( document.pointerLockElement === document.body ) {

    this.camera.rotation.y -= event.movementX / 500;
    this.camera.rotation.x -= event.movementY / 500;

}

}
    /**
     * 行走函数
     * */
    walk(deltaTime: number){
        // gives a bit of air control

        let speedDelta = 0;
        if(!this.player.playerOnFloor){
            speedDelta = deltaTime * 5;
        }else if(this.keyStates['ShiftLeft'] || this.keyStates['ShiftRight']){
            speedDelta = deltaTime * 20;
        }else {
            speedDelta = deltaTime * 8;
        }


        if ( this.keyStates[ 'KeyW' ] ) {

            this.player.playerVelocity.add( this.getForwardVector().multiplyScalar( speedDelta ) );

        }

        if ( this.keyStates[ 'KeyS' ] ) {

            this.player.playerVelocity.add( this.getForwardVector().multiplyScalar( - speedDelta ) );

        }

        if ( this.keyStates[ 'KeyA' ] ) {

            this.player.playerVelocity.add( this.getSideVector().multiplyScalar( - speedDelta * 1.5 ) );

        }

        if ( this.keyStates[ 'KeyD' ] ) {

            this.player.playerVelocity.add( this.getSideVector().multiplyScalar( speedDelta * 1.5 ) );

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
        document.removeEventListener("keydown", this.keyDown);
        document.removeEventListener("keyup", this.keyUp);
        document.removeEventListener( 'mousedown', this.mouseDown);
        document.removeEventListener( 'mouseup', this.mouseUp);
        document.removeEventListener( 'mousemove', this.mouseMove);
    }
}
export default Controller;
