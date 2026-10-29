import { BookSchema, LibrarySchema, type Book } from '../shared/schema';
let libraryPromise:ReturnType<typeof loadLibrary>|undefined;
const cache=new Map<string,Promise<Book>>();
async function fetchJson(path:string){const response=await fetch(import.meta.env.BASE_URL+'content/'+path);if(!response.ok)throw new Error('학습 자료를 불러오지 못했습니다. 연결을 확인하고 다시 시도해주세요.');return response.json();}
async function loadLibrary(){return LibrarySchema.parse(await fetchJson('library.json'));}
export function getLibrary(){return libraryPromise??=loadLibrary().catch(e=>{libraryPromise=undefined;throw e;});}
export function getBook(id:string){if(!/^[a-z0-9-]+$/.test(id)) return Promise.reject(new Error('올바르지 않은 책 주소입니다.'));if(!cache.has(id))cache.set(id,fetchJson('books/'+id+'.json').then(v=>BookSchema.parse(v)).catch(e=>{cache.delete(id);throw e;}));return cache.get(id)!;}

