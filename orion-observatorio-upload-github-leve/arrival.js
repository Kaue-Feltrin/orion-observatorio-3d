import {getHeralds,observatoryURL} from './herald-catalog.js';
import {revealPage} from './page-transition.js';
const params=new URLSearchParams(location.search);
if(params.has('character')){const{renderLocalCharacter}=await import('./local-character-view.js');renderLocalCharacter(params.get('character'));document.documentElement.dataset.localCharacter='ready';await revealPage();}else{
const heralds=getHeralds(params);
const herald=heralds.find(item=>item.id===params.get('herald'))??heralds[0]??getHeralds()[0];
document.querySelector('.arrival h1').textContent=herald.name;
document.querySelector('.arrival').dataset.heraldId=herald.id;
document.title=`${herald.name} · Chegada ao universo`;
document.querySelector('.arrival a').href=observatoryURL(location.href).href;
if(herald.demo)document.querySelector('.overline').textContent='Travessia de demonstração';
await revealPage();

}
