import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Category } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SPACING } from '../../constants/theme';

interface CategoryGridProps {
  categories: Category[];
  selected?: string;
  onSelect: (id: string) => void;
  onCreateNew?: () => void;
}

export default function CategoryGrid({ categories, selected, onSelect, onCreateNew }: CategoryGridProps) {
  const theme = useTheme();

  const cols = 4;
  const rows: Category[][] = [];
  for (let i = 0; i < categories.length; i += cols) {
    rows.push(categories.slice(i, i + cols));
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map(cat => {
              const isSelected = selected === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => onSelect(cat.id)}
                  style={[
                    styles.item,
                    {
                      backgroundColor: isSelected ? theme.accent + '22' : theme.overlay,
                      borderColor: isSelected ? theme.accent : theme.border.subtle,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emoji}>{cat.emoji}</Text>
                  <Text style={[styles.name, { color: isSelected ? theme.accent : theme.text.secondary }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {ri === rows.length - 1 && onCreateNew && (
              <TouchableOpacity
                onPress={onCreateNew}
                style={[styles.item, { backgroundColor: theme.overlay, borderColor: theme.border.subtle, borderStyle: 'dashed' }]}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>➕</Text>
                <Text style={[styles.name, { color: theme.text.muted }]}>Créer</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  item: {
    width: 74,
    height: 74,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    gap: 4,
  },
  emoji: {
    fontSize: 22,
  },
  name: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
});
