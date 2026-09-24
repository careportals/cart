import { createRoot } from "react-dom/client";
import "./styles.less";
import App from './app/app';


createRoot(document.getElementById("portals-cart-app")!).render(<App />);
