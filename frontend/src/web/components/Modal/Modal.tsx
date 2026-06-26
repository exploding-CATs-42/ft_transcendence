// Libraries
import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
// Project level
import { Icon } from "components";
import type { IconName } from "types";
// Local level
import s from "./Modal.module.css";

const modalRoot = document.querySelector("#rootModal")!;

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  toggleModal: () => void;
  previosModal?: boolean;
  className?: string;
  closeButtonClassName?: string;
  closeIconClassName?: string;
  closeIconName?: IconName;
  closeIconWidth?: number;
  closeIconHeight?: number;
}

const Modal = ({
  children,
  isOpen,
  toggleModal,
  previosModal = false,
  className,
  closeButtonClassName,
  closeIconClassName,
  closeIconName = "cross",
  closeIconWidth = 12,
  closeIconHeight = 12,
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
          className={clsx(s.modalButton, closeButtonClassName)}
          type="button"
          onClick={() => toggleModal()}
        >
          <Icon
            className={closeIconClassName}
            name={closeIconName}
            id="close"
            width={closeIconWidth}
            height={closeIconHeight}
          />
        </button>
        {children}
      </div>
    </div>,
    modalRoot,
  );
};

export default Modal;
