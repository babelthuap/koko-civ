// The base to use when converting a number to or from a string.
const BASE = 36;

/** Serializes a POJO, compressing strings. */
export function serialize(data) {
  const stringMap = new Map();
  const compressedData = compress(data, stringMap);
  return JSON.stringify([[...stringMap.keys()], compressedData]);
}

/** Deserializes JSON, assuming it was serialized with `serialize`. */
export function deserialize(json) {
  const [strings, data] = JSON.parse(json);
  return decompress(data, strings);
}

function compress(data, stringMap) {
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
        return data.map(el => compress(el, stringMap));
      } else {
        // Compress both keys and values
        return Object.entries(data).reduce((obj, [key, value]) => {
          obj[compress(key, stringMap)] = compress(value, stringMap);
          return obj;
        }, {});
      }
    default:
      return data;
  }
}

function decompress(data, strings) {
  switch (typeof data) {
    case 'string':
      return strings[parseInt(data, BASE)];
    case 'object':
      if (Array.isArray(data)) {
        // Mutate array in place, element by element
        for (let i = 0; i < data.length; i++) {
          data[i] = decompress(data[i], strings);
        }
        return data;
      } else {
        return Object.entries(data).reduce((obj, [key, value]) => {
          obj[decompress(key, strings)] = decompress(value, strings);
          return obj;
        }, {});
      }
    default:
      return data;
  }
}
