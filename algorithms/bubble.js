export function* bubbleSort(arr, optimized = false) {
  const n = arr.length;
  let swapped;

  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield ["compare", j, j + 1, [...arr], {}];
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        yield ["swap", j, j + 1, [...arr], {}];
      }
    }
    if (optimized && !swapped) break;
  }
  yield ["done", -1, -1, [...arr], {}];
}
