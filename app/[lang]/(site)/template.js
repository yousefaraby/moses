// Re-mounts on every navigation: the dry-ice veil wipes across and clears,
// then the page settles in. Pure CSS, so it also runs without JavaScript.
export default function Template({ children }) {
  return (
    <>
      <div className="veil" aria-hidden="true" />
      <div className="page-enter">{children}</div>
    </>
  );
}
