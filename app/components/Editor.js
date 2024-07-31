"use client";
import React from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

export default function Editor({ handleInputChange, inputText }) {
  return (
    <div
      style={{
        overflow: "auto",
        zIndex: 0,
        position: "relative",
      }}
    >
      <AceEditor
        onChange={handleInputChange}
        value={inputText}
        mode="latex"
        theme="dracula"
        name="latex-editor"
        editorProps={{ $blockScrolling: Infinity }}
        width="100%"
        height="100vh"
        fontSize="14px"
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={true}
        enableSnippets={true}
        wrapEnabled={true}
        setOptions={{
          useWorker: false,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          enableFoldActiveLine: true,
          foldStyle: "markbegin",
          highlightActiveLine: true,
          highlightSelectedWord: true,
          behavioursEnabled: true,
          showLineNumbers: true,
          showGutter: true,
          displayIndentGuides: true,
        }}
        style={{
          zIndex: 0,
          position: "relative",
          borderBottomWidth: "1px",
          borderColor: "#DCDCDC",
        }}
      />
    </div>
  );
}
