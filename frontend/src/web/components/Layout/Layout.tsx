import { Outlet } from "react-router-dom";
import { ToastContainer, type ToastContainerProps } from "react-toastify";

import { Header } from "components";
import { useToastPosition } from "hooks";

const Layout = () => {
  const toastPosition = useToastPosition();

  const toastConfig: ToastContainerProps = {
    theme: "light",
    autoClose: 2000,
    style: { zIndex: 99999 },
    position: toastPosition
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
