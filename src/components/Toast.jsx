export default function Toast({ show, msg }) {
  return (
    <div
      className={`toast${show ? ' show' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      ✓ {msg}
    </div>
  );
}
