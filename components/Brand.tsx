import Link from "next/link";

export default function Brand() {
  return (
    <Link href="/demo" className="brand" aria-label="MyPortfolio home">
      <span className="brand-mark" aria-hidden="true">M<span>.</span></span>
      <span>MyPortfolio</span>
    </Link>
  );
}
