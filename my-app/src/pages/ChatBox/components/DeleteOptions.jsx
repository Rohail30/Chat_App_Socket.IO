function DeleteOptions({
  message,
  selectedMessages,
  currentUser,
  handleDeleteForMe,
  handleDeleteForAll,
}) {
  return (
    <div className="delete-options">
      <button onClick={handleDeleteForMe}>Delete for me</button>
      {selectedMessages.every(
        (id) => message.find((m) => m._id === id)?.sender === currentUser
      ) && <button onClick={handleDeleteForAll}>Delete for Everyone</button>}
    </div>
  );
}

export default DeleteOptions;
