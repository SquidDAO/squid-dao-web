import React, { createContext, useContext, useMemo, useState } from "react";
import { Modal as BsModal } from "react-bootstrap";

interface ModalContext {
  // eslint-disable-next-line no-unused-vars
  onPresent: (title: string, body: React.ReactNode) => void;
  onDismiss: () => void;
  info: ModalInfo;
}

export type ModalInfo = {
  show: boolean;
  title: string;
  body: React.ReactNode;
};

export const Context = createContext<ModalContext>({
  onPresent: () => {},
  onDismiss: () => {},
  info: {
    show: false,
    title: "",
    body: "",
  },
});

export const ModalProvider: React.FC = ({ children }) => {
  const [content, setContent] = useState<ModalInfo>({
    show: false,
    title: "",
    body: "",
  });

  const handlePresent = (title: string, body: React.ReactNode) => {
    setContent({
      title,
      body,
      show: true,
    });
  };
  const handleDismiss = () => {
    setContent({
      show: false,
      title: "",
      body: "",
    });
  };

  const context = useMemo(
    () => ({
      onPresent: handlePresent,
      onDismiss: handleDismiss,
      info: content,
    }),
    [content],
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

export const useModalContext = () => {
  return useContext(Context);
};

export const Modal: React.FC = () => {
  const { info, onDismiss } = useModalContext();
  return (
    <BsModal show={info.show} onHide={onDismiss} style={{ color: "black" }}>
      <BsModal.Header closeButton>
        <BsModal.Title>{info.title}</BsModal.Title>
      </BsModal.Header>
      <BsModal.Body style={{ fontSize: "1rem" }}>{info.body}</BsModal.Body>
    </BsModal>
  );
};
