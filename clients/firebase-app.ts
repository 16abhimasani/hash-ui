import f from 'firebase';

export const fb = !f.apps.length
  ? f.initializeApp({
      apiKey: '',
      authDomain: 'hash-ca780.firebaseapp.com',
      projectId: 'hash-ca780',
      storageBucket: 'hash-ca780.appspot.com',
      messagingSenderId: '467060315438',
      appId: '1:467060315438:web:bd00a9ff0738e0f2c4d6bf',
    }) // pasting this here, non critical.
  : f.app();
