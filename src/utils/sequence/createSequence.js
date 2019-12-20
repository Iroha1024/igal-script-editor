import { readJson } from '@/utils/igal/readIgal'

import uuidv1 from 'uuid/v1'

const uuid = uuidv1()

/**
 * 创建新序列
 * @param {string} setting 配置文件
 */
export default async function createSequence(setting) {
    const json = await readJson(setting)
    const customized = {}
    for (const key of json.customized) {
        customized[key] = ''
    }
    return {
        active: false,
        customized,
        data: [
            {
                type: 'linebreak',
            },
        ],
        prev: [],
        next: [],
        uuid,
    }
}
