export type Progress={bookId:string;pageId:string;blockId:string;offset:number;version:string;updatedAt:number;readPages:string[];reviewPages:string[]};
export type Note={id:string;bookId:string;pageId:string;text:string;updatedAt:number};
type Store='progress'|'notes'|'settings';
let database:Promise<IDBDatabase>|undefined;
function db() {
  if(!database) database=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open('study-library',1);
    request.onupgradeneeded=()=>{ for(const key of ['progress','notes','settings']) if(!request.result.objectStoreNames.contains(key)) request.result.createObjectStore(key,{keyPath:'id'}); };
    request.onsuccess=()=>resolve(request.result); request.onerror=()=>{database=undefined;reject(request.error);};
  });
  return database;
}
async function transact<T>(store:Store,mode:IDBTransactionMode,work:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{
  const database=await db();
  return new Promise((resolve,reject)=>{
    const tx=database.transaction(store,mode),request=work(tx.objectStore(store));
    let result:T; request.onsuccess=()=>{result=request.result;};
    tx.oncomplete=()=>resolve(result); tx.onerror=()=>reject(tx.error||request.error); tx.onabort=()=>reject(tx.error);
  });
}
export async function getProgress(bookId:string):Promise<Progress|undefined>{return transact('progress','readonly',s=>s.get(bookId));}
export async function saveProgress(p:Progress) {
  // Only reading state: never accept question answers, scores or attempts.
  const clean={id:p.bookId,bookId:p.bookId,pageId:p.pageId,blockId:p.blockId,offset:Math.max(0,Math.min(1,p.offset)),version:p.version,updatedAt:p.updatedAt,readPages:[...new Set(p.readPages)],reviewPages:[...new Set(p.reviewPages)]};
  const database=await db();
  await new Promise<void>((resolve,reject)=>{const tx=database.transaction('progress','readwrite'),store=tx.objectStore('progress'),request=store.get(p.bookId);request.onsuccess=()=>{const current=request.result as Progress|undefined;if(!current||current.updatedAt<=p.updatedAt)store.put(clean);};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
}
export async function getNotes():Promise<Note[]>{return transact('notes','readonly',s=>s.getAll());}
export async function saveNote(n:Note){ await transact('notes','readwrite',s=>s.put({id:n.id,bookId:n.bookId,pageId:n.pageId,text:n.text,updatedAt:n.updatedAt})); }
export async function exportReading(){return {format:'study-library-reading',version:1,exportedAt:new Date().toISOString(),progress:await transact('progress','readonly',s=>s.getAll()),notes:await getNotes()};}
export function parseReading(input:unknown):{progress:Progress[];notes:Note[]} {
  if(!input || typeof input!=='object') throw new Error('기록 파일 형식이 아닙니다.');
  const x=input as Record<string,unknown>;
  if(x.format!=='study-library-reading'||x.version!==1||!Array.isArray(x.progress)||!Array.isArray(x.notes)||x.progress.length>10000||x.notes.length>10000) throw new Error('지원하지 않는 기록 파일입니다.');
  const string=(v:unknown,max=1000)=>{if(typeof v!=='string'||v.length>max) throw new Error('기록 값이 올바르지 않습니다.');return v;};
  const record=(v:unknown):Record<string,any>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('기록 항목의 형식이 올바르지 않습니다.');return v as Record<string,any>;};
  const progress=x.progress.map((entry:unknown)=>{const v=record(entry);return ({bookId:string(v.bookId),pageId:string(v.pageId),blockId:string(v.blockId),version:string(v.version),offset:typeof v.offset==='number'&&Number.isFinite(v.offset)?Math.max(0,Math.min(1,v.offset)):0,updatedAt:Number.isFinite(v.updatedAt)?v.updatedAt:0,readPages:Array.isArray(v.readPages)?v.readPages.map((s:unknown)=>string(s)):[],reviewPages:Array.isArray(v.reviewPages)?v.reviewPages.map((s:unknown)=>string(s)):[]});});
  const notes=x.notes.map((entry:unknown)=>{const v=record(entry);return ({id:string(v.id),bookId:string(v.bookId),pageId:string(v.pageId),text:string(v.text,50000),updatedAt:Number.isFinite(v.updatedAt)?Math.min(v.updatedAt,Date.now()+60000):0});});
  return {progress,notes};
}
export async function importReading(input:unknown) {
  const x=parseReading(input);
  for(const p of x.progress) await saveProgress(p);
  for(const n of x.notes) { const old=(await getNotes()).find(v=>v.id===n.id); if(!old||old.updatedAt<=n.updatedAt) await saveNote(n); }
  return {progress:x.progress.length,notes:x.notes.length};
}

