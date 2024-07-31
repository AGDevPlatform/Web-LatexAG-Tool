// // IconButton.js
// import React from "react";

// const IconButton = ({ icon, onClick, margin = "4px" }) => {
//   return (
//     <button
//       style={{
//         margin: margin,
//         padding: "4px",
//         color: "#000000",
//         cursor: "pointer",
//       }}
//       onMouseEnter={(e) => (e.currentTarget.style.color = "#3B84F5")}
//       onMouseLeave={(e) => (e.currentTarget.style.color = "#000000")}
//       onClick={onClick}
//     >
//       <i className={`${icon} fa-xl`} />
//     </button>
//   );
// };

// export default IconButton;
import React, { useState } from "react";
import styled from "styled-components";

const StyledButton = styled.button`
  width: 40px;
  height: 40px;
  margin: ${(props) => props.margin};
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${(props) =>
      props.isHovered ? "rgba(59, 132, 245, 0.1)" : "transparent"};
    border-radius: 8px;
    transition: background-color 0.3s ease;
  }

  i {
    color: ${(props) => (props.isHovered ? "#3B84F5" : "#000000")};
    transition: color 0.3s ease, transform 0.3s ease;
    position: relative;
    z-index: 1;
  }

  &:hover i {
    transform: scale(1.1);
  }

  &:active::before {
    background-color: rgba(59, 132, 245, 0.2);
  }
`;

const IconButton = ({ icon, onClick, margin = "8px" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <StyledButton
      margin={margin}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      isHovered={isHovered}
    >
      <i className={`${icon} fa-xl`} />
    </StyledButton>
  );
};

export default IconButton;
