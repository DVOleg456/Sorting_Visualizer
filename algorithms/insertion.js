export function* insertionSort(arr, optimized = false) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;

    yield ["compare", i, j, [...arr], {}];

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      yield ["swap", j + 1, j, [...arr], {}];
      j--;
      if (j >= 0) yield ["compare", j, i, [...arr], {}];
    }
    arr[j + 1] = key;
    yield ["swap", j + 1, i, [...arr], {}];
  }
  yield ["done", -1, -1, [...arr], {}];
}
