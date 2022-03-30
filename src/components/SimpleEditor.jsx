import CodeMirror from "codemirror";
import { useEffect, useRef } from "react";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import Actions from "../actions";

export default function SimpleEditor({ socketRef, roomId, onChange }) {
	const editorRef = useRef(null);

	useEffect(() => {
		async function init() {
			editorRef.current = CodeMirror.fromTextArea(
				document.getElementById("realtimeEditor"),
				{
					mode: { name: "javascript", json: true },
					theme: "dracula",
					autoCloseTags: true,
					autoCloseBrackets: true,
					lineNumbers: true,
				}
			);

			editorRef.current.on("change", (instance, changes) => {
				const { origin } = changes;
				const code = instance.getValue();
				onChange(code);
				if (origin !== "setValue") {
					socketRef.current.emit(Actions.CODE_CHANGE, {
						roomId,
						code,
					});
				}
			});
		}
		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!socketRef.current) return;
		const socket = socketRef.current;
		socket.on(Actions.CODE_CHANGE, ({ code }) => {
			if (!code) return;
			editorRef.current.setValue(code);
		});

		return () => {
			socket.off(Actions.CODE_CHANGE);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socketRef.current]);

	return <textarea id="realtimeEditor" />;
}
