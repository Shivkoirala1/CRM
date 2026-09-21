import { useUsers } from "../../context/DataContext";
import { userById } from "../../data/mockData";

export default function Avatar({ userId, size = 28 }) {
  const users = useUsers();
  const u = userById(users, userId);
  if (!u) return null;
  return (
    <div
      title={u.name}
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: u.color + "26",
        color: u.color,
        border: `1px solid ${u.color}55`,
      }}
    >
      {u.initials}
    </div>
  );
}
