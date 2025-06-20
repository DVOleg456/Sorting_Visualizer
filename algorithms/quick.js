function* partition(arr, low, high, steps) {
  let pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    yield ["compare", j, high, [...arr]];
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      yield ["swap", i, j, [...arr]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  yield ["swap", i + 1, high, [...arr]];
  return i + 1;
}

export function* quickSort(arr, optimised = true) {
  const stack = [];
  stack.push([0, arr.length - 1]);
  while (stack.length > 0) {
    const [low, high] = stack.pop();
    if (low < high) {
      const pivotIndexGen = partition(arr, low, high);
      let result = pivotIndexGen.next();
      while (!result.done) {
        yield result.value;
        result = pivotIndexGen.next();
      }
      const pivotIndex = result.value;
      if (pivotIndex - 1 > low) stack.push([low, pivotIndex - 1]);
      if (pivotIndex + 1 < high) stack.push([pivotIndex + 1, high]);
    }
  }
  yield ["done", -1, -1, [...arr]];
}
