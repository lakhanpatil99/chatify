import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const backendUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "");

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

      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential?.user;
      if (!user) {
        throw new Error("Signup failed: no user returned from Firebase.");
      }

      // 2. Send email verification
      try {
        await sendEmailVerification(user);
      } catch (verificationError) {
        console.error("Error sending verification email:", verificationError);
        toast.error("Failed to send verification email. Please try again later.");
        return; // Do NOT call backend if verification email failed
      }

      const firebaseUid = user.uid;

      // 3. Call existing backend API AFTER Firebase + verification email
      //    Your backend route is /auth/signup; we also send { name, email, firebaseUid } as requested.
      const res = await axiosInstance.post("/auth/signup", {
        // existing fields used by current backend
        fullName,
        password,
        // additional fields matching your requested shape
        name: fullName,
        email,
        firebaseUid,
      });

      set({ authUser: res.data });

      toast.success("Account created successfully! Verification email sent.");
      get().connectSocket();
    } catch (error) {
      let errorMessage =
        error.userMessage ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create account";

      // Clear, user‑friendly messages for common Firebase auth errors
      if (error.code && typeof error.code === "string" && error.code.startsWith("auth/")) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already in use. Try logging in instead.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please choose a stronger password.";
            break;
          default:
            errorMessage = "Failed to create account with Firebase. Please try again.";
            break;
        }
      }

      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const { email, password } = data;

      // 1. Sign in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Require verified email before allowing login
      if (!user.emailVerified) {
        const message = "Please verify your email first!";
        toast.error(message);
        if (typeof window !== "undefined") {
          window.alert(message);
        }
        return; // Block login: do NOT call backend
      }

      // 3. If verified, continue with existing backend login flow
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      let errorMessage =
        error.userMessage ||
        error.response?.data?.message ||
        error.message ||
        "Failed to login";

      if (error.code && typeof error.code === "string" && error.code.startsWith("auth/")) {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          default:
            errorMessage = "Failed to login with Firebase. Please try again.";
            break;
        }
      }

      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.userMessage || "Error logging out");
      console.error("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in update profile:", error);
      const errorMessage =
        error.userMessage ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toast.error(errorMessage);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(backendUrl || "http://localhost:3000", {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
