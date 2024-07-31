import React, { useRef, useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
export default function Settings({ handleFileUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        handleFileUpload(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="settings-panel">
      <input
        type="file"
        accept=".tex"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="upload-button"
      >
        Upload
      </button>
    </div>
  );
}
