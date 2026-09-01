import React from 'react';
import { View, Text } from 'react-native';
import useThemeStyles from '../hooks/useThemeStyles';

const SectionCard = ({ title, children, style }) => {
  const { S } = useThemeStyles();

  return (
    <View style={[S.sectionCard, style]}>
      {title && (
        <Text style={S.sectionCardTitle}>{title}</Text>
      )}
      {children}
    </View>
  );
};

export default SectionCard;