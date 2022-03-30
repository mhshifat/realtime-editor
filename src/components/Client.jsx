import Avatar from "react-avatar";

export default function Client({ client }) {
	return (
		<div className="client">
			<Avatar name={client.username} size={50} round="14px" />
			<span className="userName">{client.username}</span>
		</div>
	);
}
