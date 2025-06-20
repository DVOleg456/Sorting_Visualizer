function* heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n) {
    yield ["compare", left, largest, [...arr]];
    if (arr[left] > arr[largest]) largest = left;
  }
  if (right < n) {
    yield ["compare", right, largest, [...arr]];
    if (arr[right] > arr[largest]) largest = right;
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    yield ["swap", i, largest, [...arr]];
    yield* heapify(arr, n, largest);
  }
}

export function* heapSort(arr, optimised = true) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    yield ["swap", 0, i, [...arr]];
    yield* heapify(arr, i, 0);
  }
  yield ["done", -1, -1, [...arr]];
}
