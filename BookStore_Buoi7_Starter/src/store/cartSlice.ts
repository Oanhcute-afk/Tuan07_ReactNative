import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../types";

interface CartState {
  items: CartItem[];
}
const initialState: CartState = { items: [] };

const clamp = (q: number, stock: number) => Math.max(1, Math.min(q, stock));

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // BT7.3a: addItem — nếu bookId đã có thì tăng quantity (clamp ≤ stock), chưa có thì push { ...payload, quantity: 1 }
    addItem(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      const existing = state.items.find((item) => item.bookId === action.payload.bookId);
      if (existing) {
        existing.quantity = clamp(existing.quantity + 1, existing.stock);
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    // BT7.3a: removeItem — lọc bỏ item có bookId === payload
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.bookId !== action.payload);
    },
    // BT7.3a: setQuantity — tìm item, gán quantity = clamp(payload.quantity, item.stock)
    setQuantity(state, action: PayloadAction<{ bookId: number; quantity: number }>) {
      const item = state.items.find((it) => it.bookId === action.payload.bookId);
      if (item) {
        item.quantity = clamp(action.payload.quantity, item.stock);
      }
    },
    // BT7.3a: clearCart — state.items = []
    clearCart(state) {
      state.items = [];
    },
    // Dùng ở buổi sau: nạp lại giỏ hàng đã lưu trong AsyncStorage
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
  },
});

export const { addItem, removeItem, setQuantity, clearCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
