import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarize, validateBook, LibrarySchema } from '../src/shared/schema.ts';
import { validateLibraryLinks } from '../src/lib/search.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];if(!input)throw new Error('검수할 학습책 JSON 파일 경로를 인자로 지정해주세요.');
const book=validateBook(JSON.parse(fs.readFileSync(input,'utf8')));
const library=LibrarySchema.parse({
 version:'1.0.0',
 subjects:[
 {id:'japanese',title:'일본어',subtitle:'말을 배우는 첫 문장',description:'낯선 문장이 내 말이 될 때까지.',color:'#496c5b',motif:'語'},
 {id:'camera',title:'카메라',subtitle:'빛을 바라보는 눈',description:'빛과 렌즈, 한 장을 이해하는 방법.',color:'#8c6546',motif:'光'},
 {id:'video',title:'영상',subtitle:'움직임을 엮는 시간',description:'프레임과 시간 사이의 이야기.',color:'#516574',motif:'映'},
 {id:'film',title:'영화',subtitle:'이야기가 머무는 장면',description:'인물과 장면으로 세상을 읽기.',color:'#7d5655',motif:'幕'}
 ],
 books:[summarize(book)],
 paths:[
 {id:'wa-ga',title:'같은 사실을 다르게 말하는 이유',question:'は와 が는 왜 달라질까요?',audience:'기본문장은 알지만 조사 선택이 헷갈리는 분',prerequisites:['～です의 기본 뜻'],task:'자기소개하는 장면과 누가 학생인지 답하는 장면을 직접 만들고, 각각 어떤 표현을 골랐는지 이유를 설명해보세요.',steps:[{bookId:book.id,pageId:'nominal',reason:'먼저 문장의 뼈대를 잡아요',record:'이름·물건·상태를 설명하는 ～です의 역할'},{bookId:book.id,pageId:'introduction',reason:'나를 소개하는 장면을 만나요',record:'상대가 어떤 정보를 기다리고 있는지'},{bookId:book.id,pageId:'wa-ga',reason:'질문이 바뀌면 말의 역할도 달라져요',record:'누구인지 답할 때와 나를 설명할 때의 차이'},{bookId:book.id,pageId:'practice',reason:'새로운 대화에 적용해요',record:'자연스러운 표현을 고른 이유'}]},
 {id:'where',title:'보이는 관계를 일본어 문장으로',question:'어디에 있는지 어떻게 말할까요?',audience:'위치 표현과 あります/います를 함께 익히고 싶은 분',prerequisites:[],task:'주변의 물건 세 개를 골라 어디에 있는지 말하고, 고양이가 있다면 동사를 어떻게 바꿀지 설명해주세요.',steps:[{bookId:book.id,pageId:'demonstratives',reason:'무엇을 가리키는지 먼저 정해요',record:'これ·それ·あれ가 가리키는 대상'},{bookId:book.id,pageId:'location',reason:'위치를 움직이며 문장을 비교해요',record:'上·下·中과 あります/います의 연결'},{bookId:book.id,pageId:'practice',reason:'내 주변을 안내해요',record:'사물과 위치를 담은 직접 만든 문장'}]},
 {id:'myself',title:'이름에서 취미까지 이어지는 대화',question:'나를 한 문장 더 소개하려면?',audience:'처음 일본어로 자기소개하는 분',prerequisites:[],task:'이름·사는 곳·취미를 세 문장으로 소개해보세요. 외운 문장 대신 본인에게 맞는 표현을 골라주세요.',steps:[{bookId:book.id,pageId:'introduction',reason:'첫 인사와 소개의 틀을 익혀요',record:'이름과 사는 곳을 소개하는 표현'},{bookId:book.id,pageId:'hobbies',reason:'취미를 이름과 행동으로 말해요',record:'명사 취미와 동사+こと의 차이'},{bookId:book.id,pageId:'dates',reason:'생일을 묻고 답하며 대화를 이어가요',record:'자주 쓰는 월·날짜의 읽기'}]}
 ],
 concepts:[
 {id:'nominal',label:'명사 문장',description:'사람·사물의 이름을 ～です로 설명해요. 부정과 질문도 이 뼈대에서 시작합니다.',bookId:book.id,pageId:'nominal',related:['intro','wa-ga','point']},
 {id:'intro',label:'자기소개',description:'상대가 알고 싶은 이름·사는 곳·취미를 골라 나에 관해 이야기해요.',bookId:book.id,pageId:'introduction',related:['nominal','wa-ga','hobby','date']},
 {id:'wa-ga',label:'は와 が',description:'같은 사실도 대화가 묻는 것과 답하는 것이 달라지면 표현이 달라져요.',bookId:book.id,pageId:'wa-ga',related:['nominal','intro','location']},
 {id:'hobby',label:'취미와 こと',description:'취미의 이름을 말할 수도 있고, 행동을 こと로 묶어 소개할 수도 있어요.',bookId:book.id,pageId:'hobbies',related:['intro','practice']},
 {id:'point',label:'こそあど',description:'무엇을, 어디를 가리키는지 상대와 나의 위치를 생각하며 배워요.',bookId:book.id,pageId:'demonstratives',related:['nominal','location']},
 {id:'location',label:'위치와 존재',description:'사물·동물과 위치를 연결해 어디에 있는지 말해요. 그림을 바꾸며 문장을 비교합니다.',bookId:book.id,pageId:'location',related:['point','wa-ga','practice']},
 {id:'date',label:'월과 날짜',description:'자기소개와 약속에 필요한 날짜를 읽어요. 날짜에 따라 달라지는 읽기도 함께 익힙니다.',bookId:book.id,pageId:'dates',related:['intro','practice']},
 {id:'practice',label:'새 상황에 적용',description:'따로 익힌 문법을 한 대화에 모아 내가 전하고 싶은 말을 만들어봐요.',bookId:book.id,pageId:'practice',related:['hobby','location','date']}
 ]
});
validateLibraryLinks(library,[book]);
const folder=path.join(root,'public','content');fs.mkdirSync(path.join(folder,'books'),{recursive:true});
fs.writeFileSync(path.join(folder,'books',book.id+'.json'),JSON.stringify(book,null,2));fs.writeFileSync(path.join(folder,'library.json'),JSON.stringify(library,null,2));
console.log(JSON.stringify({book:book.id,pages:book.pages.length,questions:book.pages.flatMap(p=>p.blocks).filter(b=>b.type==='question').length,sources:book.coverage.length,glossary:book.glossary.length}));

