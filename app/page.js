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
  faCircleCheck,
  faEdit,
  faCircleXmark,
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
  const [checkComment, setCheckComment] = useState(true);

  useEffect(() => {
    // Lấy giá trị từ localStorage khi component mount
    const savedValue = localStorage.getItem("checkComment");
    if (savedValue !== null) {
      setCheckComment(JSON.parse(savedValue));
    }
  }, []);
  const handleChange = (event) => {
    const newValue = event.target.checked;
    setCheckComment(newValue);
    // Lưu giá trị vào localStorage
    localStorage.setItem("checkComment", JSON.stringify(newValue));
  };

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

      // Tách lời giải sử dụng regex
      const solutionMatch = question.match(
        /\\loigiai\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/s
      );
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

      const solutionMatch = question.match(
        /\\loigiai\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/s
      );
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

      const keyMatch = question.match(
        /\\shortans\[\]\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/s
      );
      const key = keyMatch ? keyMatch[1] : "";

      const solutionMatch = question.match(
        /\\loigiai\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/s
      );
      const solution = solutionMatch ? solutionMatch[1].trim() : "";
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
    // const removeDotBeforeCurlyBrace = (text) => {
    //   // Tìm các phương án trong dấu ngoặc nhọn
    //   return text.replace(/\{([^{}]+)\}/g, (match, content) => {
    //     // Xóa dấu chấm trước $} trong mỗi phương án
    //     const updatedContent = content.replace(/\.(\$})/g, "$1");
    //     return `{${updatedContent}}`;
    //   });
    // };

    const removeSingleCharBraces = (text) => {
      return text.replace(
        /(\^|_)\{(\w)\}|(\{)(\w)(\})(\^|_)/g,
        (match, p1, p2, p3, p4, p5, p6) => {
          if ((p1 && p2) || (p4 && p6)) {
            // Trường hợp ^{x} hoặc _{x} hoặc {x}^ hoặc {x}_
            // trong đó x là một ký tự đơn
            return (p1 || "") + (p2 || p4) + (p6 || "");
          }
          // Không thay đổi nếu không phù hợp với yêu cầu
          return match;
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
    // Hàm mới để xóa cặp ngoặc {...}' lặp đi lặp lại
    const removeBracesBeforePrime = (text) => {
      let result = text;
      let prevResult;
      do {
        prevResult = result;
        result = result.replace(/\{([^{}]+)\}'/g, "$1'");
      } while (result !== prevResult);
      return result;
    };

    const removeCurlyBraces = (text) => {
      return text.replace(
        /\$\s*(\{)((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}(\s*\$)/g,
        (match, openBrace, content, closingPart) => {
          // Kiểm tra xem có phải là cấu trúc "${...}$" không
          if (openBrace && closingPart.trim() === "$") {
            // Xóa một cặp ngoặc nhọn ngoài cùng
            return `$${content}${closingPart}`;
          }
          return match;
        }
      );
    };

    const removeCurlyBraces2 = (text) => {
      return text.replace(/(\$[^$]+\$)/g, (match, p1) => {
        if (!p1.includes("\\")) {
          return p1.replace(/([^\^_])(\{[^{}]+\})/g, (m, before, braces) => {
            return before + braces.slice(1, -1);
          });
        }
        return match;
      });
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
    const removeNestedCurlyBraces = (text) => {
      return text.replace(/\{\{([^{}]*)\}\}/g, (match, content) => {
        // Check if there are no characters between closing and opening braces
        if (!/\}\s*\{/.test(content)) {
          return `{${content}}`;
        }
        return match;
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
            wrapNumbersInDollars(
              removeCurlyBraces2(
                removeNestedCurlyBraces(
                  removeSingleCharBraces(
                    removeSingleCharBraces(
                      removeBracesBeforePrime(
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
                                      .replace(/\\!/g, "")
                                      .replace(/\\text\{\s*\}/g, "")
                                      .replace(/\\,/g, "")
                                      .replace(/\$\s*\$/g, "")
                                      .replace(/\$~(\S)/g, "$$$1")
                                      .replace(
                                        /\$\s*([^$]+?)\s*\$/g,
                                        (match, p1) => `$${p1.trim()}$`
                                      )
                                      .replace(
                                        /\$([^$]+)\$/g,
                                        (match, p1) =>
                                          "$" +
                                          p1.replace(/\s*([{}])\s*/g, "$1") +
                                          "$"
                                      )
                                      .replace(/\.\$/g, "$.")

                                      .replace(/\\text\{ln\}/g, "\\ln ")
                                      .replace(/\\text\{sin\}/g, "\\sin ")
                                      .replace(/\\text\{cos\}/g, "\\cos ")
                                      .replace(/\\text\{tan\}/g, "\\tan ")
                                      .replace(/\\text\{cot\}/g, "\\cot ")
                                      .replace(
                                        /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                        (_, x) => `\\log_{${x}} `
                                      )
                                  )
                                ).trim()
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
              .replace(/(\$[^$]+\$)/g, (match) =>
                match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
              )
              .replace(/\$([^$]+)\$/g, (match, p1) => {
                // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
                return (
                  "$" +
                  p1
                    .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                      // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                      if (!/\}\s*\{/.test(content)) {
                        return `{${content}}`;
                      }
                      return nestedMatch;
                    })
                    .replace(/\s*([{}])\s*/g, "$1") +
                  "$"
                );
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                let prevText;
                while (prevText !== match) {
                  prevText = match;
                  match = match.replace(
                    /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                    (m, before, braces) => {
                      if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                        return before + braces.slice(1, -1);
                      }
                      return m;
                    }
                  );
                }
                return match;
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove one pair of {} if it's in the form "{{x}}"
                return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove whitespace around "|" within "$...$"
                return match.replace(/\s*\|\s*/g, "|");
              })
              .replace(/\\text\{log\}/g, "\\log") //Them moi 2
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match
                  .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
                  .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(
                  /([a-zA-Z])\{([^{}]+)\}([+\-><])/g,
                  "$1$2$3"
                );
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove {} in the form ",{x}="
                return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
              })
              .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

              .replace(/\$\./g, "$")
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(/\s*([+\-<>=])\s*/g, "$1");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(
                  /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
                  "$1{$2}$3"
                );
              })
              .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
              // .replace(/\\begin\s*\{\s*align\s*\}/g, "\\heva{")
              // .replace(/\\left\\{/g, "")
              .replace(
                /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
                (match, p1, p2) => {
                  if (p1 && p2) {
                    return "\\heva{";
                  }
                  return match;
                }
              )
              .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
                if (group1) {
                  // Nếu là nội dung trong $...$, giữ nguyên
                  return group1;
                }
                // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
                return ".";
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match
                  .replace(
                    /\\overrightarrow\{\{([^{}]+)\}\}/g,
                    "\\overrightarrow{$1}"
                  )
                  .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
              })
              .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
              .replace(
                /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
                "$1\\mathrm{\\,d}x$3"
              )
              .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
              .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
              .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
              .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
              .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
              .replace(/\{\./g, ".{")
              .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
              .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

              .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
                if (p1) {
                  // Handle numbers already in $...$
                  return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
                }
                if (p2.includes(",")) {
                  // Handle decimal numbers with comma
                  return "$ " + p2.replace(",", "{,}") + " $";
                }
                return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
              })
          );

        const processContent = (content) =>
          wrapNumbersInDollars(
            removeCurlyBraces2(
              removeNestedCurlyBraces(
                removeSingleCharBraces(
                  removeSingleCharBraces(
                    removeBracesBeforePrime(
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
                                    .replace(/\\!/g, "")
                                    .replace(/\\text\{\s*\}/g, "")
                                    .replace(/\\,/g, "")
                                    .replace(/\$\s*\$/g, "")
                                    .replace(/\$~(\S)/g, "$$$1")
                                    .replace(
                                      /\$\s*([^$]+?)\s*\$/g,
                                      (match, p1) => `$${p1.trim()}$`
                                    )
                                    .replace(
                                      /\$([^$]+)\$/g,
                                      (match, p1) =>
                                        "$" +
                                        p1.replace(/\s*([{}])\s*/g, "$1") +
                                        "$"
                                    )
                                    .replace(/\.\$/g, "$.")
                                    .replace(/\\text\{ln\}/g, "\\ln ")
                                    .replace(/\\text\{sin\}/g, "\\sin ")
                                    .replace(/\\text\{cos\}/g, "\\cos ")
                                    .replace(/\\text\{tan\}/g, "\\tan ")
                                    .replace(/\\text\{cot\}/g, "\\cot ")
                                    .replace(
                                      /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                      (_, x) => `\\log_{${x}} `
                                    )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
            .replace(/(\$[^$]+\$)/g, (match) =>
              match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
            )
            .replace(/\$([^$]+)\$/g, (match, p1) => {
              // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
              return (
                "$" +
                p1
                  .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                    // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                    if (!/\}\s*\{/.test(content)) {
                      return `{${content}}`;
                    }
                    return nestedMatch;
                  })
                  .replace(/\s*([{}])\s*/g, "$1") +
                "$"
              );
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              let prevText;
              while (prevText !== match) {
                prevText = match;
                match = match.replace(
                  /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                  (m, before, braces) => {
                    if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                      return before + braces.slice(1, -1);
                    }
                    return m;
                  }
                );
              }
              return match;
            }) //Moi them
            .replace(/(\$[^$]+\$)/g, (match) => {
              // New functionality to remove one pair of {} if it's in the form "{{x}}"
              return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              // New functionality to remove whitespace around "|" within "$...$"
              return match.replace(/\s*\|\s*/g, "|");
            })
            .replace(/\\text\{log\}/g, "\\log") //The moi 2
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match
                .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
                .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(
                /([a-zA-Z])\{([^{}]+)\}([+\-><])/g,
                "$1$2$3"
              );
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              // New functionality to remove {} in the form ",{x}="
              return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
            })
            .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\s*([+\-<>=])\s*/g, "$1");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(
                /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
                "$1{$2}$3"
              );
            })

            .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
            // .replace(/\\begin\s*\{\s*align\s*\}/g, "\\heva{")
            // .replace(/\\left\\{/g, "")
            // .replace(/\\left\\{\s*\\begin\s*\{\s*align\s*\}/g, "\\heva{")
            .replace(
              /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
              (match, p1, p2) => {
                if (p1 && p2) {
                  return "\\heva{";
                }
                return match;
              }
            )
            .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
              if (group1) {
                // Nếu là nội dung trong $...$, giữ nguyên
                return group1;
              }
              // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
              return ".";
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match
                .replace(
                  /\\overrightarrow\{\{([^{}]+)\}\}/g,
                  "\\overrightarrow{$1}"
                )
                .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
            })
            .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
            .replace(
              /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
              "$1\\mathrm{\\,d}x$3"
            )
            .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
            .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
            .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
            .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
            .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
            .replace(/\{\./g, ".{")
            .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
            .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

            .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
              if (p1) {
                // Handle numbers already in $...$
                return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
              }
              if (p2.includes(",")) {
                // Handle decimal numbers with comma
                return "$ " + p2.replace(",", "{,}") + " $";
              }
              return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
            });
        const processExplanation = (explanation) => {
          if (
            explanation === null ||
            explanation === undefined ||
            explanation.trim() === ""
          ) {
            return explanation;
          }

          return wrapNumbersInDollars(
            removeCurlyBraces2(
              removeNestedCurlyBraces(
                removeSingleCharBraces(
                  removeSingleCharBraces(
                    removeBracesBeforePrime(
                      removeCurlyBraces(
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
                                    .replace(/\\!/g, "")
                                    .replace(/\\text\{\s*\}/g, "")
                                    .replace(/\\,/g, "")
                                    .replace(/\$\s*\$/g, "")
                                    .replace(/\$~(\S)/g, "$$$1")
                                    .replace(
                                      /\$\s*([^$]+?)\s*\$/g,
                                      (match, p1) => `$${p1.trim()}$`
                                    )
                                    .replace(
                                      /\$([^$]+)\$/g,
                                      (match, p1) =>
                                        "$" +
                                        p1.replace(/\s*([{}])\s*/g, "$1") +
                                        "$"
                                    )
                                    .replace(/\.\$/g, "$.")
                                    .replace(/\\text\{ln\}/g, "\\ln ")
                                    .replace(/\\text\{sin\}/g, "\\sin ")
                                    .replace(/\\text\{cos\}/g, "\\cos ")
                                    .replace(/\\text\{tan\}/g, "\\tan ")
                                    .replace(/\\text\{cot\}/g, "\\cot ")
                                    .replace(
                                      /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                      (_, x) => `\\log_{${x}} `
                                    )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
            .replace(/(\$[^$]+\$)/g, (match) =>
              match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
            )
            .replace(/Chọn (A|B|C|D)\.?/g, "")
            .replace(/\$([^$]+)\$/g, (match, p1) => {
              return (
                "$" +
                p1
                  .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                    if (!/\}\s*\{/.test(content)) {
                      return `{${content}}`;
                    }
                    return nestedMatch;
                  })
                  .replace(/\s*([{}])\s*/g, "$1") +
                "$"
              );
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              let prevText;
              while (prevText !== match) {
                prevText = match;
                match = match.replace(
                  /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                  (m, before, braces) => {
                    if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                      return before + braces.slice(1, -1);
                    }
                    return m;
                  }
                );
              }
              return match;
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\s*\|\s*/g, "|");
            })
            .replace(/\\text\{log\}/g, "\\log") //Them Mơi
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match
                .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
                .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(
                /([a-zA-Z])\{([^{}]+)\}([+\-><])/g,
                "$1$2$3"
              );
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              // New functionality to remove {} in the form ",{x}="
              return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
            })
            .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\s*([+\-<>=])\s*/g, "$1");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(
                /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
                "$1{$2}$3"
              );
            })
            .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
            .replace(
              /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
              (match, p1, p2) => {
                if (p1 && p2) {
                  return "\\heva{";
                }
                return match;
              }
            )
            .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
            .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
              if (group1) {
                // Nếu là nội dung trong $...$, giữ nguyên
                return group1;
              }
              // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
              return ".";
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match
                .replace(
                  /\\overrightarrow\{\{([^{}]+)\}\}/g,
                  "\\overrightarrow{$1}"
                )
                .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
            })
            .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
            .replace(
              /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
              "$1\\mathrm{\\,d}x$3"
            )
            .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
            .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
            .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
            .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
            .replace(/\{\./g, ".{")
            .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
            .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

            .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
              if (p1) {
                return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
              }
              if (p2.includes(",")) {
                return "$ " + p2.replace(",", "{,}") + " $";
              }
              return `$${p2}$`;
            })

            .trim();
        };
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
    const removeBracesBeforePrime = (text) => {
      let result = text;
      let prevResult;
      do {
        prevResult = result;
        result = result.replace(/\{([^{}]+)\}'/g, "$1'");
      } while (result !== prevResult);
      return result;
    };
    // Helper function to replace % with \\% in text, excluding specific cases
    const replacePercentage = (text) => {
      return text.replace(/%(?!Câu|\s*======================%)/g, "\\%");
    };
    const removeCurlyBraces = (text) => {
      return text.replace(
        /\$\s*(\{)((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}(\s*\$)/g,
        (match, openBrace, content, closingPart) => {
          // Kiểm tra xem có phải là cấu trúc "${...}$" không
          if (openBrace && closingPart.trim() === "$") {
            // Xóa một cặp ngoặc nhọn ngoài cùng
            return `$${content}${closingPart}`;
          }
          return match;
        }
      );
    };

    const removeCurlyBraces2 = (text) => {
      return text.replace(/(\$[^$]+\$)/g, (match, p1) => {
        if (!p1.includes("\\")) {
          return p1.replace(/([^\^_])(\{[^{}]+\})/g, (m, before, braces) => {
            return before + braces.slice(1, -1);
          });
        }
        return match;
      });
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
    const removeSingleCharBraces = (text) => {
      return text.replace(
        /(\^|_)\{(\w)\}|(\{)(\w)(\})(\^|_)/g,
        (match, p1, p2, p3, p4, p5, p6) => {
          if ((p1 && p2) || (p4 && p6)) {
            // Trường hợp ^{x} hoặc _{x} hoặc {x}^ hoặc {x}_
            // trong đó x là một ký tự đơn
            return (p1 || "") + (p2 || p4) + (p6 || "");
          }
          // Không thay đổi nếu không phù hợp với yêu cầu
          return match;
        }
      );
    };
    const removeNestedCurlyBraces = (text) => {
      return text.replace(/\{\{([^{}]*)\}\}/g, (match, content) => {
        // Check if there are no characters between closing and opening braces
        if (!/\}\s*\{/.test(content)) {
          return `{${content}}`;
        }
        return match;
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
          wrapNumbersInDollars(
            removeCurlyBraces2(
              removeNestedCurlyBraces(
                removeSingleCharBraces(
                  removeSingleCharBraces(
                    removeBracesBeforePrime(
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
                                    .replace(/\\!/g, "")
                                    .replace(/\\text\{\s*\}/g, "")
                                    .replace(/\\,/g, "")
                                    .replace(/\$\s*\$/g, "")
                                    .replace(/\$~(\S)/g, "$$$1")
                                    .replace(
                                      /\$\s*([^$]+?)\s*\$/g,
                                      (match, p1) => `$${p1.trim()}$`
                                    )
                                    .replace(
                                      /\$([^$]+)\$/g,
                                      (match, p1) =>
                                        "$" +
                                        p1.replace(/\s*([{}])\s*/g, "$1") +
                                        "$"
                                    )
                                    .replace(/\.\$/g, "$.")
                                    .replace(/\\text\{ln\}/g, "\\ln ")
                                    .replace(/\\text\{sin\}/g, "\\sin ")
                                    .replace(/\\text\{cos\}/g, "\\cos ")
                                    .replace(/\\text\{tan\}/g, "\\tan ")
                                    .replace(/\\text\{cot\}/g, "\\cot ")
                                    .replace(
                                      /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                      (_, x) => `\\log_{${x}} `
                                    )
                                )
                              ).trim()
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
            .replace(/(\$[^$]+\$)/g, (match) =>
              match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
            )
            .replace(/\$([^$]+)\$/g, (match, p1) => {
              // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
              return (
                "$" +
                p1
                  .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                    // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                    if (!/\}\s*\{/.test(content)) {
                      return `{${content}}`;
                    }
                    return nestedMatch;
                  })
                  .replace(/\s*([{}])\s*/g, "$1") +
                "$"
              );
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              let prevText;
              while (prevText !== match) {
                prevText = match;
                match = match.replace(
                  /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                  (m, before, braces) => {
                    if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                      return before + braces.slice(1, -1);
                    }
                    return m;
                  }
                );
              }
              return match;
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              // New functionality to remove one pair of {} if it's in the form "{{x}}"
              return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              // New functionality to remove whitespace around "|" within "$...$"
              return match.replace(/\s*\|\s*/g, "|");
            })
            .replace(/\\text\{log\}/g, "\\log")
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match
                .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
                .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(
                /([a-zA-Z])\{([^{}]+)\}([+\-><])/g,
                "$1$2$3"
              );
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              // New functionality to remove {} in the form ",{x}="
              return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
            })
            .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

            .replace(/\$\./g, "$")
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(/\s*([+\-<>=])\s*/g, "$1");
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match.replace(
                /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
                "$1{$2}$3"
              );
            })
            .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
            .replace(
              /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
              (match, p1, p2) => {
                if (p1 && p2) {
                  return "\\heva{";
                }
                return match;
              }
            )
            .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
              if (group1) {
                // Nếu là nội dung trong $...$, giữ nguyên
                return group1;
              }
              // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
              return ".";
            })
            .replace(/(\$[^$]+\$)/g, (match) => {
              return match
                .replace(
                  /\\overrightarrow\{\{([^{}]+)\}\}/g,
                  "\\overrightarrow{$1}"
                )
                .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
            })
            .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
            .replace(
              /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
              "$1\\mathrm{\\,d}x$3"
            )
            .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
            .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
            .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
            .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
            .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
            .replace(/\{\./g, ".{")
            .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
            .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

            .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
              if (p1) {
                // Handle numbers already in $...$
                return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
              }
              if (p2.includes(",")) {
                // Handle decimal numbers with comma
                return "$ " + p2.replace(",", "{,}") + " $";
              }
              return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
            })
        );
        const normalizedContent = wrapNumbersInDollars(
          removeCurlyBraces2(
            removeNestedCurlyBraces(
              removeSingleCharBraces(
                removeSingleCharBraces(
                  removeBracesBeforePrime(
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
                                  .replace(/\\!/g, "")
                                  .replace(/\\text\{\s*\}/g, "")
                                  .replace(/\\,/g, "")
                                  .replace(/\$\s*\$/g, "")
                                  .replace(/\$~(\S)/g, "$$$1")
                                  .replace(
                                    /\$\s*([^$]+?)\s*\$/g,
                                    (match, p1) => `$${p1.trim()}$`
                                  )
                                  .replace(
                                    /\$([^$]+)\$/g,
                                    (match, p1) =>
                                      "$" +
                                      p1.replace(/\s*([{}])\s*/g, "$1") +
                                      "$"
                                  )
                                  .replace(/\.\$/g, "$.")
                                  .replace(/\\text\{ln\}/g, "\\ln ")
                                  .replace(/\\text\{sin\}/g, "\\sin ")
                                  .replace(/\\text\{cos\}/g, "\\cos ")
                                  .replace(/\\text\{tan\}/g, "\\tan ")
                                  .replace(/\\text\{cot\}/g, "\\cot ")
                                  .replace(
                                    /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                    (_, x) => `\\log_{${x}} `
                                  )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
          .replace(/(\$[^$]+\$)/g, (match) =>
            match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
          )
          .replace(/\$([^$]+)\$/g, (match, p1) => {
            // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
            return (
              "$" +
              p1
                .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                  // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                  if (!/\}\s*\{/.test(content)) {
                    return `{${content}}`;
                  }
                  return nestedMatch;
                })
                .replace(/\s*([{}])\s*/g, "$1") +
              "$"
            );
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            let prevText;
            while (prevText !== match) {
              prevText = match;
              match = match.replace(
                /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                (m, before, braces) => {
                  if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                    return before + braces.slice(1, -1);
                  }
                  return m;
                }
              );
            }
            return match;
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            // New functionality to remove one pair of {} if it's in the form "{{x}}"
            return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            // New functionality to remove whitespace around "|" within "$...$"
            return match.replace(/\s*\|\s*/g, "|");
          })
          .replace(/\\text\{log\}/g, "\\log")
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match
              .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
              .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(/([a-zA-Z])\{([^{}]+)\}([+\-><])/g, "$1$2$3");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            // New functionality to remove {} in the form ",{x}="
            return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
          })
          .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(/\s*([+\-<>=])\s*/g, "$1");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(
              /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
              "$1{$2}$3"
            );
          })
          .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
          .replace(
            /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
            (match, p1, p2) => {
              if (p1 && p2) {
                return "\\heva{";
              }
              return match;
            }
          )
          .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
            if (group1) {
              // Nếu là nội dung trong $...$, giữ nguyên
              return group1;
            }
            // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
            return ".";
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match
              .replace(
                /\\overrightarrow\{\{([^{}]+)\}\}/g,
                "\\overrightarrow{$1}"
              )
              .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
          })
          .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
          .replace(
            /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
            "$1\\mathrm{\\,d}x$3"
          )
          .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
          .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
          .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
          .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
          .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
          .replace(/\{\./g, ".{")
          .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
          .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

          .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
            if (p1) {
              // Handle numbers already in $...$
              return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
            }
            if (p2.includes(",")) {
              // Handle decimal numbers with comma
              return "$ " + p2.replace(",", "{,}") + " $";
            }
            return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
          });
        const normalizedExplanation = explanation
          ? wrapNumbersInDollars(
              removeCurlyBraces2(
                removeNestedCurlyBraces(
                  removeSingleCharBraces(
                    removeSingleCharBraces(
                      removeBracesBeforePrime(
                        removeCurlyBraces(
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
                                      .replace(/\\!/g, "")
                                      .replace(/\\text\{\s*\}/g, "")
                                      .replace(/\\,/g, "")
                                      .replace(/\$\s*\$/g, "")
                                      .replace(/\$~(\S)/g, "$$$1")
                                      .replace(
                                        /\$\s*([^$]+?)\s*\$/g,
                                        (match, p1) => `$${p1.trim()}$`
                                      )
                                      .replace(
                                        /\$([^$]+)\$/g,
                                        (match, p1) =>
                                          "$" +
                                          p1.replace(/\s*([{}])\s*/g, "$1") +
                                          "$"
                                      )
                                      .replace(/\.\$/g, "$.")
                                      .replace(/\\text\{ln\}/g, "\\ln ")
                                      .replace(/\\text\{sin\}/g, "\\sin ")
                                      .replace(/\\text\{cos\}/g, "\\cos ")
                                      .replace(/\\text\{tan\}/g, "\\tan ")
                                      .replace(/\\text\{cot\}/g, "\\cot ")
                                      .replace(
                                        /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                        (_, x) => `\\log_{${x}} `
                                      )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
              .replace(/(\$[^$]+\$)/g, (match) =>
                match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
              )
              .replace(/\$([^$]+)\$/g, (match, p1) => {
                // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
                return (
                  "$" +
                  p1
                    .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                      // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                      if (!/\}\s*\{/.test(content)) {
                        return `{${content}}`;
                      }
                      return nestedMatch;
                    })
                    .replace(/\s*([{}])\s*/g, "$1") +
                  "$"
                );
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                let prevText;
                while (prevText !== match) {
                  prevText = match;
                  match = match.replace(
                    /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                    (m, before, braces) => {
                      if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                        return before + braces.slice(1, -1);
                      }
                      return m;
                    }
                  );
                }
                return match;
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove one pair of {} if it's in the form "{{x}}"
                return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove whitespace around "|" within "$...$"
                return match.replace(/\s*\|\s*/g, "|");
              })
              .replace(/\\text\{log\}/g, "\\log")
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match
                  .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
                  .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(
                  /([a-zA-Z])\{([^{}]+)\}([+\-><])/g,
                  "$1$2$3"
                );
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove {} in the form ",{x}="
                return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
              })
              .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(/\s*([+\-<>=])\s*/g, "$1");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(
                  /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
                  "$1{$2}$3"
                );
              })
              .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
              .replace(
                /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
                (match, p1, p2) => {
                  if (p1 && p2) {
                    return "\\heva{";
                  }
                  return match;
                }
              )
              .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
                if (group1) {
                  // Nếu là nội dung trong $...$, giữ nguyên
                  return group1;
                }
                // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
                return ".";
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match
                  .replace(
                    /\\overrightarrow\{\{([^{}]+)\}\}/g,
                    "\\overrightarrow{$1}"
                  )
                  .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
              })
              .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
              .replace(
                /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
                "$1\\mathrm{\\,d}x$3"
              )
              .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
              .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
              .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
              .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
              .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
              .replace(/\{\./g, ".{")
              .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
              .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

              .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
                if (p1) {
                  // Handle numbers already in $...$
                  return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
                }
                if (p2.includes(",")) {
                  // Handle decimal numbers with comma
                  return "$ " + p2.replace(",", "{,}") + " $";
                }
                return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
              })
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
    const removeBracesBeforePrime = (text) => {
      let result = text;
      let prevResult;
      do {
        prevResult = result;
        result = result.replace(/\{([^{}]+)\}'/g, "$1'");
      } while (result !== prevResult);
      return result;
    };
    const removeCurlyBraces2 = (text) => {
      return text.replace(/(\$[^$]+\$)/g, (match, p1) => {
        if (!p1.includes("\\")) {
          return p1.replace(/([^\^_])(\{[^{}]+\})/g, (m, before, braces) => {
            return before + braces.slice(1, -1);
          });
        }
        return match;
      });
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
        /\$\s*(\{)((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}(\s*\$)/g,
        (match, openBrace, content, closingPart) => {
          // Kiểm tra xem có phải là cấu trúc "${...}$" không
          if (openBrace && closingPart.trim() === "$") {
            // Xóa một cặp ngoặc nhọn ngoài cùng
            return `$${content}${closingPart}`;
          }
          return match;
        }
      );
    };

    // Helper function to replace % with \\% in text, excluding specific cases
    const replacePercentage = (text) => {
      return text.replace(/%(?!Câu|\s*======================)/g, "\\%");
    };
    const removeNestedCurlyBraces = (text) => {
      return text.replace(/\{\{([^{}]*)\}\}/g, (match, content) => {
        // Check if there are no characters between closing and opening braces
        if (!/\}\s*\{/.test(content)) {
          return `{${content}}`;
        }
        return match;
      });
    };
    const removeSingleCharBraces = (text) => {
      return text.replace(
        /(\^|_)\{(\w)\}|(\{)(\w)(\})(\^|_)/g,
        (match, p1, p2, p3, p4, p5, p6) => {
          if ((p1 && p2) || (p4 && p6)) {
            // Trường hợp ^{x} hoặc _{x} hoặc {x}^ hoặc {x}_
            // trong đó x là một ký tự đơn
            return (p1 || "") + (p2 || p4) + (p6 || "");
          }
          // Không thay đổi nếu không phù hợp với yêu cầu
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

        const normalizedContent = wrapNumbersInDollars(
          removeCurlyBraces2(
            removeNestedCurlyBraces(
              removeSingleCharBraces(
                removeSingleCharBraces(
                  removeBracesBeforePrime(
                    removeCurlyBraces(
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
                                  .replace(/\\!/g, "")
                                  .replace(/\\text\{\s*\}/g, "")
                                  .replace(/\\,/g, "")
                                  .replace(/\$\s*\$/g, "")
                                  .replace(/\$~(\S)/g, "$$$1")
                                  .replace(
                                    /\$\s*([^$]+?)\s*\$/g,
                                    (match, p1) => `$${p1.trim()}$`
                                  )
                                  .replace(
                                    /\$([^$]+)\$/g,
                                    (match, p1) =>
                                      "$" +
                                      p1.replace(/\s*([{}])\s*/g, "$1") +
                                      "$"
                                  )
                                  .replace(/\.\$/g, "$.")
                                  .replace(/\\text\{ln\}/g, "\\ln ")
                                  .replace(/\\text\{sin\}/g, "\\sin ")
                                  .replace(/\\text\{cos\}/g, "\\cos ")
                                  .replace(/\\text\{tan\}/g, "\\tan ")
                                  .replace(/\\text\{cot\}/g, "\\cot ")
                                  .replace(
                                    /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                    (_, x) => `\\log_{${x}} `
                                  )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
          .replace(/(\$[^$]+\$)/g, (match) =>
            match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
          )
          .replace(/\$([^$]+)\$/g, (match, p1) => {
            // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
            return (
              "$" +
              p1
                .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                  // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                  if (!/\}\s*\{/.test(content)) {
                    return `{${content}}`;
                  }
                  return nestedMatch;
                })
                .replace(/\s*([{}])\s*/g, "$1") +
              "$"
            );
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            let prevText;
            while (prevText !== match) {
              prevText = match;
              match = match.replace(
                /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                (m, before, braces) => {
                  if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                    return before + braces.slice(1, -1);
                  }
                  return m;
                }
              );
            }
            return match;
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            // New functionality to remove one pair of {} if it's in the form "{{x}}"
            return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            // New functionality to remove whitespace around "|" within "$...$"
            return match.replace(/\s*\|\s*/g, "|");
          })
          .replace(/\\text\{log\}/g, "\\log")
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match
              .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
              .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(/([a-zA-Z])\{([^{}]+)\}([+\-><])/g, "$1$2$3");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            // New functionality to remove {} in the form ",{x}="
            return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
          })
          .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(/\s*([+\-<>=])\s*/g, "$1");
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match.replace(
              /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
              "$1{$2}$3"
            );
          })
          .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
          .replace(
            /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
            (match, p1, p2) => {
              if (p1 && p2) {
                return "\\heva{";
              }
              return match;
            }
          )
          .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
            if (group1) {
              // Nếu là nội dung trong $...$, giữ nguyên
              return group1;
            }
            // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
            return ".";
          })
          .replace(/(\$[^$]+\$)/g, (match) => {
            return match
              .replace(
                /\\overrightarrow\{\{([^{}]+)\}\}/g,
                "\\overrightarrow{$1}"
              )
              .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
          })
          .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
          .replace(
            /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
            "$1\\mathrm{\\,d}x$3"
          )
          .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
          .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
          .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
          .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
          .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
          .replace(/\{\./g, ".{")
          .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
          .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

          .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
            if (p1) {
              // Handle numbers already in $...$
              return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
            }
            if (p2.includes(",")) {
              // Handle decimal numbers with comma
              return "$ " + p2.replace(",", "{,}") + " $";
            }
            return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
          });
        const normalizedAnswer =
          answer.startsWith("$") && answer.endsWith("$")
            ? answer
            : wrapNumbersInDollars(
                removeCurlyBraces2(
                  removeNestedCurlyBraces(
                    removeSingleCharBraces(
                      removeSingleCharBraces(
                        normalizePunctuation(
                          removeWhitespaceAfterSymbols(
                            replacePercentage(
                              replaceLeftRight(wrapNumbersInDollars(answer))
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
                .replace(/(\$[^$]+\$)/g, (match) =>
                  match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
                )
                .replace(/\$([^$]+)\$/g, (match, p1) => {
                  // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
                  return (
                    "$" +
                    p1
                      .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                        // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                        if (!/\}\s*\{/.test(content)) {
                          return `{${content}}`;
                        }
                        return nestedMatch;
                      })
                      .replace(/\s*([{}])\s*/g, "$1") +
                    "$"
                  );
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  let prevText;
                  while (prevText !== match) {
                    prevText = match;
                    match = match.replace(
                      /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                      (m, before, braces) => {
                        if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                          return before + braces.slice(1, -1);
                        }
                        return m;
                      }
                    );
                  }
                  return match;
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  // New functionality to remove one pair of {} if it's in the form "{{x}}"
                  return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  // New functionality to remove whitespace around "|" within "$...$"
                  return match.replace(/\s*\|\s*/g, "|");
                })
                .replace(/\\text\{log\}/g, "\\log")
                .replace(/(\$[^$]+\$)/g, (match) => {
                  return match
                    .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
                    .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  return match.replace(
                    /([a-zA-Z])\{([^{}]+)\}([+\-><])/g,
                    "$1$2$3"
                  );
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  // New functionality to remove {} in the form ",{x}="
                  return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
                })
                .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

                .replace(/(\$[^$]+\$)/g, (match) => {
                  return match.replace(/\s*([+\-<>=])\s*/g, "$1");
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  return match.replace(
                    /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
                    "$1{$2}$3"
                  );
                })
                .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
                .replace(
                  /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
                  (match, p1, p2) => {
                    if (p1 && p2) {
                      return "\\heva{";
                    }
                    return match;
                  }
                )
                .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
                  if (group1) {
                    // Nếu là nội dung trong $...$, giữ nguyên
                    return group1;
                  }
                  // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
                  return ".";
                })
                .replace(/(\$[^$]+\$)/g, (match) => {
                  return match
                    .replace(
                      /\\overrightarrow\{\{([^{}]+)\}\}/g,
                      "\\overrightarrow{$1}"
                    )
                    .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
                })
                .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
                .replace(
                  /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
                  "$1\\mathrm{\\,d}x$3"
                )
                .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
                .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
                .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
                .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
                .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
                .replace(/\{\./g, ".{")
                .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
                .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

                .replace(
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
        const normalizedExplanation = explanation
          ? wrapNumbersInDollars(
              removeCurlyBraces2(
                removeNestedCurlyBraces(
                  removeSingleCharBraces(
                    removeSingleCharBraces(
                      removeBracesBeforePrime(
                        removeCurlyBraces(
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
                                      .replace(/\\!/g, "")
                                      .replace(/\$\s*\$/g, "")
                                      .replace(/\$~(\S)/g, "$$$1")
                                      .replace(
                                        /\$\s*([^$]+?)\s*\$/g,
                                        (match, p1) => `$${p1.trim()}$`
                                      )
                                      .replace(
                                        /\$([^$]+)\$/g,
                                        (match, p1) =>
                                          "$" +
                                          p1.replace(/\s*([{}])\s*/g, "$1") +
                                          "$"
                                      )
                                      .replace(/\.\$/g, "$.")
                                      .replace(/\\text\{ln\}/g, "\\ln ")
                                      .replace(/\\text\{sin\}/g, "\\sin ")
                                      .replace(/\\text\{cos\}/g, "\\cos ")
                                      .replace(/\\text\{tan\}/g, "\\tan ")
                                      .replace(/\\text\{cot\}/g, "\\cot ")
                                      .replace(
                                        /\\text\{lo\}\{\{\\text\{g\}\}_(.+?)\}/g,
                                        (_, x) => `\\log_{${x}} `
                                      )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
              .replace(/(\$[^$]+\$)/g, (match) =>
                match.replace(/([A-Z])\s+(?=[A-Z])/g, "$1")
              )
              .replace(/\$([^$]+)\$/g, (match, p1) => {
                // Xử lý các cặp ngoặc nhọn lồng nhau trong biểu thức toán học
                return (
                  "$" +
                  p1
                    .replace(/\{\{([^{}]*)\}\}/g, (nestedMatch, content) => {
                      // Kiểm tra nếu không có ký tự giữa các dấu ngoặc đóng và mở
                      if (!/\}\s*\{/.test(content)) {
                        return `{${content}}`;
                      }
                      return nestedMatch;
                    })
                    .replace(/\s*([{}])\s*/g, "$1") +
                  "$"
                );
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                let prevText;
                while (prevText !== match) {
                  prevText = match;
                  match = match.replace(
                    /([+\-($=><|:;]|\d+)(\{(?:[^{}]|\{[^{}]*\})*\})/g,
                    (m, before, braces) => {
                      if (/^[+\-($=><|:;]|\d+$/.test(before)) {
                        return before + braces.slice(1, -1);
                      }
                      return m;
                    }
                  );
                }
                return match;
              }) //Moi them
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove one pair of {} if it's in the form "{{x}}"
                return match.replace(/\{\{([^{}]+)\}\}/g, "{$1}");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove whitespace around "|" within "$...$"
                return match.replace(/\s*\|\s*/g, "|");
              })
              .replace(/\\text\{log\}/g, "\\log") //The moi 2
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match
                  .replace(/\{\{([^{}]+)\}\}/g, "{$1}")
                  .replace(/\{\{([^{}]+)\}([+-])/g, "{$1$2");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(
                  /([a-zA-Z])\{([^{}]+)\}([+\-><])/g,
                  "$1$2$3"
                );
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(/\{\\log\}(_[^{}]+)/g, "\\log$1");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                // New functionality to remove {} in the form ",{x}="
                return match.replace(/,\{([^{}]+)\}=/g, ",$1=");
              })
              .replace(/\\Delta([A-Za-z])/g, "\\Delta $1")

              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(/\s*([+\-<>=])\s*/g, "$1");
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match.replace(
                  /(\\(?:overline|bar|sqrt|text|overrightarrow))([a-zA-Z0-9_^{}]+)([+\-<>=])/g,
                  "$1{$2}$3"
                );
              })
              .replace(/\\end\s*\{\s*align\s*\}\s*\\right/g, "}")
              .replace(
                /(\\left\\\{)(\s*\\begin\s*\{\s*align\s*\})/g,
                (match, p1, p2) => {
                  if (p1 && p2) {
                    return "\\heva{";
                  }
                  return match;
                }
              )
              .replace(/(\$[^$]*\$)|\.{2,}/g, (match, group1) => {
                if (group1) {
                  // Nếu là nội dung trong $...$, giữ nguyên
                  return group1;
                }
                // Nếu là chuỗi dấu chấm bên ngoài $...$, thay thế bằng một dấu chấm
                return ".";
              })
              .replace(/(\$[^$]+\$)/g, (match) => {
                return match
                  .replace(
                    /\\overrightarrow\{\{([^{}]+)\}\}/g,
                    "\\overrightarrow{$1}"
                  )
                  .replace(/\\overline\{\{([^{}]+)\}\}/g, "\\overline{$1}");
              })
              .replace(/\\text\{\{d\}x\}/g, "\\text{d}x")
              .replace(
                /(\$[^$]*)((?:(?<!\\)d|\\text\{d\})x)([^$]*\$)/g,
                "$1\\mathrm{\\,d}x$3"
              )
              .replace(/\\mathrm([a-zA-Z])/g, "\\mathrm $1")
              .replace(/\\Leftrightarrow([a-zA-Z])/g, "\\Leftrightarrow $1")
              .replace(/(?<!\$)(?<=^|\s)([A-Z]+)(?=\s|$)(?!\$)/g, "$$$1$$")
              .replace(/\\bar\{\{([^{}]+)\}\}/g, "\\bar{$1}")
              .replace(/\\vec([^{}\s]+)([+\-><])/g, "\\vec{$1}$2")
              .replace(/\{\./g, ".{")
              .replace(/\\text\{\{([^{}]+)\}\}/g, "\\text{$1}")
              .replace(/\{\{([^{}]*)\}([+\-\\]{1,2})/g, "{$1$2") // Xử lý trường hợp {{X}+, {{X}-, và {{X}\\

              .replace(/(\$[^$]+\$)|(-?\d+(?:[,.]\d+)*)/g, (match, p1, p2) => {
                if (p1) {
                  // Handle numbers already in $...$
                  return p1.replace(/(\d+),(\d+)/g, "$1{,}$2");
                }
                if (p2.includes(",")) {
                  // Handle decimal numbers with comma
                  return "$ " + p2.replace(",", "{,}") + " $";
                }
                return `$${p2}$`; // If it's a number not wrapped, wrap it with spaces
              })
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
  const removeSpecialCharacters = (text) => {
    // Xóa các kí tự có dạng %Câu X, với X là số bất kỳ
    let processedText = text.replace(/%Câu\s*\d+,?/g, "");

    // Xóa các kí tự có dạng %=======% với số lượng dấu = bất kỳ
    processedText = processedText.replace(/%={2,}%/g, "");

    return processedText;
  };
  const copyTextToClipboard = async (text) => {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  };
  const handleCopy = () => {
    let textToCopy = inputText;

    if (!checkComment) {
      textToCopy = removeSpecialCharacters(inputText);
    }

    copyTextToClipboard(textToCopy)
      .then(() => {
        toast.success("Đã copy tất cả nội dung !");
      })
      .catch((err) => {
        toast.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="bg-[#F3F3F3] rounded-lg">
      <div className="grid grid-cols-[254px,1.3fr,1fr] divide-x divide-solid divide-gray rounded-lg">
        {/* Column 1 */}
        <div
          className="bg-white rounded-lg overflow-hidden flex flex-col"
          style={{ marginBottom: "400px" }}
        >
          <div className="h-[700px] overflow-y-auto p-4">
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
            <div className="flex justify-between w-full">
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
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-center p-2">
                <label
                  htmlFor="commentCheckbox"
                  className="flex items-center cursor-pointer"
                >
                  <div
                    className={`
          w-6 h-6 
          flex items-center justify-center 
          mr-1
          rounded-md 
          border-2 
          transition-all duration-200 ease-in-out
          ${
            checkComment
              ? "bg-green-500 border-green-500"
              : "bg-white border-gray-400"
          }
        `}
                  >
                    <input
                      type="checkbox"
                      id="commentCheckbox"
                      checked={checkComment}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {checkComment && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-500 text-base">
                    Hiện %Câu khi copy
                  </span>
                </label>
              </div>
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
            <div className="flex flex-col  mt-3">
              <Link
                href="./huongdan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#29A4FF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2089d8] transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faBook} size="lg" className="mr-2" />
                Hướng dẫn
              </Link>
              <div className="inline-flex items-center justify-center">
                <div class="bg-white w-full h-auto py-3 flex items-center justify-center gap-4 flex-wrap">
                  <Link
                    href="https://www.facebook.com/latexvatly31415/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="bg-blue-50 cursor-pointer rounded-md shadow-md shadow-transparent transition-all duration-300 hover:shadow-indigo-200"
                  >
                    <svg
                      class=""
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 92 92"
                      fill="none"
                    >
                      <rect
                        x="0.138672"
                        width=""
                        height=""
                        rx="15"
                        fill="#EDF4FF"
                      />
                      <path
                        d="M56.4927 48.6403L57.7973 40.3588H49.7611V34.9759C49.7611 32.7114 50.883 30.4987 54.4706 30.4987H58.1756V23.4465C56.018 23.1028 53.8378 22.9168 51.6527 22.8901C45.0385 22.8901 40.7204 26.8626 40.7204 34.0442V40.3588H33.3887V48.6403H40.7204V68.671H49.7611V48.6403H56.4927Z"
                        fill="#337FFF"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="https://www.youtube.com/watch?v=pC9yvFWojlw&t=57s"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      class="cursor-pointer rounded-md shadow-md shadow-transparent transition-all duration-300 hover:shadow-red-200"
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 92 93"
                      fill="none"
                    >
                      <rect
                        x="0.138672"
                        y="1"
                        width="91.5618"
                        height="91.5618"
                        rx="15"
                        fill="#FFECE8"
                      />
                      <path
                        d="M71.2471 33.8708C70.6493 31.6234 68.8809 29.8504 66.6309 29.2428C62.5626 28.1523 46.2396 28.1523 46.2396 28.1523C46.2396 28.1523 29.925 28.1523 25.8484 29.2428C23.6067 29.8421 21.8383 31.615 21.2322 33.8708C20.1445 37.9495 20.1445 46.4647 20.1445 46.4647C20.1445 46.4647 20.1445 54.98 21.2322 59.0586C21.83 61.306 23.5984 63.079 25.8484 63.6866C29.925 64.7771 46.2396 64.7771 46.2396 64.7771C46.2396 64.7771 62.5626 64.7771 66.6309 63.6866C68.8726 63.0873 70.641 61.3144 71.2471 59.0586C72.3348 54.98 72.3348 46.4647 72.3348 46.4647C72.3348 46.4647 72.3348 37.9495 71.2471 33.8708Z"
                        fill="#FF3000"
                      />
                      <path
                        d="M41.0256 54.314L54.5838 46.4647L41.0256 38.6154V54.314Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="bg-white flex flex-col h-[700px] ">
          {/* <div className="h-[20px]">Menu 1</div> */}
          <div className="overflow-y-auto h-[700px]">
            <Editor
              handleInputChange={handleInputChange}
              inputText={inputText}
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="bg-white flex flex-col h-[700px]">
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
                        className={`font-semibold flex items-center ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="mr-2"
                            />
                            <span>Đáp án đúng: {q.key}</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleXmark}
                              className="mr-2"
                            />
                            <span>Không có đáp án</span>
                          </>
                        )}
                      </p>
                      {/* {q.sol && <p>Lời giải: {renderLatex(q.sol)}</p>} */}
                      {/* {q.sol && q.sol.trim() !== "" && (
                        <p>
                          <span className="text-green-600 font-bold">
                            <FontAwesomeIcon icon={faEdit} className="mr-2" />
                            Lời giải:
                          </span>
                          <span className="ml-2">{renderLatex(q.sol)}</span>
                        </p>
                      )} */}
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
                        className={`font-semibold flex items-center ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="mr-2"
                            />
                            <span>Đáp án đúng: {q.key}</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleXmark}
                              className="mr-2"
                            />
                            <span>Không có đáp án</span>
                          </>
                        )}
                      </p>
                      {/* {q.sol && <p>Lời giải: {renderLatex(q.sol)}</p>} */}
                      {/* {q.sol && q.sol.trim() !== "" && (
                        <p>
                          <span className="text-green-600 font-bold">
                            <FontAwesomeIcon icon={faEdit} className="mr-2" />
                            Lời giải:
                          </span>
                          <span className="ml-2">{renderLatex(q.sol)}</span>
                        </p>
                      )} */}
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
                        className={`font-semibold flex items-center ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="mr-2"
                            />
                            <span>Đáp án đúng: {renderLatex(q.key)}</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleXmark}
                              className="mr-2"
                            />
                            <span>Không có đáp án</span>
                          </>
                        )}
                      </p>
                      {/* {q.sol && <p>Lời giải: {renderLatex(q.sol)}</p>} */}
                      {/* {q.sol && q.sol.trim() !== "" && (
                        <p>
                          <span className="text-green-600 font-bold">
                            <FontAwesomeIcon icon={faEdit} className="mr-2" />
                            Lời giải:
                          </span>
                          <span className="ml-2">{renderLatex(q.sol)}</span>
                        </p>
                      )} */}
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
