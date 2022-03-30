import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
	Navigate,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import Actions from "../actions";
import Client from "../components/Client";
import SimpleEditor from "../components/SimpleEditor";
import { initSocket } from "../socket";

export default function Editor() {
	const reactNavigate = useNavigate();
	const location = useLocation();
	const { roomId } = useParams();
	const socketRef = useRef(null);
	const codeRef = useRef(null);
	const [clients, setClients] = useState([]);

	useEffect(() => {
		async function init() {
			const handleErrors = (err) => {
				console.error("Socket Connection Error", err);
				toast.error("Socket Connection Failed");
				reactNavigate("/");
			};

			socketRef.current = await initSocket();
			socketRef.current.on("connect_error", handleErrors);
			socketRef.current.on("connect_failed", handleErrors);

			socketRef.current.emit(Actions.JOIN, {
				roomId,
				username: location.state?.username,
			});

			socketRef.current.on(
				Actions.JOINED,
				({ clients, username, socketId }) => {
					if (username !== location.state?.username)
						toast.success(`${username} has joined the room.`);
					setClients(clients);

					socketRef.current.emit(Actions.SYNC_CODE, {
						code: codeRef.current,
						socketId,
					});
				}
			);

			socketRef.current.on(Actions.DISCONNECTED, ({ username, socketId }) => {
				console.log({ username });
				toast.success(`${username} has left the room.`);
				setClients((prevClients) =>
					prevClients.filter((client) => client.socketId !== socketId)
				);
			});
		}
		init();

		return () => {
			socketRef.current.disconnect();
			socketRef.current.off(Actions.JOINED);
			socketRef.current.off(Actions.DISCONNECTED);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const copyRoomId = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(roomId);
			toast.success("Room ID has been copied in your clipboard!");
		} catch (err) {
			console.error(err);
			toast.error("Could not copied the room id!");
		}
	}, [roomId]);

	const leaveRoom = useCallback(async () => {
		reactNavigate("/");
	}, [reactNavigate]);

	if (!location.state?.username) return <Navigate to="/" />;
	return (
		<div className="mainWrap">
			<div className="aside">
				<div className="asideInner">
					<div className="logo">
						<img src="/code-sync.png" alt="" className="logoImage" />
					</div>

					<h3>Connected</h3>
					<div className="clientsList">
						{clients.map((client) => (
							<Client key={client.socketId} client={client} />
						))}
					</div>
				</div>

				<button className="btn copyBtn" onClick={copyRoomId} type="button">
					Copy ROOM ID
				</button>
				<button className="btn leaveBtn" onClick={leaveRoom} type="button">
					Leave
				</button>
			</div>
			<div className="editorWrap">
				<SimpleEditor
					socketRef={socketRef}
					roomId={roomId}
					onChange={(code) => (codeRef.current = code)}
				/>
			</div>
		</div>
	);
}
