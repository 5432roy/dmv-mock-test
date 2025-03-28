// src/dataService.js
import { supabase } from './supabaseClient';

let cachedQuestions = null;

export async function fetchQuestions() {
  if (cachedQuestions) {
    return cachedQuestions;
  }
  const { data, error } = await supabase
    .from("Questions")
    .select('id, Prompt, Option1, Option2, Option3, Option4, GraphLink, Answer');
  if (error) {
    throw error;
  }
  cachedQuestions = data.map(q => ({
    id: q.id,
    question: q.Prompt,
    options: [q.Option1, q.Option2, q.Option3, q.Option4],
    answer: q.Answer,
    graphLink: q.GraphLink,
  }));
  return cachedQuestions;
}

export async function submitBugReport(report) {
  const { error } = await supabase.from('bugs_report').insert([report]);
  if (error) {
    throw error;
  }
  return true;
}
