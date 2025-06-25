export function* heapSort(arr, optimized = false) {
  const n = arr.length;
  let sortedArr = [];

  function* heapify(n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) yield ["compare", left, largest, [...arr], { sortedArray: sortedArr }];
    if (left < n && arr[left] > arr[largest]) largest = left;

    if (right < n) yield ["compare", right, largest, [...arr], { sortedArray: sortedArr }];
    if (right < n && arr[right] > arr[largest]) largest = right;

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      yield ["swap", i, largest, [...arr], { sortedArray: sortedArr }];
      yield* heapify(n, largest);
    }
  }

  // Build heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedArr = arr.slice(i);
    yield ["swap", 0, i, [...arr], { sortedArray: sortedArr }];
    yield* heapify(i, 0);
  }
  sortedArr = arr.slice(0);
  yield ["done", -1, -1, [...arr], { sortedArray: sortedArr }];
}
