import test from 'node:test';
import assert from 'node:assert/strict';
import { localJapaneseVoice, speechReading, standaloneReading } from '../src/lib/speech.ts';
const voice=(name:string,lang:string,localService:boolean,isDefault=false)=>({name,lang,localService,default:isDefault,voiceURI:name} as SpeechSynthesisVoice);
test('기기에 설치된 일본어 음성만 선택하고 원격·다른 언어로 대체하지 않는다',()=>{
 const local=voice('local-ja','ja-JP',true),remote=voice('remote-ja','ja-JP',false,true);
 assert.equal(localJapaneseVoice([remote,voice('en','en-US',true),local]),local);
 assert.equal(localJapaneseVoice([remote,voice('ko','ko-KR',true)]),undefined);
 assert.equal(localJapaneseVoice([]),undefined);
});
test('여러 읽기의 첫 읽기만 명확히 재생하고 끊긴 촉음은 단어로 듣는다',()=>{
 assert.equal(speechReading('  にほん／にっぽん  '),'にほん');assert.equal(speechReading('がくせいですか。'),'がくせいですか。');
 assert.equal(standaloneReading('がく'),true);assert.equal(standaloneReading('きっ'),false);assert.equal(standaloneReading('ざっ'),false);
});