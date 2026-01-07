import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* ---------- API CALL ---------- */
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }) => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    return await res.json(); // { token, user }
  }
);

/* ---------- LOAD FROM STORAGE ---------- */
const token = localStorage.getItem("grabx_token");
const user = localStorage.getItem("grabx_user");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: token || null,
    user: user ? JSON.parse(user) : null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("grabx_token");
      localStorage.removeItem("grabx_user");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;

        localStorage.setItem("grabx_token", action.payload.token);
        localStorage.setItem(
          "grabx_user",
          JSON.stringify(action.payload.user)
        );
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false;
        state.error = "Invalid credentials";
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

