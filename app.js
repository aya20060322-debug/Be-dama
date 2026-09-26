const KEY='beDamaCompleteV2';const defaults={count:0,goal:100,tasks:[{name:'宿題をする',points:5,color:'green'},{name:'読書をする（30分）',points:3,color:'blue'},{name:'お手伝いをする',points:5,color:'yellow'},{name:'運動をする',points:5,color:'red'},{name:'早く寝る（21時までに）',points:3,color:'green'}]};
let state;try{state=JSON.parse(localStorage.getItem(KEY))||structuredClone(defaults)}catch{state=structuredClone(defaults)}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const clean=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}function go(id){$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+id).classList.add('active');if(id==='home')home();if(id==='tasks')tasks();if(id==='settings')settings();scrollTo({top:0,behavior:'smooth'})}
function home(){const pct=Math.min(100,state.count/state.goal*100);$('#count').textContent=state.count;$('#goalLabel').textContent=state.goal;$('#remaining').textContent=Math.max(0,state.goal-state.count);$('#progressBar').style.width=pct+'%';const box=$('#jarMarbles');box.innerHTML='';const shown=Math.min(49,Math.round(state.count/state.goal*49));for(let i=0;i<shown;i++){const b=document.createElement('i');b.className='ball '+(state.tasks[i%Math.max(1,state.tasks.length)]?.color||'blue');box.append(b)}}
function tasks(){const list=$('#taskList');list.innerHTML='';state.tasks.forEach((t,i)=>{const row=document.createElement('article');row.className='task';row.innerHTML=`<i class="ball ${t.color}"></i><strong>${clean(t.name)}</strong><span class="points">${t.points}個</span><button class="done">できた！</button>`;row.querySelector('.done').onclick=e=>achieve(i,e.currentTarget);list.append(row)});if(!state.tasks.length)list.innerHTML='<p class="card" style="padding:25px;text-align:center">設定画面から項目を追加しよう！</p>'}
function achieve(i,btn){const t=state.tasks[i];animateBall(t.color,btn);state.count+=t.points;persist();toast(`${t.points}個ゲット！`);setTimeout(()=>{if(state.count>=state.goal){state.count=state.goal;persist();$('#completeNumber').textContent=state.goal;go('complete');confetti()}else tasks()},650)}
function animateBall(color,btn){const f=$('#flyingMarble'),r=btn.getBoundingClientRect();f.className=color;f.style.display='block';f.style.left=r.left+'px';f.style.top=r.top+'px';f.animate([{transform:'translate(0,0) scale(1)'},{transform:'translate(-35vw,-28vh) scale(1.25)',offset:.55},{transform:'translate(18vw,-12vh) scale(.5)'}],{duration:620,easing:'cubic-bezier(.3,.8,.3,1)'}).onfinish=()=>f.style.display='none'}

function autoSaveSettings(){

    const rows = [...document.querySelectorAll('.settings-row')];

    state.tasks = rows.map(r => ({

        name:
            r.querySelector('input').value.trim()
            || '名前なし',

        points:
            Math.max(
                1,
                Number(
                    r.querySelectorAll('input')[1].value
                ) || 1
            ),

        color:
            r.querySelector('select').value

    }));

    state.goal =
        Math.max(
            1,
            Number(
                document.querySelector('#goalInput').value
            ) || 100
        );

    persist();
}

function settings(){

    const list = $('#settingsList');

    list.innerHTML = '';

    state.tasks.forEach((t,i)=>{

        const row = document.createElement('div');

        row.className='settings-row';

        row.innerHTML=
        `<input aria-label="項目名" value="${clean(t.name)}">
        <input aria-label="個数" type="number" min="1" max="100" value="${t.points}">
        <select aria-label="色">
            <option value="green">緑</option>
            <option value="blue">青</option>
            <option value="yellow">黄</option>
            <option value="red">赤</option>
            <option value="purple">紫</option>
        </select>
        <button class="delete">削除</button>`;

        row.querySelector('select').value=t.color;

        row.querySelector('.delete').onclick=()=>{

            autoSaveSettings();

            state.tasks.splice(i,1);

            persist();

            settings();

        };

        row.querySelectorAll('input,select')
            .forEach(el=>{

                el.addEventListener(
                    'input',
                    autoSaveSettings
                );

                el.addEventListener(
                    'change',
                    autoSaveSettings
                );

            });

        list.append(row);

    });

    $('#goalInput').value = state.goal;

    $('#goalInput').addEventListener(
        'input',
        autoSaveSettings
    );
}


function saveSettings(){state.tasks=$$('.settings-row').map(r=>({name:r.querySelector('input').value.trim()||'名前なし',points:Math.max(1,+r.querySelectorAll('input')[1].value||1),color:r.querySelector('select').value}));state.goal=Math.max(1,+$('#goalInput').value||100);state.count=Math.min(state.count,state.goal);persist();toast('設定を保存しました');go('home')}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
function confetti(){const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;let p=Array.from({length:120},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height,v:2+Math.random()*5,w:6+Math.random()*9,h:4+Math.random()*7,r:Math.random()*6.3,color:['#f04f3b','#1aa8d5','#ffc529','#42ad5b','#8f58c7'][Math.floor(Math.random()*5)]}));let n=0;(function draw(){x.clearRect(0,0,c.width,c.height);p.forEach(a=>{a.y+=a.v;a.x+=Math.sin(a.y/30);a.r+=.08;x.save();x.translate(a.x,a.y);x.rotate(a.r);x.fillStyle=a.color;x.fillRect(-a.w/2,-a.h/2,a.w,a.h);x.restore()});if(n++<280)requestAnimationFrame(draw)})()}
$$('[data-screen]').forEach(b=>b.onclick=()=>go(b.dataset.screen));$('#openAdd').onclick=()=>$('#taskDialog').showModal();$('#cancelDialog').onclick=()=>$('#taskDialog').close();$('#taskForm').onsubmit=e=>{e.preventDefault();state.tasks.push({name:$('#newName').value.trim(),points:Math.max(1,+$('#newPoints').value),color:$('#newColor').value});persist();e.target.reset();$('#newPoints').value=5;$('#taskDialog').close();tasks();toast('項目を追加しました')};$('#addRow').onclick=()=>{

    autoSaveSettings();

    state.tasks.push({
        name:'新しい項目',
        points:1,
        color:'blue'
    });

    persist();

    settings();

    toast('項目を追加しました');

};
$('#saveSettings').onclick=saveSettings;$('#restart').onclick=()=>{state.count=1;persist();go('home');toast('1個から新しくスタート！')};home();
