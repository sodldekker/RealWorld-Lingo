import { GoogleGenAI } from "@google/genai";
import { NewsItem, NewsContentResponse, ExerciseLevel, Language, CEFRLevel, Topic, LessonPlan, Question } from "../types";

const getSystemInstruction = (language: Language) => `
You are “${language} Current Affairs Tutor”, an AI assistant that helps Dutch secondary school teachers (VO, 14–16 year olds) create ${language} lessons based on current news articles and videos.

GOAL
- Use recent ${language} news (articles, videos/audio) as a basis for tasks.
- Create exercises at 3 different levels, based on can do-statements for ${language} (in line with SLO and CEFR).

LEVELS (Internal Exercise Complexity)
- Level 1 ≈ A2 / low B1
- Level 2 ≈ B1
- Level 3 ≈ B1+ / low B2

WHEN YOU ARE CALLED
The app will call you in two main ways:

1) FIND NEW CONTENT (MODE = "FIND_CONTENT")
   - Propose 2 current ${language} news articles
   - And 2 current ${language} videos or audio items
   - Requirements:
     - In ${language}
     - Max 7 days old
     - Suitable for 14–16 year old students
     - Topics: Must match the requested topics.
     - Content complexity: Must match the requested CEFR level.
   - OUTPUT: Strictly JSON format with "items" array.

2) GENERATE EXERCISES FOR ONE ITEM (MODE = "MAKE_EXERCISES")
   - Create a lesson based on the provided item.
   - You MUST include a "CAN DO-STATEMENTS" section.
   - Then, create exactly 5 TASKS following this structure:
     
     TASK STRUCTURE:
     1. Create 2 Multiple Choice Questions (Meerkeuzevragen).
     2. Create 3 other tasks/questions selected from this specific list (choose the ones that fit the text/video best):
        - Vragen rond voorbeelden (Questions about examples)
        - Grote lijn vragen (ABCD) (Global understanding ABCD)
        - Beweringsvraag (Assertion verification)
        - Gatenvraag op signaalwoorden (Gap-fill signal words)
        - ‘Echte’ gatenvraag (Content gap-fill/Cloze)
        - Open vraag (Open-ended question)
        - Citeer-vraag (Quote request)
        - Rollenspel (Role play)
        - Alinea’s op volgorde zetten (Reorder paragraphs)
        - Kopjes matchen (Match headings)
        - Recencie-vraag (Review/Opinion question)

   - ADJUSTMENT PER LEVEL:
     - Level 1: Simple vocabulary, shorter sentences, more scaffolding.
     - Level 2: Standard B1 vocabulary.
     - Level 3: More abstract, requiring deeper inference or critical thinking.

OUTPUT FORMAT FOR EXERCISES (JSON ONLY):
Return a strict JSON object (no markdown formatting) matching this interface:

{
  "canDo": {
    "skill": "Reading/Listening/etc",
    "level": "Selected Level",
    "statement": "I can..."
  },
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "questionTypeLabel": "Multiple Choice",
      "instruction": "Choose the best answer...",
      "question": "What is the main idea...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "B) Because..."
    },
    {
      "id": "q3",
      "type": "open",
      "questionTypeLabel": "Citeer-vraag",
      "instruction": "Quote the sentence...",
      "question": "Find the sentence that says...",
      "correctAnswer": "The sentence is: '...'"
    }
  ]
}

TASK DESIGN ADJUSTMENTS FOR LANGUAGE
- All student instructions, questions, and sentence starters must be in ${language}.
`;

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to map Dutch topics to English for better prompt understanding
const topicTranslation: Record<Topic, string> = {
  'Natuur': 'Nature',
  'Dieren': 'Animals',
  'Sport': 'Sports',
  "Hobby's": 'Hobbies',
  'Politiek': 'Politics',
  'Film en TV': 'Film and TV',
  'Geschiedenis': 'History',
  'Muziek': 'Music',
  'Mode en Beauty': 'Fashion and Beauty',
  'Gezondheid': 'Health',
  'Lifestyle': 'Lifestyle',
  'Reizen': 'Travel',
  'Maatschappij en levensbeschouwing': 'Society and Beliefs'
};

/**
 * Fetches new content suggestions using the Google Search tool to ensure freshness.
 */
