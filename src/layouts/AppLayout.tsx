import { Outlet } from 'react-router-dom';
import HamburgerMenu from '../components/shared/HamburgerMenu';
import HorizontalMenu from '../components/shared/HorizontalMenu';

export default function AppLayout() {
  return (
    <div className="flex h-screen">
      <HamburgerMenu />
      <div className="flex-1 flex flex-col">
        <HorizontalMenu />
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
