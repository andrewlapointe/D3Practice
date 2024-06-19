import "./navStyles.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <a href="/" className="site-title">
        D3-React
      </a>
      <ul>
        <li className="active">
          <a href="/page1">Page 1</a>
        </li>
        <li>
          <a href="/page2">Page 2</a>
        </li>
      </ul>
    </nav>
  );
}
