import { computed, resource, Service, signal } from '@angular/core';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { UsersDetails } from '../interfaces/users';
import { UrlDetails } from '../interfaces/urls';

@Service()
export class FirebaseService {
  private readonly app = initializeApp(environment.firebaseConfig);

  private readonly auth = getAuth(this.app);

  private readonly db = getFirestore(this.app);

  private readonly userSessionDetails = signal<User | undefined>(undefined);
  private readonly userInfosDetails = resource({
    params: () => {
      const userUID = this.userSessionDetails()?.uid;
      if (!userUID || userUID === '') {
        return undefined;
      }
      return { id: userUID };
    },
    loader: async ({ params }) => {
      return await this.loadOrCreateProfile(params.id);
    },
    defaultValue: undefined,
  });

  readonly isLogged = computed(() => !!this.userSessionDetails());
  readonly isAdmin = computed(() => this.userInfosDetails.value()?.role === 'admin');

  constructor() {
    // noinspection JSIgnoredPromiseFromCall
    this.initAuth();
  }

  async recordUrl(link: string) {
    const newUrl = {
      owner: this.userSessionDetails()?.uid,
      createdAt: new Date(),
      link: link,
    };
    const docRef = await addDoc(collection(this.db, 'urls'), newUrl);
    return docRef.id;
  }

  async getUserUrlsList() {
    const userId = this.userSessionDetails()?.uid;
    const querySnapshot = await getDocs(
      query(
        collection(this.db, 'urls'),
        where('owner', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20),
      ),
    );
    return querySnapshot.docs.map((doc): UrlDetails => {
      const details = doc.data() as UrlDetails;
      return {
        ...details,
        id: doc.id,
      };
    });
  }

  async loginWithGoogle() {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async logout() {
    await signOut(this.auth);
    this.userSessionDetails.set(undefined);
  }

  getUserInfosDetails() {
    return this.userInfosDetails.value;
  }

  getUserSessionDetails() {
    return this.userSessionDetails.asReadonly();
  }

  // ============
  // URL ACTION
  // ============

  async findUrlById(id: string): Promise<UrlDetails | undefined> {
    const docRef = doc(this.db, 'urls', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return undefined;
    }

    const details = snapshot.data() as UrlDetails;
    return {
      ...details,
      id: snapshot.id,
    };
  }

  private async initAuth() {
    this.auth.languageCode = 'it';
    await setPersistence(this.auth, browserLocalPersistence);
    onAuthStateChanged(this.auth, (user) => {
      this.userSessionDetails.set(user ?? undefined);
    });
  }

  private async loadOrCreateProfile(uid: string) {
    const docRef = doc(this.db, 'users', uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data() as UsersDetails;
    }

    const newUserData: UsersDetails = {
      role: 'user',
    };

    await setDoc(docRef, newUserData, { merge: true });
    return newUserData;
  }
}
