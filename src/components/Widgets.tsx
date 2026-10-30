import { useState } from 'react';
import { WordText } from './WordHelp';
import { ArrowRight, RotateCcw } from 'lucide-react';
export function DialogueLab() {
  const [scene,setScene]=useState<'intro'|'who'>('intro');
  const [answer,setAnswer]=useState('');
  const choose=(s:'intro'|'who')=>{setScene(s);setAnswer('');};
  return <div className="lab"><h4>질문이 바뀌면 말의 역할도 바뀌어요</h4>
    <p>똑같은 두 단어를 두고, 대화의 상황만 바꿔 보세요.</p>
    <div className="segmented"><button aria-pressed={scene==='intro'} onClick={()=>choose('intro')}>처음 만나 자기소개</button><button aria-pressed={scene==='who'} onClick={()=>choose('who')}>학생인 사람 찾기</button></div>
    <div className="conversation"><div><span>상대방</span><p lang="ja"><WordText text={scene==='intro'?'はじめまして。自己紹介をお願いします。':'誰が学生ですか。'}/></p><small>{scene==='intro'?'처음 뵙겠습니다. 자기소개 부탁드려요.':'누가 학생이에요?'}</small></div><ArrowRight aria-hidden="true"/><div><span>내가 전할 말</span><p lang="ja"><WordText text="私 "/><strong>{answer||'？'}</strong><WordText text=" 学生です。"/></p><small>저는/제가 학생이에요.</small></div></div>
    <div className="choice-row"><button className={answer==='は'?'selected':''} onClick={()=>setAnswer('は')}>は를 넣어 보기</button><button className={answer==='が'?'selected':''} onClick={()=>setAnswer('が')}>が를 넣어 보기</button></div>
    <p className="lab-feedback" aria-live="polite">{!answer?'어느 부분을 알려주고 싶은지 생각하고 골라 보세요.':scene==='intro'?(answer==='は'?'지금은 나를 소개하는 자리예요. 私は로 나를 이야기의 주제로 꺼내고, 学生です로 설명하는 흐름이 자연스러워요.':'私が도 문법적으로 가능하지만 “학생인 사람은 바로 나”를 골라 말하는 느낌이 돼요. 평범한 자기소개라면 私は가 더 잘 어울려요.'):(answer==='が'?'상대가 궁금한 것은 “누구”예요. 誰が의 誰 자리에 私를 넣어 私が라고 답해요.':'私は로도 상황을 더 이어갈 수 있지만, 여기서 직접 “누가”인지를 답하려면 私が가 더 잘 맞아요. 대화 전체를 같이 보세요.')}</p>
  </div>;
}
export function PositionLab() {
  const [item,setItem]=useState<'book'|'cat'>('book'),[place,setPlace]=useState<'on'|'inside'|'under'>('on');
  const positions={on:{x:170,y:35,ja:'上',reading:'うえ',meaning:'위'},inside:{x:170,y:135,ja:'中',reading:'なか',meaning:'안'},under:{x:170,y:235,ja:'下',reading:'した',meaning:'아래'}};
  const p=positions[place],noun=item==='book'?'本':'ねこ',verb=item==='book'?'あります':'います';
  return <div className="lab"><h4>위치를 바꾸며 문장을 읽어 보세요</h4><p>원본 사진이 아닌 새로 만든 보충 도식이에요. 물건과 동물, 놓인 자리를 바꾸면 문장도 달라져요.</p>
    <div className="choice-row"><button aria-pressed={item==='book'} onClick={()=>setItem('book')}>책</button><button aria-pressed={item==='cat'} onClick={()=>setItem('cat')}>고양이</button></div>
    <svg viewBox="0 0 400 290" role="img" aria-label={noun+'이 상자 '+p.meaning+'에 있는 도식'} className="position-board"><rect x="100" y="100" width="200" height="100" rx="4" fill="var(--wood)" stroke="var(--ink)" strokeWidth="2"/><text x="115" y="126" fill="var(--ink)" fontSize="16">箱 · 상자</text><rect x={p.x} y={p.y} width="60" height="35" rx="4" fill="var(--accent)"/><text x={p.x+30} y={p.y+23} textAnchor="middle" fill="var(--on-accent)" fontSize="17">{noun}</text></svg>
    <div className="segmented">{(Object.keys(positions) as (keyof typeof positions)[]).map(v=><button key={v} aria-pressed={v===place} onClick={()=>setPlace(v)}>{positions[v].ja} · {positions[v].meaning}</button>)}</div>
    <div className="lab-result" aria-live="polite"><p lang="ja"><WordText text={noun+'は 箱の'+p.ja+'に '+verb+'。'}/></p><small>{item==='book'?'ほん':'ねこ'}は はこの {p.reading}に {item==='book'?'あります':'います'}。</small><p>{item==='book'?'책':'고양이'}는 상자 {p.meaning}에 있어요.</p></div>
    <p>먼저 무엇이 있는지, 그다음 어디에 있는지 읽어 보세요. 여기서는 책에 あります, 살아 있는 고양이에 います를 썼어요.</p>
  </div>;
}
export function SentenceLab() {
  const choices=[{id:'reading',label:'책 읽기',words:['私の趣味は','本を読む','こと','です。'],reading:'わたしの しゅみは ほんを よむ ことです。',meaning:'제 취미는 책을 읽는 것이에요.',note:'本を読む는 “책을 읽다”라는 행동이에요. こと가 그 행동을 “책을 읽는 것”으로 묶어 주어요.'},{id:'cooking',label:'요리',words:['私の趣味は','料理','です。'],reading:'わたしの しゅみは りょうりです。',meaning:'제 취미는 요리예요.',note:'料理는 취미의 이름인 명사예요. 그 뒤에는 바로 です를 이어 말할 수 있어요.'},{id:'movies',label:'영화 보기',words:['私の趣味は','映画を見る','こと','です。'],reading:'わたしの しゅみは えいがを みる ことです。',meaning:'제 취미는 영화를 보는 것이에요.',note:'映画を見る라는 행동을 취미로 소개하기 때문에 こと로 “영화를 보는 것”이라고 묶었어요.'}];
  const [id,setId]=useState('reading');const x=choices.find(v=>v.id===id)!;
  return <div className="lab"><h4>취미의 이름과 행동을 바꿔 보세요</h4><div className="choice-row">{choices.map(v=><button key={v.id} aria-pressed={id===v.id} onClick={()=>setId(v.id)}>{v.label}</button>)}</div><div className="sentence-pieces" aria-live="polite">{x.words.map((w,i)=><span key={i} className={w==='こと'?'highlight':''} lang="ja"><WordText text={w}/></span>)}</div><p lang="ja">{x.reading}</p><p>{x.meaning}</p><p className="lab-feedback">{x.note}</p></div>;
}
export function ResetButton({onClick}:{onClick:()=>void}) {return <button className="text-button" onClick={onClick}><RotateCcw size={16} aria-hidden="true"/>다시 풀기</button>;}


