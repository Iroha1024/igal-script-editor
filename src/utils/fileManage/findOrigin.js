/**
 * 递归遍历files，找到文件夹所在数组
 * @param {Array} files 存储file与dir的数组
 * @param {string} path 当前路径
 */
export function findArrOfDir(files, path) {
    for (const item of files) {
        if (item.path === path) return files
        if (Array.isArray(item)) {
            const list = findArrOfDir(item, path)
            if (list) return list
        }
    }
}

/**
 * 递归遍历files，找到对应path文件(夹)
 * @param {Array} files 存储file与dir的数组
 * @param {string} path 当前路径
 */
export function findFileByPath(files, path) {
    for (const item of files) {
        if (item.path === path) return item
        if (Array.isArray(item)) {
            const file = findFileByPath(item, path)
            if (file) return file
        }
    }
}

/**
 * 递归遍历files，找到所选文件夹所在数组所在的数组
 * @param {Array} arr 文件夹所在数组
 * @param {Array} outerArr 外层数组
 */
export function findArrOfArr(arr, outerArr) {
    if (outerArr.includes(arr)) return outerArr
    for (const item of outerArr) {
        if (Array.isArray(item)) {
            const list = findArrOfArr(arr, item)
            if (list) return list
        }
    }
}
