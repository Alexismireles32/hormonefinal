// Supplement/Habit Input Component - Tag-based input
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Modal,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getAllSupplementsAndHabits } from '../constants/supplements';

export default function SupplementInput({ value = [], onChange }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [filter, setFilter] = useState('');

  const allOptions = getAllSupplementsAndHabits();
  const filteredOptions = filter
    ? allOptions.filter(opt => 
        opt.name.toLowerCase().includes(filter.toLowerCase())
      )
    : allOptions;

  const handleAdd = (name) => {
    if (!value.includes(name)) {
      onChange([...value, name]);
    }
    setModalVisible(false);
    setFilter('');
  };

  const handleAddCustom = () => {
    if (customInput.trim() && !value.includes(customInput.trim())) {
      onChange([...value, customInput.trim()]);
      setCustomInput('');
      setModalVisible(false);
    }
  };

  const handleRemove = (name) => {
    onChange(value.filter(v => v !== name));
  };

  return (
    <View style={styles.container}>
      {/* Selected Tags */}
      <View style={styles.tagsContainer}>
        {value.length === 0 ? (
          <Text style={styles.emptyText}>No supplements or habits added</Text>
        ) : (
          value.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() => handleRemove(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagText}>{item}</Text>
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Add Supplement / Habit</Text>
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Supplement or Habit</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search or type custom..."
              value={filter || customInput}
              onChangeText={(text) => {
                setFilter(text);
                setCustomInput(text);
              }}
              autoCapitalize="words"
            />

            {/* Custom Add */}
            {customInput.trim() && (
              <TouchableOpacity
                style={styles.customOption}
                onPress={handleAddCustom}
              >
                <Text style={styles.customOptionText}>
                  Add "{customInput}" (custom)
                </Text>
              </TouchableOpacity>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleAdd(item.name)}
                  disabled={value.includes(item.name)}
                >
                  <View>
                    <Text style={[
                      styles.optionName,
                      value.includes(item.name) && styles.optionSelected,
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.optionCategory}>
                      {item.type === 'supplement' ? `💊 $${item.cost}/mo` : `🏃 ${item.category}`}
                    </Text>
                  </View>
                  {value.includes(item.name) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    minHeight: 40,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    paddingVertical: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  tagText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.medium,
  },
  tagRemove: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.bold,
  },
  addButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    fontSize: TYPOGRAPHY.xxl,
    color: COLORS.textSecondary,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.base,
    marginBottom: SPACING.sm,
  },
  customOption: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  customOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.semibold,
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionName: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  optionSelected: {
    color: COLORS.textTertiary,
  },
  optionCategory: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  checkmark: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.success,
  },
});

