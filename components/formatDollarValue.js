import React from 'react';
import { StyleSheet, View, Text} from 'react-native';
import { NumericFormat } from 'react-number-format';

export function NumberDollarValueFormat({ value }) {
  return (
    <NumericFormat
      value={value}
      displayType={'text'}
      thousandSeparator={true}
      prefix={'\$'}
      renderText={formattedValue => <Text>{formattedValue}</Text>} // <--- Don't forget this!
    />
  );
}