export default function FirstWord(text) {
  
        let firstBlank = text.indexOf(' ');
        if (firstBlank == -1) { // There is no space at all -- return the whole string
          return text;
        } 
        return text.slice(0, firstBlank);
}
