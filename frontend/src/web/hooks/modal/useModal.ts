import { useCallback, useState } from "react";

export const useModal = (): [boolean, (isOpen?: boolean) => void] => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const toggleModal = useCallback((isOpen?: boolean) => {
    setIsOpenModal((prev) => (isOpen === undefined ? !prev : isOpen));
  }, []);

  return [isOpenModal, toggleModal];
};
