import React from "react";
import IconButton from "./IconButton"; // Giả sử bạn có component IconButton

const MenuInput = ({}) => {
  return (
    <div
      className="flex items-center justify-between "
      style={{
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        borderColor: "#E5E5E5",
        borderBottomWidth: "1px",
      }}
    >
      <div className="flex space-x-1">
        <IconButton icon="fa-solid fa-check-double" />
        <IconButton icon="fa-solid fa-question" />
        <IconButton icon="fa-solid fa-pen" />

        <IconButton icon="fa-solid fa-eraser" />
        <IconButton icon="fa-regular fa-copy" />
        <IconButton icon="fa-solid fa-bold" margin="8px" />
        <IconButton icon="fa-solid fa-italic" margin="8px" />
        <IconButton icon="fa-solid fa-align-left" margin="8px" />
        <IconButton icon="fa-solid fa-align-center" margin="8px" />
        <IconButton icon="fa-solid fa-align-right" margin="8px" />
      </div>
    </div>
  );
};

export default MenuInput;
