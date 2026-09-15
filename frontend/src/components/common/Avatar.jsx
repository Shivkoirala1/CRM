import { useUsers } from "../../context/DataContext";
import { userById, avatarColor, avatarInitials } from "../../data/mockData";

export default function Avatar({ userId, size = 28 }) {
  const users = useUsers();
  const u = userById(users, userId);
  if (!u) return null;
  const color = avatarColor(u);
  return (
    <div
      title={u.username}
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: color + "26",
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {avatarInitials(u)}
    </div>
  );
}
