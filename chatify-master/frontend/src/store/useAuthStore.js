import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const backendUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : (import.meta.env.VITE_BACKEND_URL ||
        import.meta.env.VITE_API_URL ||
        "");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const { fullName, email, password } = data;

      // 1) Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential?.user;
      if (!user) throw new Error("Firebase signup failed");

      // 2) Send email verification
      await sendEmailVerification(user);
      toast.success("Verification email sent! Check your inbox.");

      // 3) Create user in MongoDB (backend)
      await axiosInstance.post("/auth/signup", {
        fullName,
        email,
        password,
      });

      // IMPORTANT FIX: DO NOT keep Firebase session
      await signOut(auth);

      set({ authUser: null });

      toast.success(
        "Account created! Verify your email before logging in."
      );
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Signup failed";

      if (error.code?.startsWith("auth/")) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Email already in use. Try login.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak.";
            break;
        }
      }

      toast.error(errorMessage);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const { email, password } = data;

      // 1) Sign in with Firebase first
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2) Block login if email is NOT verified
      if (!user.emailVerified) {
        toast.error("Please verify your email first!");
        await signOut(auth);
        set({ isLoggingIn: false });
        return;
      }

      // 3) Now call backend to get JWT cookie
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed";

      if (error.code?.startsWith("auth/")) {
        errorMessage = "Invalid email or password.";
      }

      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      await signOut(auth);
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Logout failed");
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(backendUrl, { withCredentials: true });

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
