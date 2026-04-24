export default function GoogleMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#EA4335" d="M12 10.2v3.9h5.6c-.2 1.2-1 2.8-2.3 3.9l3.5 2.7c2-1.8 3.2-4.5 3.2-7.7 0-.7-.1-1.4-.2-2H12z" />
      <path fill="#34A853" d="M6.6 14.3l-.7.5-2.8 2.2C5 20 8.2 22 12 22c2.6 0 4.9-.9 6.6-2.5l-3.5-2.7c-1 .7-2.3 1.1-3.9 1.1-2.9 0-5.3-1.9-6.2-4.6z" />
      <path fill="#4A90E2" d="M3.1 6.9A11.8 11.8 0 0 0 1 12c0 .8.1 1.5.3 2.2l4.6-3.7c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1L3.1 6.9z" />
      <path fill="#FBBC05" d="M12 4.2c1.4 0 2.7.5 3.7 1.4l2.8-2.8A10.7 10.7 0 0 0 12 2C8.2 2 5 4 3.1 6.9l4.6 3.7C8.7 7.5 10.4 4.2 12 4.2z" />
    </svg>
  );
}
