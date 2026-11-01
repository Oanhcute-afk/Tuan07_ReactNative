import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PriceRange, PRICE_RANGES } from "../utils/filters";
import { colors, radius } from "../theme";

interface Props {
  value: PriceRange;
  onChange: (v: PriceRange) => void;
}

// THỬ THÁCH: 3 nút lọc khoảng giá (bấm lần nữa để bỏ chọn)
export function PriceFilter({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PRICE_RANGES.map((r) => {
        const active = value === r.key;
        return (
          <Pressable
            key={r.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(active ? null : r.key)}
          >
            <Text style={[styles.text, active && styles.textActive]}>{r.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.cyan,
  },
  chipActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
  },
  text: {
    color: colors.navy,
    fontWeight: "700",
    fontSize: 13,
  },
  textActive: {
    color: "#fff",
  },
});
