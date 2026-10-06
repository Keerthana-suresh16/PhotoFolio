import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, limit } from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "react-spinner-material";
import styles from "./albumsList.module.css";
import { db } from "../../firebase";
import { AlbumForm } from "../albumForm/AlbumForm";
import { ImagesList } from "../imagesList/ImagesList";

export const AlbumsList = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [albumAddLoading, setAlbumAddLoading] = useState(false);
  const [addAlbumIntent, setAddAlbumIntent] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const ensureFirstAlbum = async () => {
    try {
      const firstQuery = query(
        collection(db, "albums"),
        where("name", "==", "first"),
        limit(1)
      );
      const snapshot = await getDocs(firstQuery);
      const hasFirst = snapshot.docs.some((doc) => doc.data().name?.toLowerCase() === "first");
      if (!hasFirst) {
        await addDoc(collection(db, "albums"), {
          name: "first",
          createdAt: Date.now(),
        });
      }
    } catch (error) {
      console.error(error);
      // The normal album query below will show the actual Firebase error to the user.
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await ensureFirstAlbum();
        const snapshot = await getDocs(collection(db, "albums"));
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAlbums(data);
      } catch (error) {
        console.error(error);
        toast.error("Unable to connect to Firebase. Check your configuration and Firestore rules.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddAlbum = async (name) => {
    setAlbumAddLoading(true);
    try {
      const duplicate = albums.some((album) => album.name?.toLowerCase() === name.toLowerCase());
      if (duplicate) {
        toast.error("An album with this name already exists.");
        return;
      }

      const docRef = await addDoc(collection(db, "albums"), {
        name,
        createdAt: Date.now(),
      });
      setAlbums((current) => [{ id: docRef.id, name, createdAt: Date.now() }, ...current]);
      setAddAlbumIntent(false);
      toast.success("Album created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create album.");
    } finally {
      setAlbumAddLoading(false);
    }
  };

  if (selectedAlbum) {
    return (
      <ImagesList
        albumId={selectedAlbum.id}
        albumName={selectedAlbum.name}
        onBack={() => setSelectedAlbum(null)}
      />
    );
  }

  return (
    <>
      <div className={styles.top}>
        <h3>Your albums</h3>
        <button
          className={addAlbumIntent ? styles.active : ""}
          onClick={() => setAddAlbumIntent((current) => !current)}
        >
          {addAlbumIntent ? "Cancel" : "Add album"}
        </button>
      </div>

      {addAlbumIntent && (
        <AlbumForm loading={albumAddLoading} onAdd={handleAddAlbum} />
      )}

      {loading ? (
        <div className={styles.loader}>
          <Spinner color="#0077ff" />
        </div>
      ) : albums.length ? (
        <div className={styles.albumsList}>
          {albums.map((album) => (
            <div
              className={styles.album}
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedAlbum(album)}
            >
              <img src="/assets/photos.png" alt="album" />
              <span>{album.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No albums found.</div>
      )}
    </>
  );
};
