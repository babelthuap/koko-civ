// The base to use when converting a number to or from a string.
const BASE = 36;

/** Compresses a POJO. Useful if there are many repeated strings. */
export function compress(data) {
  const stringMap = new Map();
  const compressedData = compress_(data, stringMap);
  return [compressedData, [...stringMap.keys()]];
}

/** Recursive helper. */
function compress_(data, stringMap) {
  switch (typeof data) {
    case 'string':
      let compressed = stringMap.get(data);
      if (compressed === undefined) {
        compressed = stringMap.size.toString(BASE);
        stringMap.set(data, compressed);
      }
      return compressed;
    case 'object':
      if (Array.isArray(data)) {
        return data.map(el => compress_(el, stringMap));
      } else {
        // Compress both keys and values
        return Object.entries(data).reduce((obj, [key, value]) => {
          obj[compress_(key, stringMap)] = compress_(value, stringMap);
          return obj;
        }, {});
      }
    default:
      return data;
  }
}

/** Inverse of `compress`. */
export function decompress(compressed) {
  return decompress_(compressed[0], compressed[1]);
}

/** Recursive helper. */
function decompress_(data, strings) {
  switch (typeof data) {
    case 'string':
      return strings[parseInt(data, BASE)];
    case 'object':
      if (Array.isArray(data)) {
        // Mutate array in place, element by element
        for (let i = 0; i < data.length; i++) {
          data[i] = decompress_(data[i], strings);
        }
        return data;
      } else {
        return Object.entries(data).reduce((obj, [key, value]) => {
          obj[decompress_(key, strings)] = decompress_(value, strings);
          return obj;
        }, {});
      }
    default:
      return data;
  }
}
