import { jsPDF } from "jspdf";
import { LessonPlan, NewsItem, Language, Question } from "../types";

// Configuration for PDF layout
const MARGIN = 20;
const PAGE_HEIGHT = 297; // A4 height in mm
const PAGE_WIDTH = 210;  // A4 width in mm
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const LINE_HEIGHT = 7;

/**
 * Helper to check page bounds and add new page if necessary
 */
const checkPageBreak = (doc: jsPDF, currentY: number, neededSpace: number = 20): number => {
  if (currentY + neededSpace > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return currentY;
};

/**
 * Adds a header to the PDF
 */
const addHeader = (doc: jsPDF, title: string, subtitle: string): number => {
  let y = MARGIN;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(subtitle, MARGIN, y);
  doc.setTextColor(0);
  
  return y + 10;
};

/**
 * Generates the Student Worksheet PDF (Source + Questions, no answers)
 */
export const downloadStudentPDF = (lesson: LessonPlan, item: NewsItem, language: Language) => {
  const doc = new jsPDF();
  let y = addHeader(doc, item.title, `${language} Lesson | Source: ${item.source} | Date: ${item.date}`);

  // --- SOURCE MATERIAL ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Source Material", MARGIN, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(item.summary, CONTENT_WIDTH);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 6;

  // Link
  y = checkPageBreak(doc, y);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 255);
  doc.textWithLink("Read full original article/video", MARGIN, y, { url: item.url });
  doc.setTextColor(0);
  y += 15;

  // --- EXERCISES ---
  y = checkPageBreak(doc, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Exercises", MARGIN, y);
  y += 10;

  // Can Do Statement
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(`Goal: ${lesson.canDo.statement} (${lesson.canDo.level})`, MARGIN, y);
  y += 10;

  // Questions
  lesson.questions.forEach((q, index) => {
    y = checkPageBreak(doc, y, 40); // Ensure space for at least question + some options

    // Question Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Question ${index + 1} (${q.questionTypeLabel})`, MARGIN, y);
    y += 6;

    // Instruction
    if (q.instruction) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(80);
      const instLines = doc.splitTextToSize(q.instruction, CONTENT_WIDTH);
      doc.text(instLines, MARGIN, y);
      y += instLines.length * 5;
      doc.setTextColor(0);
    }

    // Question Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const qLines = doc.splitTextToSize(q.question, CONTENT_WIDTH);
    doc.text(qLines, MARGIN, y);
    y += qLines.length * 6 + 2;

    // Options (Multiple Choice)
    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach(opt => {
        y = checkPageBreak(doc, y, 8);
        const optLines = doc.splitTextToSize(opt, CONTENT_WIDTH - 10);
        doc.rect(MARGIN, y - 4, 4, 4); // Checkbox
        doc.text(optLines, MARGIN + 8, y);
        y += optLines.length * 6;
      });
    }

    // Workspace (Open Question)
    if (q.type === 'open') {
      y = checkPageBreak(doc, y, 20);
      y += 2;
      doc.setDrawColor(200);
      doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
      y += 8;
      doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
      y += 8;
      doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
      doc.setDrawColor(0);
    }

    y += 10; // Spacing between questions
  });

  doc.save(`${language}_Worksheet_${item.date}.pdf`);
};

/**
 * Generates the Teacher Answer Key PDF
 */
export const downloadTeacherPDF = (lesson: LessonPlan, item: NewsItem, language: Language) => {
  const doc = new jsPDF();
  let y = addHeader(doc, `ANSWER KEY: ${item.title}`, `${language} Teacher Model | ${item.source}`);

  // --- QUESTIONS & ANSWERS ---
  lesson.questions.forEach((q, index) => {
    y = checkPageBreak(doc, y, 30);

    // Question Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Q${index + 1}: ${q.question}`, MARGIN, y, { maxWidth: CONTENT_WIDTH });
    
    // Calculate height of previous text to move Y
    const qHeight = doc.getTextDimensions(q.question, { maxWidth: CONTENT_WIDTH }).h;
    y += qHeight + 4;

    // Answer Block
    doc.setFillColor(240, 248, 255); // Light blue bg
    doc.rect(MARGIN, y, CONTENT_WIDTH, 15, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 100, 0); // Dark Green
    doc.text("Correct Answer:", MARGIN + 2, y + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const answerLines = doc.splitTextToSize(q.correctAnswer, CONTENT_WIDTH - 5);
    doc.text(answerLines, MARGIN + 2, y + 11);
    
    y += 25;
  });

  doc.save(`${language}_AnswerKey_${item.date}.pdf`);
};
