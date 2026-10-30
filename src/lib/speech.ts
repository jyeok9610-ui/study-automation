export function localJapaneseVoice(voices:SpeechSynthesisVoice[]){
 const local=voices.filter(voice=>voice.localService===true&&/^ja(?:-|$)/i.test(voice.lang.replace('_','-')));
 return local.find(voice=>voice.default)||local.find(voice=>/^ja-JP$/i.test(voice.lang))||local[0];
}
export function speechReading(reading:string){return reading.split('／')[0].replace(/\s+/g,' ').trim();}
export function standaloneReading(reading:string){return !/[っッ]$/.test(reading.trim());}