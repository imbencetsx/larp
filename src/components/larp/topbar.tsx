import Link from "next/link";

export function Topbar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="LARP home">
          <span className="wordmark">LARP</span>
          <span className="logo-pixel" />
        </Link>
        {children}
      </div>
    </header>
  );
}
