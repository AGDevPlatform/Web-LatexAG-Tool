"use client";
import { useState, useCallback, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
export default function Home() {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionType1, setQuestionType1] = useState([]);
  const [questionType2, setQuestionType2] = useState([]);
  const [questionType3, setQuestionType3] = useState([]);

  const handleInputChange = useCallback((value) => {
    setInputText(value);
  }, []);

  return (
    <div className="bg-[#F3F3F3] rounded-lg">
      <div className="grid grid-cols-[260px,1.5fr,1fr] divide-x divide-solid divide-gray rounded-lg">
        <div className="bg-white flex flex-col">
          <div className="h-[1000px] p-1 flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-grow">
              <div className="space-y-6 pr-2" style={{ marginBottom: "400px" }}>
                <div>
                  {questionType1.map((q, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 p-2 rounded-lg border border-blue-200 mb-2"
                    >
                      <p>
                        <span className="font-semibold">Câu {index + 1}: </span>
                        {q.content.replace(/%Câu \d+/g, "")}
                      </p>
                      <p>
                        {" "}
                        <strong>A.</strong> {q.ans1}
                      </p>
                      <p>
                        {" "}
                        <strong>B.</strong> {q.ans2}
                      </p>
                      <p>
                        {" "}
                        <strong>C.</strong> {q.ans3}
                      </p>
                      <p>
                        {" "}
                        <strong>D.</strong> {q.ans4}
                      </p>
                      <p
                        className={`font-semibold ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? `Đáp án đúng: ${q.key}` : "Không có đáp án"}
                      </p>
                      {q.sol && <p>Lời giải: {q.sol}</p>}
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
                        {q.content.replace(/%Câu \d+/g, "")}
                      </p>
                      <div>
                        <p>
                          <strong>a)</strong> {q.ans1}
                        </p>
                        <p>
                          <strong>b)</strong> {q.ans2}
                        </p>
                        <p>
                          <strong>c)</strong> {q.ans3}
                        </p>
                        <p>
                          <strong>d)</strong> {q.ans4}
                        </p>
                      </div>
                      <p
                        className={`font-semibold ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? `Đáp án đúng: ${q.key}` : "Không có đáp án"}
                      </p>
                      {q.sol && <p>Lời giải: {q.sol}</p>}
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
                        {q.content.replace(/%Câu \d+/g, "")}
                      </p>
                      <p
                        className={`font-semibold ${
                          q.key ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {q.key ? `Đáp án đúng: ${q.key}` : "Không có đáp án"}
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
