import styles from "./albumForm.module.css";
import { useRef } from "react";

export const AlbumForm = ({ loading, onAdd }) => {
  const albumNameInput = useRef(null);

  const handleClear = () => {
    if (albumNameInput.current) albumNameInput.current.value = "";
    albumNameInput.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = albumNameInput.current?.value.trim();
    if (!name) return;
    await onAdd(name);
    if (albumNameInput.current) albumNameInput.current.value = "";
  };

  return (
    <div className={styles.albumForm}>
      <span>Create an album</span>
      <form onSubmit={handleSubmit}>
        <input required placeholder="Album Name" ref={albumNameInput} />
        <button type="button" onClick={handleClear} disabled={loading}>
          Clear
        </button>
        <button disabled={loading} type="submit">
          Create an album
        </button>
      </form>
    </div>
  );
};
