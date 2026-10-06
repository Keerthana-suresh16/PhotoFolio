import styles from "./imageForm.module.css";
import { useEffect, useRef } from "react";

export const ImageForm = ({
  loading,
  onAdd,
  onUpdate,
  albumName,
  updateIntent,
}) => {
  const imageTitleInput = useRef(null);
  const imageUrlInput = useRef(null);
  const isUpdate = Boolean(updateIntent);

  const handleClear = () => {
    if (imageTitleInput.current) imageTitleInput.current.value = "";
    if (imageUrlInput.current) imageUrlInput.current.value = "";
  };

  useEffect(() => {
    if (updateIntent) {
      if (imageTitleInput.current) imageTitleInput.current.value = updateIntent.title || "";
      if (imageUrlInput.current) imageUrlInput.current.value = updateIntent.url || "";
    } else {
      handleClear();
    }
  }, [updateIntent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = imageTitleInput.current?.value.trim();
    const url = imageUrlInput.current?.value.trim();
    if (!title || !url) return;

    if (isUpdate) {
      await onUpdate({ title, url });
    } else {
      await onAdd({ title, url });
    }
  };

  return (
    <div className={styles.imageForm}>
      <span>
        {isUpdate ? `Update image ${updateIntent.title}` : `Add image to ${albumName}`}
      </span>
      <form onSubmit={handleSubmit}>
        <input required placeholder="Title" ref={imageTitleInput} />
        <input required placeholder="Image URL" ref={imageUrlInput} />
        <div className={styles.actions}>
          <button type="button" onClick={handleClear} disabled={loading}>
            Clear
          </button>
          <button disabled={loading} type="submit">
            {isUpdate ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};
