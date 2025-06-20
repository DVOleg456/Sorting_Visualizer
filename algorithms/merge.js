function* merge(arr, left, mid, right) {
  let n1 = mid - left + 1;
  let n2 = right - mid;
  let L = arr.slice(left, mid + 1);
  let R = arr.slice(mid + 1, right + 1);

  let i = 0, j = 0, k = left;

  while (i < n1 && j < n2) {
    yield ["compare", left + i, mid + 1 + j, [...arr]];
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
      yield ["swap", k, left + i - 1, [...arr]];
    } else {
      arr[k] = R[j];
      j++;
      yield ["swap", k, mid + 1 + j - 1, [...arr]];
    }
    k++;
  }

  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
    yield ["swap", k - 1, left + i - 1, [...arr]];
  }

  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
    yield ["swap", k - 1, mid + j, [...arr]];
  }
}

function* mergeSortHelper(arr, left, right) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    yield* mergeSortHelper(arr, left, mid);
    yield* mergeSortHelper(arr, mid + 1, right);
    yield* merge(arr, left, mid, right);
  }
}

export function* mergeSort(arr, optimised = true) {
  yield* mergeSortHelper(arr, 0, arr.length - 1);
  yield ["done", -1, -1, [...arr]];
}
