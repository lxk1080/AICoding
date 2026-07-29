/**
 * 将嵌套的多维 JS 数组铺平为一维数组
 * @param {Array} arr - 需要铺平的嵌套数组
 * @param {number} [depth=Infinity] - 铺平深度，默认无限深度
 * @returns {Array} 铺平后的一维数组
 */
export function flattenArray(arr, depth = Infinity) {
  if (!Array.isArray(arr)) {
    throw new TypeError('参数必须是一个数组');
  }

  if (depth === 0) {
    return arr.slice();
  }

  if (depth === Infinity) {
    // 深度优先遍历，效率更高
    const result = [];
    const stack = [...arr];

    while (stack.length) {
      const item = stack.shift();
      if (Array.isArray(item)) {
        stack.unshift(...item);
      } else {
        result.push(item);
      }
    }

    return result;
  }

  // 有限深度铺平，使用递归
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flattenArray(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}
