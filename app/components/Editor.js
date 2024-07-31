"use client";
import React, { useRef, useState, useEffect } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-code_lens";
import "ace-builds/src-noconflict/ext-beautify";
import ace from "ace-builds";
export default function Editor() {
  return (
    <div
      style={{
        height: "calc(100vh - 0px)",
        overflow: "auto",
        zIndex: 0,
        position: "relative",
      }}
    >
      <AceEditor
        // ref={(el) => {
        //   editorRef.current = el;
        //   if (inputRef) inputRef.current = el;
        // }}
        // onLoad={(editorInstance) => {
        //   Object.values(MathShortcuts).forEach((shortcut) => {
        //     editorInstance.commands.addCommand({
        //       name: shortcut.name,
        //       bindKey: shortcut.bindKey,
        //       exec: () => {
        //         console.log(`Shortcut ${shortcut.name} executed`);
        //         insertFormulaShortcut(
        //           shortcut.formula,
        //           shortcut.pos,
        //           shortcut.x,
        //           shortcut.y,
        //           shortcut.check,
        //           shortcut.icon
        //         );
        //       },
        //     });
        //   });
        // }}
        mode="latex"
        // theme={theme}
        // onChange={handleInputChange}
        // value={inputText}
        name="latex-editor"
        editorProps={{ $blockScrolling: Infinity }}
        width="100%"
        height="85vh"
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
          foldStyle: "markbegin", // or 'markbeginend' or 'manual'
          highlightActiveLine: true,
          highlightSelectedWord: true,
          behavioursEnabled: true,
          useWorker: true,
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
