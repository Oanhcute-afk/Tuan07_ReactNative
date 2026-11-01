import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getBookById } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useCart, useWishlist } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import { Book } from "../types";
import { colors, formatPrice, radius } from "../theme";

// gọi getBookById thay cho mảng tĩnh; có loading + lỗi + thử lại
export function BookDetailScreen({ route }: RootScreenProps<"BookDetail">) {
  const { bookId } = route.params;
  const { add } = useCart();
  const { isFavorite, toggle } = useWishlist();

  // BT7.5d: tạo state book / loading / error và hàm load() gọi getBookById(bookId); chạy trong useEffect([bookId])
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookById(bookId);
      setBook(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  // BT7.5e: if (loading) return <LoadingView/>; if (error || !book) return <ErrorView message onRetry={load}/>
  if (loading) return <LoadingView />;
  if (error || !book) return <ErrorView message={error ?? "Không tìm thấy sách"} onRetry={load} />;

  const favorite = isFavorite(book.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.cover, { backgroundColor: book.color }]}>
        <Text style={styles.emoji}>{book.emoji}</Text>
        {/* Nút yêu thích ♡/♥ dùng useWishlist */}
        <Pressable
          style={styles.heartBtn}
          onPress={() => toggle(book.id)}
          accessibilityLabel="Yêu thích"
        >
          <Text style={[styles.heartText, favorite && styles.heartTextActive]}>
            {favorite ? "♥" : "♡"}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>
      <Text style={styles.price}>{formatPrice(book.price)}</Text>
      <Text style={styles.stock}>Còn {book.stock} cuốn</Text>
      <Text style={styles.desc}>{book.description}</Text>
      {/* BT7.3c: nút "Thêm vào giỏ" → add({ bookId, title, price, emoji, color, stock }) từ book */}
      <Pressable
        style={styles.btn}
        onPress={() =>
          add({
            bookId: book.id,
            title: book.title,
            price: book.price,
            emoji: book.emoji,
            color: book.color,
            stock: book.stock,
          })
        }
      >
        <Text style={styles.btnText}>Thêm vào giỏ</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 8 },
  cover: { height: 220, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", position: "relative" },
  emoji: { fontSize: 90 },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  heartText: { fontSize: 24, color: colors.muted },
  heartTextActive: { color: colors.heart },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 8 },
  author: { color: colors.muted, fontSize: 15 },
  price: { fontSize: 20, fontWeight: "800", color: colors.indigo },
  stock: { color: colors.muted },
  desc: { color: colors.text, lineHeight: 22, marginTop: 4 },
  btn: { backgroundColor: colors.indigo, padding: 14, borderRadius: radius.md, alignItems: "center", marginTop: 12 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
