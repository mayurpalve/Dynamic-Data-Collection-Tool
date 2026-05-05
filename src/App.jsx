import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
          
      />

    </BrowserRouter>
  );
}





