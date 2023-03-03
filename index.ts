import Game from './src/game'


window.onload = ()=>{
    let game = new Game();
    Object.assign(window,{game});
}
