import Game from './src/Game'


window.onload = ()=>{
    let game = new Game();
    Object.assign(window,{game});
}
