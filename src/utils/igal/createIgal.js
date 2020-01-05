import saveIgal from '@/utils/igal/saveIgal'
import createSequence from '@/utils/sequence/createSequence'

/**
 * 创建新igal文件
 * @param {string} setting 配置文件
 * @param {string} path igal文件路径
 */
export default async function createIgal(setting, path) {
    const sequence = await createSequence(setting)
    const igal = [sequence]
    await saveIgal(igal, path)
    return [sequence.uuid]
}
