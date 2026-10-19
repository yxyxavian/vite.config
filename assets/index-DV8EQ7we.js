(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function a(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=a(r);fetch(r.href,i)}})();const ve=()=>Math.random();let ke=ve;function Z(){const e=ke();return e>=1?.999999:e<0?0:e}function R(e){return e[Math.floor(Z()*e.length)]}function O(e){const t=e.slice();for(let a=t.length-1;a>0;a--){const n=Math.floor(Z()*(a+1));[t[a],t[n]]=[t[n],t[a]]}return t}function S(e,t){return O(e).slice(0,Math.min(t,e.length))}const we=7,K=3;let $e=1;function c(e,t,a="system"){e.log.push({text:t,kind:a}),e.log.length>60&&e.log.splice(0,e.log.length-60)}function b(e,t){e.fx.push(t)}function x(e,t){return e.relics.includes(t)}function ee(e){const t=e.enemyDef.pattern;return t[e.intentIndex%t.length]}function xe(e){switch(e.kind){case"attack":return e.selfDamage?`自伤 ${e.selfDamage} · 攻击 ${e.value}`:`攻击 ${e.value}`;case"defend":return`防御 ${e.value}`;case"charge":return"蓄力";case"debuff":return e.label;default:return""}}function De(e){switch(e.kind){case"attack":return"⚔️";case"defend":return"🛡️";case"charge":return"✨";case"debuff":return"🌀";default:return"❔"}}function j(e,t){let a=t.cost;return t.type==="attack"&&e.firstAttackDiscount&&(a-=1),t.type==="defense"&&e.firstDefenseDiscount&&(a-=1),Math.max(0,a)}function te(e,t){for(let a=0;a<t;a++){if(e.hand.length>=we){c(e,"手牌已满（上限 7 张）。");return}if(e.drawPile.length===0){if(e.discardPile.length===0){c(e,"牌堆与弃牌堆都已空，无牌可抽。");return}e.drawPile=O(e.discardPile),e.discardPile=[],c(e,"弃牌堆重新洗入牌库。")}const n=e.drawPile.pop();n&&e.hand.push(n)}}function He(e,t){const a=t.deck.map(r=>({uid:$e++,def:r})),n={enemyDef:e,enemyHp:e.hp,enemyMaxHp:e.hp,enemyArmor:0,intentIndex:0,turn:0,energy:K,maxEnergy:K,playerArmor:0,drawPile:O(a),hand:[],discardPile:[],cardsPlayed:0,defensePlayed:!1,attackUsedThisTurn:!1,dmgBonus:0,firstAttackDiscount:!1,firstDefenseDiscount:!1,cannotAttack:!1,riposte:0,enemyArmorDisabled:!1,firstAttackDone:!1,energyPenalty:0,pendingDiscard:0,over:!1,log:[],fx:[]};return c(n,`遭遇 ${e.name}（${e.hp} 点生命）。`,"system"),ae(n,t),n}function ae(e,t){if(e.over)return;e.turn+=1,e.playerArmor=0,e.cardsPlayed=0,e.defensePlayed=!1,e.attackUsedThisTurn=!1,e.dmgBonus=0,e.firstAttackDiscount=!1,e.cannotAttack=!1,e.riposte=0,e.firstDefenseDiscount=x(t,"war-banner");const a=e.energyPenalty;e.energyPenalty=0,e.energy=Math.max(0,e.maxEnergy-a),a>0&&c(e,`你被削弱，本回合少 ${a} 点能量。`,"bad"),e.turn===1&&x(t,"iron-shield")&&(e.playerArmor+=3,c(e,"【铁盾】开局获得 3 点护甲。","good"));let n=5;e.turn===1&&x(t,"torch")&&(n+=1,c(e,"【火把】开局多抽 1 张牌。","good")),te(e,n),b(e,{kind:"banner",text:`第 ${e.turn} 回合`,tone:"player"}),c(e,`—— 第 ${e.turn} 回合 ——`,"system")}function Ae(e,t,a){return{player:{get hp(){return t.playerHp},set hp(s){t.playerHp=Math.max(0,Math.min(t.playerMaxHp,s))},get maxHp(){return t.playerMaxHp},set maxHp(s){t.playerMaxHp=s},get armor(){return e.playerArmor},set armor(s){e.playerArmor=Math.max(0,s)},get energy(){return e.energy},set energy(s){e.energy=s}},enemy:{get hp(){return e.enemyHp},set hp(s){e.enemyHp=s},get maxHp(){return e.enemyMaxHp},get armor(){return e.enemyArmor},set armor(s){e.enemyArmor=Math.max(0,s)}},dealDamage(s,m){if(s<=0){c(e,"没有造成伤害。");return}const p=s+e.dmgBonus;if(m!=null&&m.ignoreArmor)e.enemyHp-=p,b(e,{kind:"enemy-hit",total:p,absorbed:0,real:p}),c(e,`造成 ${p} 点伤害（无视护甲）。`,"player");else{const f=Math.min(e.enemyArmor,p);f>0&&(e.enemyArmor-=f);const o=p-f;e.enemyHp-=o,b(e,{kind:"enemy-hit",total:p,absorbed:f,real:o}),c(e,f>0?`造成 ${p} 点伤害（护甲抵挡 ${f}，实际 ${o}）。`:`造成 ${p} 点伤害。`,"player")}},gainArmor(s){s<=0||(e.playerArmor+=s,b(e,{kind:"player-armor",value:s}),c(e,`获得 ${s} 点护甲（当前 ${e.playerArmor}）。`,"good"))},heal(s){const m=t.playerHp;t.playerHp=Math.min(t.playerMaxHp,t.playerHp+s);const p=t.playerHp-m;p>0&&b(e,{kind:"player-heal",value:p}),c(e,`恢复 ${p} 点生命。`,"good")},draw(s){te(e,s)},gainEnergy(s){e.energy+=s,c(e,`获得 ${s} 点能量。`,"good")},requestDiscard(s){a.requestDiscard(s)},get enemyArmorDisabled(){return e.enemyArmorDisabled},set enemyArmorDisabled(s){e.enemyArmorDisabled=s},get dmgBonus(){return e.dmgBonus},set dmgBonus(s){e.dmgBonus=s},get cardsPlayed(){return e.cardsPlayed},set cardsPlayed(s){e.cardsPlayed=s},get defensePlayed(){return e.defensePlayed},set defensePlayed(s){e.defensePlayed=s},get cannotAttack(){return e.cannotAttack},set cannotAttack(s){e.cannotAttack=s},get riposte(){return e.riposte},set riposte(s){e.riposte=s},get firstAttackDiscount(){return e.firstAttackDiscount},set firstAttackDiscount(s){e.firstAttackDiscount=s},say(s){c(e,s,"system")}}}function Me(e,t,a){if(e.over)return!1;const n=e.hand.findIndex(f=>f.uid===a);if(n<0)return!1;const r=e.hand[n],i=r.def;if(e.cannotAttack&&i.type==="attack")return c(e,"你正在坚守，本回合无法攻击。","bad"),!1;const s=j(e,i);if(e.energy<s)return c(e,"能量不足。","bad"),!1;e.energy-=s,i.type==="attack"&&e.firstAttackDiscount&&(e.firstAttackDiscount=!1),i.type==="defense"&&e.firstDefenseDiscount&&(e.firstDefenseDiscount=!1),e.hand.splice(n,1);let m=0;i.type==="attack"&&(x(t,"whetstone")&&!e.firstAttackDone&&(m+=2,e.firstAttackDone=!0,c(e,"【磨刀石】本场第一张攻击牌 +2 伤害。","good")),x(t,"bracer")&&!e.attackUsedThisTurn&&(m+=1,e.attackUsedThisTurn=!0,c(e,"【护腕】本回合首次攻击 +1 伤害。","good"))),e.dmgBonus+=m,c(e,`你打出【${i.name}】。`,"player");const p=Ae(e,t,{requestDiscard:f=>{e.pendingDiscard+=f,c(e,`需要弃掉 ${f} 张牌。`,"system")}});return i.play(p),e.dmgBonus-=m,e.cardsPlayed+=1,i.type==="defense"&&(e.defensePlayed=!0),e.discardPile.push(r),ne(e,t),!0}function Ce(e,t){if(e.pendingDiscard<=0)return!1;const a=e.hand.findIndex(r=>r.uid===t);if(a<0)return!1;const[n]=e.hand.splice(a,1);return e.discardPile.push(n),e.pendingDiscard-=1,c(e,`弃掉【${n.def.name}】。`,"system"),!0}function Re(e,t){const a=ee(e);switch(b(e,{kind:"banner",text:"敌方回合",tone:"enemy"}),e.enemyArmor=0,a.kind){case"attack":{a.selfDamage&&(e.enemyHp-=a.selfDamage,b(e,{kind:"enemy-selfdamage",value:a.selfDamage}),c(e,`${e.enemyDef.name} 自伤 ${a.selfDamage} 点。`,"enemy"));const n=a.value,r=Math.min(e.playerArmor,n);e.playerArmor-=r;const i=n-r;t.playerHp=Math.max(0,t.playerHp-i),b(e,{kind:"enemy-attack",value:n,absorbed:r,real:i}),i>0&&b(e,{kind:"player-hurt",real:i}),c(e,`${e.enemyDef.name} 攻击 ${n} 点`+(r>0?`（护甲抵挡 ${r}，受到 ${i}）`:"")+"。","enemy"),e.riposte>0&&(e.enemyHp-=e.riposte,b(e,{kind:"riposte",value:e.riposte}),c(e,`【反击】对敌人造成 ${e.riposte} 点伤害。`,"good"));break}case"defend":{e.enemyArmorDisabled?(b(e,{kind:"enemy-defend",value:a.value,failed:!0}),c(e,`${e.enemyDef.name} 试图防御，但护甲被火焰烧穿，失效了。`,"good")):(e.enemyArmor+=a.value,b(e,{kind:"enemy-defend",value:a.value}),c(e,`${e.enemyDef.name} 获得 ${a.value} 点护甲。`,"enemy"));break}case"charge":{b(e,{kind:"enemy-charge"}),c(e,`${e.enemyDef.name} 正在蓄力……下回合将发动强力一击。`,"enemy");break}case"debuff":{e.energyPenalty=a.energyDown,b(e,{kind:"enemy-debuff",value:a.energyDown}),c(e,`${e.enemyDef.name} 施展削弱，你下回合少 ${a.energyDown} 点能量。`,"enemy");break}}e.intentIndex+=1,e.enemyArmorDisabled=!1,ne(e,t)}function Ee(e,t){return e.over?!1:e.pendingDiscard>0?(c(e,"请先完成弃牌。","bad"),!1):(e.hand.length>0&&(e.discardPile.push(...e.hand),e.hand=[]),Re(e,t),e.over||ae(e,t),!0)}function ne(e,t){e.enemyHp<=0&&(e.enemyHp=0,e.over=!0,c(e,`${e.enemyDef.name} 被击败了！`,"good")),t.playerHp<=0&&(t.playerHp=0,e.over=!0,c(e,"你倒下了……","bad"))}function Te(e,t){return e.over&&e.enemyHp<=0&&t.playerHp>0}function Pe(e,t){return t.playerHp<=0}const Ie=1024,Se=14920,Le=[[780,595],[1060,382],[1340,291],[1620,381],[1900,588],[2180,762],[2460,774],[2740,603],[3020,355],[3300,189],[3580,211],[3860,406],[4140,642],[4420,767],[4700,705],[4980,510],[5260,327],[5540,290],[5820,433],[6100,662],[6380,821],[6660,797],[6940,598],[7220,348],[7500,205],[7780,255],[8060,455],[8340,662],[8620,735],[8900,626],[9180,416],[9460,259],[9740,272],[10020,459],[10300,703],[10580,844],[10860,794],[11140,583],[11420,350],[11700,246],[11980,330],[12260,534],[12540,706],[12820,721],[13100,563],[13380,338],[13660,201],[13940,252],[14220,468],[14500,712]];function Ne(e){const t=[...Le].sort((r,i)=>i[0]-r[0]),a=t.length,n=[];for(let r=0;r<e;r++){const i=Math.min(a-1,Math.round(r*(a-1)/Math.max(1,e-1)));n.push({x:t[i][1],y:t[i][0]})}return{w:Ie,h:Se,points:n}}const Be="./",$=Be+"assets/relics/",re=[{id:"iron-shield",name:"铁盾",art:$+"relic-iron-shield.webp",desc:"每场战斗第一回合获得 3 点护甲。"},{id:"whetstone",name:"磨刀石",art:$+"relic-whetstone.webp",desc:"每场战斗第一张攻击牌 +2 伤害。"},{id:"first-aid",name:"急救包",art:$+"relic-first-aid.webp",desc:"每场战斗结束后恢复 3 点生命。"},{id:"war-banner",name:"战旗",art:$+"relic-war-banner.webp",desc:"每回合第一张防御牌费用 -1。"},{id:"knight-badge",name:"骑士徽章",art:$+"relic-knight-badge.webp",desc:"最大生命 +5。"},{id:"torch",name:"火把遗物",art:$+"relic-torch.webp",desc:"每场战斗第一回合多抽 1 张牌。"},{id:"bracer",name:"护腕",art:$+"relic-bracer.webp",desc:"每回合第一次攻击 +1 伤害。"},{id:"old-map",name:"旧地图",art:$+"relic-old-map.webp",desc:"事件节点多一个选项。"}],T=Object.fromEntries(re.map(e=>[e.id,e])),se="knight_trials_save_v1",C={bestNode:0,bestTimeMs:0,wins:0,runs:0,lastPlayedAt:"",settings:{sound:!1}};function q(){var e;try{const t=localStorage.getItem(se);if(!t)return{...C,settings:{...C.settings}};const a=JSON.parse(t);return{bestNode:Number(a.bestNode)||0,bestTimeMs:Number(a.bestTimeMs)||0,wins:Number(a.wins)||0,runs:Number(a.runs)||0,lastPlayedAt:typeof a.lastPlayedAt=="string"?a.lastPlayedAt:"",settings:{sound:!!((e=a.settings)!=null&&e.sound)}}}catch{return{...C,settings:{...C.settings}}}}function ie(e){try{e.lastPlayedAt=new Date().toISOString(),localStorage.setItem(se,JSON.stringify(e))}catch{}}function _e(){const e=q();return e.runs+=1,ie(e),e}function W(e,t,a){const n=q();return e>n.bestNode&&(n.bestNode=e),a&&(n.wins+=1,(n.bestTimeMs===0||t<n.bestTimeMs)&&(n.bestTimeMs=t)),ie(n),n}function le(e){if(!e||e<=0)return"--:--";const t=Math.floor(e/1e3),a=Math.floor(t/60),n=t%60;return`${String(a).padStart(2,"0")}:${String(n).padStart(2,"0")}`}const Oe="./",l=Oe+"assets/cards/",je=[{id:"charge",name:"冲锋",type:"attack",cost:1,art:l+"card-atk-charge.webp",desc:"造成 3 点伤害。",play:e=>{e.dealDamage(3)}},{id:"double-slash",name:"双重斩",type:"attack",cost:1,art:l+"card-atk-double-slash.webp",desc:"造成 2 点伤害；若本回合先出过防御牌，再造成 2 点。",play:e=>{e.dealDamage(2),e.defensePlayed&&e.dealDamage(2)}},{id:"combo",name:"连击",type:"attack",cost:1,art:l+"card-atk-combo.webp",desc:"若本回合已出过 2 张牌，造成 4 点伤害；否则 2 点。",play:e=>{e.dealDamage(e.cardsPlayed>=2?4:2)}},{id:"charged-slash",name:"蓄力斩",type:"attack",cost:2,art:l+"card-atk-charged-slash.webp",desc:"造成 8 点伤害。",play:e=>{e.dealDamage(8)}},{id:"sunder",name:"破甲",type:"attack",cost:1,art:l+"card-atk-sunder.webp",desc:"移除敌人全部护甲，并造成 1 点伤害。",play:e=>{e.enemy.armor>0&&(e.say(`破甲击碎了敌人 ${e.enemy.armor} 点护甲。`),e.enemy.armor=0),e.dealDamage(1)}},{id:"torch",name:"火把",type:"attack",cost:1,art:l+"card-atk-torch.webp",desc:"造成 1 点伤害；敌人护甲在下个敌人回合失效。",play:e=>{e.dealDamage(1),e.enemyArmorDisabled=!0,e.say("火焰灼烧，敌人下回合无法获得护甲。")}},{id:"shield-bash",name:"盾击",type:"attack",cost:1,art:l+"card-atk-shield-bash.webp",desc:"造成等于当前护甲一半的伤害（向下取整）。",play:e=>{e.dealDamage(Math.floor(e.player.armor/2))}},{id:"smash",name:"猛击",type:"attack",cost:2,art:l+"card-atk-smash.webp",desc:"造成 6 点伤害。",play:e=>{e.dealDamage(6)}},{id:"whirlwind",name:"回旋斩",type:"attack",cost:2,art:l+"card-atk-whirlwind.webp",desc:"造成 3 点伤害，抽 1 张牌。",play:e=>{e.dealDamage(3),e.draw(1)}},{id:"execute",name:"处决",type:"attack",cost:2,art:l+"card-atk-execute.webp",desc:"若敌人生命 ≤ 6，造成 10 点伤害；否则 3 点。",play:e=>{const t=e.enemy.hp<=6;t&&e.say("处决！重伤的敌人被一剑了结。"),e.dealDamage(t?10:3)}}],qe=[{id:"shield-wall",name:"盾墙",type:"defense",cost:1,art:l+"card-def-shield-wall.webp",desc:"获得 3 点护甲。",play:e=>{e.gainArmor(3)}},{id:"hold-line",name:"坚守",type:"defense",cost:1,art:l+"card-def-hold-line.webp",desc:"获得 5 点护甲；本回合不能攻击。",play:e=>{e.gainArmor(5),e.cannotAttack=!0,e.say("你选择坚守阵地，本回合无法再攻击。")}},{id:"riposte",name:"反击",type:"defense",cost:1,art:l+"card-def-riposte.webp",desc:"本回合受到攻击时，对敌人造成 3 点伤害。",play:e=>{e.riposte+=3,e.say("你摆出反击架势。")}},{id:"oath",name:"骑士誓言",type:"defense",cost:1,art:l+"card-def-oath.webp",desc:"若生命 ≤ 10，获得 6 点护甲；否则获得 3 点护甲。",play:e=>{e.gainArmor(e.player.hp<=10?6:3)}},{id:"bulwark",name:"铁壁",type:"defense",cost:2,art:l+"card-def-bulwark.webp",desc:"获得 8 点护甲。",play:e=>{e.gainArmor(8)}},{id:"dodge",name:"闪避",type:"defense",cost:0,art:l+"card-def-dodge.webp",desc:"获得 2 点护甲，抽 1 张牌。",play:e=>{e.gainArmor(2),e.draw(1)}}],Fe=[{id:"rally",name:"集结",type:"utility",cost:1,art:l+"card-utl-rally.webp",desc:"抽 1 张牌。",play:e=>{e.draw(1)}},{id:"heal",name:"治疗",type:"utility",cost:1,art:l+"card-utl-heal.webp",desc:"恢复 4 点生命。",play:e=>{e.heal(4)}},{id:"energy",name:"能量药剂",type:"utility",cost:0,art:l+"card-utl-energy.webp",desc:"获得 1 点能量（本回合有效）。",play:e=>{e.gainEnergy(1)}},{id:"whetstone",name:"磨刀",type:"utility",cost:1,art:l+"card-utl-whetstone.webp",desc:"本回合攻击牌伤害 +2。",play:e=>{e.dmgBonus+=2,e.say("你磨快了剑刃，本回合攻击 +2 伤害。")}},{id:"command",name:"号令",type:"utility",cost:1,art:l+"card-utl-command.webp",desc:"本回合第一张攻击牌费用 -1。",play:e=>{e.firstAttackDiscount=!0,e.say("号令已下，本回合第一张攻击牌费用 -1。")}},{id:"tactics",name:"战术准备",type:"utility",cost:1,art:l+"card-utl-tactics.webp",desc:"抽 2 张牌，然后弃 1 张牌。",play:e=>{e.draw(2),e.requestDiscard(1)}},{id:"inspire",name:"鼓舞",type:"utility",cost:0,art:l+"card-utl-inspire.webp",desc:"获得 2 点护甲，抽 1 张牌。",play:e=>{e.gainArmor(2),e.draw(1)}},{id:"crest",name:"骑士徽记",type:"utility",cost:2,art:l+"card-utl-crest.webp",desc:"最大生命 +3，并恢复 3 点生命。",play:e=>{e.player.maxHp+=3,e.player.hp+=3,e.say("骑士徽记闪耀，最大生命 +3。")}}],Ue=[{id:"flame-slash",name:"烈焰斩",type:"attack",cost:2,art:l+"card-atk-flame-slash.webp",desc:"造成 5 点伤害，无视护甲。",play:e=>{e.dealDamage(5,{ignoreArmor:!0})}},{id:"heavy-blow",name:"重锤",type:"attack",cost:2,art:l+"card-atk-heavy-blow.webp",desc:"造成 4 点伤害，并移除敌人 4 点护甲。",play:e=>{e.enemy.armor=Math.max(0,e.enemy.armor-4),e.dealDamage(4)}},{id:"shatter-break",name:"碎甲击",type:"attack",cost:1,art:l+"card-atk-shatter.webp",desc:"造成 2 点伤害；若敌人有护甲，改为造成 5 点伤害。",play:e=>{e.dealDamage(e.enemy.armor>0?5:2)}}],ze=[{id:"thorn-shield",name:"荆棘盾",type:"defense",cost:1,art:l+"card-def-thorn-shield.webp",desc:"获得 4 点护甲；本回合受到攻击时对敌人造成 2 点伤害。",play:e=>{e.gainArmor(4),e.riposte=e.riposte+2,e.say("荆棘竖起：本回合被攻击时反伤 2 点。")}},{id:"holy-ward",name:"圣盾",type:"defense",cost:2,art:l+"card-def-holy-ward.webp",desc:"获得 6 点护甲，恢复 2 点生命。",play:e=>{e.gainArmor(6),e.heal(2)}}],Ye=[{id:"swiftness",name:"迅捷",type:"utility",cost:1,art:l+"card-utl-swiftness.webp",desc:"抽 2 张牌。",play:e=>{e.draw(2)}},{id:"holy-light",name:"圣光",type:"utility",cost:2,art:l+"card-utl-holy-light.webp",desc:"恢复 8 点生命。",play:e=>{e.heal(8)}},{id:"blood-rage",name:"血怒",type:"utility",cost:0,art:l+"card-utl-blood-rage.webp",desc:"失去 2 点生命，本回合攻击牌伤害 +3。",play:e=>{e.player.hp=Math.max(1,e.player.hp-2),e.dmgBonus=e.dmgBonus+3,e.say("怒火燃烧：本回合攻击 +3 伤害。")}}],ce=[...je,...qe,...Fe,...Ue,...ze,...Ye],Ge=Object.fromEntries(ce.map(e=>[e.id,e])),Ke=["charge","charge","charge","charge","shield-wall","shield-wall","shield-wall","heal","rally","sunder"];function We(){return Ke.map(e=>Ge[e])}function oe(){return ce}const Je="./",y=Je+"assets/enemies/",L=[{id:"goblin",name:"哥布林",hp:12,art:y+"enemy-goblin.webp",tier:"normal",pattern:[{kind:"attack",value:4},{kind:"defend",value:3}]},{id:"wolf",name:"狼",hp:10,art:y+"enemy-wolf.webp",tier:"normal",pattern:[{kind:"attack",value:3},{kind:"attack",value:5}]},{id:"archer",name:"弓箭手",hp:14,art:y+"enemy-archer.webp",tier:"normal",pattern:[{kind:"attack",value:5},{kind:"charge"},{kind:"attack",value:7}]},{id:"shieldman",name:"盾兵",hp:18,art:y+"enemy-shieldman.webp",tier:"normal",pattern:[{kind:"defend",value:6},{kind:"attack",value:4}]},{id:"mage",name:"法师",hp:16,art:y+"enemy-mage.webp",tier:"normal",pattern:[{kind:"attack",value:7},{kind:"debuff",energyDown:1,label:"削弱"}]},{id:"berserker",name:"狂战士",hp:20,art:y+"enemy-berserker.webp",tier:"normal",pattern:[{kind:"attack",value:6},{kind:"attack",value:8,selfDamage:2}]},{id:"assassin",name:"刺客",hp:12,art:y+"enemy-assassin.webp",tier:"normal",pattern:[{kind:"attack",value:8},{kind:"defend",value:2}]},{id:"gargoyle",name:"石像鬼",hp:22,art:y+"enemy-gargoyle.webp",tier:"normal",pattern:[{kind:"defend",value:8},{kind:"attack",value:5}]}],N={id:"fallen-knight",name:"堕落骑士",hp:40,art:y+"enemy-boss-fallen-knight.webp",tier:"boss",pattern:[{kind:"attack",value:8},{kind:"defend",value:6},{kind:"charge"},{kind:"attack",value:14}]},B=[{id:"skeleton",name:"骷髅兵",hp:15,art:y+"enemy-skeleton.webp",tier:"normal",pattern:[{kind:"attack",value:4},{kind:"attack",value:4},{kind:"defend",value:4}]},{id:"bat",name:"巨蝠",hp:12,art:y+"enemy-bat.webp",tier:"normal",pattern:[{kind:"attack",value:3},{kind:"debuff",energyDown:1,label:"尖啸：能量 -1"}]},{id:"ghost",name:"幽灵",hp:17,art:y+"enemy-ghost.webp",tier:"normal",pattern:[{kind:"attack",value:5},{kind:"defend",value:5}]},{id:"spider",name:"毒蛛",hp:14,art:y+"enemy-spider.webp",tier:"normal",pattern:[{kind:"attack",value:4},{kind:"attack",value:2},{kind:"debuff",energyDown:1,label:"毒雾：能量 -1"}]}],de=[{id:"ogre",name:"食人魔",hp:28,art:y+"enemy-ogre.webp",tier:"normal",pattern:[{kind:"attack",value:7},{kind:"charge"},{kind:"attack",value:10}]},{id:"orc",name:"兽人武士",hp:26,art:y+"enemy-orc.webp",tier:"normal",pattern:[{kind:"attack",value:6},{kind:"defend",value:5},{kind:"attack",value:8}]},{id:"necromancer",name:"死灵法师",hp:22,art:y+"enemy-necromancer.webp",tier:"normal",pattern:[{kind:"charge"},{kind:"attack",value:9},{kind:"defend",value:4}]},{id:"dragon",name:"幼龙",hp:32,art:y+"enemy-dragon.webp",tier:"normal",pattern:[{kind:"attack",value:8},{kind:"defend",value:6},{kind:"attack",value:10}]}];function Ve(e){return{...e,name:e.name+"（精英）",hp:e.hp+6,tier:"elite"}}Object.fromEntries([...L,...B,...de,N].map(e=>[e.id,e]));const pe=[{id:"campfire",name:"篝火",text:"林间空地上有一堆还在燃烧的篝火，暖意驱散了你的疲惫。你可以在这里休整，也可以把行囊里多余的牌烧掉。",options:[{label:"坐下休息",hint:"恢复 8 点生命",effect:{heal:8}},{label:"烧掉一张牌",hint:"从牌组中移除一张牌",effect:{removeCard:!0}}]},{id:"blacksmith",name:"铁匠",text:"一位独眼铁匠在路边支起了炉子。他盯上了你的生命力，说可以用一件古物交换。",options:[{label:"接受交易",hint:"获得一个随机遗物，最大生命 -3",effect:{randomRelic:!0,maxHp:-3}},{label:"谢绝离开",hint:"什么也不发生",effect:{}}]},{id:"training",name:"训练场",text:"废弃的训练场上还立着几个稻草人。你在角落里翻出几卷残破的招式图谱。",options:[{label:"翻阅图谱",hint:"从 3 张随机卡中选 1 张加入牌组",effect:{addCardChoices:!0}},{label:"专心练剑",hint:"恢复 4 点生命",effect:{heal:4}}]},{id:"altar",name:"神秘祭坛",text:"一座覆满苔藓的石祭坛立在雾中，坛上刻着你读不懂的文字。它似乎在等待献祭，也在等待馈赠。",options:[{label:"触碰祭坛",hint:"最大生命 +5",effect:{maxHp:5}},{label:"搜刮供品",hint:"获得 30 金币",effect:{gold:30}}]},{id:"battlefield",name:"旧战场",text:"锈蚀的兵器散落一地，乌鸦在远处盘旋。这里曾经死过很多人，也许还留着些有用的东西。",options:[{label:"搜寻遗物",hint:"获得一个随机遗物",effect:{randomRelic:!0}},{label:"就地包扎",hint:"恢复 5 点生命",effect:{heal:5}}]}];Object.fromEntries(pe.map(e=>[e.id,e]));const Qe={battle:{label:"普通战斗",icon:"⚔️",desc:"击败敌人，获得一张新牌"},elite:{label:"精英战斗",icon:"🛡️",desc:"强敌，战后获得遗物与卡牌"},event:{label:"事件",icon:"❓",desc:"未知的遭遇"},camp:{label:"休营地",icon:"⛺",desc:"休整：恢复生命或删牌"},boss:{label:"Boss 战",icon:"👑",desc:"堕落骑士在此等候"}};function Xe(e){const t=30+Math.floor(e()*21),a=new Array(t).fill("battle");a[0]="battle",a[1]="battle",a[t-1]="boss";const n=[];for(let o=2;o<t-1;o++)n.push(o);for(let o=n.length-1;o>0;o--){const M=Math.floor(e()*(o+1));[n[o],n[M]]=[n[M],n[o]]}const r=t-2,i=Math.max(4,Math.round(r*.14)),s=Math.max(4,Math.round(r*.2)),m=Math.max(3,Math.floor(t/8));let p=0;const f=o=>n.slice(p,p+=o);for(const o of f(i))a[o]="event";for(const o of f(s))a[o]="elite";for(const o of f(m))a[o]="camp";return a.map((o,M)=>{const G=Qe[o];return{index:M,kind:o,label:G.label,icon:G.icon}})}const h={run:null,save:q()};function u(){if(!h.run)throw new Error("还没有进行中的对局");return h.run}function Ze(){return h.run!==null}function et(){h.save=_e();const e={screen:"map",map:Xe(Math.random),nodeIndex:0,playerHp:35,playerMaxHp:35,deck:We(),relics:[],gold:0,startTime:Date.now(),endTime:null,result:null,battle:null,rewardChoices:null,rewardRelicChoices:null,eventDef:null,eventResult:null,pendingRemove:!1,pendingCardChoices:null,message:null,nodeResults:[]};return h.run=e,e}function tt(){h.run=null}function I(e,t){return e+Math.floor(t*1)}function J(e){const t=e.nodeIndex/Math.max(1,e.map.length-1);return t<.4?L:t<.72?[...L,...B]:[...B,...de]}function at(){const e=u();if(e.nodeIndex>=e.map.length)return;const t=e.map[e.nodeIndex].kind;if(t==="battle"||t==="elite"||t==="boss"){let a;if(t==="boss")a={...N,hp:I(N.hp,e.nodeIndex)};else if(t==="elite"){const n=R(J(e));a=Ve({...n,hp:I(n.hp,e.nodeIndex)})}else{const n=R(J(e));a={...n,hp:I(n.hp,e.nodeIndex)}}e.battle=He(a,e),e.screen="battle";return}if(t==="camp"){e.eventResult=null,e.pendingRemove=!1,e.pendingCardChoices=null,e.screen="camp";return}e.eventDef=R(pe),e.eventResult=null,e.pendingRemove=!1,e.pendingCardChoices=null,e.screen="event"}function ue(e){return Math.max(3,Math.floor(e.playerMaxHp*.3))}function nt(){const e=u(),t=ue(e),a=e.playerHp;e.playerHp=Math.min(e.playerMaxHp,e.playerHp+t);const n=e.playerHp-a;e.eventResult=n>0?`你在篝火旁休整，恢复了 ${n} 点生命。`:"生命已满，好好休息了一晚。"}function rt(){const e=u();e.pendingRemove=!0,e.eventResult=null}function st(){const e=u();if(e.eventResult=null,e.pendingRemove=!1,e.nodeIndex+=1,e.nodeIndex>=e.map.length){e.screen="result";return}e.screen="map"}function it(){const e=u(),t=e.battle;if(!t)return;if(Pe(t,e)){e.result="lose",e.screen="result",e.endTime=Date.now(),e.battle=null,h.save=W(e.nodeIndex+1,0,!1);return}if(!Te(t,e))return;if(x(e,"first-aid")){const r=e.playerHp;e.playerHp=Math.min(e.playerMaxHp,e.playerHp+3),e.playerHp>r&&t.log.push({text:"【急救包】战斗结束恢复 3 点生命。",kind:"good"})}if(t.enemyDef.tier==="elite"&&e.playerHp<e.playerMaxHp){const r=e.playerHp,i=4+Math.floor(e.nodeIndex/6);e.playerHp=Math.min(e.playerMaxHp,e.playerHp+i),e.playerHp>r&&t.log.push({text:`战后休整，恢复 ${e.playerHp-r} 点生命。`,kind:"good"})}const a=t.enemyDef.tier==="boss",n=t.enemyDef.tier==="elite";if(e.nodeResults.push({index:e.nodeIndex,label:`击破 ${t.enemyDef.name}`}),e.battle=null,a){e.result="win",e.screen="result",e.endTime=Date.now();const r=e.endTime-e.startTime;h.save=W(e.map.length,r,!0);return}e.rewardChoices=S(oe(),3),e.rewardRelicChoices=n?S(me(e),3).map(r=>r.id):null,e.rewardRelicChoices&&e.rewardRelicChoices.length===0&&(e.rewardRelicChoices=null),e.screen="reward"}function me(e){const t=new Set(e.relics);return re.filter(a=>!t.has(a.id))}function lt(e){const t=u();t.rewardChoices&&(e>=0&&e<t.rewardChoices.length&&t.deck.push(t.rewardChoices[e]),t.rewardChoices=null,F())}function ct(e){const t=u();t.rewardRelicChoices&&(t.rewardRelicChoices.includes(e)&&fe(e),t.rewardRelicChoices=null,F())}function ot(){const e=u();e.rewardChoices=null,e.rewardRelicChoices=null,F()}function F(){const e=u();if(!(e.rewardChoices||e.rewardRelicChoices)){if(e.nodeIndex+=1,e.nodeIndex>=e.map.length){e.screen="result";return}e.screen="map"}}function fe(e){const t=u();!T[e]||t.relics.includes(e)||(t.relics.push(e),e==="knight-badge"&&(t.playerMaxHp+=5,t.playerHp+=5))}function ye(){const e=u(),t=e.eventDef;if(!t)return[];const a=t.options.slice();return x(e,"old-map")&&a.push({label:"【旧地图】绕道而行",hint:"恢复 4 点生命并获得 10 金币",effect:{heal:4,gold:10}}),a}function dt(e){const t=u(),n=ye()[e];if(!n)return;const r=n.effect,i=[];if(r.heal){const s=t.playerHp;t.playerHp=Math.min(t.playerMaxHp,t.playerHp+r.heal),i.push(`恢复 ${t.playerHp-s} 点生命`)}if(r.maxHp&&(t.playerMaxHp=Math.max(1,t.playerMaxHp+r.maxHp),r.maxHp>0?t.playerHp+=r.maxHp:t.playerHp=Math.min(t.playerHp,t.playerMaxHp),i.push(`最大生命 ${r.maxHp>0?"+":""}${r.maxHp}`)),r.gold&&(t.gold+=r.gold,i.push(`获得 ${r.gold} 金币`)),r.randomRelic){const s=me(t);if(s.length){const m=R(s);fe(m.id),i.push(`获得遗物【${m.name}】`)}else i.push("没有可获得的遗物了")}if(t.eventResult=i.length?i.join("，")+"。":"什么也没有发生。",r.removeCard){t.pendingRemove=!0,t.eventResult="选择一张牌从牌组中永久移除。";return}if(r.addCardChoices){t.pendingCardChoices=S(oe(),3),t.eventResult="从下列卡牌中选择一张加入牌组。";return}}function pt(e){const t=u(),a=t.deck.findIndex(n=>n.id===e);if(a>=0){const[n]=t.deck.splice(a,1);t.eventResult=`【${n.name}】已被烧毁。`}t.pendingRemove=!1}function ut(e){var n;const t=u(),a=(n=t.pendingCardChoices)==null?void 0:n.find(r=>r.id===e);a&&(t.deck.push(a),t.eventResult=`【${a.name}】加入了牌组。`),t.pendingCardChoices=null}function mt(){const e=u();if(e.eventDef=null,e.eventResult=null,e.pendingRemove=!1,e.pendingCardChoices=null,e.nodeIndex+=1,e.nodeIndex>=e.map.length){e.screen="result";return}e.screen="map"}function ft(e){return(e.endTime??Date.now())-e.startTime}function yt(){const e=h.save.bestNode;return e>0?`${e} 关`:"—"}function d(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const P={attack:"t-attack",defense:"t-defense",utility:"t-utility"};function ht(e,t,a){const n=e.def,r=j(t,n),i=a?!1:r>t.energy||t.cannotAttack&&n.type==="attack",s=a?"discard-card":"play-card";return`
    <button class="card ${P[n.type]} ${i?"is-disabled":""}" 
            data-action="${s}" data-uid="${e.uid}">
      <span class="card-cost">${r}</span>
      <span class="card-art"><img src="${n.art}" alt="" loading="lazy" /></span>
      <span class="card-name">${d(n.name)}</span>
      <span class="card-desc">${d(n.desc)}</span>
    </button>`}function he(e,t){return`
    <button class="card card-big ${P[e.type]}" data-action="${t}" data-card="${e.id}">
      <span class="card-cost">${e.cost}</span>
      <span class="card-art"><img src="${e.art}" alt="" /></span>
      <span class="card-name">${d(e.name)}</span>
      <span class="card-desc">${d(e.desc)}</span>
    </button>`}function bt(e,t,a="player"){const n=t>0?Math.max(0,Math.min(100,e/t*100)):0;return`
    <div class="hp-bar ${a}">
      <div class="hp-fill" style="width:${n}%"></div>
      <span class="hp-text">${e} / ${t}</span>
    </div>`}function gt(e){return`<div class="intent intent-${e.kind}">
      <span class="intent-icon">${De(e)}</span>
      <span class="intent-text">${d(xe(e))}</span>
    </div>`}function vt(e){return e.length?`<div class="relic-strip">${e.map(a=>{const n=T[a];return n?`<div class="relic" title="${d(n.name)}：${d(n.desc)}">
          <img src="${n.art}" alt="${d(n.name)}" />
        </div>`:""}).join("")}</div>`:""}function kt(e){return e.slice(-8).map(a=>`<div class="log-line log-${a.kind}">${d(a.text)}</div>`).join("")}const wt="./",U=wt+"assets/ui/";function V(){const e=h.save;return`
  <div class="screen screen-start">
    <img class="bg" src="${U}ui-bg-start.webp" alt="" />
    <div class="start-inner">
      <div class="title-block">
        <h1 class="game-title">骑士试炼</h1>
        <p class="game-sub">随机长征 · 30~50 关</p>
      </div>
      <button class="btn btn-primary btn-lg" data-action="start">开始试炼</button>
      <div class="stat-grid">
        <div class="stat"><b>${yt()}</b><span>最远节点</span></div>
        <div class="stat"><b>${e.wins}</b><span>胜场</span></div>
        <div class="stat"><b>${e.runs}</b><span>局数</span></div>
        <div class="stat"><b>${le(e.bestTimeMs)}</b><span>最佳用时</span></div>
      </div>
      <button class="btn btn-ghost" data-action="help">玩法说明</button>
    </div>
  </div>`}function Q(){const e=u(),t=Math.min(e.nodeIndex,e.map.length-1),a=e.map.length,n=Ne(a),r=e.map.map((i,s)=>{const m=n.points[s],p=s<t,f=s===t,o=s===a-1;return`
      <div class="path-node ${i.kind} ${p?"done":""} ${f?"current":""}"
           style="left:${(m.x/n.w*100).toFixed(2)}%;top:${(m.y/n.h*100).toFixed(2)}%"
           ${f?'data-action="enter-node"':'aria-hidden="true"'}>
        <span class="path-icon">${p?"✓":i.icon}</span>
        ${f?'<span class="path-now">▼ 当前</span>':""}
        ${o&&!p?'<span class="path-king">👑</span>':""}
      </div>`}).join("");return`
  <div class="screen screen-map">
    <div class="map-inner">
      <header class="top-bar">
        <span class="node-tag">节点 ${t+1} / ${a}</span>
        <span class="hp-inline">❤️ ${e.playerHp} / ${e.playerMaxHp}</span>
        <span class="gold-inline">🪙 ${e.gold}</span>
      </header>
      ${vt(e.relics)}
      <div class="map-scroll">
        <div class="path-track" style="aspect-ratio:${n.w} / ${n.h};">
          <img class="map-img" src="${U}ui-map-long.webp" alt="" />
          ${r}
          <div class="path-castle-tag">堕落骑士的城堡 👑</div>
          <div class="path-start">起点 · 出发！</div>
        </div>
      </div>
      <div class="map-foot">
        <button class="btn btn-primary btn-lg" data-action="enter-node">进入节点</button>
        <button class="btn btn-ghost btn-sm" data-action="abandon">放弃本局</button>
      </div>
    </div>
  </div>`}function $t(){const e=u(),t=e.battle;if(!t)return"";const a=ee(t),n=t.pendingDiscard>0,r=e.playerHp<=0;t.enemyHp<=0;const i=t.hand.map(m=>ht(m,t,n)).join(""),s=t.over?`<div class="battle-over">
        <div class="battle-over-box">
          <div class="battle-over-title">${r?"你倒下了":"战斗胜利"}</div>
          <p>${r?"这一局到此为止。":`击败了 ${d(t.enemyDef.name)}。`}</p>
          <button class="btn btn-primary" data-action="finish-battle">继续</button>
        </div>
      </div>`:"";return`
  <div class="screen screen-battle">
    <img class="bg bg-battle" src="${U}ui-bg-battle.webp" alt="" />
    <div class="battle-inner">
      <header class="top-bar">
        <span class="node-tag">节点 ${e.nodeIndex+1} / ${e.map.length}</span>
        <span class="turn-tag">第 ${t.turn} 回合</span>
        <span class="hp-inline">❤️ ${e.playerHp}</span>
      </header>

      <section class="enemy-zone">
        <div class="enemy-head">
          <span class="enemy-name">${d(t.enemyDef.name)}</span>
          ${t.enemyArmor>0?`<span class="armor-chip">🛡️ ${t.enemyArmor}</span>`:""}
        </div>
        ${bt(t.enemyHp,t.enemyMaxHp,"enemy")}
        <div class="enemy-stage">
          <img class="enemy-art" src="${t.enemyDef.art}" alt="${d(t.enemyDef.name)}" />
          ${gt(a)}
        </div>
      </section>

      <section class="player-zone">
        <div class="ps p-hp">❤️ ${e.playerHp} / ${e.playerMaxHp}</div>
        <div class="ps p-armor">🛡️ ${t.playerArmor}</div>
        <div class="ps p-energy">⚡ ${t.energy} / ${t.maxEnergy}</div>
      </section>

      <section class="log-box">
        <div class="log-inner" id="battle-log">${kt(t.log)}</div>
      </section>

      ${n?'<div class="hint-bar">请选择一张牌弃掉（'+t.pendingDiscard+"）</div>":""}
      ${t.cannotAttack?'<div class="hint-bar">坚守中：本回合无法攻击</div>':""}

      <section class="hand-zone">
        <div class="hand-scroll">${i}</div>
      </section>

      <footer class="battle-foot">
        <div class="piles">
          <span>牌库 ${t.drawPile.length}</span>
          <span>弃牌 ${t.discardPile.length}</span>
        </div>
        <button class="btn btn-primary end-turn" data-action="end-turn" ${t.over||n?"disabled":""}>
          结束回合
        </button>
      </footer>

      ${s}
    </div>
  </div>`}function xt(){const e=u();return e.rewardChoices?`
    <div class="screen screen-reward">
      <div class="panel">
        <h2 class="panel-title">战斗胜利</h2>
        <p class="panel-sub">选择一张牌加入牌组</p>
        <div class="reward-row">
          ${e.rewardChoices.map(t=>he(t,"pick-reward")).join("")}
        </div>
        <button class="btn btn-ghost" data-action="skip-reward">跳过</button>
      </div>
    </div>`:e.rewardRelicChoices?`
    <div class="screen screen-reward">
      <div class="panel">
        <h2 class="panel-title">精英战利品</h2>
        <p class="panel-sub">选择一个遗物</p>
        <div class="relic-row">${e.rewardRelicChoices.map(a=>{const n=T[a];return n?`<button class="relic-pick" data-action="pick-relic" data-relic="${a}">
            <img src="${n.art}" alt="${d(n.name)}" />
            <b>${d(n.name)}</b>
            <span>${d(n.desc)}</span>
          </button>`:""}).join("")}</div>
        <button class="btn btn-ghost" data-action="skip-reward">不要了</button>
      </div>
    </div>`:""}function be(){const e=u(),t=new Map;for(const n of e.deck){const r=t.get(n.id);r?r.n+=1:t.set(n.id,{def:n,n:1})}return`<div class="deck-pick">${[...t.values()].map(({def:n,n:r})=>`<button class="deck-chip ${P[n.type]}" data-action="remove-card" data-card="${n.id}">
            ${d(n.name)}${r>1?` ×${r}`:""}
          </button>`).join("")}</div>`}function Dt(){const e=u(),t=e.eventDef;if(!t)return"";let a="";return e.pendingRemove?a=be():e.pendingCardChoices?a=`<div class="reward-row">${e.pendingCardChoices.map(n=>he(n,"pick-event-card")).join("")}</div>`:e.eventResult?a=`
      <p class="event-result">${d(e.eventResult)}</p>
      <button class="btn btn-primary" data-action="leave-event">继续前进</button>`:a=`<div class="option-list">${ye().map((r,i)=>`
        <button class="option" data-action="event-option" data-index="${i}">
          <b>${d(r.label)}</b>
          ${r.hint?`<span>${d(r.hint)}</span>`:""}
        </button>`).join("")}</div>`,`
  <div class="screen screen-event">
    <div class="panel event-panel">
      <div class="event-icon">❓</div>
      <h2 class="panel-title">${d(t.name)}</h2>
      <p class="event-text">${d(t.text)}</p>
      ${a}
    </div>
  </div>`}function Ht(){const e=u();let t="";return e.pendingRemove?t=`<p class="event-text">选择一张牌，把它熔进篝火里。</p>${be()}`:e.eventResult?t=`
      <p class="event-result">${d(e.eventResult)}</p>
      <button class="btn btn-primary" data-action="leave-camp">继续前进</button>`:t=`
      <div class="option-list">
        <button class="option" data-action="camp-heal">
          <b>⛺ 篝火休整</b>
          <span>恢复 ${ue(e)} 点生命</span>
        </button>
        <button class="option" data-action="camp-remove">
          <b>🔥 打磨装备</b>
          <span>从牌组中永久移除一张牌</span>
        </button>
      </div>`,`
  <div class="screen screen-event">
    <div class="panel event-panel">
      <div class="event-icon">⛺</div>
      <h2 class="panel-title">休营地</h2>
      <p class="event-text">漫长的征途中难得的喘息。篝火噼啪作响，趁夜色未深，做点修整吧。</p>
      ${t}
    </div>
  </div>`}function At(e){const t=new Map;for(const a of e){const n=t.get(a.id);n?n.n+=1:t.set(a.id,{def:a,n:1})}return[...t.values()].map(({def:a,n})=>`<span class="deck-chip ${P[a.type]}">${d(a.name)}${n>1?` ×${n}`:""}</span>`).join("")}function Mt(){const e=u(),t=e.result==="win",a=ft(e),n=t?e.map.length:e.nodeIndex+1;return`
  <div class="screen screen-result ${t?"is-win":"is-lose"}">
    <div class="panel result-panel">
      <div class="result-badge">${t?"👑":"💀"}</div>
      <h2 class="panel-title">${t?"通关！":"试炼失败"}</h2>
      <p class="panel-sub">${t?"你击败了堕落骑士，试炼完成。":"倒在了第 "+n+" 个节点。"}</p>

      <div class="result-stats">
        <div class="stat"><b>${n} / ${e.map.length}</b><span>到达节点</span></div>
        <div class="stat"><b>${le(a)}</b><span>用时</span></div>
        <div class="stat"><b>${e.gold}</b><span>金币</span></div>
      </div>

      ${e.relics.length?`<div class="result-block"><h3>遗物</h3><div class="relic-strip">${e.relics.map(r=>{const i=T[r];return i?`<div class="relic" title="${d(i.desc)}"><img src="${i.art}" alt="${d(i.name)}" /></div>`:""}).join("")}</div></div>`:""}

      <div class="result-block">
        <h3>本局牌组（${e.deck.length} 张）</h3>
        <div class="chip-wrap">${At(e.deck)}</div>
      </div>

      <div class="result-actions">
        <button class="btn btn-primary btn-lg" data-action="start">再来一局</button>
        <button class="btn btn-ghost" data-action="home">返回首页</button>
      </div>
    </div>
  </div>`}function Ct(){return`
  <div class="overlay" data-action="close-help">
    <div class="help-box" data-stop="1">
      <h2>玩法说明</h2>
      <ul>
        <li>每局路线随机生成 30~50 个节点：普通战斗、精英战、事件、休营地穿插，终点是 Boss 堕落骑士。</li>
        <li>越往后敌人越强：前段是杂兵，中段出现骷髅、幽灵，后段有食人魔、幼龙等强敌。</li>
        <li>休营地可以恢复 30% 生命或删除一张牌，长旅程里别错过。</li>
        <li>每回合抽 5 张牌，拥有 3 点能量，手牌上限 7 张。</li>
        <li>护甲会在你的回合开始时清空，用来抵挡敌人本回合的攻击。</li>
        <li>敌人头顶会提前显示它下回合的行动，据此决定攻守。</li>
        <li>战斗胜利后可三选一拿一张新牌，也可以跳过。</li>
        <li>生命归零即本局结束；刷新页面视为放弃本局。</li>
        <li>最远节点、胜场、局数会保存在本机浏览器中。</li>
      </ul>
      <button class="btn btn-primary" data-action="close-help">知道了</button>
    </div>
  </div>`}function Rt(e){let t="";if(!Ze()||!h.run)t=V();else switch(h.run.screen){case"map":t=Q();break;case"battle":t=$t();break;case"reward":t=xt()||Q();break;case"event":t=Dt();break;case"camp":t=Ht();break;case"result":t=Mt();break;default:t=V()}return`<div class="app">${t}${e?Ct():""}</div>`}const z=document.getElementById("app");if(!z)throw new Error("缺少 #app 容器");let E=!1,D=!1;const H=document.createElement("div");H.id="fx-layer";document.body.appendChild(H);function g(e){return new Promise(t=>setTimeout(t,e))}function k(e,t=.4){const a=document.querySelector(e);if(!a)return{x:window.innerWidth/2,y:window.innerHeight*t};const n=a.getBoundingClientRect();return{x:n.left+n.width/2,y:n.top+n.height*.35}}function v(e,t,a,n=0){const r=document.createElement("div");r.className="float-txt "+a,r.textContent=t,r.style.left=e.x+"px",r.style.top=e.y+"px",n>0&&(r.style.animationDelay=n+"ms"),H.appendChild(r),setTimeout(()=>r.remove(),1150+n)}function w(e,t,a,n=0){const r=document.querySelector(e);r&&setTimeout(()=>{r.classList.add(t),setTimeout(()=>r.classList.remove(t),a)},n)}async function Et(e,t){const a=document.createElement("div");a.className="fx-banner "+t,a.textContent=e,H.appendChild(a),await g(780),a.remove()}function Tt(){const e=document.createElement("div");e.className="hurt-vignette",H.appendChild(e),setTimeout(()=>e.remove(),520)}function Pt(e){const t=document.createElement("div");t.className="fx-toast",t.textContent=e,H.appendChild(t),setTimeout(()=>t.remove(),1500)}async function Y(e){if(e.length){D=!0,document.body.classList.add("fx-busy");for(const t of e)switch(t.kind){case"banner":await Et(t.text,t.tone);break;case"enemy-hit":{w(".enemy-art","anim-hit",420);const a=k(".enemy-stage",.3);t.real>0?v(a,`-${t.real}`,"f-enemy-dmg"):v(a,"格挡","f-block"),await g(440);break}case"enemy-attack":{w(".enemy-art","anim-lunge",560),await g(260);const a=k(".player-zone",.5);t.real>0?(v(a,`-${t.real}`,"f-player-dmg"),w(".screen-battle","anim-shake",400),Tt()):v(a,"格挡","f-block"),await g(440);break}case"enemy-selfdamage":{w(".enemy-art","anim-hit",380),v(k(".enemy-stage",.3),`自伤 -${t.value}`,"f-enemy-dmg"),await g(400);break}case"enemy-defend":{w(".enemy-art",t.failed?"anim-stagger":"anim-guard",680),v(k(".enemy-stage",.3),t.failed?"护甲失效！":`+${t.value} 护甲`,t.failed?"f-good":"f-enemy-armor"),await g(620);break}case"enemy-charge":{w(".enemy-art","anim-charge",850),v(k(".enemy-stage",.25),"蓄力！","f-charge"),await g(780);break}case"enemy-debuff":{v(k(".enemy-stage",.3),`你的能量 -${t.value}`,"f-debuff"),await g(560);break}case"riposte":{w(".enemy-art","anim-hit",380),v(k(".enemy-stage",.3),`反击 -${t.value}`,"f-good"),await g(420);break}case"player-armor":{w(".p-armor","pulse-good",520),v(k(".p-armor",.5),`+${t.value}`,"f-armor"),await g(400);break}case"player-heal":{w(".p-hp","pulse-good",520),v(k(".p-hp",.5),`+${t.value}`,"f-heal"),await g(400);break}}D=!1,document.body.classList.remove("fx-busy")}}function It(){var a;const e=(a=h.run)==null?void 0:a.battle;if(!e||e.fx.length===0)return;const t=e.fx.splice(0,e.fx.length);Y(t)}function A(){z.innerHTML=Rt(E);const e=document.getElementById("battle-log");e&&(e.scrollTop=e.scrollHeight);const t=document.querySelector(".map-scroll"),a=document.querySelector(".path-node.current");if(t&&a){const n=a.offsetTop-t.clientHeight/2+a.offsetHeight/2;t.scrollTo({top:Math.max(0,n),behavior:"smooth"})}}function X(e){return e.hand.some(t=>!(j(e,t.def)>e.energy||e.cannotAttack&&t.def.type==="attack"))}function _(){var t;const e=(t=h.run)==null?void 0:t.battle;!e||e.over||e.pendingDiscard>0||X(e)||(Pt("⚡ 没有能出的牌，自动结束回合"),g(750).then(()=>{const a=h.run,n=a==null?void 0:a.battle;!a||!n||n.over||n.pendingDiscard>0||D||X(n)||ge(a)}))}function ge(e){D=!0,document.body.classList.add("fx-busy"),document.querySelectorAll(".hand-scroll .card").forEach((t,a)=>{t.classList.add("anim-discard"),t.style.animationDelay=`${a*30}ms`}),g(300).then(()=>{Ee(e.battle,e),A();const t=e.battle?e.battle.fx.splice(0,e.battle.fx.length):[];D=!1,document.body.classList.remove("fx-busy"),Y(t).then(()=>_())})}z.addEventListener("click",e=>{const t=e.target;if(!t)return;const a=t.closest("[data-action]");a&&(a.dataset.action==="close-help"&&a.classList.contains("overlay")&&t.closest(".help-box")||D||St(a.dataset.action,a))});function St(e,t){const a=h.run;switch(e){case"start":E=!1,et();break;case"help":E=!0;break;case"close-help":E=!1;break;case"abandon":case"home":tt();break;case"enter-node":at();break;case"play-card":{if(!(a!=null&&a.battle))break;if(Me(a.battle,a,Number(t.dataset.uid))){A();const n=a.battle.fx.splice(0,a.battle.fx.length);Y(n).then(()=>_());return}break}case"discard-card":{if(!(a!=null&&a.battle))break;Ce(a.battle,Number(t.dataset.uid)),A(),_();break}case"end-turn":{if(!(a!=null&&a.battle))break;ge(a);return}case"finish-battle":it();break;case"pick-reward":{if(!(a!=null&&a.rewardChoices))break;const n=t.dataset.card,r=a.rewardChoices.findIndex(i=>i.id===n);lt(r);break}case"pick-relic":{const n=t.dataset.relic;n&&ct(n);break}case"skip-reward":ot();break;case"event-option":dt(Number(t.dataset.index));break;case"remove-card":{const n=t.dataset.card;n&&pt(n);break}case"pick-event-card":{const n=t.dataset.card;n&&ut(n);break}case"leave-event":mt();break;case"camp-heal":nt();break;case"camp-remove":rt();break;case"leave-camp":st();break;default:return}A(),e==="enter-node"&&It()}A();
