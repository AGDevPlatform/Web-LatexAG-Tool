import "katex/dist/katex.min.css";
import katex from "katex";
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
          <p key={option} className={isTrue ? "font-bold text-green-600" : ""}>
            <strong>{option}.</strong> {renderLatex(displayText)}
          </p>
        );
      })}
      <p
        className={`font-semibold ${q.key ? "text-green-600" : "text-red-600"}`}
      >
        {q.key ? `Đáp án đúng: ${q.key}` : "Không có đáp án"}
      </p>
      {/* {q.sol && <p>Lời giải: {renderLatex(q.sol)}</p>} */}
      <p>
        <span className="font-semibold">Câu {index + 1}: </span>
        {renderLatex(q.sol.replace(/%Câu \d+/g, ""))}
      </p>
    </div>
  ))}
</div>;
