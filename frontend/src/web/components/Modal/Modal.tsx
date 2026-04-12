import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import { CrossIcon } from "assets";

import s from "./Modal.module.css";

const modalRoot = document.querySelector("#rootModal")!;

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  toggleModal: () => void;
  previosModal?: boolean;
  className?: string;
}

const Modal = ({
  children,
  isOpen,
  toggleModal,
  previosModal = false,
  className
}: Props) => {
  useEffect(() => {
    if (previosModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.code === "Escape") toggleModal();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [toggleModal, previosModal]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { target, currentTarget } = event;
    if (target === currentTarget) {
      toggleModal();
    }
  };

  return createPortal(
    <div
      className={clsx(s.wrapper, { [s.isOpen]: isOpen })}
      onClick={handleClick}
    >
      <div className={clsx(s.modalWindow, className)}>
        <button
          className={s.modalButton}
          type="button"
          onClick={() => toggleModal()}
        >
          <CrossIcon id={"close"} width={12} height={12} />
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
