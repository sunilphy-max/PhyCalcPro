export function computeReactions(
  K: number[][],
  d: number[],
  F: number[]
) {

  const reactions: number[] =
    Array(F.length).fill(0);

  for (let i = 0; i < K.length; i++) {

    let sum = 0;

    for (let j = 0; j < K[i].length; j++) {

      sum += K[i][j] * d[j];
    }

    reactions[i] =
      sum - F[i];
  }

  return reactions;
}