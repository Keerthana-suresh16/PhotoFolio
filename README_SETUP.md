# PhotoFolio setup

## 1. Install dependencies
```bash
npm install
```

## 2. Create Firebase/Firestore
1. Open Firebase Console and create a project.
2. Create a Web App in Project Settings.
3. Create a Firestore Database.
4. Copy the Web SDK configuration values into a `.env` file in this project, using `.env.example` as the template.
5. For a classroom/demo project, the included `firestore/firestore.rules` permits read/write access. For a real application, replace it with authenticated rules.

Example `.env`:
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

## 3. Start
```bash
npm start
```

The application automatically creates an album named `first` if it does not already exist, as required by the test note.

## Firestore structure
```
albums/{albumId}
  name
  createdAt

albums/{albumId}/images/{imageId}
  title
  url
  createdAt
  updatedAt
```
