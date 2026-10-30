import supplementalEntries from '../content/japanese-word-supplements.json';
import type { GlossaryEntry } from './words';

export function getWordEntries(entries:GlossaryEntry[]):GlossaryEntry[]{
 // The book's own readings and explanations take priority over shared supplements.
 return [...new Map([...supplementalEntries,...entries].map(entry=>[entry.word,entry])).values()];
}