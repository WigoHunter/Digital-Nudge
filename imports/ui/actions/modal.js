export function openModal(text) {
  return {
    type: "OPEN_MODAL",
    data: {
      text
    }
  };
}

export function closeModal() {
  return {
    type: "CLOSE_MODAL",
    data: {}
  };
}
