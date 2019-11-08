import React, { useEffect } from "react";

// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import modalActions from "./actions/modal";

type Props = {
  open: boolean,
  text: string,
  modalActions: {
    [string]: () => void
  }
};

function FeedbackModal(props: Props) {
  const { open, text, modalActions } = props;

  if (!open) {
    return null;
  }

  useEffect(() => {
    const esc = e => {
      if (e.keyCode === 27) {
        modalActions.closeModal();
      }
    };

    window.addEventListener("keydown", esc);

    return () => {
      window.removeEventListener("keydown", esc);
    };
  }, []);

  return (
    <div className="modal-background">
      <div className="modal-body">
        <span onClick={() => modalActions.closeModal()}>＋</span>
        <p>{text}</p>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    open: state.modal.open,
    text: state.modal.text
  };
};

const mapDispatchToProps = dispatch => {
  return {
    modalActions: bindActionCreators(modalActions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedbackModal);
