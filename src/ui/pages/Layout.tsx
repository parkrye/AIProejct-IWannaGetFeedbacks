import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

export function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <h1 className="layout__title">AI 피드백 생성기</h1>
        <nav className="layout__nav">
          <NavLink to="/" end className={({ isActive }) => `layout__link ${isActive ? "layout__link--active" : ""}`}>
            피드백
          </NavLink>
          <NavLink to="/personas" className={({ isActive }) => `layout__link ${isActive ? "layout__link--active" : ""}`}>
            페르소나
          </NavLink>
          <NavLink to="/groups" className={({ isActive }) => `layout__link ${isActive ? "layout__link--active" : ""}`}>
            그룹
          </NavLink>
        </nav>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
