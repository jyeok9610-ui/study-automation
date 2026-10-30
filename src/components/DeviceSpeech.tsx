import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type PropsWithChildren } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { localJapaneseVoice, speechReading } from '../lib/speech';

type SpeechState={current:string|null;error:{owner:string;message:string}|null;speak:(owner:string,text:string)=>void;stop:()=>void};
const SpeechContext=createContext<SpeechState|null>(null);
export function DeviceSpeechProvider({children}:PropsWithChildren){
 const [current,setCurrent]=useState<string|null>(null),[error,setError]=useState<SpeechState['error']>(null);
 const active=useRef<{owner:string;utterance:SpeechSynthesisUtterance}|null>(null);
 const stop=useCallback(()=>{const wasActive=active.current;active.current=null;setCurrent(null);if(wasActive)window.speechSynthesis?.cancel();},[]);
 useEffect(()=>{
  if(typeof window.speechSynthesis?.getVoices!=='function')return;
  const synth=window.speechSynthesis;
  const voices=()=>{try{if(localJapaneseVoice(synth.getVoices()))setError(null);}catch{/* The button reports engine availability on the next user gesture. */}};
  const hidden=()=>{if(document.hidden)stop();};
  voices();synth.addEventListener('voiceschanged',voices);document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',stop);
  return()=>{synth.removeEventListener('voiceschanged',voices);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',stop);if(active.current){active.current=null;synth.cancel();}};
 },[stop]);
 const speak=(owner:string,text:string)=>{
  if(active.current?.owner===owner){stop();return;}
  stop();setError(null);
  const fail=(message:string)=>setError({owner,message});
  if(typeof window.speechSynthesis?.getVoices!=='function'||typeof window.SpeechSynthesisUtterance!=='function'){fail('이 브라우저는 음성 읽기를 지원하지 않아요.');return;}
  const synth=window.speechSynthesis;
  try{
   const voice=localJapaneseVoice(synth.getVoices());
   if(!voice){fail('기기에 설치된 일본어 음성을 아직 찾지 못했어요. 잠시 후 다시 누르거나 기기 설정에서 일본어 음성을 내려받아 주세요.');return;}
   const reading=speechReading(text);if(!reading)return;
   const utterance=new SpeechSynthesisUtterance(reading);utterance.voice=voice;utterance.lang='ja-JP';utterance.rate=.9;
   active.current={owner,utterance};setCurrent(owner);
   utterance.onend=()=>{if(active.current?.utterance===utterance){active.current=null;setCurrent(null);}};
   utterance.onerror=()=>{if(active.current?.utterance===utterance){active.current=null;setCurrent(null);fail('음성을 재생하지 못했어요. 다시 누르거나 기기의 일본어 음성을 확인해주세요.');}};
   // Call inside the tap/click gesture; voiceschanged never starts playback automatically.
   synth.speak(utterance);
  }catch{stop();fail('음성을 재생하지 못했어요. 기기의 일본어 음성을 확인한 뒤 다시 눌러주세요.');}
 };
 return <SpeechContext.Provider value={{current,error,speak,stop}}>{children}</SpeechContext.Provider>;
}
export function useDeviceSpeech(){return useContext(SpeechContext);}
export function SpeechButton({text,label}:{text:string;label:string}){
 const speech=useDeviceSpeech(),owner=useId();if(!speech)return null;
 const playing=speech.current===owner,message=speech.error?.owner===owner?speech.error.message:'';
 const action=label+(playing?' 발음 중지':' 발음 듣기');
 return <span className="speech-control"><button type="button" lang="ko" className="speech-button" aria-label={action} title={action} aria-pressed={playing} aria-describedby={message?owner+'-message':undefined} onClick={()=>speech.speak(owner,text)}>{playing?<Square size={16} fill="currentColor" aria-hidden="true"/>:<Volume2 size={19} aria-hidden="true"/>}</button>{message&&<span className="speech-feedback" id={owner+'-message'} lang="ko" role="status">{message}</span>}</span>;
}