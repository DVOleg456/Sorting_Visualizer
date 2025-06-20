export function* insertionSort(arr, optimised = true) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      yield ["compare", j, j + 1, [...arr]];
      arr[j + 1] = arr[j];
      j--;
      yield ["swap", j + 1, j + 2, [...arr]];
    }
    arr[j + 1] = key;
  }
  yield ["done", -1, -1, [...arr]];
}
