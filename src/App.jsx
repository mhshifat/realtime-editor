import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Editor from "./pages/Editor";
import Home from "./pages/Home";

function App() {
	return (
		<>
			<div>
				<Toaster
					position="top-right"
					toastOptions={{
						success: {
							theme: {
								primary: "#4aed88",
							},
							iconTheme: {
								primary: "#4aed88",
							},
						},
					}}
				/>
			</div>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/editor/:roomId" element={<Editor />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
