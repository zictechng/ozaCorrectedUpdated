import React from 'react';
import { StyleSheet, View, Text} from 'react-native';
import { NumericFormat } from 'react-number-format';

export function NumberValueFormat({ value }) {
  return (
    <NumericFormat
      value={value}
      displayType={'text'}
      thousandSeparator={true}
      prefix={'\u20A6'}
      renderText={formattedValue => <Text>{formattedValue}</Text>} // <--- Don't forget this!
    />
  );
}