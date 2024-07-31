"use client";
import { useState, useCallback, useEffect } from "react";
import Editor from "./components/Editor";
import Settings from "./components/Setting";
import MenuInput from "./components/MenuInput";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionType1, setQuestionType1] = useState([]);
  const [questionType2, setQuestionType2] = useState([]);
  const [questionType3, setQuestionType3] = useState([]);

  const handleInputChange = useCallback((value) => {
    setInputText(value);
  }, []);

  const handleFileUpload = (content) => {
    setInputText(content);
  };
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShuffleAndDownload = () => {
    const shuffledType1 = shuffleArray(questionType1);
    const shuffledType2 = shuffleArray(questionType2);
    const shuffledType3 = shuffleArray(questionType3);

    let texContent = `\\documentclass[12pt,a4paper]{article}
  \\usepackage{amsmath,amssymb,multicol,enumitem,geometry,fontspec}
  \\usepackage[vietnamese]{babel}
  \\usepackage{fancyhdr}
  
  \\geometry{left=2cm,right=2cm,top=2cm,bottom=2cm}
  \\setmainfont{Times New Roman}
  
  \\pagestyle{fancy}
  \\fancyhf{}
  \\renewcommand{\\headrulewidth}{0pt}
  \\fancyfoot[C]{\\thepage}
  
  \\newcommand{\\answerbox}[1]{\\fbox{\\parbox{1cm}{\\centering #1}}}
  
  \\begin{document}
  
  \\begin{center}
  \\textbf{\\Large ĐỀ THI TRẮC NGHIỆM VẬT LÝ}
  \\end{center}
  
  \\vspace{0.5cm}
  
  \\noindent\\textbf{Họ và tên:} \\underline{\\hspace{8cm}} \\hfill \\textbf{Lớp:} \\underline{\\hspace{3cm}}
  
  \\vspace{0.5cm}
  
  \\section*{PHẦN I: CÂU HỎI TRẮC NGHIỆM}
  \\begin{enumerate}[label=\\textbf{Câu \\arabic*.}]
  ${shuffledType1
    .map(
      (q, index) => `
  \\item ${q.content}
  \\begin{multicols}{2}
  \\begin{enumerate}[label=\\textbf{\\Alph*.}]
  \\item ${q.ans1.replace(/^\\True/, "")}
  \\item ${q.ans2.replace(/^\\True/, "")}
  \\item ${q.ans3.replace(/^\\True/, "")}
  \\item ${q.ans4.replace(/^\\True/, "")}
  \\end{enumerate}
  \\end{multicols}
  \\noindent Đáp án: \\answerbox{${q.key}}
  ${q.sol ? `\\\\\\textit{Lời giải:} ${q.sol}` : ""}
  ${index < shuffledType1.length - 1 ? "\\vspace{0.5cm}" : ""}
  `
    )
    .join("\n")}
  \\end{enumerate}
  
  \\newpage
  
  \\section*{PHẦN II: CÂU HỎI ĐÚNG/SAI}
  \\begin{enumerate}[label=\\textbf{Câu \\arabic*.},resume]
  ${shuffledType2
    .map(
      (q, index) => `
      \\begin{ex} \n
   ${q.content}
  
  \\item ${q.ans1}
  \\item ${q.ans2}
  \\item ${q.ans3}
  \\item ${q.ans4}
  \\end{enumerate}
  \\noindent Đáp án: \\answerbox{${q.key}}
  ${q.sol ? `\\\\\\textit{Lời giải:} ${q.sol}` : ""}
  ${index < shuffledType2.length - 1 ? "\\vspace{0.5cm}" : ""}
  `
    )
    .join("\n")}
  \\end{enumerate}
  
  \\newpage
  
  \\section*{PHẦN III: CÂU HỎI TỰ LUẬN}
  \\begin{enumerate}[label=\\textbf{Câu \\arabic*.},resume]
  ${shuffledType3
    .map(
      (q, index) => `
  \\item ${q.content}
  \\vspace{2cm}
  \\noindent Đáp án: ${q.key}
  ${q.sol ? `\\\\\\textit{Lời giải:} ${q.sol}` : ""}
  ${index < shuffledType3.length - 1 ? "\\vspace{0.5cm}" : ""}
  `
    )
    .join("\n")}
  \\end{enumerate}
  
  \\end{document}`;

    const blob = new Blob([texContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "de_thi_vat_ly.tex";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const extractQuestions = (text) => {
      const regex = /begin\{ex\}(.*?)end\{ex\}/gs;
      const matches = [...text.matchAll(regex)];
      return matches.map((match) => match[1].trim());
    };

    const classifyQuestions = (questions) => {
      const type1 = [];
      const type2 = [];
      const type3 = [];

      questions.forEach((question) => {
        if (question.includes("\\choiceTF")) {
          const obj = parseType2(question);
          type2.push(obj);
        } else if (question.includes("\\choice")) {
          const obj = parseType1(question);
          type1.push(obj);
        } else if (question.includes("\\shortans")) {
          const obj = parseType3(question);
          type3.push(obj);
        }
      });

      setQuestionType1(type1);
      setQuestionType2(type2);
      setQuestionType3(type3);
    };

    const parseType1 = (question) => {
      const contentMatch = question.match(/(.*?)\\choice/s);
      const content = contentMatch ? contentMatch[1].trim() : "";

      const answerMatches = question.match(
        /\\choice([\s\S]*?)(?:\\loigiai|\z)/
      );
      const answerContent = answerMatches ? answerMatches[1] : "";

      const answers = answerContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("{"))
        .map((line) => line.slice(1, -1).trim());

      const solutionMatch = question.match(/\\loigiai\{([^}]+)\}/);
      const solution = solutionMatch ? solutionMatch[1].trim() : "";

      const key = answers.findIndex((ans) => ans.startsWith("\\True"));
      const keyLetter = key !== -1 ? String.fromCharCode(65 + key) : "";

      return {
        content,
        ans1: answers[0] || "",
        ans2: answers[1] || "",
        ans3: answers[2] || "",
        ans4: answers[3] || "",
        sol: solution,
        key: keyLetter,
      };
    };
    const parseType2 = (question) => {
      const contentMatch = question.match(/(.*?)\\choiceTF/s);
      const content = contentMatch ? contentMatch[1].trim() : "";

      const answerMatches = question.match(
        /\\choiceTF([\s\S]*?)(?:\\loigiai|\z)/
      );
      const answerContent = answerMatches ? answerMatches[1] : "";

      const answers = answerContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("{"))
        .map((line) => line.slice(1, -1).trim());

      const solutionMatch = question.match(/\\loigiai\{([^}]+)\}/);
      const solution = solutionMatch ? solutionMatch[1].trim() : "";

      const keys = answers
        .map((ans, index) =>
          ans.startsWith("\\True") ? String.fromCharCode(65 + index) : null
        )
        .filter(Boolean);

      return {
        content,
        ans1: answers[0] || "",
        ans2: answers[1] || "",
        ans3: answers[2] || "",
        ans4: answers[3] || "",
        sol: solution,
        key: keys.join(", "),
      };
    };

    const parseType3 = (question) => {
      const contentMatch = question.match(/(.*?)\\shortans/s);
      const content = contentMatch ? contentMatch[1].trim() : "";

      const keyMatch = question.match(/\\shortans\[oly\]\{([^}]+)\}/);
      const key = keyMatch ? keyMatch[1] : "";

      const solutionMatch = question.match(/\\loigiai\{([^}]+)\}/);
      const solution = solutionMatch ? solutionMatch[1] : "";

      return {
        content,
        sol: solution,
        key,
      };
    };

    const newQuestions = extractQuestions(inputText);
    setQuestions(newQuestions);
    classifyQuestions(newQuestions);
  }, [inputText]);

  return (
    <div className="bg-[#F3F3F3] rounded-lg">
      <div className="grid grid-cols-[200px,1fr,1fr] divide-x divide-solid divide-gray rounded-lg">
        {/* Column 1 */}
        <div className="bg-white rounded-lg overflow-hidden flex flex-col">
          <div className="h-[200px] overflow-y-auto p-4">
            <Settings handleFileUpload={handleFileUpload} />
            <div>Tổng số câu hỏi: {questions.length}</div>
            <div>Loại 1: {questionType1.length}</div>
            <div>Loại 2: {questionType2.length}</div>
            <div>Loại 3: {questionType3.length}</div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="bg-white flex flex-col">
          <div className="h-[20px]">Menu 1</div>
          <div className="overflow-y-auto h-[1000px]">
            <Editor
              handleInputChange={handleInputChange}
              inputText={inputText}
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="bg-white flex flex-col">
          <div className="h-[20px]">Menu 2</div>
          <div className="h-[1000px] p-6 flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-grow">
              <div className="space-y-6 pr-2" style={{ marginBottom: "200px" }}>
                {/* Type 1 Questions */}
                <div>
                  <button
                    onClick={handleShuffleAndDownload}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Trộn và Tải xuống
                  </button>
                  <h2 className="text-xl font-bold mb-2">Câu hỏi Loại 1</h2>
                  {questionType1.map((q, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4"
                    >
                      <p className="font-semibold">Nội dung: {q.content}</p>
                      <p>Đáp án A: {q.ans1}</p>
                      <p>Đáp án B: {q.ans2}</p>
                      <p>Đáp án C: {q.ans3}</p>
                      <p>Đáp án D: {q.ans4}</p>
                      <p className="font-semibold text-green-600">
                        Đáp án đúng: {q.key}
                      </p>
                      {q.sol && <p>Lời giải: {q.sol}</p>}
                    </div>
                  ))}
                </div>

                {/* Type 2 Questions */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Câu hỏi Loại 2</h2>
                  {questionType2.map((q, index) => (
                    <div
                      key={index}
                      className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4"
                    >
                      <p className="font-semibold">Nội dung: {q.content}</p>
                      <p>Mệnh đề 1: {q.ans1}</p>
                      <p>Mệnh đề 2: {q.ans2}</p>
                      <p>Mệnh đề 3: {q.ans3}</p>
                      <p>Mệnh đề 4: {q.ans4}</p>
                      <p className="font-semibold text-green-600">
                        Đáp án đúng: {q.key}
                      </p>
                      {q.sol && <p>Lời giải: {q.sol}</p>}
                    </div>
                  ))}
                </div>

                {/* Type 3 Questions */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Câu hỏi Loại 3</h2>
                  {questionType3.map((q, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4"
                    >
                      <p className="font-semibold">Nội dung: {q.content}</p>
                      <p className="font-semibold text-green-600">
                        Đáp án: {q.key}
                      </p>
                      {q.sol && <p>Lời giải: {q.sol}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
