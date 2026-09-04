const firebaseConfig = {
  apiKey: "AIzaSyCUwABaqJLAfq29F3nKpwKJCWrWlsTAPqc",
  authDomain: "our-topup-center.firebaseapp.com",
  projectId: "our-topup-center",
  storageBucket: "our-topup-center.firebasestorage.app",
  messagingSenderId: "927598820295",
  appId: "1:927598820295:web:96bddbbd398e169efff7e2",
  measurementId: "G-FKZHKTGKK3"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();