export function* mergeSort(arr, optimized = false) {
  const aux = new Array(arr.length);

  function* merge(low, mid, high) {
    let i = low, j = mid + 1, k = low;
    for (let idx = low; idx <= high; idx++) aux[idx] = arr[idx];

    yield ["merge", -1, -1, [...arr], { low, high, aux: aux.slice(low, high + 1) }];

    while (i <= mid && j <= high) {
      yield ["compare", i, j, [...arr], { low, high, aux: aux.slice(low, high + 1) }];
      if (aux[i] <= aux[j]) {
        arr[k++] = aux[i++];
      } else {
        arr[k++] = aux[j++];
      }
      yield ["swap", k - 1, i - 1, [...arr], { low, high, aux: aux.slice(low, high + 1) }];
    }

    while (i <= mid) {
      arr[k++] = aux[i++];
      yield ["swap", k - 1, i - 1, [...arr], { low, high, aux: aux.slice(low, high + 1) }];
    }

    while (j <= high) {
      arr[k++] = aux[j++];
      yield ["swap", k - 1, j - 1, [...arr], { low, high, aux: aux.slice(low, high + 1) }];
    }
  }

  function* mergeSortRec(low, high) {
    if (low >= high) return;
    const mid = Math.floor((low + high) / 2);
    yield* mergeSortRec(low, mid);
    yield* mergeSortRec(mid + 1, high);
    yield* merge(low, mid, high);
  }

  yield* mergeSortRec(0, arr.length - 1);
  yield ["done", -1, -1, [...arr], {}];
}
