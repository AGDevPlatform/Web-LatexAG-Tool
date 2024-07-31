"use client";

import Image from "next/image";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import Editor from "./components/Editor";

export default function Home() {
  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F3F3",
        borderRadius: "10px",
      }}
    >
      <div
        className="grid grid-cols-[155px,1fr,1fr] gap-0 divide-x divide-solid divide-gray"
        style={{ borderRadius: "10px" }}
      >
        <div
          className="overflow-y-auto p-1 flex flex-col gap-0 flex-shrink-0"
          style={{
            maxHeight: "calc(85vh + 48px)",
            backgroundColor: "white",
            borderRadius: "10px",
          }}
        >
          Cot Mot
        </div>
        <div class="grid grid-cols-1 gap-0">
          <div>Menu</div>
          <Editor />
        </div>
        <div
          class="grid grid-cols-1 gap-0"
          style={{ backgroundColor: "white" }}
        >
          <div>Menu Prevew</div>
          <div>Previw</div>
        </div>
      </div>
    </div>
  );
}
