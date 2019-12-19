/**
 * 切换文件夹状态
 *
 * 只有点击的文件夹切换折叠状态`isFolded`
 *
 * 其他文件及文件夹根据点击的文件夹改变`isShow`状态
 * @param {Object} info 文件夹信息
 * @param {Array} arr 文件夹所在数组
 * @param {Array<boolean>} isFolded 存储上层每个文件夹是否折叠
 */
export default function toggleDirShow(info, arr, isFolded = []) {
    if (isFolded.length < 1) {
        info.isFolded = !info.isFolded
    }
    let upperIsFolded = JSON.parse(JSON.stringify(isFolded))
    let dir = arr.filter(item => item.type === 'dir').pop()
    isFolded.push(dir.isFolded)
    for (const item of arr) {
        if (Array.isArray(item)) {
            toggleDirShow(info, item, JSON.parse(JSON.stringify(isFolded)))
        } else {
            if (item.type === 'dir') {
                item.isShow = !upperIsFolded.some(item => item)
            } else {
                item.isShow = !isFolded.some(item => item)
            }
        }
    }
}
