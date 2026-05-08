import { Outlet } from "react-router-dom";
import { ToastContainer, type ToastContainerProps } from "react-toastify";

import { Header } from "components";

const Layout = () => {
  const toastConfig: ToastContainerProps = {
    theme: "light",
    autoClose: 2000,
    style: { zIndex: 99999 }
  };

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <ToastContainer {...toastConfig} />
    </>
  );
};

export default Layout;
