import type { Book } from '../shared/schema';
import type { Progress } from './storage';

export function summarizeReading(books:Book[],progress:(Progress|undefined)[]){
 const byBook=new Map(progress.filter((v):v is Progress=>!!v).map(p=>[p.bookId,p]));
 const rows=books.map(book=>{
  const p=byBook.get(book.id),read=new Set(p?.readPages),review=new Set(p?.reviewPages);
  const readPages=book.pages.filter(page=>read.has(page.id)),reviewPages=book.pages.filter(page=>review.has(page.id));
  return {book,progress:p,readPages,reviewPages,percent:book.pages.length?Math.round(readPages.length/book.pages.length*100):0};
 });
 const totalPages=books.reduce((sum,book)=>sum+book.pages.length,0),readPages=rows.reduce((sum,row)=>sum+row.readPages.length,0);
 const recent=rows.filter(row=>row.progress&&row.book.pages.some(page=>page.id===row.progress!.pageId)).sort((a,b)=>b.progress!.updatedAt-a.progress!.updatedAt);
 return {rows,recent,totalPages,readPages,percent:totalPages?Math.round(readPages/totalPages*100):0};
}
