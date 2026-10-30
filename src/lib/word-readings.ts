import wordReadings from '../content/japanese-word-readings.json';
import type { GlossaryEntry } from './words';
export type ReadingPart={text:string;reading:string};
export type ReadingGuide={parts:ReadingPart[];grouped?:boolean;note?:string};
const authored:Record<string,string[][]>=wordReadings;
const suffixes:Record<string,string[]>={階:['かい','がい'],月:['がつ'],日:['にち'],時:['じ'],分:['ふん','ぷん'],年:['ねん'],人:['にん'],冊:['さつ'],本:['ほん','ぼん','ぽん'],匹:['ひき','びき','ぴき'],杯:['はい','ばい','ぱい']};

export function getReadingGuide(entry:GlossaryEntry):ReadingGuide|undefined{
 if(!/\p{Script=Han}/u.test(entry.word))return;
 const primary=entry.reading.split('／')[0];
 const group=(note:string):ReadingGuide=>({parts:[{text:entry.word,reading:primary}],grouped:true,note});
 if(entry.word==='時計')return group('時計는 글자별 소리로 나누기보다 とけい라는 단어 전체로 읽어주세요.');
 if(authored[entry.word])return {parts:authored[entry.word].map(([text,reading])=>({text,reading})),note:entry.reading.includes('／')?'아래 글자별 표시는 첫 번째 읽기를 기준으로 했어요.':undefined};
 if(/^\p{Script=Han}$/u.test(entry.word))return {parts:[{text:entry.word,reading:entry.reading}]};
 const number=entry.word.match(/^(\d+)([階月日時分年人冊本匹杯])$/u);
 if(number){
  const [,digits,unit]=number;
  if((unit==='日'&&!primary.endsWith('にち'))||(unit==='人'&&Number(digits)<=2))return group('숫자와 한자를 묶어 읽는 표현이에요. 위에 적힌 단어 전체의 소리를 함께 익혀주세요.');
  // These are verified counter suffixes; irregular calendar/person readings are grouped above.
  const suffix=suffixes[unit].find(value=>primary.endsWith(value));
  if(suffix)return {parts:[{text:digits,reading:primary.slice(0,-suffix.length)},{text:unit,reading:suffix}],note:'여기에 적힌 소리는 이 숫자와 붙었을 때의 읽기예요.'};
 }
}

export function characterReadings(guide:ReadingGuide|undefined,character:string){
 if(!guide||guide.grouped)return '';
 return [...new Set(guide.parts.filter(part=>part.text===character).map(part=>part.reading))].join('／');
}