import styles from "./imageList.module.css";
import { useState, useRef, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "react-spinner-material";
import { db } from "../../firebase";
import { ImageForm } from "../imageForm/ImageForm";
import { Carousel } from "../carousel/Carousel";

export const ImagesList = ({ albumId, albumName, onBack }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchIntent, setSearchIntent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInput = useRef();
  const [addImageIntent, setAddImageIntent] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [updateImageIntent, setUpdateImageIntent] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [activeHoverImageIndex, setActiveHoverImageIndex] = useState(null);

  const getImages = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "albums", albumId, "images"));
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setImages(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  const handleNext = () => {
    if (!images.length) return;
    setActiveImageIndex((current) => (current + 1) % images.length);
  };

  const handlePrev = () => {
    if (!images.length) return;
    setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
  };

  const handleCancel = () => setActiveImageIndex(null);

  const handleSearchClick = () => {
    if (searchIntent) {
      setSearchTerm("");
      if (searchInput.current) searchInput.current.value = "";
      setSearchIntent(false);
    } else {
      setSearchIntent(true);
    }
  };

  const filteredImages = images.filter((image) =>
    image.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async ({ title, url }) => {
    setImgLoading(true);
    try {
      const imageRef = await addDoc(collection(db, "albums", albumId, "images"), {
        title,
        url,
        createdAt: Date.now(),
      });
      setImages((current) => [
        { id: imageRef.id, title, url, createdAt: Date.now() },
        ...current,
      ]);
      setAddImageIntent(false);
      toast.success("Image added successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add image.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleUpdate = async ({ title, url }) => {
    if (!updateImageIntent) return;
    setImgLoading(true);
    try {
      await updateDoc(doc(db, "albums", albumId, "images", updateImageIntent.id), {
        title,
        url,
        updatedAt: Date.now(),
      });
      setImages((current) =>
        current.map((image) =>
          image.id === updateImageIntent.id ? { ...image, title, url } : image
        )
      );
      setUpdateImageIntent(null);
      toast.success("Image updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update image.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "albums", albumId, "images", id));
      setImages((current) => current.filter((image) => image.id !== id));
      setActiveImageIndex(null);
      toast.success("Image deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image.");
    }
  };

  const showEmptyState = !loading && !images.length;

  return (
    <>
      {activeImageIndex !== null && filteredImages.length > 0 && (
        <Carousel
          title={filteredImages[activeImageIndex]?.title}
          url={filteredImages[activeImageIndex]?.url}
          onNext={handleNext}
          onPrev={handlePrev}
          onCancel={handleCancel}
        />
      )}

      <div className={styles.top}>
        <span onClick={onBack} title="Back">
          <img src="/assets/back.png" alt="back" />
        </span>
        <h3>{showEmptyState ? "No images found in the album." : `Images in ${albumName}`}</h3>

        <div className={styles.search}>
          {searchIntent && (
            <input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={searchInput}
              autoFocus
            />
          )}
          {!showEmptyState && (
            <img
              onClick={handleSearchClick}
              src={!searchIntent ? "/assets/search.png" : "/assets/clear.png"}
              alt={searchIntent ? "clear search" : "search"}
            />
          )}
        </div>

        {updateImageIntent ? (
          <button className={styles.active} onClick={() => setUpdateImageIntent(null)}>
            Cancel
          </button>
        ) : (
          <button
            className={addImageIntent ? styles.active : ""}
            onClick={() => setAddImageIntent((current) => !current)}
          >
            {addImageIntent ? "Cancel" : "Add image"}
          </button>
        )}
      </div>

      {(addImageIntent || updateImageIntent) && (
        <ImageForm
          loading={imgLoading}
          onAdd={handleAdd}
          albumName={albumName}
          onUpdate={handleUpdate}
          updateIntent={updateImageIntent}
        />
      )}

      {loading && (
        <div className={styles.loader}>
          <Spinner color="#0077ff" />
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className={styles.imageList}>
          {filteredImages.length > 0 ? (
            filteredImages.map((image, i) => (
              <div
                key={image.id}
                className={styles.image}
                onMouseEnter={() => setActiveHoverImageIndex(image.id)}
                onMouseLeave={() => setActiveHoverImageIndex(null)}
                onClick={() => {
                  const index = filteredImages.findIndex((item) => item.id === image.id);
                  setActiveImageIndex(index);
                }}
              >
                <div
                  className={`${styles.update} ${activeHoverImageIndex === image.id ? styles.active : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddImageIntent(false);
                    setUpdateImageIntent(image);
                  }}
                >
                  <img src="/assets/edit.png" alt="update" />
                </div>
                <div
                  className={`${styles.delete} ${activeHoverImageIndex === image.id ? styles.active : ""}`}
                  onClick={(e) => handleDelete(e, image.id)}
                >
                  <img src="/assets/trash-bin.png" alt="deleted" />
                </div>
                <img
                  src={image.url}
                  alt={image.title}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/assets/warning.png";
                  }}
                />
                <span>{image.title?.substring(0, 20)}</span>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>No images match your search.</div>
          )}
        </div>
      )}
    </>
  );
};