export function CounterLab(){
  const sets=[
    {label:'사람',noun:'学生',suffix:'人',verb:'います',readings:['ひとり','ふたり','さんにん','よにん','ごにん','ろくにん','ななにん','はちにん','きゅうにん','じゅうにん'],why:'사람을 셀 때 1人은 ひとり, 2人은 ふたり예요. 3人부터는 숫자와 にん을 연결하지만 4人은 よにん으로 읽어요.'},
    {label:'책',noun:'本',suffix:'冊',verb:'あります',readings:['いっさつ','にさつ','さんさつ','よんさつ','ごさつ','ろくさつ','ななさつ','はっさつ','きゅうさつ','じゅっさつ'],why:'책은 冊(さつ)로 세어요. 1冊·8冊·10冊의 작은 っ처럼 소리가 달라지는 부분을 같이 보세요.'},
    {label:'긴 물건',noun:'えんぴつ',suffix:'本',verb:'あります',readings:['いっぽん','にほん','さんぼん','よんほん','ごほん','ろっぽん','ななほん','はっぽん','きゅうほん','じゅっぽん'],why:'연필처럼 길쭉한 물건은 本으로 세어요. 책이라는 뜻의 本(ほん)과 구분해서, ぽん·ほん·ぼん의 변화를 비교해요.'},
    {label:'동물',noun:'ねこ',suffix:'匹',verb:'います',readings:['いっぴき','にひき','さんびき','よんひき','ごひき','ろっぴき','ななひき','はっぴき','きゅうひき','じゅっぴき'],why:'작은 동물은 匹으로 세어요. 1匹·3匹·6匹을 골라 ぴき·びき·ひき가 어떻게 달라지는지 들어갈 소리를 읽어보세요.'},
    {label:'잔',noun:'コーヒー',suffix:'杯',verb:'あります',readings:['いっぱい','にはい','さんばい','よんはい','ごはい','ろっぱい','ななはい','はっぱい','きゅうはい','じゅっぱい'],why:'잔에 담긴 양은 杯로 세어요. 여기서는 원자료의 대표 읽기를 사용했어요. 허용되는 다른 읽기가 있다는 점도 기억해주세요.'}
  ];
  const [kind,setKind]=useState(0),[count,setCount]=useState(1),x=sets[kind];
  return <div className="lab"><h4>대상과 개수를 바꾸며 읽어 보세요</h4><p>원을 하나씩 늘리고, 같은 숫자에 어떤 단위와 읽기가 붙는지 비교해요. 원은 새로 만든 수량 도식입니다.</p><div className="choice-row">{sets.map((v,i)=><button key={v.label} aria-pressed={i===kind} onClick={()=>setKind(i)}>{v.label}</button>)}</div><div className="count-control"><button aria-label="개수 줄이기" disabled={count===1} onClick={()=>setCount(count-1)}>−</button><label>개수 <output>{count}</output><input aria-label="대상의 개수" type="range" min="1" max="10" value={count} onChange={e=>setCount(Number(e.target.value))}/></label><button aria-label="개수 늘리기" disabled={count===10} onClick={()=>setCount(count+1)}>+</button></div><svg viewBox="0 0 330 105" role="img" aria-label={count+'개를 나타낸 수량 도식'} className="count-diagram">{Array.from({length:count},(_,i)=><g key={i}><circle cx={35+(i%5)*65} cy={28+Math.floor(i/5)*52} r="18" fill="var(--accent)"/><text x={35+(i%5)*65} y={33+Math.floor(i/5)*52} textAnchor="middle" fill="var(--on-accent)" fontSize="13">{i+1}</text></g>)}</svg><div className="lab-result" aria-live="polite"><p lang="ja"><WordText text={x.noun+'が '+count+x.suffix+' '+x.verb+'。'}/></p><p lang="ja">{count}{x.suffix} → {x.readings[count-1]}</p></div><p>{x.why}</p></div>;
}

