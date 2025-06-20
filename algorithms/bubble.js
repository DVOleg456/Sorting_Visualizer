export function* bubbleSort(arr, optimised = true) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield ["compare", j, j + 1, [...arr]];
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        yield ["swap", j, j + 1, [...arr]];
      }
    }
    if (optimised && !swapped) break;
  }
  yield ["done", -1, -1, [...arr]];
}
