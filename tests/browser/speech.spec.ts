import { test, expect, type Page } from '@playwright/test';
async function mockSpeech(page:Page,voices:{name:string;lang:string;localService:boolean;default?:boolean}[]){
 await page.addInitScript(initial=>{
  let list=initial,current:any=null;const calls:any[]=[];let cancelled=0;
  class Utterance {text:string;onend:any;onerror:any;voice:any;lang='';rate=1;constructor(text:string){this.text=text;}}
  const synth=Object.assign(new EventTarget(),{getVoices:()=>list,cancel:()=>{cancelled++;current=null;},speak:(value:any)=>{current=value;calls.push({text:value.text,lang:value.lang,rate:value.rate,voice:value.voice});}});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:Utterance});
  (window as any).__speech={calls,get cancelled(){return cancelled;},setVoices:(value:any[])=>{list=value;synth.dispatchEvent(new Event('voiceschanged'));},finish:()=>current?.onend?.(),fail:()=>current?.onerror?.({error:'not-allowed'})};
 },voices);
}
const local={name:'device-ja',lang:'ja-JP',localService:true};
test('단어·한자·문장을 기기 일본어 음성으로 재생하고 중지·이동을 처리한다',async({page})=>{
 await mockSpeech(page,[{name:'remote-ja',lang:'ja-JP',localService:false,default:true},{name:'en',lang:'en-US',localService:true},local]);
 await page.goto('/#/books/first-sentences/pages/nominal');
 const sentence=page.locator('#nominal-05 .example').first();await sentence.getByRole('button',{name:'일본어 예문 발음 듣기',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__speech.calls.length)).toBe(1);
 expect(await page.evaluate(()=>(window as any).__speech.calls[0])).toMatchObject({text:'がくせいですか。',lang:'ja-JP',voice:{name:'device-ja',localService:true}});
 await sentence.getByRole('button',{name:'일본어 예문 발음 중지',exact:true}).click();expect(await page.evaluate(()=>(window as any).__speech.cancelled)).toBe(1);
 await page.locator('.reading-paper .word-link').filter({hasText:/^学生$/}).first().click();const popup=page.getByRole('dialog',{name:'学生',exact:true});
 await popup.getByRole('button',{name:'단어 学生 がくせい 발음 듣기',exact:true}).click();await popup.getByRole('button',{name:'한자 学 がく 발음 듣기',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).__speech.calls.slice(-2).map((x:any)=>x.text))).toEqual(['がくせい','がく']);
 const before=await page.evaluate(()=>(window as any).__speech.cancelled);await popup.getByRole('button',{name:'단어 설명 닫기'}).click();await expect.poll(()=>page.evaluate(()=>(window as any).__speech.cancelled)).toBeGreaterThan(before);
 await page.goto('/#/books/first-sentences/pages/demonstratives');await page.getByRole('button',{name:'切手 단어 풀이',exact:true}).first().click();
 await page.getByRole('dialog',{name:'切手',exact:true}).getByRole('button',{name:'한자 切 단어 전체 발음 듣기',exact:true}).click();expect(await page.evaluate(()=>(window as any).__speech.calls.at(-1).text)).toBe('きって');
 const count=await page.evaluate(()=>(window as any).__speech.cancelled);await page.goto('/#/library');await expect.poll(()=>page.evaluate(()=>(window as any).__speech.cancelled)).toBeGreaterThan(count);
});
test('음성 지연·원격 음성만 존재·재생 오류를 안내하고 자동 재생하지 않는다',async({page})=>{
 await mockSpeech(page,[]);await page.goto('/#/books/first-sentences/pages/nominal');await page.locator('.reading-paper .word-link').filter({hasText:/^学生$/}).first().click();const popup=page.getByRole('dialog',{name:'学生',exact:true});
 await popup.getByRole('button',{name:'단어 学生 がくせい 발음 듣기',exact:true}).click();await expect(popup.getByRole('status')).toContainText('기기에 설치된 일본어 음성');expect(await page.evaluate(()=>(window as any).__speech.calls.length)).toBe(0);
 await page.evaluate(()=>(window as any).__speech.setVoices([{name:'remote',lang:'ja-JP',localService:false}]));await popup.getByRole('button',{name:'단어 学生 がくせい 발음 듣기',exact:true}).click();expect(await page.evaluate(()=>(window as any).__speech.calls.length)).toBe(0);
 await page.evaluate(value=>(window as any).__speech.setVoices([value]),local);await expect(popup.getByRole('status')).toHaveCount(0);expect(await page.evaluate(()=>(window as any).__speech.calls.length)).toBe(0);
 await popup.getByRole('button',{name:'단어 学生 がくせい 발음 듣기',exact:true}).click();await page.evaluate(()=>(window as any).__speech.fail());await expect(popup.getByRole('status')).toContainText('재생하지 못했어요');
 await popup.getByRole('button',{name:'단어 学生 がくせい 발음 듣기',exact:true}).click();await page.evaluate(()=>(window as any).__speech.finish());await expect(popup.getByRole('button',{name:'단어 学生 がくせい 발음 듣기',exact:true})).toHaveAttribute('aria-pressed','false');
});
test('음성 API 미지원 브라우저는 설명을 안내한다',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:undefined});});
 await page.goto('/#/books/first-sentences/pages/nominal');await page.locator('.reading-paper .word-link').filter({hasText:/^学生$/}).first().click();const popup=page.getByRole('dialog',{name:'学生',exact:true});await popup.getByRole('button',{name:'단어 学生 がくせい 발음 듣기',exact:true}).click();await expect(popup.getByRole('status')).toContainText('지원하지 않아요');
});