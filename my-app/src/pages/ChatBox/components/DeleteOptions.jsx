function DeleteOptions({ selectedMessages, currentUser, handleDeleteForMe, handleDeleteForAll }) {
  const allMine = selectedMessages.every(msg => msg.sender === currentUser);

  return (
    <div className="delete-options">
      {allMine ? (
        <>
          <button onClick={handleDeleteForMe}>Delete for Me</button>
          <button onClick={handleDeleteForAll}>Delete for Everyone</button>
        </>
      ) : (
        <button onClick={handleDeleteForMe}>Delete for Me</button>
      )}
    </div>
  );
}

export default DeleteOptions;
