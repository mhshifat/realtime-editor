import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

export default function Home() {
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState("");
	const [username, setUsername] = useState("");

	const createNewRoom = useCallback((e) => {
		e.preventDefault();
		const id = uuid();
		setRoomId(id);
		toast.success("Created a new room");
	}, []);

	const joinRoom = useCallback(() => {
		if (!roomId || !username)
			return toast.error("Room ID & Username is required!");
		navigate(`/editor/${roomId}`, {
			state: { username },
		});
	}, [navigate, roomId, username]);

	return (
		<div className="homePageWrapper">
			<div className="formWrapper">
				<img src="/code-sync.png" alt="" />
				<h4 className="mainLabel">Paste invitation ROOM ID</h4>
				<div className="inputGroup">
					<input
						type="text"
						value={roomId}
						className="inputBox"
						placeholder="ROOM ID"
						onChange={({ target }) => setRoomId(target.value)}
					/>
					<input
						type="text"
						value={username}
						className="inputBox"
						placeholder="USERNAME"
						onChange={({ target }) => setUsername(target.value)}
						onKeyUp={({ code }) => code === "Enter" && joinRoom()}
					/>
					<button onClick={joinRoom} type="button" className="btn joinBtn">
						Join
					</button>
					<span className="createInfo">
						If you don't have an invite then create a &nbsp;
						<a href="/" onClick={createNewRoom} className="createNewBtn">
							new room
						</a>
					</span>
				</div>
			</div>
			<footer>
				<h4>
					Built by <a href="/">Mehedi Hassan Shifat</a>
				</h4>
			</footer>
		</div>
	);
}
