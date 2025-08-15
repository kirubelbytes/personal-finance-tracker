import { create }from 'zustand'

const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;
const useStore = create((set) => ({
  theme: localStorage.getItem("theme") ?? "light",
  user: user,

  setTheme: (value) => set({ theme: value }),
  setCredential: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));

export default useStore;