export const fetchContentSuggestions = async (
  language: Language, 
  cefrLevel: CEFRLevel, 
  topics: Topic[]
): Promise<NewsItem[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Translate topics for the prompt
    const englishTopics = topics.map(t => topicTranslation[t]).join(", ");

    const prompt = `
      MODE = "FIND_CONTENT"
      
      Please find 4 distinct, current news items (2 articles, 2 videos) suitable for Dutch teenagers (14-16 years old).
      
      CRITICAL CONSTRAINTS:
      1. Language: Content must be in **${language}**.
      2. Level: Content complexity must be appropriate for **CEFR Level ${cefrLevel}** learners.
      3. Topics: Content must be strictly related to one or more of these topics: **${englishTopics}**.
      
      Return ONLY the JSON. Do not include markdown formatting like \`\`\`json.
      
      Expected JSON Structure:
      {
        "items": [
          { "type": "article", "title": "...", "source": "...", "date": "...", "url": "...", "summary": "..." },
          ...
        ]
      }
    `;

    // We use the googleSearch tool to get real, recent news.
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(language),
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated");
    }

    // Clean up potential markdown formatting if the model adds it despite instructions
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanJson) as NewsContentResponse;
    return parsedData.items;

  } catch (error) {
    console.error("Error fetching content suggestions:", error);
    throw error;
  }
};

/**
 * Generates the lesson plan for a specific item and level.
 */
export const generateLessonPlan = async (item: NewsItem, level: ExerciseLevel, language: Language): Promise<LessonPlan> => {
  try {
    const model = "gemini-2.5-flash";

    const prompt = `
      MODE = "MAKE_EXERCISES"
      
      Context:
      contentType: "${item.type}"
      title: "${item.title}"
      source: "${item.source}"
      date: "${item.date}"
      url: "${item.url}"
      summary: "${item.summary}"
      
      Task:
      Generate exercises for Level ${level} in ${language}.
      
      IMPORTANT:
      - Create 2 Multiple Choice questions (type: "multiple_choice").
      - Create 3 other questions from the allowed list (type: "open").
      - Return STRICT JSON only.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(language),
        temperature: 0.7,
        responseMimeType: "application/json"
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text generated");

    // Parse JSON
    const parsed = JSON.parse(text) as LessonPlan;
    return parsed;

  } catch (error) {
    console.error("Error generating lesson plan:", error);
    throw error;
  }
};

/**
 * Evaluates student answers against the lesson plan and source text.
 */
export const evaluateStudentAnswers = async (
  item: NewsItem,
  questions: Question[],
  studentAnswers: Record<string, string>,
  language: Language
): Promise<Record<string, string>> => {
  try {
    const model = "gemini-2.5-flash";

    const questionsJson = JSON.stringify(questions.map(q => ({
      id: q.id,
      question: q.question,
      correctAnswer: q.correctAnswer,
      type: q.type,
      label: q.questionTypeLabel,
      options: q.options
    })));

    const answersJson = JSON.stringify(studentAnswers);

    const prompt = `
      MODE = "GRADING"
      
      Role: You are a helpful teacher grading a student's work for a ${language} class.
      
      Context Article/Video:
      Title: "${item.title}"
      Summary: "${item.summary}"
      
      Questions & Model Answers:
      ${questionsJson}
      
      Student Answers:
      ${answersJson}
      
      TASK:
      Evaluate each answer. Return a JSON object where keys are the question IDs and values are the feedback strings.
      
      FEEDBACK FORMAT (Write in Dutch):
      For each question, the feedback text MUST follow this structure:

      Stap 1: Controle
      - Heeft de leerling voldaan aan de opdracht? (Ja/Nee)
      - Is het antwoord inhoudelijk correct?
      - Indien fout: Geef duidelijk aan wat het goede antwoord had moeten zijn.

      Stap 2: Analyse & Uitleg
      - Leg in **maximaal 3 zinnen** uit waarom het juiste antwoord correct is en (indien van toepassing) waarom de andere opties fout zijn.

      Stap 3: Strategie & Tip
      - Geef in **maximaal 3 zinnen** een leerstrategie of tip voor dit specifieke vraagtype.

      Example Output JSON:
      {
        "q1": "Stap 1: Controle\nJa, correct...\n\nStap 2: Analyse\nDit is goed omdat...\n\nStap 3: Strategie\nLet bij dit soort vragen op..."
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are a teacher. Provide constructive, educational feedback in Dutch. Return strictly JSON.",
        temperature: 0.3,
        responseMimeType: "application/json"
      },
    });

    const text = response.text;
    if (!text) throw new Error("No grading generated");

    return JSON.parse(text) as Record<string, string>;

  } catch (error) {
    console.error("Error evaluating answers:", error);
    // Fallback: return simple message if API fails
    const fallback: Record<string, string> = {};
    questions.forEach(q => {
      fallback[q.id] = "Grading unavailable. Model answer: " + q.correctAnswer;
    });
    return fallback;
  }
};