export default function EmptyState({ icon: Icon, text }) {
  return (
    <div className="empty-state">
      <Icon size={22} color="#B7C0CC" />
      <p>{text}</p>
    </div>
  );
}
