"use client";
import { useState, useCallback, useEffect } from "react";
import Editor from "./components/Editor";
import Settings from "./components/Setting";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const formatTracNghiem = useCallback(() => {
    // Helper function to wrap numbers in $...$ and handle decimal numbers
    const wrapNumbersInDollars = (text) => {
      return text.replace(
        /(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g,
        (match, p1, p2) => {
          if (p1) {
            // Handle numbers already in $...$
            return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
          }
          if (p2.includes(",")) {
            // Handle decimal numbers with comma
            return "$" + p2.replace(",", "{,}") + "$";
          }
          return `$${p2}$`; // If it's a number not wrapped, wrap it
        }
      );
    };

    // Helper function to replace % with \\% in text, excluding specific cases
    const replacePercentage = (text) => {
      return text.replace(/%(?!Câu|\s*======================%)/g, "\\%");
    };

    const questionBlocks = inputText.split(/Câu\s*(?:\d+[:.]|\.)?\s*/);
    const normalizedQuestions = questionBlocks
      .filter((q) => q.trim())
      .map((question, index) => {
        // Separate the explanation from the question content
        const [questionContent, explanation] = question.split(/Lời giải\s*/);

        const parts = questionContent.split(/(?<=\s|^)(A\.|B\.|C\.|D\.)\s*/);
        const content = parts[0];
        const choices = [];

        for (let i = 1; i < parts.length; i += 2) {
          if (i + 1 < parts.length) {
            let choice = parts[i + 1].trim();
            // Check if the option starts with "#"
            if (choice.startsWith("#")) {
              choice = "\\True " + choice.substring(1);
            }
            choices.push(choice);
          }
        }

        const normalizedChoices = choices.map(
          (choice) =>
            replacePercentage(
              wrapNumbersInDollars(
                choice
                  .replace(/\.$/, "")
                  .replace(/\s+/g, " ")
                  .replace(/\\frac/g, "\\dfrac")
                  .replace(/\\\[/g, "$")
                  .replace(/\\\]/g, "$")
              )
            ).trim() // Remove trailing whitespace
        );

        const normalizedContent = replacePercentage(
          wrapNumbersInDollars(
            content
              .trim()
              .replace(/\s+/g, " ")
              .replace(/\\frac/g, "\\dfrac")
              .replace(/\\\[/g, "$")
              .replace(/\\\]/g, "$")
          )
        );

        const normalizedExplanation = explanation
          ? replacePercentage(
              wrapNumbersInDollars(
                explanation
                  .trim()
                  .replace(/\s+/g, " ")
                  .replace(/\\frac/g, "\\dfrac")
                  .replace(/\\\[/g, "$")
                  .replace(/\\\]/g, "$")
              )
            )
          : "";

        return `\\begin{ex} %Câu ${
          index + 1
        }\n${normalizedContent}\n\\choice\n{${normalizedChoices.join(
          "}\n{"
        )}}\n\\loigiai{${
          normalizedExplanation ? `\n${normalizedExplanation}\n` : ""
        }}\n\\end{ex} \n%======================%`;
      });

    setInputText(normalizedQuestions.join("\n\n"));
    toast.success("Chuẩn hóa trắc nghiệm thành công !");
  }, [inputText]);
  const formatDungSai = useCallback(() => {
    // Helper function to wrap numbers in $...$ and handle decimal numbers
    const wrapNumbersInDollars = (text) => {
      return text.replace(
        /(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g,
        (match, p1, p2) => {
          if (p1) {
            return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
          }
          if (p2.includes(",")) {
            return "$" + p2.replace(",", "{,}") + "$";
          }
          return `$${p2}$`;
        }
      );
    };

    // Helper function to replace % with \\% in text, excluding specific cases
    const replacePercentage = (text) => {
      return text.replace(/%(?!Câu|\s*======================%)/g, "\\%");
    };

    const questionBlocks = inputText.split(/Câu\s*(?:\d+[:.]|\.)?\s*/);
    const normalizedQuestions = questionBlocks
      .filter((q) => q.trim())
      .map((question, index) => {
        const [questionContent, explanation] = question.split(/Lời giải\s*/);

        // Modified regex to match options with or without space after the parenthesis
        const parts = questionContent.split(/(?<=\s|^)([a-d]\))(\s*)/);
        const content = parts[0];
        const choices = [];

        for (let i = 1; i < parts.length; i += 3) {
          if (i + 2 < parts.length) {
            let choice = parts[i + 2].trim();
            if (choice.startsWith("#")) {
              choice = "\\True " + choice.substring(1);
            }
            choices.push(choice);
          }
        }

        const normalizedChoices = choices.map((choice) =>
          replacePercentage(
            wrapNumbersInDollars(
              choice
                .replace(/\.$/, "")
                .replace(/\s+/g, " ")
                .replace(/\\frac/g, "\\dfrac")
                .replace(/\\\[/g, "$")
                .replace(/\\\]/g, "$")
            )
          ).trim()
        );

        const normalizedContent = replacePercentage(
          wrapNumbersInDollars(
            content
              .trim()
              .replace(/\s+/g, " ")
              .replace(/\\frac/g, "\\dfrac")
              .replace(/\\\[/g, "$")
              .replace(/\\\]/g, "$")
          )
        );

        const normalizedExplanation = explanation
          ? replacePercentage(
              wrapNumbersInDollars(
                explanation
                  .trim()
                  .replace(/\s+/g, " ")
                  .replace(/\\frac/g, "\\dfrac")
                  .replace(/\\\[/g, "$")
                  .replace(/\\\]/g, "$")
              )
            )
          : "";

        return `\\begin{ex} %Câu ${
          index + 1
        }\n${normalizedContent}\n\\choiceTF[1t]\n{${normalizedChoices.join(
          "}\n{"
        )}}\n\\loigiai{${
          normalizedExplanation ? `\n${normalizedExplanation}\n` : ""
        }}\n\\end{ex} \n%======================%`;
      });

    setInputText(normalizedQuestions.join("\n\n"));
    toast.success("Chuẩn hóa đúng sai thành công !");
  }, [inputText]);
  const formatTraLoiNgan = useCallback(() => {
    // Helper function to wrap numbers in $...$ and handle decimal numbers
    const wrapNumbersInDollars = (text) => {
      return text.replace(
        /(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g,
        (match, p1, p2) => {
          if (p1) {
            return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
          }
          if (p2.includes(",")) {
            return "$" + p2.replace(",", "{,}") + "$";
          }
          return `$${p2}$`;
        }
      );
    };

    // Helper function to replace % with \\% in text, excluding specific cases
    const replacePercentage = (text) => {
      return text.replace(/%(?!Câu|\s*======================)/g, "\\%");
    };

    const questionBlocks = inputText.split(/Câu\s*(?:\d+[:.]|\.)?\s*/);
    const normalizedQuestions = questionBlocks
      .filter((q) => q.trim())
      .map((question, index) => {
        const [questionContent, explanation] = question.split(/Lời giải\s*/);

        const answerMatch = questionContent.match(
          /#\s*((?:\$[^$]+\$|\S+))\s*$/
        );
        let answer = "";
        let cleanedQuestionContent = questionContent;

        if (answerMatch) {
          answer = answerMatch[1].trim();
          cleanedQuestionContent = questionContent.replace(/#.*$/, "").trim();
        }

        const normalizedContent = replacePercentage(
          wrapNumbersInDollars(
            cleanedQuestionContent
              .replace(/\s+/g, " ")
              .replace(/\\frac/g, "\\dfrac")
              .replace(/\\\[/g, "$")
              .replace(/\\\]/g, "$")
          )
        );

        const normalizedAnswer =
          answer.startsWith("$") && answer.endsWith("$")
            ? answer
            : replacePercentage(wrapNumbersInDollars(answer));

        const normalizedExplanation = explanation
          ? replacePercentage(
              wrapNumbersInDollars(
                explanation
                  .trim()
                  .replace(/\s+/g, " ")
                  .replace(/\\frac/g, "\\dfrac")
                  .replace(/\\\[/g, "$")
                  .replace(/\\\]/g, "$")
              )
            )
          : "";

        // Format the question with proper indentation
        let formattedQuestion = `\\begin{ex} %Câu ${index + 1}
     ${normalizedContent}
  
     \\shortans[]{${normalizedAnswer}}
     \\loigiai{${
       normalizedExplanation
         ? `\n      ${normalizedExplanation.split("\n").join("\n      ")}\n   `
         : ""
     }}
  \\end{ex}`;

        // Remove "#Answer" at the end of the question content
        formattedQuestion = formattedQuestion.replace(
          /#\s*(?:\$[^$]+\$|\S+)\s*(?=\n\s*\\shortans)/,
          ""
        );

        // Add two newline characters to the end of formattedQuestion
        formattedQuestion += "\n\n";

        return formattedQuestion;
      });

    setInputText(normalizedQuestions.join("\n%=======================%\n"));
    toast.success("Chuẩn hóa trả lời ngắn thành công !");
  }, [inputText]);
  const copyTextToClipboard = async (text) => {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  };
  const handleCopy = () => {
    copyTextToClipboard(inputText)
      .then(() => {
        toast.success("All content has been copied successfully !");
      })
      .catch((err) => {
        toast.error("Failed to copy text: ", err);
      });
  };
  return (
    <div className="bg-[#F3F3F3] rounded-lg">
      <div className="grid grid-cols-[200px,1fr,1fr] divide-x divide-solid divide-gray rounded-lg">
        {/* Column 1 */}
        <div className="bg-white rounded-lg overflow-hidden flex flex-col">
          <div className="h-[500px] overflow-y-auto p-4">
            <div className="flex justify-between mb-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setInputText("");
                }}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-all duration-300 w-[48%]"
              >
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all duration-300 w-[48%]"
              >
                <span>Copy</span>
              </button>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={formatTracNghiem}
                className="flex items-center justify-center w-full text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300"
              >
                <span>Trắc nghiệm</span>
              </button>

              <button
                type="button"
                onClick={formatDungSai}
                className="flex items-center justify-center w-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300"
              >
                <span>Đúng sai</span>
              </button>

              <button
                type="button"
                onClick={formatTraLoiNgan}
                className="flex items-center justify-center w-full text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300"
              >
                <span>Trả lời ngắn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="bg-white flex flex-col">
          {/* <div className="h-[20px]">Menu 1</div> */}
          <div className="overflow-y-auto h-[1000px]">
            <Editor
              handleInputChange={handleInputChange}
              inputText={inputText}
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="bg-white flex flex-col">
          {/* <div className="h-[20px]">Menu 2</div> */}
          <div className="h-[1000px] p-6 flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-grow">
              <div className="space-y-6 pr-2" style={{ marginBottom: "200px" }}>
                {/* Type 1 Questions */}
                <div>
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
      <ToastContainer />
    </div>
  );
}
