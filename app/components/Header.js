"use client";
import React, { useState, useEffect } from "react";

export default function Header() {
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const incrementVisits = () => {
      const storedVisits = localStorage.getItem("visitCount");
      let currentVisits = storedVisits ? parseInt(storedVisits, 10) : 0;
      if (!sessionStorage.getItem("visitIncremented")) {
        currentVisits += 1;
        localStorage.setItem("visitCount", currentVisits.toString());
        sessionStorage.setItem("visitIncremented", "true");
      }

      setVisits(currentVisits);
    };

    incrementVisits();
  }, []);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setOpen2(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "2px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: "1px",
        borderColor: "#EFEFEF",
      }}
    >
      <div
        style={{
          marginTop: "1px",
          marginBottom: "1px",
          borderWidth: "1.5px",
          borderColor: "#DDDDDD",
          borderStyle: "solid",
          borderRadius: "8px",
          width: "650px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", flexGrow: 1 }}>
          <button
            href="/"
            style={{
              margin: "0 10px",
              fontSize: "16px",
              borderRadius: "5px",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
            className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            Latex AG
          </button>

          <button
            className="hover:underline block text-sm font-medium truncate"
            style={{ margin: "0 10px", fontSize: "16px" }}
          >
            <a href="/"> Home</a>
          </button>

          <button
            className="hover:underline block text-sm font-medium truncate"
            style={{ margin: "0 10px", fontSize: "16px" }}
          >
            Snippet
          </button>
          <button
            class="hover:underline block text-sm font-medium truncate"
            style={{ margin: "0 10px", fontSize: "16px" }}
          >
            <a
              href="https://www.facebook.com/latexvatly31415/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fanpage
            </a>
          </button>

          <button
            className="hover:underline block text-sm font-medium truncate"
            style={{ margin: "0 10px", fontSize: "16px" }}
          >
            About
          </button>
          <div className="flex ml-3">
            <div className="text-xs sm:text-sm text-nowrap flex justify-center items-center gap-x-1.5">
              <div className="relative flex size-2">
                <span className="relative inline-flex rounded-full size-2 bg-green-500"></span>
              </div>

              <span className="font-bold truncate" style={{ fontSize: "15px" }}>
                {(() => {
                  if (visits < 1000) return visits.toString();
                  if (visits < 1000000) return (visits / 1000).toFixed(1) + "K";
                  if (visits < 1000000000)
                    return (visits / 1000000).toFixed(1) + "M";
                  return (visits / 1000000000).toFixed(1) + "B";
                })()}
              </span>
              <span>your visits</span>
            </div>
          </div>
        </div>
        <div
          className="absolute top-0 right-0 hidden md:flex items-center "
          style={{ marginTop: "2.5px", marginRight: "5px", padding: "2px" }}
        >
          <span
            className="bg-blue-100 text-blue-800  font-semibold px-2.5 py-0.5 rounded-lg "
            style={{ fontSize: "13px" }}
          >
            ✨ 13/7/2024 - Cập nhật giao diện nút bấm.
          </span>
        </div>
      </div>
    </div>
  );
}
