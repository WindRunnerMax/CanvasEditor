import ReactDOM from "react-dom";

export const Portal: React.FC = ({ children }) => {
  return typeof document === "object" ? ReactDOM.createPortal(children, document.body) : null;
};
