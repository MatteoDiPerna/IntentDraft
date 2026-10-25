import type {
  ClarificationQuestion,
  Conversation,
  Interpretation,
} from '@/types/conversation';

const MEDICAL_LEGAL = /\b(cure|medic|diagnos|legal|avvocat|lawsuit|malattia|terapia)\b/i;

function isLinkedInVague(text: string): boolean {
  return /linkedin|post social/i.test(text) && text.length < 120;
}

function isMarketingVague(text: string): boolean {
  return /piano marketing|marketing plan/i.test(text) && !/budget|pubblico|audience|target/i.test(text);
}

function isNotesRequest(text: string): boolean {
  return /\b(note|appunti|minutes|riunione|meeting)\b/i.test(text);
}

export function detectUnsupported(text: string): boolean {
  return MEDICAL_LEGAL.test(text);
}

export function buildClarifications(text: string, locale: 'it' | 'en'): ClarificationQuestion[] {
  if (isLinkedInVague(text)) {
    return locale === 'it'
      ? [
          {
            id: 'audience',
            text: 'Chi vuoi raggiungere su LinkedIn (ruolo, settore)?',
            reason: 'Serve a definire tono e messaggio.',
          },
          {
            id: 'message',
            text: 'Qual è il messaggio principale in una frase?',
            reason: 'Evita post troppo generici.',
          },
        ]
      : [
          {
            id: 'audience',
            text: 'Who do you want to reach on LinkedIn (role, industry)?',
            reason: 'Helps set tone and message.',
          },
          {
            id: 'message',
            text: 'What is the main message in one sentence?',
            reason: 'Avoids overly generic posts.',
          },
        ];
  }
  if (isMarketingVague(text)) {
    return locale === 'it'
      ? [
          {
            id: 'business',
            text: 'Che tipo di attività o prodotto promuovi?',
            reason: 'Personalizza il piano.',
          },
          {
            id: 'goal',
            text: 'Obiettivo principale (contatti, vendite, notorietà)?',
          },
        ]
      : [
          { id: 'business', text: 'What business or product are you promoting?' },
          { id: 'goal', text: 'Main goal (leads, sales, awareness)?' },
        ];
  }
  return [];
}

export function buildInterpretation(
  userText: string,
  answers: string[],
  locale: 'it' | 'en',
): Interpretation {
  const assumptions: string[] = [];
  let objective = userText.slice(0, 200);
  let audience: string | undefined;
  let context: string | undefined;

  if (isNotesRequest(userText)) {
    objective =
      locale === 'it'
        ? 'Organizzare appunti/chiarezza su contenuti di riunione o studio'
        : 'Organize notes or meeting/study content clearly';
    context = userText;
    if (!/lunghezza|length|breve|short/i.test(userText)) {
      assumptions.push(
        locale === 'it'
          ? 'Formato medio (bullet e paragrafi brevi) se non specificato.'
          : 'Medium format (bullets and short paragraphs) unless specified.',
      );
    }
  } else if (/linkedin/i.test(userText)) {
    objective =
      locale === 'it' ? 'Scrivere un post LinkedIn efficace' : 'Write an effective LinkedIn post';
    context = [userText, ...answers].join('\n');
    audience = answers[0] || (locale === 'it' ? 'Professionisti del settore (assunto)' : 'Industry professionals (assumed)');
    if (!answers[1]) {
      assumptions.push(
        locale === 'it' ? 'Messaggio dedotto dal testo iniziale.' : 'Message inferred from initial text.',
      );
    }
  } else {
    context = [userText, ...answers].filter(Boolean).join('\n');
  }

  return { objective, context, audience, assumptions };
}

export function buildPrompt(
  interpretation: Interpretation,
  locale: 'it' | 'en',
  variant = 0,
): string {
  const intro =
    locale === 'it'
      ? 'Agisci come assistente esperto. Segui le istruzioni seguenti.'
      : 'Act as an expert assistant. Follow the instructions below.';

  const sections = [
    `## ${locale === 'it' ? 'Obiettivo' : 'Objective'}\n${interpretation.objective}`,
    interpretation.context &&
      `## ${locale === 'it' ? 'Contesto' : 'Context'}\n${interpretation.context}`,
    interpretation.audience &&
      `## ${locale === 'it' ? 'Destinatario' : 'Audience'}\n${interpretation.audience}`,
    `## ${locale === 'it' ? 'Vincoli' : 'Constraints'}\n- ${locale === 'it' ? 'Non inventare dati o fatti non forniti.' : 'Do not invent facts or data not provided.'}\n- ${locale === 'it' ? 'Segnala le limitazioni se mancano informazioni.' : 'State limitations when information is missing.'}`,
    interpretation.assumptions.length > 0 &&
      `## ${locale === 'it' ? 'Assunzioni' : 'Assumptions'}\n${interpretation.assumptions.map((a) => `- ${a}`).join('\n')}`,
    `## ${locale === 'it' ? 'Formato output' : 'Output format'}\n${locale === 'it' ? 'Testo chiaro, pronto da usare.' : 'Clear, ready-to-use text.'}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  if (variant > 0) {
    return `${intro}\n\n${sections}\n\n<!-- variant ${variant} -->`;
  }
  return `${intro}\n\n${sections}`;
}

export function shouldAskClarification(conv: Conversation, latestUserText: string): boolean {
  if (conv.clarificationTurns >= 2) return false;
  const qs = buildClarifications(latestUserText, 'it');
  return qs.length > 0 && conv.pendingQuestions.length === 0 && conv.clarificationTurns === 0;
}

export function assistantReplyForQuestions(
  questions: ClarificationQuestion[],
  locale: 'it' | 'en',
): string {
  const header =
    locale === 'it'
      ? 'Per preparare istruzioni più utili, rispondi (puoi anche usare "Salta"):'
      : 'To prepare better instructions, please answer (or use Skip):';
  return `${header}\n\n${questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')}`;
}
