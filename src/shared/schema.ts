import { z } from 'zod';

export const ExampleSchema = z.object({ ja: z.string(), reading: z.string(), meaning: z.string(), note: z.string().optional() });
export const QuestionSchema = z.object({
  prompt: z.string().min(1), options: z.array(z.string()).min(2), answer: z.number().int().nonnegative(),
  explanation: z.string().min(15), wrongExplanations: z.array(z.string()).optional(),
}).refine(q => q.answer < q.options.length, '정답 번호가 선택지 범위를 벗어났습니다.');
export const BlockSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), type: z.enum(['text','example','table','question','dialogue','position','sentence','callout','counter']),
  title: z.string().optional(), text: z.string().optional(), examples: z.array(ExampleSchema).optional(),
  headers: z.array(z.string()).optional(), rows: z.array(z.array(z.string())).optional(),
  question: QuestionSchema.optional(), sourceIds: z.array(z.string()).min(1),
  provenance: z.enum(['source','supplement','correction']),
}).superRefine((b,c) => {
  if (b.type === 'question' && !b.question) c.addIssue({code:'custom',message:'문제 본문이 없습니다.'});
  if (b.type === 'example' && !b.examples?.length) c.addIssue({code:'custom',message:'예문이 없습니다.'});
  if (b.type === 'table' && (!b.headers?.length || !b.rows?.length)) c.addIssue({code:'custom',message:'표 데이터가 없습니다.'});
});
export const PageSchema = z.object({
  id:z.string().regex(/^[a-z0-9-]+$/),title:z.string().min(1),goal:z.string(),minutes:z.number().positive(),
  blocks:z.array(BlockSchema).min(2)
});
export const BookSchema = z.object({
  id:z.string().regex(/^[a-z0-9-]+$/), version:z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/), subject:z.string(), section:z.string(), title:z.string().min(2),
  subtitle:z.string(), level:z.string(), minutes:z.number().positive(), coverColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),
  summary:z.string(),objectives:z.array(z.string()).min(1), prerequisites:z.array(z.string()),
  sources:z.array(z.object({id:z.string(),label:z.string(),url:z.string().url().optional()})).min(1),
  pages:z.array(PageSchema).min(1),
  glossary:z.array(z.object({id:z.string(),word:z.string(),reading:z.string(),meaning:z.string(),note:z.string()})),
  coverage:z.array(z.object({sourceId:z.string(),status:z.enum(['covered','duplicate','reference']),pageIds:z.array(z.string()),reason:z.string()})),
});
export type Book = z.infer<typeof BookSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export const SummarySchema = BookSchema.pick({id:true,version:true,subject:true,section:true,title:true,subtitle:true,level:true,minutes:true,coverColor:true,summary:true,objectives:true,prerequisites:true}).extend({pageCount:z.number()});
export type BookSummary = z.infer<typeof SummarySchema>;
export const LibrarySchema = z.object({
  version:z.string(),
  subjects:z.array(z.object({id:z.string(),title:z.string(),subtitle:z.string(),description:z.string(),color:z.string(),motif:z.string()})),
  books:z.array(SummarySchema),
  paths:z.array(z.object({id:z.string(),title:z.string(),question:z.string(),audience:z.string(),prerequisites:z.array(z.string()),task:z.string(),steps:z.array(z.object({bookId:z.string(),pageId:z.string(),reason:z.string(),record:z.string()}))})),
  concepts:z.array(z.object({id:z.string(),label:z.string(),description:z.string(),bookId:z.string(),pageId:z.string(),related:z.array(z.string())})),
});
export type Library = z.infer<typeof LibrarySchema>;
export function validateBook(input:unknown):Book {
  const b=BookSchema.parse(input);
  const pages=new Set<string>(), blocks=new Set<string>(), sources=new Set(b.sources.map(s=>s.id));
  for(const p of b.pages) {
    if(pages.has(p.id)) throw new Error('중복 페이지 ID: '+p.id); pages.add(p.id);
    for(const block of p.blocks) {
      if(blocks.has(block.id)) throw new Error('중복 블록 ID: '+block.id); blocks.add(block.id);
      for(const source of block.sourceIds) if(!sources.has(source)) throw new Error('없는 출처: '+source);
    }
  }
  for(const c of b.coverage) {
    if(!sources.has(c.sourceId) || c.pageIds.some(id=>!pages.has(id))) throw new Error('출처 대응 오류: '+c.sourceId);
    if(c.status==='covered' && !c.pageIds.length) throw new Error('사용처 없는 원문: '+c.sourceId);
  }
  const serialized=JSON.stringify(b);
  if(/[A-Z]:(?:\\|\/)+Users(?:\\|\/)+|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}/.test(serialized))
    throw new Error('공개 데이터에 로컬 경로나 비밀 정보가 포함됐습니다.');
  return b;
}
export function summarize(b:Book):BookSummary {
  const {pages,glossary,sources,coverage,...rest}=b;
  return {...rest,pageCount:pages.length};
}

