// merge.js
export function* mergeSort(arr, optimized = false) {
  const aux = new Array(arr.length);
  const stages = [];

  function recordStage(type, left, right, depth, values) {
    stages.push({ type, left, right, depth, values: values.slice(left, right + 1) });
  }

  function* merge(low, mid, high, depth) {
    for (let i = low; i <= high; i++) aux[i] = arr[i];

    let i = low, j = mid + 1, k = low;

    while (i <= mid && j <= high) {
      yield ["compare", i, j, [...arr], { stages: [...stages] }];
      if (aux[i] <= aux[j]) {
        arr[k++] = aux[i++];
      } else {
        arr[k++] = aux[j++];
      }
      yield ["swap", k - 1, -1, [...arr], { stages: [...stages] }];
    }

    while (i <= mid) {
      arr[k++] = aux[i++];
      yield ["swap", k - 1, -1, [...arr], { stages: [...stages] }];
    }

    while (j <= high) {
      arr[k++] = aux[j++];
      yield ["swap", k - 1, -1, [...arr], { stages: [...stages] }];
    }

    recordStage("merge", low, high, depth, arr);
    yield ["merge", -1, -1, [...arr], { stages: [...stages] }];
  }

  function* mergeSortRec(low, high, depth = 0) {
    if (low >= high) return;

    const mid = Math.floor((low + high) / 2);

    recordStage("split", low, mid, depth, arr);
    yield ["merge", -1, -1, [...arr], { stages: [...stages] }];
    yield* mergeSortRec(low, mid, depth + 1);

    recordStage("split", mid + 1, high, depth, arr);
    yield ["merge", -1, -1, [...arr], { stages: [...stages] }];
    yield* mergeSortRec(mid + 1, high, depth + 1);

    yield* merge(low, mid, high, depth);
  }

  yield* mergeSortRec(0, arr.length - 1, 0);
  yield ["done", -1, -1, [...arr], { stages }];
}
