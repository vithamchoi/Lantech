import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md selection:bg-secondary selection:text-on-secondary">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-md py-xl grid grid-cols-1 gap-xl relative pt-[100px] pb-[200px]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
