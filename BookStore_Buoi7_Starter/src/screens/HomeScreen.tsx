import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { CategoryChips } from "../components/CategoryChips";
import { PriceFilter } from "../components/PriceFilter";
import { BookGrid } from "../components/BookGrid";
import { FloatingCartButton } from "../components/FloatingCartButton";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getBooks } from "../services/bookService";
import { getCategories } from "../services/categoryService";
import { getErrorMessage } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";
import { filterBooks, PriceRange } from "../utils/filters";
import { useCart } from "../store/hooks";
import { TabScreenProps } from "../navigation/types";
import { Book, Category } from "../types";
import { colors, radius } from "../theme";

export function HomeScreen({ route, navigation }: TabScreenProps<"Home">) {
  // BT7.3d: lấy { totalQuantity } từ useCart() và truyền vào <FloatingCartButton count=... />
  const { totalQuantity } = useCart();

  // BT7.5b: state books, categories, loading, error
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [b, c] = await Promise.all([getBooks(), getCategories()]);
      setBooks(b);
      setCategories(c);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // BT7.7a: debounce keyword
  const debouncedKeyword = useDebounce(keyword, 400);

  // BT7.7c: visibleBooks với useMemo
  const visibleBooks = useMemo(
    () => filterBooks(books, { keyword: debouncedKeyword, categoryId, priceRange }),
    [books, debouncedKeyword, categoryId, priceRange]
  );

  // BT7.8b: nhận categoryId từ route.params (Tab Danh mục gửi sang)
  useEffect(() => {
    if (route.params?.categoryId !== undefined) {
      setCategoryId(route.params.categoryId);
      navigation.setParams({ categoryId: undefined });
    }
  }, [route.params?.categoryId, navigation]);

  // BT7.7d: hàm clearFilters
  const clearFilters = () => {
    setKeyword("");
    setCategoryId(null);
    setPriceRange(null);
  };

  const hasFilter = Boolean(keyword.trim() || categoryId !== null || priceRange !== null);

  return (
    <View style={styles.container}>
      <Header title="📚 BookStore" onSearchPress={() => setSearchOpen((v) => !v)} />
      {searchOpen && (
        <SearchBar
          value={keyword}
          onChangeText={setKeyword}
          onClose={() => {
            setSearchOpen(false);
            setKeyword("");
          }}
        />
      )}

      {loading ? (
        <LoadingView label="Đang tải sách…" />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : (
        <BookGrid
          data={visibleBooks}
          // BT7.2a: onPressBook → navigation.navigate("BookDetail", { bookId: b.id })
          onPressBook={(b) => navigation.navigate("BookDetail", { bookId: b.id })}
          ListHeaderComponent={
            <View>
              <CategoryChips categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
              <PriceFilter value={priceRange} onChange={setPriceRange} />
              {/* BT7.7e: nút "✕ Xóa bộ lọc" khi đang lọc */}
              {hasFilter && (
                <View style={styles.clearRow}>
                  <Pressable style={styles.clearChip} onPress={clearFilters}>
                    <Text style={styles.clearText}>✕ Xóa bộ lọc</Text>
                  </Pressable>
                </View>
              )}
            </View>
          }
          // BT7.7d: ListEmptyComponent = EmptyState
          ListEmptyComponent={
            <EmptyState
              emoji="🔎"
              title="Không tìm thấy sách phù hợp"
              message="Hãy thử từ khoá khác hoặc bỏ bớt bộ lọc."
              actionLabel="Xóa bộ lọc"
              onAction={clearFilters}
            />
          }
        />
      )}

      <FloatingCartButton count={totalQuantity} onPress={() => navigation.navigate("Cart")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  clearRow: { paddingHorizontal: 12, paddingBottom: 10, flexDirection: "row" },
  clearChip: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  clearText: { color: colors.danger, fontWeight: "700", fontSize: 12 },
});
