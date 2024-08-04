"use client";
import { useState, useCallback, useEffect } from "react";
import Editor from "./components/Editor";
import Settings from "./components/Setting";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faQuestion,
  faPen,
  faEraser,
  faCopy,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import "katex/dist/katex.min.css";
import katex from "katex";
export default function Home() {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionType1, setQuestionType1] = useState([]);
  const [questionType2, setQuestionType2] = useState([]);
  const [questionType3, setQuestionType3] = useState([]);
  const renderLatex = (text) => {
    const parts = text.split(/(\$[^\$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        const latex = part.slice(1, -1);
        return (
          <span
            key={index}
            style={{ fontSize: "0.9em" }} // Điều chỉnh kích thước chữ ở đây
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(latex, {
                throwOnError: false,
                fontSize: "0.9em", // Điều chỉnh kích thước chữ trong KaTeX
              }),
            }}
          />
        );
      }
      return part;
    });
  };
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

      const keyMatch = question.match(/\\shortans(?:\[[^\]]*\])?\{([^}]+)\}/);
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
            return "$ " + p2.replace(",", "{,}") + " $";
          }
          return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
        }
      );
    };

    // Helper function to replace % with \\% in text, excluding specific cases
    const replacePercentage = (text) => {
      return text.replace(/%(?!Câu|\s*======================%)/g, "\\%");
    };

    // Helper function to remove whitespace after specific characters
    const removeWhitespaceAfterSymbols = (text) => {
      return text.replace(/(\(|\{|\[)\s+/g, "$1");
    };

    const removeChoicePrefix = (text) => {
      return text.replace(/Chọn (A|B|C|D)\.?/g, "").trim();
    };

    const removeCurlyBraces = (text) => {
      return text.replace(
        /\$\s*(\{)?\s*(.*?)\s*(\})?\s*\$/g,
        (match, openBrace, content, closeBrace) => {
          if (openBrace && closeBrace) {
            return `$${content.trim()}$`;
          }
          return match;
        }
      );
    };
    // Updated helper function to normalize punctuation and add space after $
    const normalizePunctuation = (text) => {
      let result = "";
      let inDollar = false;
      let i = 0;

      while (i < text.length) {
        if (text[i] === "$") {
          if (!inDollar && i > 0 && result[result.length - 1] !== " ") {
            result += " "; // Add space before opening $ if needed
          }
          inDollar = !inDollar;
          result += text[i];
          if (
            !inDollar &&
            i + 1 < text.length &&
            text[i + 1] !== " " &&
            text[i + 1] !== "$"
          ) {
            result += " "; // Add space after closing $ if needed
          }
          i++;
        } else if ((text[i] === "," || text[i] === ".") && !inDollar) {
          // Remove any spaces before the punctuation
          while (result.length > 0 && result[result.length - 1] === " ") {
            result = result.slice(0, -1);
          }

          // Add the punctuation
          result += text[i];
          i++;

          // Add exactly one space after the punctuation if it's not the end of the text
          if (i < text.length && text[i] !== "$") {
            result += " ";
            // Skip any extra spaces
            while (i < text.length && text[i] === " ") {
              i++;
            }
          }
        } else {
          if (
            !inDollar &&
            text[i] !== " " &&
            i + 1 < text.length &&
            text[i + 1] === "$"
          ) {
            result += text[i] + " "; // Add space before $ if needed
            i++;
          } else {
            result += text[i];
            i++;
          }
        }
      }

      return result;
    };

    // New helper function to replace \left(...\right) with (...)
    const replaceLeftRight = (text) => {
      return text
        .replace(/\\left\(((?![\\^_]).)*?\\right\)/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left( và \right)
          return `(${content})`;
        })
        .replace(/\\left\[((?![\\^_]).)*?\\right\]/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left[ và \right]
          return `[${content}]`;
        })
        .replace(/\\left\|((?![\\^_]).)*?\\right\|/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left| và \right|
          return `|${content}|`;
        });
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
            choices.push(removeChoicePrefix(choice));
          }
        }

        const processChoices = (choices) =>
          choices.map((choice) =>
            removeCurlyBraces(
              replaceLeftRight(
                normalizePunctuation(
                  removeWhitespaceAfterSymbols(
                    replacePercentage(
                      wrapNumbersInDollars(
                        choice
                          .replace(/\.$/, "")
                          .replace(/\s+/g, " ")
                          .replace(/\\frac/g, "\\dfrac")
                          .replace(/\\\[/g, "$")
                          .replace(/\\\]/g, "$")
                          .replace(
                            /(?<!\\displaystyle)\\int/g,
                            "\\displaystyle\\int"
                          )
                          .replace(/\\cdot\s*/g, ".")
                          .replace(/\s+\\right/g, "\\right")
                      )
                    ).trim()
                  )
                )
              )
            )
          );

        const processContent = (content) =>
          removeCurlyBraces(
            replaceLeftRight(
              normalizePunctuation(
                removeWhitespaceAfterSymbols(
                  replacePercentage(
                    wrapNumbersInDollars(
                      content
                        .trim()
                        .replace(/\s+/g, " ")
                        .replace(/\\frac/g, "\\dfrac")
                        .replace(/\\\[/g, "$")
                        .replace(/\\\]/g, "$")
                        .replace(
                          /(?<!\\displaystyle)\\int/g,
                          "\\displaystyle\\int"
                        )
                        .replace(/\\cdot\s*/g, ".")
                        .replace(/\s+\\right/g, "\\right")
                    )
                  )
                )
              )
            )
          );

        const processExplanation = (explanation) =>
          explanation
            ? removeCurlyBraces(
                replaceLeftRight(
                  normalizePunctuation(
                    removeChoicePrefix(
                      removeWhitespaceAfterSymbols(
                        replacePercentage(
                          wrapNumbersInDollars(
                            explanation
                              .trim()
                              .replace(/\s+/g, " ")
                              .replace(/\\frac/g, "\\dfrac")
                              .replace(/\\\[/g, "$")
                              .replace(/\\\]/g, "$")
                              .replace(
                                /(?<!\\displaystyle)\\int/g,
                                "\\displaystyle\\int"
                              )
                              .replace(/\\cdot\s*/g, ".")
                              .replace(/\s+\\right/g, "\\right")
                          )
                        )
                      )
                    )
                  )
                )
              )
            : "";

        const normalizedContent = processContent(content);
        const normalizedChoices = processChoices(choices);
        const normalizedExplanation = processExplanation(explanation);

        return `\\begin{ex} %Câu ${
          index + 1
        }\n${normalizedContent}\n\\choice\n{${normalizedChoices.join(
          "}\n{"
        )}}\n\\loigiai{${
          normalizedExplanation ? `\n${normalizedExplanation}\n` : ""
        }}\n\\end{ex} \n%======================%`;
      });

    setInputText(normalizedQuestions.join("\n\n"));
    // toast.success("Chuẩn hóa trắc nghiệm thành công !");
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
    const removeCurlyBraces = (text) => {
      return text.replace(
        /\$\s*(\{)?\s*(.*?)\s*(\})?\s*\$/g,
        (match, openBrace, content, closeBrace) => {
          if (openBrace && closeBrace) {
            return `$${content.trim()}$`;
          }
          return match;
        }
      );
    };
    // Helper function to remove whitespace after specific characters
    const removeWhitespaceAfterSymbols = (text) => {
      return text.replace(/(\(|\{|\[)\s+/g, "$1");
    };
    const normalizePunctuation = (text) => {
      let result = "";
      let inDollar = false;
      let i = 0;

      while (i < text.length) {
        if (text[i] === "$") {
          if (!inDollar && i > 0 && result[result.length - 1] !== " ") {
            result += " "; // Add space before opening $ if needed
          }
          inDollar = !inDollar;
          result += text[i];
          if (
            !inDollar &&
            i + 1 < text.length &&
            text[i + 1] !== " " &&
            text[i + 1] !== "$"
          ) {
            result += " "; // Add space after closing $ if needed
          }
          i++;
        } else if ((text[i] === "," || text[i] === ".") && !inDollar) {
          // Remove any spaces before the punctuation
          while (result.length > 0 && result[result.length - 1] === " ") {
            result = result.slice(0, -1);
          }

          // Add the punctuation
          result += text[i];
          i++;

          // Add exactly one space after the punctuation if it's not the end of the text
          if (i < text.length && text[i] !== "$") {
            result += " ";
            // Skip any extra spaces
            while (i < text.length && text[i] === " ") {
              i++;
            }
          }
        } else {
          if (
            !inDollar &&
            text[i] !== " " &&
            i + 1 < text.length &&
            text[i + 1] === "$"
          ) {
            result += text[i] + " "; // Add space before $ if needed
            i++;
          } else {
            result += text[i];
            i++;
          }
        }
      }

      return result;
    };
    const replaceLeftRight = (text) => {
      return text
        .replace(/\\left\(((?![\\^_]).)*?\\right\)/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left( và \right)
          return `(${content})`;
        })
        .replace(/\\left\[((?![\\^_]).)*?\\right\]/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left[ và \right]
          return `[${content}]`;
        })
        .replace(/\\left\|((?![\\^_]).)*?\\right\|/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left| và \right|
          return `|${content}|`;
        });
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
          removeCurlyBraces(
            replaceLeftRight(
              normalizePunctuation(
                removeWhitespaceAfterSymbols(
                  replacePercentage(
                    wrapNumbersInDollars(
                      choice
                        .replace(/\.$/, "")
                        .replace(/\s+/g, " ")
                        .replace(/\\frac/g, "\\dfrac")
                        .replace(/\\\[/g, "$")
                        .replace(/\\\]/g, "$")
                        .replace(
                          /(?<!\\displaystyle)\\int/g,
                          "\\displaystyle\\int"
                        )
                        .replace(/\\cdot\s*/g, ".")
                        .replace(/\s+\\right/g, "\\right")
                    )
                  ).trim()
                )
              )
            )
          )
        );
        const normalizedContent = removeCurlyBraces(
          replaceLeftRight(
            normalizePunctuation(
              removeWhitespaceAfterSymbols(
                replacePercentage(
                  wrapNumbersInDollars(
                    content
                      .trim()
                      .replace(/\s+/g, " ")
                      .replace(/\\frac/g, "\\dfrac")
                      .replace(/\\\[/g, "$")
                      .replace(/\\\]/g, "$")
                      .replace(
                        /(?<!\\displaystyle)\\int/g,
                        "\\displaystyle\\int"
                      )
                      .replace(/\\cdot\s*/g, ".")
                      .replace(/\s+\\right/g, "\\right")
                  )
                )
              )
            )
          )
        );

        const normalizedExplanation = explanation
          ? removeCurlyBraces(
              replaceLeftRight(
                normalizePunctuation(
                  removeWhitespaceAfterSymbols(
                    replacePercentage(
                      wrapNumbersInDollars(
                        explanation
                          .trim()
                          .replace(/\s+/g, " ")
                          .replace(/\\frac/g, "\\dfrac")
                          .replace(/\\\[/g, "$")
                          .replace(/\\\]/g, "$")
                          .replace(
                            /(?<!\\displaystyle)\\int/g,
                            "\\displaystyle\\int"
                          )
                          .replace(/\\cdot\s*/g, ".")
                          .replace(/\s+\\right/g, "\\right")
                      )
                    )
                  )
                )
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
    // toast.success("Chuẩn hóa đúng sai thành công !");
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
    const replaceLeftRight = (text) => {
      return text
        .replace(/\\left\(((?![\\^_]).)*?\\right\)/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left( và \right)
          return `(${content})`;
        })
        .replace(/\\left\[((?![\\^_]).)*?\\right\]/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left[ và \right]
          return `[${content}]`;
        })
        .replace(/\\left\|((?![\\^_]).)*?\\right\|/g, (match) => {
          const content = match.slice(6, -7); // Loại bỏ \left| và \right|
          return `|${content}|`;
        });
    };
    const removeCurlyBraces = (text) => {
      return text.replace(
        /\$\s*(\{)?\s*(.*?)\s*(\})?\s*\$/g,
        (match, openBrace, content, closeBrace) => {
          if (openBrace && closeBrace) {
            return `$${content.trim()}$`;
          }
          return match;
        }
      );
    };
    // Helper function to replace % with \\% in text, excluding specific cases
    const replacePercentage = (text) => {
      return text.replace(/%(?!Câu|\s*======================)/g, "\\%");
    };

    // Helper function to remove whitespace after specific characters
    const removeWhitespaceAfterSymbols = (text) => {
      return text.replace(/(\(|\{|\[)\s+/g, "$1");
    };
    const normalizePunctuation = (text) => {
      let result = "";
      let inDollar = false;
      let i = 0;

      while (i < text.length) {
        if (text[i] === "$") {
          if (!inDollar && i > 0 && result[result.length - 1] !== " ") {
            result += " "; // Add space before opening $ if needed
          }
          inDollar = !inDollar;
          result += text[i];
          if (
            !inDollar &&
            i + 1 < text.length &&
            text[i + 1] !== " " &&
            text[i + 1] !== "$"
          ) {
            result += " "; // Add space after closing $ if needed
          }
          i++;
        } else if ((text[i] === "," || text[i] === ".") && !inDollar) {
          // Remove any spaces before the punctuation
          while (result.length > 0 && result[result.length - 1] === " ") {
            result = result.slice(0, -1);
          }

          // Add the punctuation
          result += text[i];
          i++;

          // Add exactly one space after the punctuation if it's not the end of the text
          if (i < text.length && text[i] !== "$") {
            result += " ";
            // Skip any extra spaces
            while (i < text.length && text[i] === " ") {
              i++;
            }
          }
        } else {
          if (
            !inDollar &&
            text[i] !== " " &&
            i + 1 < text.length &&
            text[i + 1] === "$"
          ) {
            result += text[i] + " "; // Add space before $ if needed
            i++;
          } else {
            result += text[i];
            i++;
          }
        }
      }

      return result;
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

        const normalizedContent = removeCurlyBraces(
          replaceLeftRight(
            normalizePunctuation(
              removeWhitespaceAfterSymbols(
                replacePercentage(
                  wrapNumbersInDollars(
                    cleanedQuestionContent
                      .replace(/\s+/g, " ")
                      .replace(/\\frac/g, "\\dfrac")
                      .replace(/\\\[/g, "$")
                      .replace(/\\\]/g, "$")
                      .replace(
                        /(?<!\\displaystyle)\\int/g,
                        "\\displaystyle\\int"
                      )
                      .replace(/\\cdot\s*/g, ".")
                      .replace(/\s+\\right/g, "\\right")
                  )
                )
              )
            )
          )
        );
        const normalizedAnswer =
          answer.startsWith("$") && answer.endsWith("$")
            ? answer
            : normalizePunctuation(
                removeWhitespaceAfterSymbols(
                  replacePercentage(
                    replaceLeftRight(wrapNumbersInDollars(answer))
                  )
                )
              );

        const normalizedExplanation = explanation
          ? removeCurlyBraces(
              replaceLeftRight(
                normalizePunctuation(
                  removeWhitespaceAfterSymbols(
                    replacePercentage(
                      wrapNumbersInDollars(
                        explanation
                          .trim()
                          .replace(/\s+/g, " ")
                          .replace(/\\frac/g, "\\dfrac")
                          .replace(/\\\[/g, "$")
                          .replace(/\\\]/g, "$")
                          .replace(
                            /(?<!\\displaystyle)\\int/g,
                            "\\displaystyle\\int"
                          )
                          .replace(/\\cdot\s*/g, ".")
                          .replace(/\s+\\right/g, "\\right")
                      )
                    )
                  )
                )
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
    // toast.success("Chuẩn hóa trả lời ngắn thành công !");
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
        toast.success("Đã copy tất cả nội dung !");
      })
      .catch((err) => {
        toast.error("Failed to copy text: ", err);
      });
  };
  return (
    <div className="bg-[#F3F3F3] rounded-lg">
      <div className="grid grid-cols-[246px,1.3fr,1fr] divide-x divide-solid divide-gray rounded-lg">
        {/* Column 1 */}
        <div className="bg-white rounded-lg overflow-hidden flex flex-col">
          <div className="h-[1500px] overflow-y-auto p-4">
            <div
              id="toast-success"
              className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
              role="alert"
            >
              <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                <span className="sr-only">Check icon</span>
              </div>
              <div className="ms-3 text-sm font-normal">
                Tự động clean code sau khi chuyển !
              </div>
            </div>
            <div className="flex justify-between mb-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setInputText("");
                }}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-all duration-300 w-[48%]"
              >
                <span>
                  <FontAwesomeIcon icon={faEraser} size="xl" /> Delete
                </span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-all duration-300 w-[48%]"
              >
                <span>
                  <FontAwesomeIcon icon={faCopy} size="xl" /> Copy
                </span>
              </button>
            </div>
            <div
              className="flex flex-col space-y-2"
              style={{
                borderWidth: "1px",
                padding: "10px",
                borderRadius: "10px",
                borderColor: "#21A8DD",
              }}
            >
              <button
                type="button"
                onClick={formatTracNghiem}
                className="flex items-center justify-center w-full text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-2 py-2.5 transition-all duration-300"
              >
                <span>
                  <FontAwesomeIcon icon={faCheck} size="xl" /> Câu hỏi 4 phương
                  án
                </span>
              </button>

              <button
                type="button"
                onClick={formatDungSai}
                className="flex items-center justify-center w-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300"
              >
                <span>
                  <FontAwesomeIcon icon={faQuestion} size="xl" /> Câu hỏi
                  đúng/sai
                </span>
              </button>

              <button
                type="button"
                onClick={formatTraLoiNgan}
                className="flex items-center justify-center w-full text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300"
              >
                <span>
                  <FontAwesomeIcon icon={faPen} size="xl" /> Câu hỏi trả lời
                  ngắn
                </span>
              </button>
            </div>
            <div className="mt-4 p-2 bg-white rounded-lg  border border-blue-300">
              {/* <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Thống kê câu hỏi
              </h3> */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                  <span className="text-blue-700 font-normal">
                    Câu hỏi 4 PA:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {questionType1.length}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                  <span className="text-green-700 font-normal">
                    Câu hỏi đúng sai:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {questionType2.length}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-md">
                  <span className="text-yellow-700 font-normal">
                    Câu hỏi trả lời ngắn:
                  </span>
                  <span className="text-xl font-bold text-yellow-600">
                    {questionType3.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 mt-3">
              <Link
                href="./huongdan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#29A4FF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2089d8] transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faBook} size="lg" className="mr-2" />
                Hướng dẫn
              </Link>
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
          <div className="h-[1000px] p-1 flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-grow">
              <div
                className="space-y-0 pr-1 pl-1 pt-1"
                style={{ marginBottom: "400px" }}
              >
                {/* Type 1 Questions */}
                <div>
                  {questionType1.map((q, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 p-2 rounded-lg border border-blue-200 mb-2"
                    >
                      <p>
                        <span className="font-semibold">Câu {index + 1}: </span>
                        {renderLatex(q.content.replace(/%Câu \d+/g, ""))}
                      </p>
                      {["A", "B", "C", "D"].map((option, i) => {
                        const ansKey = `ans${i + 1}`;
                        const answerText = q[ansKey];
                        const isTrue = answerText.startsWith("\\True");
                        const displayText = isTrue
                          ? answerText.replace("\\True", "").trim()
                          : answerText;
                        return (
                          <p
                            key={option}
                            className={isTrue ? "font-bold text-green-600" : ""}
                          >
                            <strong>{option}.</strong>{" "}
                            {renderLatex(displayText)}
                          </p>
                        );
                      })}
                      <p
                        className={`font-semibold ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? `Đáp án đúng: ${q.key}` : "Không có đáp án"}
                      </p>
                      {q.sol && <p>Lời giải: {renderLatex(q.sol)}</p>}
                    </div>
                  ))}
                </div>
                {/* Type 2 Questions */}
                <div>
                  {questionType2.map((q, index) => (
                    <div
                      key={index}
                      className="bg-green-50 p-2 rounded-lg border border-green-200 mb-2"
                    >
                      <p>
                        <span className="font-semibold">Câu {index + 1}: </span>
                        {renderLatex(q.content.replace(/%Câu \d+/g, ""))}
                      </p>
                      <div>
                        {["a", "b", "c", "d"].map((option, i) => {
                          const ansKey = `ans${i + 1}`;
                          const answerText = q[ansKey];
                          const isTrue = answerText.startsWith("\\True");
                          const displayText = isTrue
                            ? answerText.replace("\\True", "").trim()
                            : answerText;
                          return (
                            <p
                              key={option}
                              className={
                                isTrue ? "font-bold text-green-600" : ""
                              }
                            >
                              <strong>{option})</strong>{" "}
                              {renderLatex(displayText)}
                            </p>
                          );
                        })}
                      </div>
                      <p
                        className={`font-semibold ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? `Đáp án đúng: ${q.key}` : "Không có đáp án"}
                      </p>
                      {q.sol && <p>Lời giải: {renderLatex(q.sol)}</p>}
                    </div>
                  ))}
                </div>

                {/* Type 3 Questions */}
                <div>
                  {questionType3.map((q, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 p-2 rounded-lg border border-yellow-200 mb-2"
                    >
                      <p>
                        <span className="font-semibold">Câu {index + 1}: </span>
                        {renderLatex(q.content.replace(/%Câu \d+/g, ""))}
                      </p>
                      <p
                        className={`font-semibold ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? (
                          <>Đáp án đúng: {renderLatex(q.key)}</>
                        ) : (
                          "Không có đáp án"
                        )}
                      </p>
                      {q.sol && <p>Lời giải: {renderLatex(q.sol)}</p>}
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
