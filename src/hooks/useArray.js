import { useState } from 'react';

export function useArray(initial = [10, 20, 30, 40, 50]) {
  const [array, setArray] = useState(initial);

  function* getInsertGenerator(val) {
    const newArr = [...array, val];
    yield {
      type: 'visit',
      message: `Appending ${val} to the array.`,
      arraySnapshot: newArr,
      highlight: [newArr.length - 1]
    };
    setArray(newArr);
  }

  function* getDeleteGenerator() {
    if (array.length === 0) {
      yield { type: 'visit', message: 'Array is empty.', arraySnapshot: array };
      return;
    }
    const val = array[array.length - 1];
    yield {
      type: 'visit',
      message: `Preparing to remove last element (${val}).`,
      arraySnapshot: array,
      eliminated: [array.length - 1]
    };
    const newArr = array.slice(0, -1);
    yield {
      type: 'visit',
      message: `Removed ${val}.`,
      arraySnapshot: newArr,
      highlight: []
    };
    setArray(newArr);
  }

  function* getUpdateGenerator(index, val) {
    if (index < 0 || index >= array.length) {
      yield { type: 'visit', message: 'Index out of bounds.', arraySnapshot: array };
      return;
    }
    const oldVal = array[index];
    yield {
      type: 'visit',
      message: `Accessing index ${index}...`,
      arraySnapshot: array,
      pointers: { [index]: "target" },
      highlight: [index]
    };
    const newArr = [...array];
    newArr[index] = val;
    yield {
      type: 'visit',
      message: `Updated index ${index} from ${oldVal} to ${val}.`,
      arraySnapshot: newArr,
      done: [index]
    };
    setArray(newArr);
  }

  return { 
    array, 
    getInsertGenerator, 
    getDeleteGenerator,
    getUpdateGenerator
  };
}
