Modal usage example:

```tsx
// MyComponent.tsx
import { useModal } from "hooks";
import { Modal } from "components";

import s from "./MyComponent.module.css";

const MyComponent = () => {
  const [isOpenModal, toggleModal] = useModal();

  return (
    <>
      <button type="button" onClick={() => toggleModal()}>
        Open modal
      </button>

      <Modal className={s.modal} isOpen={isOpenModal} toggleModal={toggleModal}>
        Data inside modal window
      </Modal>
    </>
  );
};

export default MyComponent;
```

```css
/* MyComponent.module.css */
.modal {
  background-color: white;
  color: black;
  border-radius: 20px;
  padding: 40px;
}
```
