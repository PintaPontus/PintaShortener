import { computed, Service, Signal, signal, WritableSignal } from '@angular/core';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, getDoc, doc } from 'firebase/firestore';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { User } from '@firebase/auth';
import { UsersDetails } from '../interfaces/users';

@Service()
export class FirebaseService {
  // Initialize Firebase
  private readonly app = initializeApp(environment.firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  private readonly auth = getAuth(this.app);

  private readonly db = getFirestore(this.app);

  private readonly userSessionDetails: WritableSignal<User | undefined> = signal(undefined);
  private readonly userInfosDetails: WritableSignal<UsersDetails | undefined> = signal(undefined);
  private readonly isAdminFlag: Signal<boolean> = computed(
    () => this.userInfosDetails()?.role === 'admin',
  );
  readonly isLogged = computed(() => !!this.userInfosDetails());

  async loginWithGoogle() {
    this.auth.languageCode = 'it';
    await setPersistence(this.auth, browserLocalPersistence);
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.setupLoggedUser(result.user);
  }

  async setupLoggedUser(user: User) {
    this.userSessionDetails.set(user);
    const currentUser = await this.fetchCurrentUser();

    if (!currentUser()) {
      await setDoc(doc(this.db, 'users', this.userSessionDetails()!.uid!), {
        role: 'user',
        continueToWatch: [],
        favorites: [],
      } as UsersDetails);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.userSessionDetails.set(undefined);
    this.userInfosDetails.set(undefined);
  }

  isAdmin() {
    return this.isAdminFlag;
  }

  async fetchCurrentUser() {
    await this.auth.authStateReady();
    const userUID = this.userSessionDetails()?.uid;

    if (!userUID || userUID === '') {
      return this.userInfosDetails;
    }

    const docRef = doc(this.db, 'users', userUID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return this.userInfosDetails;
    }

    const docData = docSnap.data() as UsersDetails;

    this.userInfosDetails.set(docData);

    return this.userInfosDetails;
  }

  getUserSessionDetails() {
    this.auth.authStateReady().then((_) => {
      this.userSessionDetails.set(this.auth.currentUser || undefined);
    });
    return this.userSessionDetails.asReadonly();
  }

  getUserInfosDetails() {
    this.fetchCurrentUser();
    return this.userInfosDetails.asReadonly();
  }
}
